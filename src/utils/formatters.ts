import { format, formatDistanceToNow, isAfter, isBefore, isToday, parseISO } from 'date-fns';

export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'No date set';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateShort = (dateStr: string | null): string => {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return '';
  }
};

export const formatRelativeTime = (dateStr: string): string => {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
};

export const isDueDateOverdue = (dateStr: string | null, status?: string): boolean => {
  if (!dateStr || status === 'completed') return false;
  try {
    return isBefore(parseISO(dateStr), new Date());
  } catch {
    return false;
  }
};

export const isDueToday = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  try {
    return isToday(parseISO(dateStr));
  } catch {
    return false;
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
};

export const hashStringToColor = (str: string): [string, string] => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const gradients: [string, string][] = [
    ['#FF1F8E', '#8B1FCC'],
    ['#8B1FCC', '#FF6B1A'],
    ['#FF6B1A', '#FFB800'],
    ['#FF2200', '#FF1F8E'],
    ['#FFB800', '#FF2200'],
    ['#8B1FCC', '#3B82F6'],
  ];

  return gradients[Math.abs(hash) % gradients.length];
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatStatus = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };
  return map[status] || capitalize(status);
};

export const formatPriority = (priority: string): string => {
  return capitalize(priority);
};
