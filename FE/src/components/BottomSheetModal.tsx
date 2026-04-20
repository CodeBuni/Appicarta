// src/components/BottomSheetModal.tsx - Bottom sheets elegantes
import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface BottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  snapPoints?: string[];
  showHandle?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  snapPoints = ['50%', '75%'],
  showHandle = true,
  showCloseButton = true,
  footer,
}) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  if (!isVisible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[
        styles.background,
        { backgroundColor: theme.colors.surface },
      ]}
      handleStyle={[
        styles.handle,
        { backgroundColor: theme.colors.surface },
      ]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: theme.colors.border },
      ]}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {showHandle && (
              <View style={[styles.iconWrapper, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Icon name="gesture-swipe-down" size={20} color={theme.colors.primary} />
              </View>
            )}
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              {title}
            </Text>
          </View>

          {showCloseButton && (
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={onClose}
            >
              <Icon name="close" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            {children}
          </Animated.View>
        </BottomSheetScrollView>

        {/* Footer */}
        {footer && (
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.footer}>
            {footer}
          </Animated.View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

// Componente para ações em lista
interface ActionSheetItem {
  id: string;
  label: string;
  icon: string;
  color?: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  actions: ActionSheetItem[];
  cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isVisible,
  onClose,
  title,
  actions,
  cancelLabel = 'Cancelar',
}) => {
  const { theme } = useTheme();

  const handleAction = (action: ActionSheetItem) => {
    action.onPress();
    onClose();
  };

  return (
    <BottomSheetModal
      isVisible={isVisible}
      onClose={onClose}
      title={title}
      snapPoints={['35%', '50%']}
      showHandle={false}
    >
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <Animated.View
            key={action.id}
            entering={FadeInUp.delay(index * 50).duration(300)}
          >
            <TouchableOpacity
              style={[
                styles.actionItem,
                {
                  borderBottomColor: theme.colors.borderLight,
                  borderBottomWidth: index < actions.length - 1 ? 1 : 0,
                },
              ]}
              onPress={() => handleAction(action)}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: action.destructive
                      ? `${theme.colors.error}15`
                      : `${action.color || theme.colors.primary}15`,
                  },
                ]}
              >
                <Icon
                  name={action.icon}
                  size={22}
                  color={action.destructive ? theme.colors.error : action.color || theme.colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.actionLabel,
                  {
                    color: action.destructive ? theme.colors.error : theme.colors.text.primary,
                  },
                ]}
              >
                {action.label}
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInUp.delay(actions.length * 50).duration(300)}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: theme.colors.text.primary }]}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </BottomSheetModal>
  );
};

// Bottom sheet para confirmação
interface ConfirmSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  icon?: string;
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  isVisible,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  destructive = false,
  icon = 'alert-circle',
}) => {
  const { theme } = useTheme();

  return (
    <BottomSheetModal
      isVisible={isVisible}
      onClose={onClose}
      title=""
      snapPoints={['40%']}
      showHandle={false}
      footer={
        <View style={styles.confirmFooter}>
          <TouchableOpacity
            style={[styles.footerButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={onClose}
          >
            <Text style={[styles.footerButtonText, { color: theme.colors.text.primary }]}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.footerButton,
              {
                backgroundColor: destructive ? theme.colors.error : theme.colors.primary,
                marginLeft: 12,
              },
            ]}
            onPress={() => {
              onConfirm();
              onClose();
            }}
          >
            <Text style={[styles.footerButtonText, { color: '#FFFFFF' }]}>
              {confirmLabel}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.confirmContainer}>
        <View
          style={[
            styles.confirmIcon,
            {
              backgroundColor: destructive
                ? `${theme.colors.error}15`
                : `${theme.colors.primary}15`,
            },
          ]}
        >
          <Icon
            name={icon}
            size={40}
            color={destructive ? theme.colors.error : theme.colors.primary}
          />
        </View>
        <Text style={[styles.confirmTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.confirmMessage, { color: theme.colors.text.secondary }]}>
          {message}
        </Text>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  // Action Sheet styles
  actionsContainer: {
    paddingTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Confirm styles
  confirmContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  confirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  confirmFooter: {
    flexDirection: 'row',
    padding: 20,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BottomSheetModal;
