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
