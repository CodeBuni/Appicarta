// src/components/Toast.tsx - Sistema de Toast elegante
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, darkColors } from '../styles/theme';

const { width } = Dimensions.get('window');

// Toast de sucesso customizado
const SuccessToastComponent = (props: any) => (
  <BaseToast
    {...props}
    style={styles.successContainer}
    contentContainerStyle={styles.contentContainer}
    text1Style={styles.text1}
    text2Style={styles.text2}
    renderLeadingIcon={() => (
      <View style={styles.iconContainer}>
        <Icon name="check-circle" size={24} color="#10B981" />
      </View>
    )}
  />
);

// Toast de erro customizado
const ErrorToastComponent = (props: any) => (
  <ErrorToast
    {...props}
    style={styles.errorContainer}
    contentContainerStyle={styles.contentContainer}
    text1Style={[styles.text1, styles.errorText1]}
    text2Style={[styles.text2, styles.errorText2]}
    renderLeadingIcon={() => (
      <View style={styles.iconContainer}>
        <Icon name="alert-circle" size={24} color="#EF4444" />
      </View>
    )}
  />
);

// Toast de info customizado
const InfoToastComponent = (props: any) => (
  <BaseToast
    {...props}
    style={styles.infoContainer}
    contentContainerStyle={styles.contentContainer}
    text1Style={[styles.text1, styles.infoText1]}
    text2Style={[styles.text2, styles.infoText2]}
    renderLeadingIcon={() => (
      <View style={styles.iconContainer}>
        <Icon name="information" size={24} color="#3B82F6" />
      </View>
    )}
  />
);

// Toast de aviso customizado
const WarningToastComponent = (props: any) => (
  <BaseToast
    {...props}
    style={styles.warningContainer}
    contentContainerStyle={styles.contentContainer}
    text1Style={[styles.text1, styles.warningText1]}
    text2Style={[styles.text2, styles.warningText2]}
    renderLeadingIcon={() => (
      <View style={styles.iconContainer}>
        <Icon name="alert" size={24} color="#F59E0B" />
      </View>
    )}
  />
);

// Configuração global de toasts
export const toastConfig: ToastConfig = {
  success: SuccessToastComponent,
  error: ErrorToastComponent,
  info: InfoToastComponent,
  warning: WarningToastComponent,
  // Custom toasts para tipos específicos da app
  successPremium: (props) => (
    <View style={styles.premiumContainer}>
      <View style={styles.premiumGradient}>
        <Icon name="check-decagram" size={28} color="#10B981" />
        <View style={styles.premiumTextContainer}>
          <Text style={styles.premiumTitle}>{props.text1}</Text>
          {props.text2 && <Text style={styles.premiumSubtitle}>{props.text2}</Text>}
        </View>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  successContainer: {
    borderLeftColor: '#10B981',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  errorContainer: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContainer: {
    borderLeftColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  warningContainer: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  text1: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 18,
  },
  errorText1: {
    color: '#991B1B',
  },
  errorText2: {
    color: '#B91C1C',
  },
  infoText1: {
    color: '#1E40AF',
  },
  infoText2: {
    color: '#2563EB',
  },
  warningText1: {
    color: '#92400E',
  },
  warningText2: {
    color: '#B45309',
  },
  // Premium styles
  premiumContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  premiumTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});

// Helper para mostrar toasts facilmente
export const showToast = {
  success: (message: string, description?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({
      type: 'success',
      text1: message,
      text2: description,
      visibilityTime: 3000,
      position: 'top',
      topOffset: 60,
    });
  },
  error: (message: string, description?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({
      type: 'error',
      text1: message,
      text2: description,
      visibilityTime: 4000,
      position: 'top',
      topOffset: 60,
    });
  },
  info: (message: string, description?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({
      type: 'info',
      text1: message,
      text2: description,
      visibilityTime: 3000,
      position: 'top',
      topOffset: 60,
    });
  },
  warning: (message: string, description?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({
      type: 'warning',
      text1: message,
      text2: description,
      visibilityTime: 3000,
      position: 'top',
      topOffset: 60,
    });
  },
};

export default Toast;
