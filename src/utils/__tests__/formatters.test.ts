import {
  formatDate,
  formatDateShort,
  getInitials,
  getGreeting,
  capitalize,
  formatStatus,
  formatPriority,
  isDueDateOverdue,
  isDueToday,
  hashStringToColor,
} from '../formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('returns "No date set" for null/empty values', () => {
      expect(formatDate(null)).toBe('No date set');
      expect(formatDate('')).toBe('No date set');
    });

    it('formats ISO date strings correctly', () => {
      expect(formatDate('2026-06-11T00:00:00.000Z')).toBe('Jun 11, 2026');
    });

    it('returns "Invalid date" for bad format', () => {
      expect(formatDate('not-a-date')).toBe('Invalid date');
    });
  });

  describe('formatDateShort', () => {
    it('returns empty string for null/empty values', () => {
      expect(formatDateShort(null)).toBe('');
      expect(formatDateShort('')).toBe('');
    });

    it('formats date short format correctly', () => {
      expect(formatDateShort('2026-06-11T00:00:00.000Z')).toBe('Jun 11');
    });

    it('returns empty string for bad format', () => {
      expect(formatDateShort('not-a-date')).toBe('');
    });
  });

  describe('getInitials', () => {
    it('returns correct initials for multiple names', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice Bob Charlie')).toBe('AB');
    });

    it('returns correct initials for single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('returns empty string for empty input', () => {
      expect(getInitials('')).toBe('');
    });
  });

  describe('getGreeting', () => {
    const originalGetHours = Date.prototype.getHours;

    afterEach(() => {
      Date.prototype.getHours = originalGetHours;
    });

    it('returns "Good morning," before 12 PM', () => {
      Date.prototype.getHours = jest.fn().mockReturnValue(9);
      expect(getGreeting()).toBe('Good morning,');
    });

    it('returns "Good afternoon," between 12 PM and 5 PM', () => {
      Date.prototype.getHours = jest.fn().mockReturnValue(14);
      expect(getGreeting()).toBe('Good afternoon,');
    });

    it('returns "Good evening," after 5 PM', () => {
      Date.prototype.getHours = jest.fn().mockReturnValue(19);
      expect(getGreeting()).toBe('Good evening,');
    });
  });

  describe('capitalize', () => {
    it('capitalizes the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });
  });

  describe('formatStatus', () => {
    it('maps known statuses correctly', () => {
      expect(formatStatus('pending')).toBe('Pending');
      expect(formatStatus('in_progress')).toBe('In Progress');
      expect(formatStatus('completed')).toBe('Completed');
    });

    it('falls back to capitalized raw string if unknown', () => {
      expect(formatStatus('unknown_status')).toBe('Unknown_status');
    });
  });

  describe('formatPriority', () => {
    it('capitalizes priority levels', () => {
      expect(formatPriority('low')).toBe('Low');
      expect(formatPriority('medium')).toBe('Medium');
      expect(formatPriority('high')).toBe('High');
    });
  });

  describe('isDueToday', () => {
    it('returns false for null/empty date', () => {
      expect(isDueToday(null)).toBe(false);
    });

    it('returns true if the date is today', () => {
      const todayISO = new Date().toISOString();
      expect(isDueToday(todayISO)).toBe(true);
    });
  });

  describe('isDueDateOverdue', () => {
    it('returns false for completed status', () => {
      expect(isDueDateOverdue('2020-01-01', 'completed')).toBe(false);
    });

    it('returns true if date is in the past and not completed', () => {
      expect(isDueDateOverdue('2020-01-01', 'pending')).toBe(true);
    });

    it('returns false if date is in the future', () => {
      expect(isDueDateOverdue('2099-01-01', 'pending')).toBe(false);
    });
  });

  describe('hashStringToColor', () => {
    it('returns a color gradient tuple', () => {
      const gradient = hashStringToColor('user_name');
      expect(gradient).toBeInstanceOf(Array);
      expect(gradient.length).toBe(2);
      expect(gradient[0]).toMatch(/^#[0-9A-F]{6}$/i);
      expect(gradient[1]).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});
