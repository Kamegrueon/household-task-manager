from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app import database, models, schemas
from app.settings import settings

# パスワードハッシュ化の設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# JWT設定
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = (
    settings.access_token_expire_minutes if settings.access_token_expire_minutes else 15
)
if settings.secret_key:
    SECRET_KEY = settings.secret_key


def hash_password(password: str) -> str:
    """
    パスワードをハッシュ化します。
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    平文のパスワードとハッシュ化されたパスワードを比較します。
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict[str, Any]) -> str:
    """
    JWTアクセストークンを生成します。
    """
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    data: dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    JWTリフレッシュトークンを生成します。
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(days=3)  # デフォルトで3日間有効

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ユーザーの認証
def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user


def get_current_user(
    token: str = Depends(database.oauth2_scheme), db: Session = Depends(database.get_db)
) -> models.User:
    """
    現在のユーザーを取得します。トークンを検証し、ユーザー情報をデータベースから取得します。
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="認証に失敗しました",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def refresh_access_token(
    refresh_token: schemas.RefreshTokenRequest, db: Session = Depends(database.get_db)
):
    try:
        payload = jwt.decode(
            refresh_token.refresh_token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="トークンの認証に失敗しました。"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="トークンの認証に失敗しました。"
        )

    # リフレッシュトークンの存在と有効期限を確認
    stored_token = (
        db.query(models.RefreshToken)
        .filter(
            models.RefreshToken.token == refresh_token.refresh_token,
            models.RefreshToken.expires_at > datetime.now(),
        )
        .first()
    )

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="有効なリフレッシュトークンではありません。"
        )

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="ユーザーが存在しません。"
        )

    # 新しいアクセストークンを生成
    new_access_token = create_access_token(data={"sub": str(user.id)})

    # リフレッシュトークンをローテーション（新しいトークンを発行し、古いトークンを削除）
    db.delete(stored_token)
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id)}, expires_delta=timedelta(days=3)
    )
    new_stored_refresh_token = models.RefreshToken(
        token=new_refresh_token,
        user_id=user.id,
        expires_at=datetime.now() + timedelta(days=3),
    )
    db.add(new_stored_refresh_token)
    db.commit()

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }
