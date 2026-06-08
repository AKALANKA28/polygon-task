import { api } from './api';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStats } from '../types/task.types';

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return (response as unknown as { data: Task[] }).data;
  },

  getById: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return (response as unknown as { data: Task }).data;
  },

  create: async (dto: CreateTaskDto): Promise<Task> => {
    const response = await api.post('/tasks', dto);
    return (response as unknown as { data: Task }).data;
  },

  update: async (id: number, dto: UpdateTaskDto): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, dto);
    return (response as unknown as { data: Task }).data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  getStats: async (): Promise<TaskStats> => {
    const response = await api.get('/tasks/stats');
    return (response as unknown as { data: TaskStats }).data;
  },
};
