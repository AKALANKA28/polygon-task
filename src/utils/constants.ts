export const APP_NAME = 'Polygon Task';
export const APP_TAGLINE = 'Work smarter, together.';

export const API_TIMEOUT = 15000;

export const TASK_STATUS_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'pending' as const, label: 'Pending' },
  { value: 'in_progress' as const, label: 'In Progress' },
  { value: 'completed' as const, label: 'Completed' },
];

export const TASK_PRIORITY_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'low' as const, label: 'Low' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'high' as const, label: 'High' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low' as const, label: 'Low' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'high' as const, label: 'High' },
];

export const STATUS_UPDATE_OPTIONS = [
  { value: 'pending' as const, label: 'Pending', icon: 'clock' },
  { value: 'in_progress' as const, label: 'In Progress', icon: 'zap' },
  { value: 'completed' as const, label: 'Completed', icon: 'check-circle' },
];

export const SEARCH_DEBOUNCE_MS = 300;

export const STAGGER_DELAY_MS = 50;
export const MAX_STAGGER_ITEMS = 10;
export const COUNT_UP_DURATION_MS = 800;
export const PROGRESS_BAR_DURATION_MS = 600;
