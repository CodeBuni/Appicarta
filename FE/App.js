// App.js
import React from 'react';
import { ThemeProvider } from './src/styles/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from './src/services/pushNotificationService';
import { setupNotifications, testNotification } from './src/services/simpleNotification';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/Toast';


LogBox.ignoreAllLogs();

if (__DEV__) {
  const noop = () => {};
  console.log = noop;
  console.error = noop;
  console.warn = noop;
  console.debug = noop;
  console.info = noop;
  console.trace = noop;
  console.dir = noop;
  console.table = noop;
  console.group = noop;
  console.groupEnd = noop;
  console.groupCollapsed = noop;
  console.time = noop;
  console.timeEnd = noop;
  console.assert = noop;
  console.clear = noop;
  console.count = noop;
  console.countReset = noop;
  console.dirxml = noop;
  // Também tenta desativar o YellowBox/RedBox
  if (typeof console.disableYellowBox !== 'undefined') {
    console.disableYellowBox = true;
  }
}

// Componente Error Boundary silencioso
class SilentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Absolutamente nada - silencia completamente
  }

  render() {
    if (this.state.hasError) {
      // Rende uma View vazia
      return <></>;
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    setupNotifications();
    // Registar para notificações push quando a app abre
    registerForPushNotificationsAsync();
  }, []);
  return (
    <SilentErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
      <Toast config={toastConfig} position="top" topOffset={60} />
    </SilentErrorBoundary>
  );
}