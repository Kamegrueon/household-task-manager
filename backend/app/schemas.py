from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserBase(BaseModel):
    id: int
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    name: str
    description: Optional[str]


class ProjectCreate(ProjectBase):
    name: str
    description: Optional[str]


class ProjectResponse(ProjectBase):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectMemberBase(BaseModel):
    user: UserBase
    role: Optional[str] = None  # 役割などの追加フィールドがあれば


class ProjectMemberCreate(ProjectMemberBase):
    pass


class ProjectMemberUpdate(BaseModel):
    role: Optional[str] = None  # 更新可能なフィールドのみ


class ProjectMemberResponse(ProjectMemberBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True


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
    task_id: int
    user_id: int
    execution_date: datetime


class TaskExecutionResponse(TaskExecutionBase):
    id: int
    task_id: int
    task_name: str
    user_id: int
    user_name: str
    execution_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
