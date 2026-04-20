// src/styles/typography.ts - Sistema tipográfico premium com Inter
import { Platform } from 'react-native';

// Font family configuration
export const fonts = {
  regular: Platform.select({
    ios: 'Inter-Regular',
    android: 'Inter_400Regular',
    default: 'Inter-Regular',
  }),
  medium: Platform.select({
    ios: 'Inter-Medium',
    android: 'Inter_500Medium',
    default: 'Inter-Medium',
  }),
  semiBold: Platform.select({
    ios: 'Inter-SemiBold',
    android: 'Inter_600SemiBold',
    default: 'Inter-SemiBold',
  }),
  bold: Platform.select({
    ios: 'Inter-Bold',
    android: 'Inter_700Bold',
    default: 'Inter-Bold',
  }),
  extraBold: Platform.select({
    ios: 'Inter-ExtraBold',
    android: 'Inter_800ExtraBold',
    default: 'Inter-ExtraBold',
  }),
};

// Sistema tipográfico com escala modular
export const typography = {
  fonts,
  sizes: {
    // Micro text
    micro: 10,
    caption: 12,

    // Small text
    bodySmall: 13,
    body: 14,

    // Medium text
    subheading: 16,
    heading: 20,

    // Large text
    title: 24,
    displaySmall: 28,
    display: 32,
    displayLarge: 40,

    // Extra large
    hero: 48,
    giant: 64,
  },

  // Line heights para melhor legibilidade
  lineHeight: {
    tight: 1.1,      // Para headlines
    snug: 1.25,      // Para títulos
    normal: 1.5,     // Para body text
    relaxed: 1.75,   // Para parágrafos longos
  },

  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
};

// Estilos pré-definidos para consistência
export const textStyles = {
  // Headlines
  headline1: {
    fontFamily: fonts.bold,
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.sizes.display * typography.lineHeight.tight,
  },
  headline2: {
    fontFamily: fonts.bold,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.sizes.title * typography.lineHeight.tight,
  },
  headline3: {
    fontFamily: fonts.semiBold,
    fontSize: typography.sizes.heading,
    fontWeight: typography.weights.semiBold,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.sizes.heading * typography.lineHeight.snug,
  },

  // Body text
  body1: {
    fontFamily: fonts.regular,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.sizes.body * typography.lineHeight.normal,
  },
  body2: {
    fontFamily: fonts.regular,
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.sizes.bodySmall * typography.lineHeight.normal,
  },
  body1Bold: {
    fontFamily: fonts.semiBold,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.sizes.body * typography.lineHeight.normal,
  },

  // Labels
  label: {
    fontFamily: fonts.medium,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wide,
    lineHeight: typography.sizes.body * typography.lineHeight.normal,
  },
  labelSmall: {
    fontFamily: fonts.medium,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wider,
    lineHeight: typography.sizes.caption * typography.lineHeight.normal,
    textTransform: 'uppercase' as const,
  },

  // Button text
  button: {
    fontFamily: fonts.semiBold,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    letterSpacing: typography.letterSpacing.wide,
    lineHeight: typography.sizes.body * typography.lineHeight.tight,
  },
  buttonLarge: {
    fontFamily: fonts.semiBold,
    fontSize: typography.sizes.subheading,
    fontWeight: typography.weights.semiBold,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.sizes.subheading * typography.lineHeight.tight,
  },

  // Display text
  display: {
    fontFamily: fonts.extraBold,
    fontSize: typography.sizes.displayLarge,
    fontWeight: typography.weights.extraBold,
    letterSpacing: typography.letterSpacing.tighter,
    lineHeight: typography.sizes.displayLarge * typography.lineHeight.tight,
  },

  // Caption
  caption: {
    fontFamily: fonts.regular,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.regular,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.sizes.caption * typography.lineHeight.normal,
  },
  captionBold: {
    fontFamily: fonts.medium,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.sizes.caption * typography.lineHeight.normal,
  },
};

// Helper para criar estilos tipográficos
export const createTextStyle = (
  size: keyof typeof typography.sizes,
  weight: keyof typeof typography.weights = 'regular',
  family?: keyof typeof fonts
) => {
  const fontFamily = family
    ? fonts[family]
    : weight === 'bold' || weight === 'extraBold'
      ? fonts.bold
      : weight === 'semiBold'
        ? fonts.semiBold
        : weight === 'medium'
          ? fonts.medium
          : fonts.regular;

  return {
    fontFamily,
    fontSize: typography.sizes[size],
    fontWeight: typography.weights[weight],
    letterSpacing: size === 'display' || size === 'displayLarge'
      ? typography.letterSpacing.tight
      : typography.letterSpacing.normal,
    lineHeight: typography.sizes[size] * typography.lineHeight.normal,
  };
};

export default typography;
