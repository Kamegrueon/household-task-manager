# app/routers/project_member.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app import database, models, schemas, utils

router = APIRouter(
    prefix="/projects/{project_id}/members",
    tags=["Project Members"],
)


def get_project_membership(project_id: int, current_user: models.User, db: Session):
    """
    現在のユーザーがプロジェクトのメンバーであることを確認します。
    """
    membership = (
        db.query(models.ProjectMember)
        .filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == current_user.id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="このプロジェクトに参加していません"
        )
    return membership


@router.get("/", response_model=List[schemas.ProjectMemberResponse])
def get_project_members(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    指定されたプロジェクトの全メンバーを取得します。
    """
    get_project_membership(project_id, current_user, db)

    members = (
        db.query(models.ProjectMember)
        .options(joinedload(models.ProjectMember.user))  # ユーザーデータをロード
        .filter(models.ProjectMember.project_id == project_id)
        .all()
    )

    return members


@router.post(
    "/",
    response_model=schemas.ProjectMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_project_member(
    project_id: int,
    member: schemas.ProjectMemberCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    プロジェクトに新しいメンバーを追加します。
    """
    get_project_membership(project_id, current_user, db)

    # 追加しようとしているユーザーが存在するか確認
    user = db.query(models.User).filter(models.User.id == member.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="指定されたユーザーが見つかりません")

    # 既にメンバーとして存在するか確認
    existing_member = (
        db.query(models.ProjectMember)
        .filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == member.user_id,
        )
        .first()
    )
    if existing_member:
        raise HTTPException(status_code=400, detail="既にプロジェクトのメンバーです")

    new_member = models.ProjectMember(
        project_id=project_id, user_id=member.user_id, role=member.role
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


@router.put("/{member_id}", response_model=schemas.ProjectMemberResponse)
def update_project_member(
    project_id: int,
    member_id: int,
    member_update: schemas.ProjectMemberUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    プロジェクトメンバーの情報を更新します。
    """
    get_project_membership(project_id, current_user, db)

    member = (
        db.query(models.ProjectMember)
        .filter(
            models.ProjectMember.id == member_id,
            models.ProjectMember.project_id == project_id,
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="プロジェクトメンバーが見つかりません")

    if member_update.role is not None:
        member.role = member_update.role

    db.commit()
    db.refresh(member)

    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_member(
    project_id: int,
    member_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    プロジェクトメンバーを削除します。
    """
    get_project_membership(project_id, current_user, db)

    member = (
        db.query(models.ProjectMember)
        .filter(
            models.ProjectMember.id == member_id,
            models.ProjectMember.project_id == project_id,
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="プロジェクトメンバーが見つかりません")

    db.delete(member)
    db.commit()

    return
