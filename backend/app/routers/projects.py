from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import database, models, schemas, utils

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


@router.post(
    "/", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED
)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    新しいプロジェクトを作成します。
    """
    new_project = models.Project(
        name=project.name, description=project.description, owner_id=current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # プロジェクトメンバーとしてオーナーを追加
    project_member = models.ProjectMember(
        project_id=new_project.id, user_id=current_user.id, role="Admin"
    )
    db.add(project_member)
    db.commit()

    return new_project


@router.get("/", response_model=List[schemas.ProjectResponse])
def get_projects(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    現在のユーザーが参加しているすべてのプロジェクトを取得します。
    """
    projects = (
        db.query(models.Project)
        .join(models.ProjectMember)
        .filter(models.ProjectMember.user_id == current_user.id)
        .all()
    )
    return projects


@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    特定のプロジェクトの詳細を取得します。
    """
    project = (
        db.query(models.Project)
        .join(models.ProjectMember)
        .filter(
            models.Project.id == project_id,
            models.ProjectMember.user_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="プロジェクトが見つかりません"
        )

    return project


@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    project_update: schemas.ProjectCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    プロジェクトの情報を更新します。
    """
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id, models.Project.owner_id == current_user.id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="プロジェクトが見つかりませんまたは権限がありません"
        )

    project.name = project_update.name

    if project_update.description is not None:
        project.description = project_update.description
    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    プロジェクトを削除します。
    """
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id, models.Project.owner_id == current_user.id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="プロジェクトが見つかりませんまたは権限がありません"
        )

    db.delete(project)
    db.commit()

    return
