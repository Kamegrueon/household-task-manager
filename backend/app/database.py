from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .settings import settings

SUPABASE_URL = settings.supabase_url
SECRET_KEY = settings.secret_key

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL が設定されていません。.env ファイルを確認してください。")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY が設定されていません。.env ファイルを確認してください。")

DATABASE_URL = SUPABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
