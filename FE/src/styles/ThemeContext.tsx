// src/styles/ThemeContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { colors, darkColors, spacing, borderRadius, shadows } from './theme';
import { typography } from './typography';

interface ThemeContextType {
  theme: {
    colors: typeof colors;
    spacing: typeof spacing;
    typography: typeof typography;
    borderRadius: typeof borderRadius;
    shadows: typeof shadows;
  };
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    colors: isDarkMode ? darkColors : colors,
    spacing,
    typography,
    borderRadius,
    shadows,
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};