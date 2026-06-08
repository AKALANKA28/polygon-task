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
      bg: '#FFF7E6',
      text: '#B76E00',
      dot: '#FFB800',
      border: '#FFD166',
    },
    inProgress: {
      bg: '#FFF0F7',
      text: '#A0005E',
      dot: '#FF1F8E',
      border: '#FF80C4',
    },
    completed: {
      bg: '#F0F0FF',
      text: '#5A00A8',
      dot: '#8B1FCC',
      border: '#C084FC',
    },
  },

  // === NEUTRALS ===
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
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
    background: '#F8F7FF',
    card: '#FFFFFF',
    overlay: 'rgba(139, 31, 204, 0.06)',
    border: '#EDE9FE',
  },

  // === SURFACE (Dark Mode) ===
  surfaceDark: {
    background: '#0D0D14',
    card: '#1A1A2E',
    overlay: 'rgba(255, 31, 142, 0.08)',
    border: '#2D2D4A',
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
