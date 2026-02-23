"""Base repository with common CRUD operations"""
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository class with common CRUD operations"""
    
    def __init__(self, model: Type[ModelType]):
        """Initialize repository with model class"""
        self.model = model
    
    async def get(
        self,
        db: AsyncSession,
        id: Any
    ) -> Optional[ModelType]:
        """Get a single record by ID"""
        result = await db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()
    
    async def get_multi(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        **filters: Any
    ) -> List[ModelType]:
        """Get multiple records with pagination and filtering"""
        query = select(self.model)
        
        # Apply filters
        for key, value in filters.items():
            if hasattr(self.model, key) and value is not None:
                query = query.where(getattr(self.model, key) == value)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def count(
        self,
        db: AsyncSession,
        **filters: Any
    ) -> int:
        """Count records with optional filtering"""
        query = select(func.count(self.model.id))
        
        # Apply filters
        for key, value in filters.items():
            if hasattr(self.model, key) and value is not None:
                query = query.where(getattr(self.model, key) == value)
        
        result = await db.execute(query)
        return result.scalar()
    
    async def create(
        self,
        db: AsyncSession,
        obj_in: Union[Dict[str, Any], Any]
    ) -> ModelType:
        """Create a new record"""
        if isinstance(obj_in, dict):
            db_obj = self.model(**obj_in)
        else:
            obj_data = obj_in.model_dump() if hasattr(obj_in, 'model_dump') else obj_in.dict()
            db_obj = self.model(**obj_data)
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def update(
        self,
        db: AsyncSession,
        db_obj: ModelType,
        obj_in: Union[Dict[str, Any], Any]
    ) -> ModelType:
        """Update an existing record"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, 'model_dump') else obj_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def delete(
        self,
        db: AsyncSession,
        id: Any
    ) -> Optional[ModelType]:
        """Delete a record by ID"""
        db_obj = await self.get(db, id)
        if db_obj:
            await db.delete(db_obj)
            await db.commit()
        return db_obj
    
    async def bulk_create(
        self,
        db: AsyncSession,
        objects: List[Union[Dict[str, Any], Any]]
    ) -> List[ModelType]:
        """Create multiple records in bulk"""
        db_objects = []
        
        for obj_in in objects:
            if isinstance(obj_in, dict):
                db_obj = self.model(**obj_in)
            else:
                obj_data = obj_in.model_dump() if hasattr(obj_in, 'model_dump') else obj_in.dict()
                db_obj = self.model(**obj_data)
            db_objects.append(db_obj)
        
        db.add_all(db_objects)
        await db.commit()
        
        for db_obj in db_objects:
            await db.refresh(db_obj)
        
        return db_objects