"""Product Pydantic schemas"""
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator

from app.schemas.base import BaseSchema, TimestampMixin


class ProductBase(BaseSchema):
    """Base product schema with common fields"""
    
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Product name"
    )
    
    price: Decimal = Field(
        ...,
        gt=0,
        max_digits=10,
        decimal_places=2,
        description="Product price in USD"
    )
    
    category: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Product category"
    )
    
    image_url: Optional[HttpUrl] = Field(
        None,
        description="Product image URL"
    )
    
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Product description"
    )
    
    stock_quantity: int = Field(
        default=0,
        ge=0,
        description="Available stock quantity"
    )
    
    is_active: bool = Field(
        default=True,
        description="Whether the product is active and available for purchase"
    )
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v: str) -> str:
        """Validate and normalize category"""
        return v.strip().title()
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate and normalize product name"""
        return v.strip()


class ProductCreate(ProductBase):
    """Schema for creating a new product"""
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Premium Wireless Headphones",
                "price": "199.99",
                "category": "Electronics",
                "image_url": "https://example.com/images/headphones.jpg",
                "description": "High-quality wireless headphones with noise cancellation",
                "stock_quantity": 50,
                "is_active": True
            }
        }


class ProductUpdate(BaseSchema):
    """Schema for updating an existing product"""
    
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Product name"
    )
    
    price: Optional[Decimal] = Field(
        None,
        gt=0,
        max_digits=10,
        decimal_places=2,
        description="Product price in USD"
    )
    
    category: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Product category"
    )
    
    image_url: Optional[HttpUrl] = Field(
        None,
        description="Product image URL"
    )
    
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Product description"
    )
    
    stock_quantity: Optional[int] = Field(
        None,
        ge=0,
        description="Available stock quantity"
    )
    
    is_active: Optional[bool] = Field(
        None,
        description="Whether the product is active and available for purchase"
    )
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        """Validate and normalize category"""
        return v.strip().title() if v else None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate and normalize product name"""
        return v.strip() if v else None


class ProductInDB(ProductBase, TimestampMixin):
    """Product schema with database fields"""
    
    id: int = Field(..., description="Product ID")


class Product(ProductInDB):
    """Complete product schema for API responses"""
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Premium Wireless Headphones",
                "price": "199.99",
                "category": "Electronics",
                "image_url": "https://example.com/images/headphones.jpg",
                "description": "High-quality wireless headphones with noise cancellation",
                "stock_quantity": 50,
                "is_active": True,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class ProductList(BaseSchema):
    """Schema for paginated product list responses"""
    
    items: List[Product] = Field(..., description="List of products")
    total: int = Field(..., description="Total number of products")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    pages: int = Field(..., description="Total number of pages")
    
    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "id": 1,
                        "name": "Premium Wireless Headphones",
                        "price": "199.99",
                        "category": "Electronics",
                        "image_url": "https://example.com/images/headphones.jpg",
                        "description": "High-quality wireless headphones with noise cancellation",
                        "stock_quantity": 50,
                        "is_active": True,
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-15T10:30:00Z"
                    }
                ],
                "total": 100,
                "page": 1,
                "per_page": 20,
                "pages": 5
            }
        }