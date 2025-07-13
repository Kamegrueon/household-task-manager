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

# CORS設定
origins = [
    "http://localhost:4173",  # フロントエンドのURL
    "http://localhost:5173",  # フロントエンドのURL
    "https://household-task-manager-topaz.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 本番環境では適切なオリジンに変更
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
