# app/routers/due_tasks.py

from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, literal, or_
from sqlalchemy.orm import Session
from sqlalchemy.types import Interval
from zoneinfo import ZoneInfo  # 追加: ZoneInfoをインポート

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


def due_tasks(
    db: Session, project_id: int, target_start: datetime, target_end: datetime
):
    """
    実施が必要なタスクの一覧を取得します。
    実施が必要なタスクとは、前回実施日 + 頻度日数が target_start から target_end の範囲内にあるタスク。
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

    # INTERVAL '1 day' を表現
    interval_one_day = literal("1 day").cast(Interval())

    # 実施が必要なタスクをフィルタリング
    due_tasks_query = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id)
        .outerjoin(subquery, models.Task.id == subquery.c.task_id)
        .filter(
            or_(
                subquery.c.last_execution == None,  # noqa: E711
                and_(
                    # frequencyがInteger型の場合、INTERVAL '1 day' * frequency として加算
                    subquery.c.last_execution
                    + (interval_one_day * models.Task.frequency)
                    >= target_start,
                    subquery.c.last_execution
                    + (interval_one_day * models.Task.frequency)
                    <= target_end,
                ),
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

    # JSTタイムゾーンの定義
    jst = ZoneInfo("Asia/Tokyo")

    # 現在のJST日時を取得
    jst_now = datetime.now(jst)

    # JSTでの今日の開始（0:00）と終了（23:59:59.999999）を計算
    jst_today_start = jst_now.replace(hour=0, minute=0, second=0, microsecond=0)
    jst_today_end = jst_today_start + timedelta(days=1) - timedelta(microseconds=1)

    # UTCに変換
    utc_today_start = jst_today_start.astimezone(timezone.utc)
    utc_today_end = jst_today_end.astimezone(timezone.utc)

    # FilterTypeに基づいてtarget_startとtarget_endを設定
    if filter_type == FilterType.today:
        target_start = utc_today_start
        target_end = utc_today_end
    elif filter_type == FilterType.tomorrow:
        # JSTでの明日の開始と終了を計算
        # jst_tomorrow_start = jst_today_start + timedelta(days=1)
        jst_tomorrow_end = jst_today_end + timedelta(days=1)

        target_start = utc_today_start
        target_end = jst_tomorrow_end.astimezone(timezone.utc)
    elif filter_type == FilterType.week:
        # JSTでの1週間後の終了日時
        jst_week_end = jst_today_end + timedelta(days=7)

        target_start = utc_today_start
        target_end = jst_week_end.astimezone(timezone.utc)
    elif filter_type == FilterType.month:
        # JSTでの1ヶ月後の終了日時（30日後と定義）
        jst_month_end = jst_today_end + timedelta(days=30)

        target_start = utc_today_start
        target_end = jst_month_end.astimezone(timezone.utc)
    else:
        # デフォルトは今日と同じ
        target_start = utc_today_start
        target_end = utc_today_end

    tasks = due_tasks(db, project_id, target_start, target_end)
    return tasks
