import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as nativeUseColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  card: string;
  border: string;
  overlay: string;
  text: string;
  textSecondary: string;
  whiteOrCard: string;
}

interface ThemeContextType {
  themeMode: ThemeMode; // 'light' | 'dark' | 'system'
  theme: 'light' | 'dark'; // the active theme ('light' or 'dark')
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  themeColors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = nativeUseColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load persisted theme
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('theme_mode');
        if (savedMode) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (e) {
        console.warn('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, []);

  const activeTheme = themeMode === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : themeMode;
  const isDark = activeTheme === 'dark';

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('theme_mode', mode);
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }
  };

  const toggleTheme = async () => {
    const nextMode = activeTheme === 'light' ? 'dark' : 'light';
    await setThemeMode(nextMode);
  };

  // Derive semantic active colors
  const themeColors = {
    background: isDark ? colors.surfaceDark.background : colors.surface.background,
    card: isDark ? colors.surfaceDark.card : colors.surface.card,
    border: isDark ? colors.surfaceDark.border : colors.surface.border,
    overlay: isDark ? colors.surfaceDark.overlay : colors.surface.overlay,
    text: isDark ? colors.white : colors.neutral[900],
    textSecondary: isDark ? colors.neutral[400] : colors.neutral[500],
    whiteOrCard: isDark ? colors.surfaceDark.card : colors.white,
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        theme: activeTheme,
        isDark,
        setThemeMode,
        toggleTheme,
        themeColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
