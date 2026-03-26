from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.database import get_session
from app.models.client import Client
from app.models.client_project import ClientProject
from app.models.project_product import ProjectProduct
from app.models.user import User
from app.schemas.client import (
    ClientProjectCreate,
    ClientProjectResponse,
    ClientProjectUpdate,
    ProjectProductCreate,
    ProjectProductResponse,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=list[ClientProjectResponse])
async def list_projects(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ClientProject]:
    stmt = (
        select(ClientProject)
        .where(ClientProject.dealer_id == current_user.id)
        .offset(offset)
        .limit(limit)
        .order_by(ClientProject.created_at.desc())
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{project_id}", response_model=ClientProjectResponse)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ClientProject:
    stmt = (
        select(ClientProject)
        .options(selectinload(ClientProject.items).selectinload(ProjectProduct.product))
        .where(
            ClientProject.id == project_id,
            ClientProject.dealer_id == current_user.id,
        )
    )
    result = await session.execute(stmt)
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post(
    "/clients/{client_id}/projects",
    response_model=ClientProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    client_id: str,
    body: ClientProjectCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ClientProject:
    # Verify client belongs to dealer
    result = await session.execute(
        select(Client).where(
            Client.id == client_id, Client.dealer_id == current_user.id
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    project = ClientProject(
        client_id=client_id,
        dealer_id=current_user.id,
        name=body.name,
        notes=body.notes,
    )
    session.add(project)
    await session.flush()
    return project


@router.patch("/{project_id}", response_model=ClientProjectResponse)
async def update_project(
    project_id: str,
    body: ClientProjectUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ClientProject:
    result = await session.execute(
        select(ClientProject).where(
            ClientProject.id == project_id,
            ClientProject.dealer_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    await session.flush()
    return project


@router.post("/{project_id}/products", response_model=ProjectProductResponse, status_code=status.HTTP_201_CREATED)
async def add_product_to_project(
    project_id: str,
    body: ProjectProductCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ProjectProduct:
    # Verify project belongs to dealer
    result = await session.execute(
        select(ClientProject).where(
            ClientProject.id == project_id,
            ClientProject.dealer_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    item = ProjectProduct(
        project_id=project_id,
        product_id=str(body.product_id),
        quantity=body.quantity,
        custom_price=body.custom_price,
        notes=body.notes,
    )
    session.add(item)
    await session.flush()
    return item


@router.delete("/{project_id}/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_product_from_project(
    project_id: str,
    product_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    # Verify project belongs to dealer
    proj_result = await session.execute(
        select(ClientProject).where(
            ClientProject.id == project_id,
            ClientProject.dealer_id == current_user.id,
        )
    )
    if not proj_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    result = await session.execute(
        select(ProjectProduct).where(
            ProjectProduct.project_id == project_id,
            ProjectProduct.product_id == product_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in project")
    await session.delete(item)
    await session.flush()


@router.post("/{project_id}/share")
async def share_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    result = await session.execute(
        select(ClientProject).where(
            ClientProject.id == project_id,
            ClientProject.dealer_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    portal_url = f"https://www.dealerreach.io/portal/{project.access_token}"
    return {"access_token": project.access_token, "portal_url": portal_url}
