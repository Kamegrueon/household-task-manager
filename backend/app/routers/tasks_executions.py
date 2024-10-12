from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import database, models, schemas, utils

router = APIRouter(
    prefix="/projects/{project_id}/tasksExecutions",
    tags=["TasksExecutions"],
)


@router.post(
    "/{task_id}",
    response_model=schemas.TaskExecutionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task_execution(
    project_id: int,
    task_id: int,
    task_execution: schemas.TaskExecutionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    実行したタスクを登録します
    """
    # プロジェクトメンバーシップの確認
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

    new_task_execute = models.TaskExecution(
        project_id=project_id,
        task_id=task_id,
        user_id=current_user.id,
        execution_date=task_execution.execution_date,
    )
    db.add(new_task_execute)
    db.commit()
    db.refresh(new_task_execute)

    return new_task_execute


@router.get("/", response_model=List[schemas.TaskExecutionResponse])
def get_task_executions(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    指定されたプロジェクト内のすべてのタスク実行履歴を取得します。
    """
    # プロジェクトメンバーシップの確認
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

    task_executions = (
        db.query(models.TaskExecution)
        .filter(models.TaskExecution.project_id == project_id)
        .all()
    )
    return task_executions
