from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app import database, models, schemas, utils

router = APIRouter(
    prefix="/projects/{project_id}/tasks/due",
    tags=["DueTasks"],
)


def due_tasks(db: Session, project_id: int):
    """
    実施が必要なタスクの一覧を取得します。
    実施が必要なタスクとは、前回実施日 + 頻度日数 が本日より前のタスク。
    """

    # サブクエリで各タスクの最新実行日を取得
    subquery = (
        db.query(
            models.TaskExecution.task_id,
            func.max(models.TaskExecution.execution_date).label("last_execution"),
        )
        .join(models.Task, models.Task.id == models.TaskExecution.task_id)
        .filter(models.Task.project_id == project_id)
        .group_by(models.TaskExecution.task_id)
        .subquery()
    )

    # 実施が必要なタスクをフィルタリング
    due_tasks_query = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id)
        .outerjoin(subquery, models.Task.id == subquery.c.task_id)
        .filter(
            or_(
                subquery.c.last_execution == None,  # noqa: E711
                func.date(subquery.c.last_execution) + models.Task.frequency
                < func.current_date(),
            )
        )
        .order_by(models.Task.category)
    )

    print(due_tasks_query.statement.compile(compile_kwargs={"literal_binds": True}))
    due_tasks = due_tasks_query.all()

    return due_tasks


@router.get("/", response_model=List[schemas.TaskResponse])
def get_due_tasks(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    指定されたプロジェクト内のすべてのタスクを取得します。
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

    tasks = due_tasks(db, project_id)
    return tasks
