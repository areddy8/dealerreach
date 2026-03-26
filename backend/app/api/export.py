from __future__ import annotations

import io
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models.quote_request import QuoteRequest
from app.models.dealer import Dealer
from app.models.reply import Reply
from app.models.user import User
from app.services.auth_service import decode_access_token

logger = logging.getLogger(__name__)
router = APIRouter(tags=["export"])


@router.get("/quote-requests/{quote_request_id}/export/pdf")
async def export_quote_pdf(
    quote_request_id: str,
    token: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session),
):
    # Auth via query param (window.open cannot set Authorization headers)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token required (pass as ?token= query parameter)",
        )

    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    result = await session.execute(select(User).where(User.id == user_id))
    current_user = result.scalar_one_or_none()
    if current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Fetch quote request with dealers and replies
    result = await session.execute(
        select(QuoteRequest)
        .where(QuoteRequest.id == quote_request_id, QuoteRequest.user_id == current_user.id)
        .options(selectinload(QuoteRequest.dealers), selectinload(QuoteRequest.replies))
    )
    qr = result.scalar_one_or_none()
    if not qr:
        raise HTTPException(status_code=404, detail="Quote request not found")

    # Generate PDF
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.units import inch

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75*inch, bottomMargin=0.75*inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=18, spaceAfter=6)
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontSize=14, spaceAfter=6, spaceBefore=12)
    normal_style = styles['Normal']

    elements = []

    # Title
    elements.append(Paragraph("DealerReach.io - Quote Report", title_style))
    elements.append(Spacer(1, 6))

    # Quote request details
    elements.append(Paragraph("Quote Request Details", heading_style))
    details_data = [
        ["Product", qr.product_name],
        ["Brand", qr.brand or "N/A"],
        ["Reference", qr.reference_code],
        ["ZIP Code", qr.zip_code],
        ["Radius", f"{qr.radius_miles} miles"],
        ["Status", qr.status.value if hasattr(qr.status, 'value') else str(qr.status)],
        ["Created", qr.created_at.strftime("%B %d, %Y")],
    ]
    if qr.specs:
        details_data.append(["Specs", qr.specs[:200]])

    details_table = Table(details_data, colWidths=[1.5*inch, 5*inch])
    details_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.Color(0.15, 0.23, 0.35)),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.Color(0.8, 0.8, 0.8)),
    ]))
    elements.append(details_table)
    elements.append(Spacer(1, 16))

    # Quote comparison table (replies)
    replies = list(qr.replies)
    if replies:
        elements.append(Paragraph("Quote Comparison", heading_style))

        # Build dealer name lookup
        dealer_map = {d.id: d for d in qr.dealers}

        # Sort by price (lowest first, nulls last)
        replies.sort(key=lambda r: (r.parsed_price is None, r.parsed_price or 0))

        table_data = [["Dealer", "Price", "Lead Time", "Availability", "Summary"]]
        for reply in replies:
            dealer = dealer_map.get(reply.dealer_id)
            dealer_name = dealer.name if dealer else "Unknown"
            price = f"${reply.parsed_price:,.2f}" if reply.parsed_price else "N/A"
            lead_time = reply.parsed_lead_time or "N/A"
            availability = reply.parsed_availability or "N/A"
            summary = (reply.parsed_summary or "")[:100]
            table_data.append([dealer_name, price, lead_time, availability, summary])

        quote_table = Table(table_data, colWidths=[1.3*inch, 0.9*inch, 1*inch, 1*inch, 2.3*inch])
        quote_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.15, 0.23, 0.35)),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.Color(0.8, 0.8, 0.8)),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.Color(0.95, 0.95, 0.95)]),
        ]))

        # Highlight best price row in green
        if replies and replies[0].parsed_price is not None:
            quote_table.setStyle(TableStyle([
                ('BACKGROUND', (1, 1), (1, 1), colors.Color(0.85, 1, 0.85)),
            ]))

        elements.append(quote_table)
        elements.append(Spacer(1, 16))

    # Dealer list
    dealers = list(qr.dealers)
    if dealers:
        elements.append(Paragraph("Dealer Directory", heading_style))
        dealer_data = [["Name", "City/State", "Phone", "Email"]]
        for d in dealers:
            dealer_data.append([
                d.name,
                f"{d.city}, {d.state}" if d.city else "N/A",
                d.phone or "N/A",
                d.email or "N/A",
            ])

        dealer_table = Table(dealer_data, colWidths=[1.8*inch, 1.5*inch, 1.3*inch, 1.9*inch])
        dealer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.15, 0.23, 0.35)),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.Color(0.8, 0.8, 0.8)),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.Color(0.95, 0.95, 0.95)]),
        ]))
        elements.append(dealer_table)

    # Footer
    elements.append(Spacer(1, 24))
    elements.append(Paragraph(
        f"Generated by DealerReach.io on {datetime.now(timezone.utc).strftime('%B %d, %Y')}. "
        "Quotes are for informational purposes only and may be subject to change.",
        ParagraphStyle('Footer', parent=normal_style, fontSize=8, textColor=colors.gray)
    ))

    doc.build(elements)
    buffer.seek(0)

    filename = f"dealerreach-{qr.reference_code}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
