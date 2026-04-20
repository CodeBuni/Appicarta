// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Telas - IMPORTAÇÃO CORRETA
import NotificationsScreenWithNav from '../screens/Notifications';
import Start from '../screens/Start';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import Home from '../screens/Home';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import UserScreen from '../screens/UserScreen';
import AboutAppicartaScreen from '../screens/AboutAppicartaScreen';
import MailAndPackagesScreen from '../screens/MailAndPackagesScreen';
import JoinCreateArcoScreen from '../screens/JoinCreateArcoScreen';
import GerirArcoFamiliarScreen from '../screens/GerirArcoFamiliarScreen';

const Stack = createNativeStackNavigator();

// Tela de loading
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c3cb4' }}>
    <ActivityIndicator size="large" color="#FFFFFF" />
  </View>
);

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#f5f5f5' } // Corrigi a cor de fundo
        }}
      >
        {user ? (
          // User AUTENTICADO - CORRIGIDO: use as telas normais, não as "WithNav"
          <>
            <Stack.Screen 
              name="Home" 
              component={Home}
              options={{
                animation: "slide_from_right",
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="MailAndPackages" 
              component={MailAndPackagesScreen}
              options={{
                animation: "slide_from_right",
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="Messages" 
              component={MessagesScreen}
              options={{
                animation: "slide_from_right",
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreenWithNav}
              options={{
                animation: "slide_from_bottom",
                presentation: "modal",
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{
                animation: "slide_from_right",
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="UserScreen" 
              component={UserScreen}
              options={{
                animation: "slide_from_right",
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="JoinCreateArco" 
              component={JoinCreateArcoScreen} 
              options={{ title: 'Arco Familiar' }}
            />
            <Stack.Screen 
              name="ManageArcoFamiliar" 
              component={GerirArcoFamiliarScreen} 
              options={{ title: 'Gerir Arco' }}
            />
            <Stack.Screen 
              name="AboutAppicartaScreen" 
              component={AboutAppicartaScreen}
              options={{
                animation: "slide_from_right",
                gestureEnabled: true,
              }}
            />
          </>
        ) : (
          // USER NÃO AUTENTICADO
          <>
            <Stack.Screen 
              name="Start" 
              component={Start}
              options={{
                animation: "fade",
              }}
            />
            <Stack.Screen 
              name="LoginScreen" 
              component={LoginScreen}
              options={{
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen 
              name="SignupScreen" 
              component={SignupScreen}
              options={{
                animation: "slide_from_bottom",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;