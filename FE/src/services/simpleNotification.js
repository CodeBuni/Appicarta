// services/simpleNotification.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar como as notificações aparecem
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Configurar canal no Android
export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('cartas', {
      name: 'Cartas',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF416C',
    });
  }
}

// Mostrar notificação quando chega uma carta
export async function showCartaNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📬 Nova Carta!',
      body: 'Uma nova carta acabou de chegar à caixa de correio.',
      sound: 'default',
      priority: 'high',
    },
    trigger: null, // Mostra imediatamente
  });
  
  console.log('✅ Notificação enviada!');
}

// Notificação de teste (para experimentar)
export async function testNotification() {
  await showCartaNotification();
}