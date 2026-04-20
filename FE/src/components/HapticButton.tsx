// src/components/HapticButton.tsx - Botão com micro-interações
import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface HapticButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  scale?: number;
  children: React.ReactNode;
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  haptic = 'light',
  scale = 0.95,
  children,
  style,
  onPress,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();
  const scaleValue = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      { translateY: translateY.value },
    ],
  }));

  const handlePressIn = () => {
    scaleValue.value = withSpring(scale, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
  };

  const handlePress = async () => {
    if (disabled || loading) return;

    // Haptic feedback
    if (haptic !== 'none') {
      const style = haptic === 'light'
        ? Haptics.ImpactFeedbackStyle.Light
        : haptic === 'medium'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Heavy;
      await Haptics.impactAsync(style);
    }

    onPress?.();
  };

  // Get background color based on variant
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.text.disabled + '40';
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'danger':
        return theme.colors.error;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    if (disabled) return theme.colors.text.disabled;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  // Get border style
  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 2,
        borderColor: disabled ? theme.colors.text.disabled : theme.colors.primary,
      };
    }
    return {};
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 10,
        };
      case 'large':
        return {
          paddingVertical: 18,
          paddingHorizontal: 32,
          borderRadius: 16,
        };
      default:
        return {
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 14,
        };
    }
  };

  // Get text size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 17;
      default:
        return 16;
    }
  };

  // Get icon size
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 22;
      default:
        return 20;
    }
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getSizeStyles(),
        getBorderStyle(),
        { backgroundColor: getBackgroundColor() },
        variant !== 'ghost' && styles.shadow,
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={getIconSize()}
              color={getTextColor()}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.text, { color: getTextColor(), fontSize: getTextSize() }]}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={getIconSize()}
              color={getTextColor()}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </AnimatedTouchable>
  );
};

// FAB (Floating Action Button)
interface FABProps extends TouchableOpacityProps {
  icon: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
  haptic?: 'light' | 'medium' | 'heavy';
}

export const FAB: React.FC<FABProps> = ({
  icon,
  size = 'medium',
  variant = 'primary',
  haptic = 'medium',
  style,
  onPress,
  ...props
}) => {
  const { theme } = useTheme();
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = async () => {
    const style = haptic === 'light'
      ? Haptics.ImpactFeedbackStyle.Light
      : haptic === 'medium'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Heavy;
    await Haptics.impactAsync(style);
    onPress?.();
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 48, height: 48, borderRadius: 24 };
      case 'large':
        return { width: 64, height: 64, borderRadius: 32 };
      default:
        return { width: 56, height: 56, borderRadius: 28 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 22;
      case 'large':
        return 30;
      default:
        return 26;
    }
  };

  const dimensions = getSize();

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.fab,
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.borderRadius,
          backgroundColor: variant === 'primary' ? theme.colors.primary : theme.colors.secondary,
        },
        styles.fabShadow,
        animatedStyle,
        style,
      ]}
      {...props}
    >
      <Icon name={icon} size={getIconSize()} color="#FFFFFF" />
    </AnimatedTouchable>
  );
};

// Icon Button
interface IconButtonProps extends TouchableOpacityProps {
  icon: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outlined';
  color?: string;
  haptic?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'medium',
  variant = 'default',
  color,
  haptic = true,
  style,
  onPress,
  ...props
}) => {
  const { theme } = useTheme();
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.85, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = async () => {
    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 36, height: 36, borderRadius: 18, iconSize: 18 };
      case 'large':
        return { width: 52, height: 52, borderRadius: 26, iconSize: 26 };
      default:
        return { width: 44, height: 44, borderRadius: 22, iconSize: 22 };
    }
  };

  const dimensions = getSize();
  const iconColor = color || theme.colors.primary;

  const getBackgroundStyle = () => {
    switch (variant) {
      case 'filled':
        return { backgroundColor: `${iconColor}15` };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: iconColor,
        };
      default:
        return { backgroundColor: 'transparent' };
    }
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.iconButton,
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.borderRadius,
        },
        getBackgroundStyle(),
        animatedStyle,
        style,
      ]}
      {...props}
    >
      <Icon name={icon} size={dimensions.iconSize} color={iconColor} />
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HapticButton;
