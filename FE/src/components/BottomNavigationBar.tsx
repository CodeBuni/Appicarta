// src/components/BottomNavigationBar.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define os tipos das rotas disponíveis
type RootStackParamList = {
  Home: undefined;
  MailAndPackages: undefined;
  Messages: undefined;
  Notifications: undefined;
  Login: undefined;
  Register: undefined;
  // Adicione outras rotas aqui conforme necessário
};

// Define o tipo para a navegação
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface BottomNavigationBarProps {
  activeTab: string;
  onTabPress?: (tabId: string) => void;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ 
  activeTab, 
  onTabPress,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  
  // Usar o tipo correto para navigation
  const navigation = useNavigation<NavigationProp>();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const badgeScale = useState(new Animated.Value(0))[0];

  // Buscar contagem de notificações não lidas
  const fetchUnreadCount = async () => {
    try {
      const count = await AsyncStorage.getItem('@Appicarta:unreadCount');
      const unread = parseInt(count || '0');
      setUnreadCount(unread);
      
      // Animar badge se houver notificações
      if (unread > 0) {
        Animated.spring(badgeScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 3,
        }).start();
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações:', error);
    }
  };

  // Atualizar quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  // 3 TABS ORIGINAIS: Home, Correspondências, Mensagens
  const tabs = [
    { 
      id: 'home', 
      icon: 'home-outline', 
      activeIcon: 'home',
      label: 'Home',
      color: colors.primary,
    },
    { 
      id: 'correspondencias', 
      icon: 'email-multiple-outline', 
      activeIcon: 'email-multiple',
      label: 'Correspondências',
      color: colors.secondary,
    },
    { 
      id: 'messages', 
      icon: 'account-group-outline', 
      activeIcon: 'account-group', 
      label: 'Arco Familiar',
      color: colors.primary,
      badge: unreadCount,
    },
  ];

  const handleTabPress = (tabId: string) => {
    // Primeiro, executa a ação personalizada se fornecida
    if (onTabPress) {
      onTabPress(tabId);
      return;
    }
    
    // Se não houver ação personalizada, navega normalmente
    // Agora o TypeScript conhece os tipos das rotas
    switch (tabId) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'correspondencias':
        navigation.navigate('MailAndPackages');
        break;
      case 'messages':
        navigation.navigate('Messages');
        break;
      // Adicione outras rotas se necessário
    }
  };

  const renderBadge = (count: number) => {
    if (count <= 0) return null;
    
    const badgeSize = count > 9 ? 24 : 20;
    
    return (
      <Animated.View 
        style={[
          styles.badgeContainer,
          { 
            transform: [{ scale: badgeScale }],
            backgroundColor: colors.error || '#EF4444',
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
          }
        ]}
      >
        <Text style={styles.badgeText}>
          {count > 9 ? '9+' : count}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.surface,
        borderTopColor: colors.borderLight || '#f0f0f0',
      }
    ]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const tabColor = isActive ? tab.color : colors.text.secondary;
        const backgroundColor = isActive ? `${tab.color}15` : 'transparent';
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.7}
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <View style={styles.tabContent}>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: tab.color }]} />
              )}
              
              <View style={[
                styles.iconContainer,
                { backgroundColor }
              ]}>
                <Icon
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={tabColor}
                />
                
                {/* Badge para mensagens */}
                {tab.id === 'messages' && tab.badge && renderBadge(tab.badge)}
              </View>
              
              <Text style={[
                styles.tabLabel,
                { 
                  color: tabColor,
                  fontWeight: isActive ? '600' : '500'
                }
              ]}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    paddingVertical: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
    includeFontPadding: false,
  },
  // Estilos do badge
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    minHeight: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    includeFontPadding: false,
  },
});

export default BottomNavigationBar;