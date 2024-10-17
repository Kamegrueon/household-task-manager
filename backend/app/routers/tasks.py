import csv
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app import database, models, schemas, utils

router = APIRouter(
    prefix="/projects/{project_id}/tasks",
    tags=["Masters"],
)


@router.post(
    "/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED
)
def create_task(
    project_id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    指定されたプロジェクトに新しいタスクを作成します。
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

    new_task = models.Task(
        project_id=project_id,
        category=task.category,
        task_name=task.task_name,
        frequency=task.frequency,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(
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

    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    return tasks


@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    指定されたプロジェクト内の特定のタスクの詳細を取得します。
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

    task = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id, models.Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="タスクが見つかりません")

    return task


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    project_id: int,
    task_id: int,
    task_update: schemas.TaskCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    指定されたプロジェクト内の特定のタスクを更新します。
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

    task = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id, models.Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="タスクが見つかりません")

    task.category = task_update.category
    task.task_name = task_update.task_name
    task.frequency = task_update.frequency
    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    指定されたプロジェクト内の特定のタスクを削除します。
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

    task = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id, models.Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="タスクが見つかりません")

    db.delete(task)
    db.commit()

    return


@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    summary="CSVファイルからタスクを一括アップロード",
)
async def upload_tasks(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(utils.get_current_user),
):
    """
    CSVファイルをアップロードして、一括でタスクを作成します。
    CSVファイルは以下のカラムを含む必要があります:
    - category
    - task_name
    - frequency
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

    if file.content_type != "text/csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="CSVファイルをアップロードしてください"
        )

    try:
        # CSVファイルの読み取り
        contents = await file.read()
        decoded = contents.decode("utf-8").splitlines()
        reader = csv.DictReader(decoded)
        print(reader)
        tasks_to_create: list[dict[str, str | int]] = []
        for row in reader:
            print(row)
            # 必要なカラムが存在するか確認
            if not all(key in row for key in ["category", "task_name", "frequency"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CSVファイルのフォーマットが正しくありません。'category', 'task_name', 'frequency'カラムが必要です。",
                )
            # タスク作成用の辞書を追加
            tasks_to_create.append(
                {
                    "project_id": project_id,
                    "category": row["category"],
                    "task_name": row["task_name"],
                    "frequency": row["frequency"],
                }
            )

        # タスクの一括作成
        new_tasks: list[dict[str, str | int]] = []
        for task_data in tasks_to_create:
            new_task = models.Task(
                project_id=task_data["project_id"],
                category=task_data["category"],
                task_name=task_data["task_name"],
                frequency=task_data["frequency"],
            )
            db.add(new_task)
            new_tasks.append(new_task)

        db.commit()

        # 作成されたタスクを返す
        return [schemas.TaskResponse.model_validate(task) for task in new_tasks]

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CSVファイルの処理中にエラーが発生しました。",
        )
