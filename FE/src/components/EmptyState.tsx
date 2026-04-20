// src/components/EmptyState.tsx - Estados vazios ilustrados
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeIn,
  FadeInUp,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTheme } from '../styles/ThemeContext';

const { width } = Dimensions.get('window');

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'default' | 'compact' | 'card';
  lottieSource?: any; // Para animações Lottie
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default',
  children,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    onAction?.();
  };

  if (variant === 'compact') {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.compactContainer, { backgroundColor: theme.colors.surface }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}10` }]}>
          <Icon name={icon} size={32} color={theme.colors.primary} />
        </View>
        <Text style={[styles.compactTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.compactSubtitle, { color: theme.colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </Animated.View>
    );
  }

  if (variant === 'card') {
    return (
      <Animated.View
        entering={FadeInUp.duration(500)}
        style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]}
      >
        <View style={[styles.cardIconContainer, { backgroundColor: `${theme.colors.primary}10` }]}>
          <Icon name={icon} size={40} color={theme.colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.cardSubtitle, { color: theme.colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
        {actionLabel && onAction && (
          <TouchableOpacity
            style={[styles.cardButton, { backgroundColor: theme.colors.primary }]}
            onPress={handlePress}
            activeOpacity={0.9}
          >
            <Text style={styles.cardButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }

  // Default variant
  return (
    <Animated.View
      entering={FadeInUp.duration(600)}
      style={styles.container}
    >
      <Animated.View
        entering={FadeInUp.delay(100).duration(500)}
        style={[styles.illustrationContainer, { backgroundColor: `${theme.colors.primary}08` }]}
      >
        <View style={[styles.iconBg, { backgroundColor: `${theme.colors.primary}15` }]}>
          <Icon name={icon} size={64} color={theme.colors.primary} />
        </View>

        {/* Decorative circles */}
        <View style={[styles.decorCircle1, { backgroundColor: `${theme.colors.primary}10` }]} />
        <View style={[styles.decorCircle2, { backgroundColor: `${theme.colors.secondary}10` }]} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </Animated.View>

      {children}

      {(actionLabel || secondaryActionLabel) && (
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.actionsContainer}>
          {actionLabel && onAction && (
            <Animated.View style={animatedStyle}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                onPress={handlePress}
                activeOpacity={0.9}
              >
                <Icon name="plus" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>{actionLabel}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              onPress={onSecondaryAction}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text.primary }]}>
                {secondaryActionLabel}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
};

// Presets comuns
export const EmptyStatePresets = {
  noMail: {
    icon: 'email-off-outline',
    title: 'Nenhuma correspondência',
    subtitle: 'Quando o dispositivo detetar carta ou encomendas, elas aparecerão aqui automaticamente.',
  },
  noNotifications: {
    icon: 'bell-off-outline',
    title: 'Nenhuma notificação',
    subtitle: 'Quando tiveres novas notificações, elas aparecerão aqui.',
  },
  noMessages: {
    icon: 'message-off-outline',
    title: 'Nenhuma mensagem',
    subtitle: 'Começa uma conversa com os membros do teu arco familiar.',
  },
  noArco: {
    icon: 'account-group-outline',
    title: 'Sem Arco Familiar',
    subtitle: 'Junta-te ou cria um arco familiar para começar a usar o AppiCarta.',
  },
  noResults: {
    icon: 'magnify-close',
    title: 'Nenhum resultado',
    subtitle: 'Tenta ajustar os filtros ou termos de pesquisa.',
  },
  error: {
    icon: 'alert-circle-outline',
    title: 'Algo correu mal',
    subtitle: 'Não foi possível carregar os dados. Tenta novamente.',
  },
  offline: {
    icon: 'wifi-off',
    title: 'Sem conexão',
    subtitle: 'Verifica a tua conexão à internet e tenta novamente.',
  },
  emptyPackage: {
    icon: 'package-variant-remove',
    title: 'Nenhuma encomenda',
    subtitle: 'Adiciona uma encomenda para rastrear o seu estado.',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  illustrationContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: 10,
    right: 20,
  },
  decorCircle2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    bottom: 20,
    left: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  actionsContainer: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactSubtitle: {
    fontSize: 13,
  },
  // Card variant
  cardContainer: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 250,
  },
  cardButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EmptyState;
