from __future__ import annotations

import enum
import secrets
from typing import Optional

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class ProjectStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    presented = "presented"
    approved = "approved"
    ordered = "ordered"
    completed = "completed"


class ClientProject(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "client_projects"

    client_id: Mapped[str] = mapped_column(ForeignKey("clients.id"), nullable=False)
    dealer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus), default=ProjectStatus.draft
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    access_token: Mapped[str] = mapped_column(
        String(64), default=lambda: secrets.token_urlsafe(32), unique=True
    )

    client = relationship("Client", back_populates="projects")
    items = relationship("ProjectProduct", back_populates="project", lazy="selectin")
