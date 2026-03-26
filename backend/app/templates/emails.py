"""
Branded HTML email templates for DealerReach.io.

All templates use inline CSS and <table> layouts for maximum email client
compatibility. No external stylesheets.
"""
from __future__ import annotations

import re
from typing import Optional


# ---------------------------------------------------------------------------
# Brand constants
# ---------------------------------------------------------------------------
_PRIMARY = "#3B82F6"
_DARK_BG = "#0F172A"
_CARD_BG = "#1E293B"
_TEXT = "#F8FAFC"
_MUTED = "#94A3B8"
_SUCCESS = "#10B981"


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def strip_html(html: str) -> str:
    """Convert an HTML email to a plain-text fallback."""
    # Remove style/script blocks
    text = re.sub(r"<(style|script)[^>]*>.*?</\1>", "", html, flags=re.DOTALL | re.IGNORECASE)
    # Convert <br> and block-level tags to newlines
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</(p|div|tr|h[1-6]|li)>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<li[^>]*>", "- ", text, flags=re.IGNORECASE)
    # Strip remaining tags
    text = re.sub(r"<[^>]+>", "", text)
    # Collapse whitespace but keep newlines
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Decode common entities
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&nbsp;", " ").replace("&#39;", "'").replace("&quot;", '"')
    return text.strip()


def _wrapper_start(bg_color: str = "#f4f4f7") -> str:
    return (
        '<!DOCTYPE html>'
        '<html lang="en">'
        '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>'
        '<body style="margin:0;padding:0;background-color:{bg};">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="background-color:{bg};">'
        '<tr><td align="center" style="padding:24px 16px;">'
        '<table role="presentation" width="600" cellpadding="0" cellspacing="0" '
        'style="max-width:600px;width:100%;">'
    ).format(bg=bg_color)


def _wrapper_end() -> str:
    return (
        '</table>'
        '</td></tr></table>'
        '</body></html>'
    )


# ---------------------------------------------------------------------------
# 1. Outreach email (sent TO dealers — clean, professional, white)
# ---------------------------------------------------------------------------

def render_outreach_email(
    dealer_name: str,
    product_name: str,
    brand: str,
    specs: str,
    reference_code: str,
    body_text: str,
) -> str:
    """Render the outreach email sent to dealers.

    Uses a clean white design so it looks like a real customer email,
    not marketing spam.
    """
    # Convert plain-text body newlines to <br> for HTML
    html_body = body_text.replace("\n", "<br>")

    html = _wrapper_start("#f4f4f7")

    # Header
    html += (
        '<tr><td style="background-color:#ffffff;padding:24px 32px 16px 32px;'
        'border-radius:8px 8px 0 0;border-bottom:1px solid #e2e8f0;">'
        '<span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;'
        'font-weight:bold;color:#1e293b;">DealerReach.io</span>'
        '</td></tr>'
    )

    # Body
    html += (
        '<tr><td style="background-color:#ffffff;padding:24px 32px;'
        'font-family:Arial,Helvetica,sans-serif;font-size:15px;'
        'line-height:1.6;color:#334155;">'
        '{body}'
        '</td></tr>'
    ).format(body=html_body)

    # Footer
    html += (
        '<tr><td style="background-color:#ffffff;padding:16px 32px 24px 32px;'
        'border-radius:0 0 8px 8px;border-top:1px solid #e2e8f0;">'
        '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;'
        'color:#94a3b8;line-height:1.5;">'
        'This inquiry was sent via DealerReach.io on behalf of a verified customer. '
        'Reference: {ref}'
        '</p></td></tr>'
    ).format(ref=reference_code)

    html += _wrapper_end()
    return html


# ---------------------------------------------------------------------------
# 2. Reply notification (sent TO users — branded, dark-themed, exciting)
# ---------------------------------------------------------------------------

def render_reply_notification(
    user_name: str,
    dealer_name: str,
    product_name: str,
    reference_code: str,
    price: Optional[float] = None,
    lead_time: Optional[str] = None,
    availability: Optional[str] = None,
    summary: Optional[str] = None,
    dashboard_url: Optional[str] = None,
) -> str:
    """Render the notification email sent to users when a dealer replies."""
    html = _wrapper_start(_DARK_BG)

    # Branded header
    html += (
        '<tr><td style="background-color:{dark};padding:32px 32px 24px 32px;'
        'border-radius:8px 8px 0 0;text-align:center;">'
        '<span style="font-family:Arial,Helvetica,sans-serif;font-size:24px;'
        'font-weight:bold;color:{primary};">DealerReach.io</span>'
        '</td></tr>'
    ).format(dark=_DARK_BG, primary=_PRIMARY)

    # "Great news!" section
    html += (
        '<tr><td style="background-color:{card};padding:32px;'
        'font-family:Arial,Helvetica,sans-serif;">'
        '<h1 style="margin:0 0 8px 0;font-size:28px;color:{text};">Great news!</h1>'
        '<p style="margin:0 0 24px 0;font-size:16px;color:{muted};line-height:1.5;">'
        '{dealer} has responded to your inquiry about <strong style="color:{text};">'
        '{product}</strong>.</p>'
    ).format(
        card=_CARD_BG, text=_TEXT, muted=_MUTED,
        dealer=dealer_name, product=product_name,
    )

    # Price highlight
    if price is not None:
        html += (
            '<div style="text-align:center;padding:16px 0 24px 0;">'
            '<span style="font-size:14px;color:{muted};text-transform:uppercase;'
            'letter-spacing:1px;">Quoted Price</span><br>'
            '<span style="font-size:40px;font-weight:bold;color:{success};">'
            '${price}</span></div>'
        ).format(muted=_MUTED, success=_SUCCESS, price="{:,.2f}".format(price))

    # Details grid
    details_rows = ""
    if lead_time:
        details_rows += (
            '<tr>'
            '<td style="padding:12px 16px;font-size:13px;color:{muted};'
            'border-bottom:1px solid #334155;width:40%;">Lead Time</td>'
            '<td style="padding:12px 16px;font-size:15px;color:{text};'
            'border-bottom:1px solid #334155;">{val}</td>'
            '</tr>'
        ).format(muted=_MUTED, text=_TEXT, val=lead_time)
    if availability:
        details_rows += (
            '<tr>'
            '<td style="padding:12px 16px;font-size:13px;color:{muted};'
            'border-bottom:1px solid #334155;width:40%;">Availability</td>'
            '<td style="padding:12px 16px;font-size:15px;color:{text};'
            'border-bottom:1px solid #334155;">{val}</td>'
            '</tr>'
        ).format(muted=_MUTED, text=_TEXT, val=availability)
    if reference_code:
        details_rows += (
            '<tr>'
            '<td style="padding:12px 16px;font-size:13px;color:{muted};width:40%;">'
            'Reference</td>'
            '<td style="padding:12px 16px;font-size:15px;color:{text};">{val}</td>'
            '</tr>'
        ).format(muted=_MUTED, text=_TEXT, val=reference_code)

    if details_rows:
        html += (
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
            'style="background-color:{dark};border-radius:8px;margin-bottom:24px;">'
            '{rows}</table>'
        ).format(dark=_DARK_BG, rows=details_rows)

    # Summary
    if summary:
        html += (
            '<p style="margin:0 0 24px 0;font-size:15px;color:{muted};'
            'line-height:1.6;">{summary}</p>'
        ).format(muted=_MUTED, summary=summary)

    # CTA button
    if dashboard_url:
        html += (
            '<div style="text-align:center;padding:8px 0 0 0;">'
            '<a href="{url}" style="display:inline-block;padding:14px 32px;'
            'background-color:{primary};color:#ffffff;font-size:16px;'
            'font-weight:bold;text-decoration:none;border-radius:8px;">'
            'View Full Reply</a></div>'
        ).format(url=dashboard_url, primary=_PRIMARY)

    html += '</td></tr>'

    # Footer
    html += (
        '<tr><td style="background-color:{dark};padding:24px 32px;'
        'border-radius:0 0 8px 8px;text-align:center;">'
        '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;'
        'color:{muted};line-height:1.5;">'
        'DealerReach.io &mdash; Get dealer pricing on the products you want.<br>'
        '<a href="https://www.dealerreach.io" style="color:{primary};'
        'text-decoration:none;">www.dealerreach.io</a>'
        '</p></td></tr>'
    ).format(dark=_DARK_BG, muted=_MUTED, primary=_PRIMARY)

    html += _wrapper_end()
    return html


# ---------------------------------------------------------------------------
# 3. Welcome email (sent after signup — branded)
# ---------------------------------------------------------------------------

def render_password_reset_email(user_name: str, reset_url: str) -> str:
    """Render the password reset email sent when a user requests a reset."""
    html = _wrapper_start(_DARK_BG)

    # Branded header
    html += (
        '<tr><td style="background-color:{dark};padding:32px 32px 24px 32px;'
        'border-radius:8px 8px 0 0;text-align:center;">'
        '<span style="font-family:Arial,Helvetica,sans-serif;font-size:24px;'
        'font-weight:bold;color:{primary};">DealerReach.io</span>'
        '</td></tr>'
    ).format(dark=_DARK_BG, primary=_PRIMARY)

    # Body section
    html += (
        '<tr><td style="background-color:{card};padding:32px;'
        'font-family:Arial,Helvetica,sans-serif;">'
        '<h1 style="margin:0 0 8px 0;font-size:28px;color:{text};">'
        'Password Reset Request</h1>'
        '<p style="margin:0 0 24px 0;font-size:16px;color:{muted};line-height:1.5;">'
        'Hi {name}, we received a request to reset your password.</p>'
    ).format(card=_CARD_BG, text=_TEXT, muted=_MUTED, name=user_name)

    # CTA button
    html += (
        '<div style="text-align:center;padding:8px 0 24px 0;">'
        '<a href="{url}" style="display:inline-block;padding:14px 32px;'
        'background-color:{primary};color:#ffffff;font-size:16px;'
        'font-weight:bold;text-decoration:none;border-radius:8px;">'
        'Reset Password</a></div>'
    ).format(url=reset_url, primary=_PRIMARY)

    # Note
    html += (
        '<p style="margin:0;font-size:14px;color:{muted};line-height:1.5;">'
        'This link expires in 1 hour. If you didn\'t request this, you can '
        'safely ignore this email.</p>'
    ).format(muted=_MUTED)

    html += '</td></tr>'

    # Footer
    html += (
        '<tr><td style="background-color:{dark};padding:24px 32px;'
        'border-radius:0 0 8px 8px;text-align:center;">'
        '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;'
        'color:{muted};line-height:1.5;">'
        'DealerReach.io &mdash; Get dealer pricing on the products you want.<br>'
        '<a href="https://www.dealerreach.io" style="color:{primary};'
        'text-decoration:none;">www.dealerreach.io</a>'
        '</p></td></tr>'
    ).format(dark=_DARK_BG, muted=_MUTED, primary=_PRIMARY)

    html += _wrapper_end()
    return html


# ---------------------------------------------------------------------------
# 5. Welcome email (sent after signup — branded)
# ---------------------------------------------------------------------------

def render_welcome_email(user_name: str) -> str:
    """Render the welcome email sent after signup."""
    html = _wrapper_start(_DARK_BG)

    # Branded header
    html += (
        '<tr><td style="background-color:{dark};padding:32px 32px 24px 32px;'
        'border-radius:8px 8px 0 0;text-align:center;">'
        '<span style="font-family:Arial,Helvetica,sans-serif;font-size:24px;'
        'font-weight:bold;color:{primary};">DealerReach.io</span>'
        '</td></tr>'
    ).format(dark=_DARK_BG, primary=_PRIMARY)

    # Welcome section
    html += (
        '<tr><td style="background-color:{card};padding:32px;'
        'font-family:Arial,Helvetica,sans-serif;">'
        '<h1 style="margin:0 0 8px 0;font-size:28px;color:{text};">'
        'Welcome to DealerReach.io, {name}!</h1>'
        '<p style="margin:0 0 32px 0;font-size:16px;color:{muted};line-height:1.5;">'
        'You\'re all set to start getting real dealer pricing on the products you '
        'want. Here\'s how it works:</p>'
    ).format(card=_CARD_BG, text=_TEXT, muted=_MUTED, name=user_name)

    # 3 steps
    steps = [
        ("1", "Tell us what you want", "Enter the product details and we'll find authorized dealers near you."),
        ("2", "We reach out for you", "Our system contacts multiple dealers on your behalf with a professional inquiry."),
        ("3", "Compare replies", "Dealers respond with pricing, availability, and lead times. You pick the best deal."),
    ]
    for num, title, desc in steps:
        html += (
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
            'style="margin-bottom:20px;">'
            '<tr>'
            '<td style="width:48px;vertical-align:top;padding-right:16px;">'
            '<div style="width:40px;height:40px;border-radius:20px;'
            'background-color:{primary};color:#ffffff;font-size:18px;'
            'font-weight:bold;text-align:center;line-height:40px;">{num}</div></td>'
            '<td style="vertical-align:top;">'
            '<p style="margin:0 0 4px 0;font-size:16px;font-weight:bold;'
            'color:{text};">{title}</p>'
            '<p style="margin:0;font-size:14px;color:{muted};line-height:1.5;">'
            '{desc}</p></td>'
            '</tr></table>'
        ).format(primary=_PRIMARY, text=_TEXT, muted=_MUTED, num=num, title=title, desc=desc)

    # CTA button
    html += (
        '<div style="text-align:center;padding:16px 0 0 0;">'
        '<a href="https://www.dealerreach.io/new-request" '
        'style="display:inline-block;padding:14px 32px;'
        'background-color:{primary};color:#ffffff;font-size:16px;'
        'font-weight:bold;text-decoration:none;border-radius:8px;">'
        'Create Your First Request</a></div>'
    ).format(primary=_PRIMARY)

    html += '</td></tr>'

    # Footer
    html += (
        '<tr><td style="background-color:{dark};padding:24px 32px;'
        'border-radius:0 0 8px 8px;text-align:center;">'
        '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;'
        'color:{muted};line-height:1.5;">'
        'DealerReach.io &mdash; Get dealer pricing on the products you want.<br>'
        '<a href="https://www.dealerreach.io" style="color:{primary};'
        'text-decoration:none;">www.dealerreach.io</a>'
        '</p></td></tr>'
    ).format(dark=_DARK_BG, muted=_MUTED, primary=_PRIMARY)

    html += _wrapper_end()
    return html


# ---------------------------------------------------------------------------
# 6. Verification email (sent after signup — branded)
# ---------------------------------------------------------------------------

def render_verification_email(user_name: str, verify_url: str) -> str:
    """Render the email verification email sent after signup."""
    html = _wrapper_start(_DARK_BG)

    # Branded header
    html += (
        '<tr><td style="background-color:{dark};padding:32px 32px 24px 32px;'
        'border-radius:8px 8px 0 0;text-align:center;">'
        '<span style="font-family:Arial,Helvetica,sans-serif;font-size:24px;'
        'font-weight:bold;color:{primary};">DealerReach.io</span>'
        '</td></tr>'
    ).format(dark=_DARK_BG, primary=_PRIMARY)

    # Verify section
    html += (
        '<tr><td style="background-color:{card};padding:32px;'
        'font-family:Arial,Helvetica,sans-serif;">'
        '<h1 style="margin:0 0 8px 0;font-size:28px;color:{text};">'
        'Verify Your Email</h1>'
        '<p style="margin:0 0 32px 0;font-size:16px;color:{muted};line-height:1.5;">'
        'Hi {name}, please verify your email to start using DealerReach.</p>'
    ).format(card=_CARD_BG, text=_TEXT, muted=_MUTED, name=user_name)

    # CTA button
    html += (
        '<div style="text-align:center;padding:16px 0 0 0;">'
        '<a href="{url}" '
        'style="display:inline-block;padding:14px 32px;'
        'background-color:{primary};color:#ffffff;font-size:16px;'
        'font-weight:bold;text-decoration:none;border-radius:8px;">'
        'Verify Email</a></div>'
    ).format(url=verify_url, primary=_PRIMARY)

    html += '</td></tr>'

    # Footer
    html += (
        '<tr><td style="background-color:{dark};padding:24px 32px;'
        'border-radius:0 0 8px 8px;text-align:center;">'
        '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;'
        'color:{muted};line-height:1.5;">'
        'If you didn\'t create an account, ignore this email.<br>'
        '<a href="https://www.dealerreach.io" style="color:{primary};'
        'text-decoration:none;">www.dealerreach.io</a>'
        '</p></td></tr>'
    ).format(dark=_DARK_BG, muted=_MUTED, primary=_PRIMARY)

    html += _wrapper_end()
    return html
