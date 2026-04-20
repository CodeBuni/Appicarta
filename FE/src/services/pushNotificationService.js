// services/pushNotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import api from '../config/api';

// Configurar como as notificações aparecem
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Registar o dispositivo para receber notificações
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF416C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Erro', 'Permissão para notificações negada!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('✅ Expo Push Token:', token);
    
    // Guardar o token no backend
    try {
      await api.post('/api/push/register-token', { token });
      console.log('✅ Token guardado no backend');
    } catch (error) {
      console.log('❌ Erro ao guardar token:', error);
    }
  } else {
    Alert.alert('Aviso', 'Usa um dispositivo físico para receber notificações push');
  }

  return token;
}

// Função para enviar notificação local (teste)
export async function sendLocalNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: null, // Mostra imediatamente
  });
}