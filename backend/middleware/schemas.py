import datetime
import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username must be between 3 and 50 characters")
    email: str
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not re.match(EMAIL_REGEX, v):
            raise ValueError('Invalid email address format')
        return v.lower().strip()

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator('email')
    @classmethod
    def validate_email_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not re.match(EMAIL_REGEX, v):
                raise ValueError('Invalid email address format')
            return v.lower().strip()
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefreshRequest(BaseModel):
    refresh_token: Optional[str] = None
