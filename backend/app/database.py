from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .settings import settings

# 環境変数に基づいてデータベースURLを選択
if settings.environment == "production":
    # 本番環境ではSupabaseのデータベースURLを使用
    if not settings.supabase_database_url:
        raise ValueError("SUPABASE_DATABASE_URL が設定されていません。環境変数を確認してください。")
    database_url = settings.supabase_database_url
else:
    # 開発環境ではローカルのPostgreSQLを使用
    if not settings.local_database_url:
        raise ValueError("LOCAL_DATABASE_URL が設定されていません。環境変数または .env ファイルを確認してください。")
    database_url = settings.local_database_url

DATABASE_URL = database_url

# SQLAlchemyエンジンの作成
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# セッションローカルの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# デクララティブベースの作成
Base = declarative_base()

# OAuth2のスキーム設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    """データベースセッションを取得する依存関係"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
