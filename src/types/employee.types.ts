import { Task, TaskStats } from './task.types';

export interface Employee {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  department: string | null;
  phone: string | null;
  created_at: string;
  taskCount?: number;
  completedCount?: number;
  pendingCount?: number;
  inProgressCount?: number;
}

export interface EmployeeWithTasks extends Employee {
  tasks: Task[];
}

export interface EmployeeStats extends TaskStats {
  employeeId: number;
}
