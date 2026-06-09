export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskAssignee {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface TaskCreator {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: number | null;
  assignee?: TaskAssignee;
  assignees?: TaskAssignee[];
  created_by: number;
  creator?: TaskCreator;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigned_to: number | number[];
  due_date?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number | number[];
  due_date?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  user_role: 'admin' | 'employee';
  content: string;
  created_at: string;
}
