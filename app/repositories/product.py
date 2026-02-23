"""Product repository with specific business logic"""
from typing import List, Optional

from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    """Product repository with specific query methods"""
    
    def __init__(self):
        """Initialize product repository"""
        super().__init__(Product)
    
    async def get_by_name(
        self,
        db: AsyncSession,
        name: str
    ) -> Optional[Product]:
        """Get product by exact name"""
        result = await db.execute(
            select(Product).where(Product.name == name)
        )
        return result.scalar_one_or_none()
    
    async def get_by_category(
        self,
        db: AsyncSession,
        category: str,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = True
    ) -> List[Product]:
        """Get products by category"""
        query = select(Product).where(Product.category == category)
        
        if active_only:
            query = query.where(Product.is_active == True)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def search_products(
        self,
        db: AsyncSession,
        search_term: str,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = True
    ) -> List[Product]:
        """Search products by name or description"""
        query = select(Product).where(
            or_(
                Product.name.ilike(f"%{search_term}%"),
                Product.description.ilike(f"%{search_term}%")
            )
        )
        
        if active_only:
            query = query.where(Product.is_active == True)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_price_range(
        self,
        db: AsyncSession,
        min_price: float,
        max_price: float,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = True
    ) -> List[Product]:
        """Get products within price range"""
        query = select(Product).where(
            and_(
                Product.price >= min_price,
                Product.price <= max_price
            )
        )
        
        if active_only:
            query = query.where(Product.is_active == True)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_low_stock_products(
        self,
        db: AsyncSession,
        threshold: int = 10,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """Get products with low stock"""
        query = select(Product).where(
            and_(
                Product.stock_quantity <= threshold,
                Product.is_active == True
            )
        )
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_active_products(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """Get only active products"""
        query = select(Product).where(Product.is_active == True)
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def update_stock(
        self,
        db: AsyncSession,
        product_id: int,
        quantity_change: int
    ) -> Optional[Product]:
        """Update product stock quantity"""
        product = await self.get(db, product_id)
        if product:
            new_quantity = max(0, product.stock_quantity + quantity_change)
            product.stock_quantity = new_quantity
            await db.commit()
            await db.refresh(product)
        return product


# Create a singleton instance
product_repository = ProductRepository()