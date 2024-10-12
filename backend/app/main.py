from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, projects, tasks, tasks_executions

# テーブルの作成
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なオリジンに変更
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターのインクルード
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(tasks_executions.router)


@app.get("/")
def read_root():
    return {"message": "家事タスク管理アプリへようこそ"}
