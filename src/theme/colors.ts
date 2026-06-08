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
    gradient: ['#FF1F8E', '#8B1FCC'] as const,
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
    50: '#FAF8F5',
    100: '#F5F2EC',
    200: '#EAE6DF',
    300: '#D6D1C7',
    400: '#A39E93',
    500: '#736F65',
    600: '#525048',
    700: '#403E38',
    800: '#262522',
    900: '#171614',
    950: '#0C0C0A',
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
    background: '#FAF7F2',
    card: '#FFFFFF',
    overlay: 'rgba(255, 122, 0, 0.06)',
    border: '#EAE6DF',
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
