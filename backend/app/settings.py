import os
from typing import Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# 環境変数ENVIRONMENTに基づいて処理を分岐
environment = os.getenv("ENVIRONMENT", "development")

if environment != "production":
    # production以外の場合は.envファイルをロード
    load_dotenv(".env.development")


class Settings(BaseSettings):
    environment: str = environment  # デフォルトは開発環境
    supabase_url: Optional[str] = None  # Optionalに変更
    supabase_anon_key: Optional[str] = None  # 本番環境でのみ必要
    secret_key: Optional[str] = None
    access_token_expire_minutes: int = 30

    class Config:
        env_file = None  # 本番環境では環境変数からのみ読み取るため、env_fileは指定しない

    def __init__(self, **values):  # type: ignore
        super().__init__(**values)  # type: ignore
        if environment != "production":
            # developmentの場合のみ .env.development を使う
            if not self.supabase_url:
                raise ValueError("SUPABASE_URL が設定されていません。環境変数または .env ファイルを確認してください。")
            if not self.secret_key:
                raise ValueError("SECRET_KEY が設定されていません。環境変数または .env ファイルを確認してください。")


settings = Settings()
