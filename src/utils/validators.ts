import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be under 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  assigned_to: z.number({ required_error: 'Please assign to an employee' }),
  due_date: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Please enter a valid email'),
  department: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Please enter a valid email'),
  department: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
