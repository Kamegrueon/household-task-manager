from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


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


class ProjectBase(BaseModel):
    name: str


class ProjectCreate(ProjectBase):
    name: str


class ProjectResponse(ProjectBase):
    id: int
    name: str
    owner_id: int
    created_at: datetime
    updated_at: datetime

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


class TaskExecutionResponse(TaskExecutionBase):
    id: int
    project_id: int
    task_id: int
    user_id: int
    execution_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
