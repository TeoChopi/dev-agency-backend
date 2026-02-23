"""Product database model"""
from decimal import Decimal
from typing import Optional

from sqlalchemy import String, Text, Numeric, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Product(Base):
    """Product model for e-commerce items"""
    
    __tablename__ = "products"
    
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        index=True
    )
    
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True
    )
    
    image_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        index=True
    )
    
    stock_quantity: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
        index=True
    )
    
    # Add constraints
    __table_args__ = (
        CheckConstraint('price > 0', name='price_positive'),
        CheckConstraint('stock_quantity >= 0', name='stock_non_negative'),
    )
    
    def __repr__(self) -> str:
        """String representation of product"""
        return f"<Product(id={self.id}, name='{self.name}', price={self.price})>"