import os
import sys

# スクリプトの現在のディレクトリを取得
current_dir = os.path.dirname(os.path.abspath(__file__))
# 親ディレクトリ（プロジェクトのルート）を取得
parent_dir = os.path.dirname(current_dir)
# 親ディレクトリをPythonのモジュール検索パスに追加
sys.path.append(parent_dir)

from sqlalchemy import text  # noqa: E402
from sqlalchemy.exc import SQLAlchemyError  # noqa: E402

from app import database, models  # noqa: E402
from app.settings import settings  # noqa: E402


def test_connection():
    try:
        # 現在の環境を表示
        print(f"Environment: {settings.environment}")

        # 使用しているデータベースURLを表示（セキュリティ上、必要に応じてマスクしてください）
        if settings.environment == "production":
            print(
                f"Connecting to Production (Supabase) Database: {settings.supabase_database_url}"
            )
        else:
            print(
                f"Connecting to Development (Local PostgreSQL) Database: {settings.local_database_url}"
            )

        # データベースに接続し、テーブルが存在するか確認
        models.Base.metadata.create_all(bind=database.engine)
        print("Database connection successful.")

        # 接続しているデータベースの名前を取得
        with database.engine.connect() as connection:
            result = connection.execute(text("SELECT current_database();"))
            db_name = result.fetchone()[0]  # type: ignore
            print(f"Connected to database: {db_name}")

        # 特定のテーブルが存在するか確認（例: users テーブル）
        with database.engine.connect() as connection:
            result = connection.execute(
                text(
                    """
                SELECT to_regclass('public.users');
            """
                )
            )
            table_exists = result.fetchone()[0]  # type: ignore
            if table_exists:
                print("Table 'users' exists in the database.")
            else:
                print("Table 'users' does NOT exist in the database.")

    except SQLAlchemyError as e:
        print(f"Database connection failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    test_connection()
