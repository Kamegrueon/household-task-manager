export interface UserCreateParams {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
	refresh_token: string;
	token_type: string;
}

export interface ProjectCreateParams {
  name: string;
  description?: string;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberCreate {
  user_id: number;
  role: string; // 役割などの追加情報があれば
}

export interface ProjectMemberUpdate {
  role: string; // 更新可能なフィールドのみ
}

export interface ProjectMemberResponse {
	id: number;
	project_id: number
  user: UserResponse;
  role: string; // 役割などの追加情報があれば
}

export interface TaskCreateParams {
	category: string,
  task_name: string,
  frequency: number,
}

export interface TaskResponse {
  id: number,
  project_id: number,
	category: string,
  task_name: string,
  frequency: number,
  created_at: string,
  updated_at: string
}

export interface TaskExecutionCreate {
  execution_date?: string; // ISO8601形式の文字列
}

export interface TaskExecutionUpdate {
  user_id?: number;
  execution_date?: string;
}

export interface TaskExecutionResponse {
  id: number;
	task_id: number;
	category: string,
  task_name: string;
  user_id: number;
  user_name: string;
  execution_date: string; // ISO形式の日付
  created_at: string;
}
