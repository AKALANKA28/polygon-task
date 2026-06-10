import { api } from './api';
import { Employee, EmployeeWithTasks, EmployeeStats, CreateEmployeeDto, UpdateEmployeeDto } from '../types/employee.types';

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/employees');
    return (response as unknown as { data: Employee[] }).data;
  },

  getById: async (id: number): Promise<EmployeeWithTasks> => {
    const response = await api.get(`/employees/${id}`);
    return (response as unknown as { data: EmployeeWithTasks }).data;
  },

  getStats: async (id: number): Promise<EmployeeStats> => {
    const response = await api.get(`/employees/${id}/stats`);
    return (response as unknown as { data: EmployeeStats }).data;
  },

  updateProfile: async (data: { name?: string; phone?: string; department?: string; avatar_url?: string | null }): Promise<Employee> => {
    const response = await api.put('/profile', data);
    return (response as unknown as { data: Employee }).data;
  },

  getProfile: async (): Promise<Employee> => {
    const response = await api.get('/profile');
    return (response as unknown as { data: Employee }).data;
  },

  create: async (data: CreateEmployeeDto): Promise<Employee> => {
    const response = await api.post('/employees', data);
    return (response as unknown as { data: Employee }).data;
  },

  update: async (id: number, data: UpdateEmployeeDto): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, data);
    return (response as unknown as { data: Employee }).data;
  },

  delete: async (id: number): Promise<{ success: boolean }> => {
    const response = await api.delete(`/employees/${id}`);
    return response as unknown as { success: boolean };
  },
};
