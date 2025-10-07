from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import String, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

# ---------- ENTIDAD ORM ----------
class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("customerid", name="uq_users_customerid"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    customerid: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

# ---------- DTOs ----------
class CredentialsDTO(BaseModel):
    customerid: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=4, max_length=200)

class AuthResponseDTO(BaseModel):
    userCreated: bool
