from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

# ============================
# Authentication Schemas
# ============================


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    username: Optional[str] = None


# ============================
# User Schemas
# ============================


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# ============================
# Project Schemas
# ============================


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================
# Project Member Schemas
# ============================


class ProjectMemberBase(BaseModel):
    role: str


class ProjectMemberCreate(ProjectMemberBase):
    user_id: int


class ProjectMemberUpdate(BaseModel):
    role: str


class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    user: UserResponse  # ユーザー情報を含める
    role: str

    class Config:
        from_attributes = True


# ============================
# Task Schemas
# ============================


class TaskBase(BaseModel):
    category: str
    task_name: str
    frequency: int


class TaskCreate(TaskBase):
    pass


class TaskResponse(TaskBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================
# Task Execution Schemas
# ============================


class TaskExecutionBase(BaseModel):
    task_id: int
    user_id: int


class TaskExecutionCreate(TaskExecutionBase):
    execution_date: Optional[datetime] = None


class TaskExecutionUpdate(BaseModel):
    user_id: Optional[int] = None
    execution_date: Optional[datetime] = None


class TaskExecutionCreateResponse(TaskExecutionBase):
    id: int
    execution_date: datetime

    class Config:
        from_attributes = True


class TaskExecutionResponse(TaskExecutionBase):
    id: int
    task_id: int
    category: str
    task_name: str
    user_id: int
    user_name: str
    execution_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
