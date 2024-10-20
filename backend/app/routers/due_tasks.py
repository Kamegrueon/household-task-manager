# app/routers/due_tasks.py

from datetime import date, timedelta
from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app import database, models, schemas, utils


# 追加: フィルタータイプの定義
class FilterType(str, Enum):
    today = "today"
    tomorrow = "tomorrow"
    week = "week"
    month = "month"  # 新規追加


router = APIRouter(
    prefix="/projects/{project_id}/tasks/due",
    tags=["DueTasks"],
)


def due_tasks(db: Session, project_id: int, target_date: date):
    """
    実施が必要なタスクの一覧を取得します。
    実施が必要なタスクとは、前回実施日 + 頻度日数 <= target_date のタスク。
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
                <= target_date,
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
    filter_type: Optional[FilterType] = Query(
        None, description="Filter by time period"
    ),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    指定されたプロジェクト内の実施が必要なタスクを取得します。
    フィルタを指定することで期間を絞り込むことができます。
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

    # Determine target_date based on filter_type
    today = date.today()
    if filter_type == FilterType.today:
        target_date = today
    elif filter_type == FilterType.tomorrow:
        target_date = today + timedelta(days=1)
    elif filter_type == FilterType.week:
        target_date = today + timedelta(days=7)
    elif filter_type == FilterType.month:
        target_date = today + timedelta(days=30)  # 1ヶ月後を30日と定義
    else:
        # Default to today if no filter_type provided
        target_date = today

    tasks = due_tasks(db, project_id, target_date)
    return tasks
