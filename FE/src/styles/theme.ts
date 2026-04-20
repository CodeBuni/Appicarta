// src/theme/theme.ts
import { typography } from './typography';

export const colors = {
  // Cores principais - Azul e Vermelho
  primary: "#1c3cb4",       // Azul principal
  primaryLight: "#2985e6",  // Azul claro
  primaryDark: "#152a8a",   // Azul escuro
  
  // Cores secundárias
  secondary: "#f84234",     // Vermelho vibrante
  secondaryLight: "#ff6b5e", // Vermelho claro
  secondaryDark: "#c7392e",  // Vermelho escuro
  
  // ADICIONADO: Cor danger para modo claro
  danger: "#dc2626",        // Vermelho danger
  
  // Cores neutras para modo claro
  background: "#f8feff",    // Fundo principal
  surface: "#ffffff",       // Superfícies
  surfaceVariant: "#f3f8fc", // Superfície variante
  border: "#e1e8f0",        // Bordas
  borderLight: "#f0f5fa",   // Bordas claras
  
  // Cores de texto
  text: {
    primary: "#1a1a1a",
    secondary: "#4a5568",
    tertiary: "#718096",
    disabled: "#a0aec0",
    inverse: "#ffffff",
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
  },
  
  // Cores de estado
  success: "#10b981",       // Verde
  warning: "#f59e0b",       // Laranja
  error: "#c7392e",         // Vermelho
  info: "#2985e6",          // Azul info
  
  // Cores de feedback
  successLight: "#d1fae5",
  warningLight: "#fef3c7",
  errorLight: "#fee2e2",
  infoLight: "#dbeafe",
  
  // Cores base
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  
  // Overlays
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.1)",
  
  // Sombras
  shadowColor: "#2d3748",
};

// Cores para modo escuro
export const darkColors = {
  primary: "#5d7ae6",       // Azul mais claro para dark mode
  primaryLight: "#8aa4ff",
  primaryDark: "#4a64c2",
  
  secondary: "#ff6b5e",
  secondaryLight: "#ff9a90",
  secondaryDark: "#e0554a",
  
  // JÁ TEM danger aqui:
  danger: "#dc2626",
  
  background: "#121826",
  surface: "#1e293b",
  surfaceVariant: "#2d3748",
  border: "#374151",
  borderLight: "#4b5563",
  
  text: {
    primary: "#f7fafc",
    secondary: "#cbd5e0",
    tertiary: "#94a3b8",
    disabled: "#64748b",
    inverse: "#1a202c",
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
  },
  
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  
  successLight: "#065f46",
  warningLight: "#92400e",
  errorLight: "#7f1d1d",
  infoLight: "#1e40af",
  
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(255, 255, 255, 0.1)",
  
  shadowColor: "#000000",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};


export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  round: 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Tipografia melhorada
export { typography };

export const theme = {
  colors,
  darkColors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

export default theme;