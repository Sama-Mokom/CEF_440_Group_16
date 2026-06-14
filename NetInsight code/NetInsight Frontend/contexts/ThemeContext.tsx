import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getItem, setItem } from '@/utils/storage';

// ─── NetInsight Dark Navy palette (matches screenshot) ───────────────────────
const darkColors = {
  // Brand
  primary: '#00C2CB',        // cyan accent — buttons, active states
  secondary: '#0077FF',      // blue secondary
  accent: '#00C2CB',

  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  danger: '#F44336',

  // Backgrounds — layered navy
  background: '#0B1628',     // deepest navy page background
  card: '#132036',           // card surface
  cardAlt: '#0D1B2E',        // slightly darker card variant
  heroCard: '#0D2550',       // hero/banner card (the big status card)

  // Text
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.5)',
  textMuted: 'rgba(255,255,255,0.3)',

  // Borders & dividers
  border: 'rgba(255,255,255,0.08)',
  borderCyan: 'rgba(0,194,203,0.25)',

  // Tab bar
  tabBar: '#0A1422',
  tabBarBorder: 'rgba(255,255,255,0.06)',
  tabBarInactive: 'rgba(255,255,255,0.35)',

  // Status / overlay
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.4)',

  // Semantic backgrounds
  errorBackground: 'rgba(244,67,54,0.15)',
  successBackground: 'rgba(76,175,80,0.15)',
  warningBackground: 'rgba(255,152,0,0.15)',
  infoBackground: 'rgba(33,150,243,0.15)',
};

// ─── Light palette (kept for toggle option) ──────────────────────────────────
const lightColors = {
  primary: '#0077FF',
  secondary: '#00BFA5',
  accent: '#FF9800',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  danger: '#F44336',
  background: '#F0F4F8',
  card: '#FFFFFF',
  cardAlt: '#F8FAFC',
  heroCard: '#E8F0FE',
  text: '#1A1A2E',
  textSecondary: '#6E6E8A',
  textMuted: '#9E9EB8',
  border: '#E0E0F0',
  borderCyan: 'rgba(0,119,255,0.2)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E0E0F0',
  tabBarInactive: '#9E9EB8',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.2)',
  errorBackground: '#FFEBEE',
  successBackground: '#E8F5E9',
  warningBackground: '#FFF8E1',
  infoBackground: '#E3F2FD',
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof darkColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemColorScheme = useColorScheme() as Theme || 'dark';
  const [theme, setThemeState] = useState<Theme>('dark'); // default dark
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeState(savedTheme);
        } else {
          setThemeState('dark'); // always default to dark (matches brand)
        }
      } catch {
        setThemeState('dark');
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (isLoaded) setItem('theme', theme);
  }, [theme, isLoaded]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
