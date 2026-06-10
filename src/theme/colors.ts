export const colors = {
  // === BRAND PRIMARIES (from logo) ===
  brand: {
    magenta: '#FF1F8E',
    purple: '#8B1FCC',
    red: '#FF2200',
    orange: '#FF6B1A',
    amber: '#FFB800',
  },

  // === PRIMARY UI COLOR ===
  primary: {
    DEFAULT: '#FF1F8E',
    light: '#FF5BAD',
    dark: '#C4006A',
    gradient: ['#0B0F19', '#1E1B4B', '#2E1045'] as const,
  },

  // === TASK STATUS COLORS ===
  status: {
    pending: {
      bg: '#FFF8EE',
      text: '#C27803',
      dot: '#F59E0B',
      border: 'rgba(245, 158, 11, 0.15)',
    },
    inProgress: {
      bg: '#EEF6FF',
      text: '#0284C7',
      dot: '#38BDF8',
      border: 'rgba(56, 189, 248, 0.15)',
    },
    completed: {
      bg: '#F8F2FF',
      text: '#7C3AED',
      dot: '#A855F7',
      border: 'rgba(168, 85, 247, 0.15)',
    },
  },

  // === NEUTRALS ===
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // === SEMANTIC ===
  semantic: {
    error: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  // === SURFACE (Light Mode) ===
  surface: {
    background: '#F3F4F6',
    card: '#FFFFFF',
    overlay: 'rgba(139, 31, 204, 0.04)',
    border: '#E5E7EB',
  },

  // === SURFACE (Dark Mode) ===
  surfaceDark: {
    background: '#0F0F12',
    card: '#17171C',
    overlay: 'rgba(255, 31, 142, 0.08)',
    border: '#27272F',
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Helper: get status colors by task status key
export const getStatusColors = (status: 'pending' | 'in_progress' | 'completed') => {
  const map = {
    pending: colors.status.pending,
    in_progress: colors.status.inProgress,
    completed: colors.status.completed,
  };
  return map[status];
};

// Helper: get priority colors
export const getPriorityColors = (priority: 'low' | 'medium' | 'high') => {
  const map = {
    low: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
    medium: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
    high: { bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3' },
  };
  return map[priority];
};
