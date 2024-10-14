from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import PasswordChange, Token, UserCreate, UserResponse, UserUpdate
from app.utils import (
    authenticate_user,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register/", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    新しいユーザーを登録します。
    """
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="メールアドレスが既に存在します")

    hashed_password = hash_password(user.password)
    new_user = User(
        username=user.username, email=user.email, password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login/", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    ユーザーを認証し、アクセストークンを発行します。
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="パスワードが正しくありません")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    ログイン中のユーザーの情報を返します。
    """
    return current_user


@router.put("/update-profile")
def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ユーザーのプロフィールを更新します。
    """
    if update_data.username:
        current_user.username = update_data.username
    if update_data.email:
        current_user.email = update_data.email

    db.add(current_user)
    db.commit()
    return {"msg": "プロフィールが更新されました。"}


@router.put("/change-password")
def change_password(
    change_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    パスワードを変更します。
    """
    if not pwd_context.verify(change_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="現在のパスワードが正しくありません。")

    current_user.password_hash = pwd_context.hash(change_data.new_password)
    db.add(current_user)
    db.commit()
    return {"msg": "パスワードが変更されました。"}
