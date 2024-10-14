from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import database, models, schemas

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/", response_model=List[schemas.UserResponse])
def get_users(
    email: Optional[str] = Query(None, min_length=1),
    db: Session = Depends(database.get_db),
):
    if email:
        users = (
            db.query(models.User).filter(models.User.email.ilike(f"%{email}%")).all()
        )
    else:
        users = db.query(models.User).all()
    return users


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません。")
    return user
