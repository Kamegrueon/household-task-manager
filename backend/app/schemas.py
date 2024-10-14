from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

# ============================
# Authentication Schemas
# ============================


class Token(BaseModel):
    access_token: str
    token_type: str


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
    role: Optional[str] = None  # 役割などの追加フィールドがあれば


class ProjectMemberCreate(ProjectMemberBase):
    user_id: int


class ProjectMemberUpdate(BaseModel):
    role: Optional[str] = None  # 更新可能なフィールドのみ


class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    user: UserResponse  # ユーザー情報を含める
    role: Optional[str] = None

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
    execution_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class TaskExecutionResponse(BaseModel):
    id: int
    task_id: int
    task_name: str
    user_id: int
    user_name: str
    execution_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
