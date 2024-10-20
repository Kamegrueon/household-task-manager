# app/routers/executions.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app import database, models, schemas, utils

router = APIRouter(
    prefix="/projects/{project_id}/executions",
    tags=["Executions"],
)


@router.post(
    "/{task_id}",
    response_model=schemas.TaskExecutionCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_execution(
    project_id: int,
    task_id: int,
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

    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="タスクが見つかりません")

    new_task_execute = models.TaskExecution(
        task_id=task_id,
        user_id=current_user.id,
    )
    db.add(new_task_execute)
    db.commit()
    db.refresh(new_task_execute)

    return new_task_execute


@router.get("/", response_model=List[schemas.TaskExecutionResponse])
def get_executions(
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

    executions = (
        db.query(models.TaskExecution)
        .join(models.Task, models.Task.id == models.TaskExecution.task_id)
        .filter(models.Task.project_id == project_id)
        .order_by(desc(models.TaskExecution.execution_date))
        .all()
    )

    # スキーマに変換（タスク名と実施者名を含める）
    execution_responses = [
        schemas.TaskExecutionResponse(
            id=exec.id,
            task_id=exec.task_id,
            category=exec.task.category,
            task_name=exec.task.task_name,
            user_id=exec.user_id,
            user_name=exec.user.username,
            execution_date=exec.execution_date,
            created_at=exec.created_at,
        )
        for exec in executions
    ]
    return execution_responses


@router.get(
    "/{execution_id}",
    response_model=schemas.TaskExecutionResponse,
    status_code=status.HTTP_200_OK,
)
def get_execution(
    project_id: int,
    execution_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    特定のタスク実行履歴を取得します。
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

    execution = (
        db.query(models.TaskExecution)
        .join(models.Task, models.Task.id == models.TaskExecution.task_id)
        .filter(
            models.Task.project_id == project_id,
            models.TaskExecution.id == execution_id,
        )
        .first()
    )

    if not execution:
        raise HTTPException(status_code=404, detail="タスク実行履歴が見つかりません")

    execution_response = schemas.TaskExecutionResponse(
        id=execution.id,
        task_id=execution.task_id,
        category=execution.task.category,
        task_name=execution.task.task_name,
        user_id=execution.user_id,
        user_name=execution.user.username,  # executor のリレーションを仮定
        execution_date=execution.execution_date,
        created_at=execution.created_at,
    )

    return execution_response


@router.put(
    "/{execution_id}",
    response_model=schemas.TaskExecutionResponse,
    status_code=status.HTTP_200_OK,
)
def update_execution(
    project_id: int,
    execution_id: int,
    execution_update: schemas.TaskExecutionUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    タスク実行履歴を更新します。
    タスク名は変更できず、実行者と実行日時のみ更新可能です。
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

    execution = (
        db.query(models.TaskExecution)
        .filter(models.TaskExecution.id == execution_id)
        .first()
    )
    if not execution:
        raise HTTPException(status_code=404, detail="タスク実行履歴が見つかりません")

    # 実行者がプロジェクトメンバーであることを確認
    new_executor = (
        db.query(models.User).filter(models.User.id == execution_update.user_id).first()
    )
    if not new_executor:
        raise HTTPException(status_code=404, detail="指定された実施者が見つかりません")
    project_member = (
        db.query(models.ProjectMember)
        .filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == execution_update.user_id,
        )
        .first()
    )
    if not project_member:
        raise HTTPException(status_code=400, detail="指定された実施者はこのプロジェクトのメンバーではありません")

    # 実行履歴を更新
    if execution_update.user_id is not None:
        execution.user_id = execution_update.user_id
    if execution_update.execution_date is not None:
        execution.execution_date = execution_update.execution_date

    db.commit()
    db.refresh(execution)

    # スキーマに変換
    execution_response = schemas.TaskExecutionResponse(
        id=execution.id,
        task_id=execution.task_id,
        category=execution.task.category,
        task_name=execution.task.task_name,
        user_id=execution.user_id,
        user_name=execution.user.username,
        execution_date=execution.execution_date,
        created_at=execution.created_at,
    )

    return execution_response


@router.delete(
    "/{execution_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_execution(
    project_id: int,
    execution_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    タスク実行履歴を削除します。
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

    execution = (
        db.query(models.TaskExecution)
        .filter(models.TaskExecution.id == execution_id)
        .first()
    )
    if not execution:
        raise HTTPException(status_code=404, detail="タスク実行履歴が見つかりません")

    db.delete(execution)
    db.commit()

    return
