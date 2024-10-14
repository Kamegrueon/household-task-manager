import os
from typing import Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# 環境変数ENVIRONMENTに基づいて処理を分岐
environment = os.getenv("ENVIRONMENT", "development")

if environment != "production":
    # production以外の場合は.envファイルをロード
    load_dotenv(".env.development")


class Settings(BaseSettings):
    environment: str = environment  # デフォルトは開発環境
    supabase_database_url: Optional[str] = None  # 本番環境でのみ使用
    supabase_anon_key: Optional[str] = None  # 本番環境でのみ必要
    supabase_service_role_key: Optional[str] = None  # 本番環境でのみ必要
    local_database_url: Optional[str] = None  # ローカル開発用のデータベースURLを追加
    secret_key: Optional[str] = None
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=None)  # 本番環境ではenv_fileを使用しない

    def __init__(self, **values):  # type: ignore
        super().__init__(**values)  # type: ignore
        if self.environment != "production":
            # developmentの場合のみ .env.development を使う
            if not self.local_database_url:
                raise ValueError(
                    "LOCAL_DATABASE_URL が設定されていません。環境変数または .env ファイルを確認してください。"
                )
            if not self.secret_key:
                raise ValueError("SECRET_KEY が設定されていません。環境変数または .env ファイルを確認してください。")
        else:
            # productionの場合の追加チェック（必要に応じて）
            if not self.supabase_database_url:
                raise ValueError("SUPABASE_DATABASE_URL が設定されていません。環境変数を確認してください。")
            if not self.secret_key:
                raise ValueError("SECRET_KEY が設定されていません。環境変数を確認してください。")


settings = Settings()
