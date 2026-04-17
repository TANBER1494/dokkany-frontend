import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import settingsService from '../services/settingsService';


// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext(null);

const THEME_KEY = 'dokkany_theme';

export const ThemeProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // 1. التهيئة الفورية من التخزين المحلي لضمان السرعة
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) === 'dark';
  });

  // 2. دالة التبديل (Optimistic Update)
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // 3. مراقبة التغييرات وتطبيقها على واجهة DOM والتخزين المحلي
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  // 4. مزامنة الحالة مع الباك إند عند تغييرها من قبل مستخدم مسجل
  useEffect(() => {
    if (user) {
      // نتحقق من التفضيل المسجل في الباك إند أولاً لمنع الطلبات المتكررة
      if (user.is_dark_mode !== isDarkMode) {
        settingsService.updatePreferences({ is_dark_mode: isDarkMode })
          .catch((err) => console.error('Failed to sync theme with backend:', err));
      }
    }
  }, [isDarkMode, user]);

  // استخدام useMemo لضمان عدم إعادة تصيير المكونات التي لا تعتمد على المظهر
  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme
  }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};