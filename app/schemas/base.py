"""Base Pydantic schemas"""
from datetime import datetime
from typing import Any, Dict

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Base schema with common configuration"""
    
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True
    )


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields"""
    
    created_at: datetime
    updated_at: datetime


class ResponseBase(BaseSchema):
    """Base response schema"""
    
    success: bool = True
    message: str = "Operation completed successfully"
    data: Any = None


class ErrorResponse(BaseSchema):
    """Error response schema"""
    
    success: bool = False
    message: str
    errors: Dict[str, Any] = {}