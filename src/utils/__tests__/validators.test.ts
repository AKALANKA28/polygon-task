import {
  loginSchema,
  taskSchema,
  profileSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
} from '../validators';

describe('validators', () => {
  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      const result = loginSchema.safeParse({
        email: 'employee@polygon.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid emails', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects passwords shorter than 6 characters', () => {
      const result = loginSchema.safeParse({
        email: 'employee@polygon.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('taskSchema', () => {
    it('accepts valid task data', () => {
      const result = taskSchema.safeParse({
        title: 'Review PRs',
        description: 'Check task management commits',
        priority: 'high',
        assigned_to: 42,
      });
      expect(result.success).toBe(true);
    });

    it('rejects titles that are too short', () => {
      const result = taskSchema.safeParse({
        title: 'ab',
        priority: 'low',
        assigned_to: 1,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid priority enum', () => {
      const result = taskSchema.safeParse({
        title: 'Valid Title',
        priority: 'critical',
        assigned_to: 1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createEmployeeSchema', () => {
    it('accepts valid employee registration data', () => {
      const result = createEmployeeSchema.safeParse({
        name: 'Jane Doe',
        email: 'jane@polygon.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects matching password mismatch', () => {
      const result = createEmployeeSchema.safeParse({
        name: 'Jane Doe',
        email: 'jane@polygon.com',
        password: 'securePassword123',
        confirmPassword: 'differentPassword',
      });
      expect(result.success).toBe(false);
    });
  });
});
