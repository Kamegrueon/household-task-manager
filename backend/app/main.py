import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import (
    auth,
    due_tasks,
    executions,
    project_members,
    projects,
    tasks,
    users,
)

# テーブルの作成
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS設定 - 環境変数から読み込み
cors_origins_env = os.getenv("CORS_ORIGINS", "")
origins = []

# 環境変数からオリジンを追加（カンマ区切り）
if cors_origins_env:
    origins.extend([origin.strip() for origin in cors_origins_env.split(",")])

# 開発環境用のオリジンを追加
dev_origins = [
    "http://localhost:80",
    "http://localhost:5173",
]
origins.extend(dev_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターのインクルード
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(project_members.router)
app.include_router(due_tasks.router)
app.include_router(executions.router)
app.include_router(tasks.router)
