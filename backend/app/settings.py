import os
from typing import Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()
# 環境変数ENVIRONMENTに基づいて.envファイルを変更
environment = os.getenv("ENVIRONMENT", "development")

if environment == "production":
    env_file = ".env.production"
else:
    env_file = ".env.development"


class Settings(BaseSettings):
    environment: str = environment  # デフォルトは開発環境
    supabase_url: Optional[str] = None  # Optionalに変更
    supabase_anon_key: Optional[str] = None  # 本番環境でのみ必要
    secret_key: Optional[str] = None
    access_token_expire_minutes: int = 30

    class Config:
        env_file = env_file

    def __init__(self, **values):  # type: ignore
        super().__init__(**values)  # type: ignore
        if not self.supabase_url:
            raise ValueError("SUPABASE_URL が設定されていません。環境変数または .env ファイルを確認してください。")
        if not self.secret_key:
            raise ValueError("SECRET_KEY が設定されていません。環境変数または .env ファイルを確認してください。")


settings = Settings()
