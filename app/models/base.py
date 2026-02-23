"""Base model with common fields and utilities"""
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, func
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base model class with common attributes"""
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        index=True
    )
    
    @declared_attr
    def __tablename__(cls) -> str:
        """Generate table name from class name"""
        return cls.__name__.lower()
    
    def dict(self) -> dict[str, Any]:
        """Convert model to dictionary"""
        return {
            column.key: getattr(self, column.key)
            for column in self.__table__.columns
        }
    
    def __repr__(self) -> str:
        """String representation of model"""
        return f"<{self.__class__.__name__}(id={self.id})>"