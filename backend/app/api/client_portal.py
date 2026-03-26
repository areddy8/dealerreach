from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models.client_project import ClientProject, ProjectStatus
from app.models.project_product import ProjectProduct
from app.models.user import User
from app.schemas.client import ClientProjectResponse
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/portal", tags=["portal"])


class PortalProjectResponse(BaseModel):
    project: ClientProjectResponse
    products: list[ProductResponse]
    dealer_company_name: str | None = None

    model_config = {"from_attributes": True}


@router.get("/{access_token}", response_model=PortalProjectResponse)
async def get_portal_project(
    access_token: str,
    session: AsyncSession = Depends(get_session),
) -> dict:
    stmt = (
        select(ClientProject)
        .options(selectinload(ClientProject.items).selectinload(ProjectProduct.product))
        .where(ClientProject.access_token == access_token)
    )
    result = await session.execute(stmt)
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Get dealer info
    dealer_result = await session.execute(
        select(User).where(User.id == project.dealer_id)
    )
    dealer = dealer_result.scalar_one_or_none()
    dealer_company_name = dealer.company_name if dealer else None

    products = [item.product for item in project.items if item.product]

    return {
        "project": project,
        "products": products,
        "dealer_company_name": dealer_company_name,
    }


@router.post("/{access_token}/approve", response_model=ClientProjectResponse)
async def approve_project(
    access_token: str,
    session: AsyncSession = Depends(get_session),
) -> ClientProject:
    result = await session.execute(
        select(ClientProject).where(ClientProject.access_token == access_token)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project.status = ProjectStatus.approved
    await session.flush()
    return project
