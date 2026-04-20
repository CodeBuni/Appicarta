// src/screens/NotificationsScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  UIManager,
  LayoutAnimation
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import Header from '../components/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BottomNavigationBar from '../components/BottomNavigationBar';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ativar LayoutAnimation no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Tipos simplificados
type NotificationType = 'mail' | 'package' | 'message' | 'arco' | 'system' | 'alert' | 'request';

interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  data?: any;
  priority?: number;
}

const NotificationsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const swipeableRefs = useRef<{ [key: string]: Swipeable }>({});

  // Configurar LayoutAnimation
  const configureLayoutAnimation = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // Mapear tipo para ícone e cor
  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: { icon: string; color: string } } = {
      mail: { icon: 'email', color: '#2563EB' },
      package: { icon: 'package-variant', color: '#DC2626' },
      message: { icon: 'message-text', color: '#7C3AED' },
      arco: { icon: 'account-group', color: '#059669' },
      system: { icon: 'cog', color: '#6B7280' },
      alert: { icon: 'alert-circle', color: '#F59E0B' },
      request: { icon: 'account-clock', color: '#8B5CF6' }
    };
    return icons[type] || { icon: 'bell', color: '#6B7280' };
  };

  // Formatar data simplificado
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'agora';
      if (diffMins < 60) return `há ${diffMins} min`;
      if (diffHours < 24) return `há ${diffHours} h`;
      if (diffDays < 7) return `há ${diffDays} dias`;
      
      return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
    } catch (error) {
      return dateString;
    }
  };

  // Buscar notificações
  const fetchNotifications = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      
      console.log('📡 Buscando notificações...');
      
      const response = await api.get('/api/notifications', {
        params: {
          limit: 20,
          offset: 0,
          unreadOnly: false
        }
      });

      if (response.data.success) {
        const { notifications: newNotifications, pagination } = response.data.data;
        
        setNotifications(newNotifications);
        setUnreadCount(pagination.unread);
        
        // Atualizar badge no AsyncStorage
        await AsyncStorage.setItem('@Appicarta:unreadCount', pagination.unread.toString());
        
        console.log(`✅ ${newNotifications.length} notificações carregadas (${pagination.unread} não lidas)`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar notificações:', error);
      
      if (error.response?.status === 401) {
        Alert.alert('Sessão expirada', 'Por favor, faça login novamente');
        // navigation.navigate('Login');
        return;
      }
      
      Alert.alert(
        'Erro',
        'Não foi possível carregar as notificações. Verifique sua conexão.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Marcar como lida
  const markAsRead = async (notificationId: string) => {
    try {
      console.log(`📌 Marcando notificação ${notificationId} como lida`);
      
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        // Atualizar estado local
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Atualizar contagem de não lidas
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Atualizar AsyncStorage
        await AsyncStorage.setItem('@Appicarta:unreadCount', Math.max(0, unreadCount - 1).toString());
        
        console.log(`✅ Notificação marcada como lida`);
      }
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
      Alert.alert('Erro', 'Não foi possível marcar a notificação como lida');
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      Alert.alert(
        'Marcar todas como lidas',
        'Tem certeza que deseja marcar todas as notificações como lidas?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim',
            onPress: async () => {
              console.log('📌 Marcando TODAS as notificações como lidas');
              
              const response = await api.put('/api/notifications/read-all');
              
              if (response.data.success) {
                // Atualizar todas as notificações para lidas
                setNotifications(prev =>
                  prev.map(notification => ({ ...notification, read: true }))
                );
                
                // Zerar contagem de não lidas
                setUnreadCount(0);
                
                // Atualizar AsyncStorage
                await AsyncStorage.setItem('@Appicarta:unreadCount', '0');
                
                Alert.alert('Sucesso', 'Todas as notificações foram marcadas como lidas');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
      Alert.alert('Erro', 'Não foi possível marcar todas as notificações como lidas');
    }
  };

  // Deletar notificação
  const deleteNotification = async (notificationId: string) => {
    try {
      configureLayoutAnimation();
      
      const response = await api.delete(`/api/notifications/${notificationId}`);
      
      if (response.data.success) {
        // Remover da lista local
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        console.log(`🗑️ Notificação deletada: ${notificationId}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
      Alert.alert('Erro', 'Não foi possível deletar a notificação');
    }
  };

  // Deletar todas as lidas
  const deleteAllRead = async () => {
    try {
      Alert.alert(
        'Limpar notificações lidas',
        'Tem certeza que deseja apagar todas as notificações já lidas?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim',
            onPress: async () => {
              console.log('🗑️ Deletando TODAS as notificações lidas');
              
              const response = await api.delete('/api/notifications/read-all');
              
              if (response.data.success) {
                // Remover apenas as lidas da lista local
                setNotifications(prev => prev.filter(n => !n.read));
                Alert.alert('Sucesso', 'Notificações lidas apagadas');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao deletar notificações lidas:', error);
      Alert.alert('Erro', 'Não foi possível apagar as notificações lidas');
    }
  };

  // Handler para clicar em uma notificação
  const handleNotificationPress = async (notification: Notification) => {
    // Primeiro, marcar como lida se ainda não estiver
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    // Navegar baseado no tipo
    switch (notification.type) {
      case 'mail':
      case 'package':
        navigation.navigate('MailAndPackages');
        break;
      case 'message':
        navigation.navigate('Messages');
        break;
      case 'arco':
        navigation.navigate('ArcScreen');
        break;
      default:
        break;
    }
  };

  // Carregar notificações quando a tela for focada
  useFocusEffect(
    useCallback(() => {
      fetchNotifications(true);
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  // Renderizar ações do swipe (direita)
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, notification: Notification) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const isUnread = !notification.read;

    return (
      <View style={styles.rightActionsContainer}>
        {/* Botão Marcar como Lida (se não lida) */}
        {isUnread && (
          <Animated.View
            style={[
              styles.rightAction,
              styles.readAction,
              { transform: [{ scale: trans }] }
            ]}
          >
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                swipeableRefs.current[notification._id]?.close();
                markAsRead(notification._id);
              }}
            >
              <Icon name="check-circle" size={28} color="#FFF" />
              <Text style={styles.actionText}>Lida</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Botão Apagar */}
        <Animated.View
          style={[
            styles.rightAction,
            styles.deleteAction,
            { transform: [{ scale: trans }] }
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              swipeableRefs.current[notification._id]?.close();
              deleteNotification(notification._id);
            }}
          >
            <Icon name="trash-can-outline" size={28} color="#FFF" />
            <Text style={styles.actionText}>Apagar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Renderizar cada item de notificação
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const { icon, color } = getNotificationIcon(item.type);
    const isUnread = !item.read;
    const formattedTime = formatDate(item.createdAt);

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current[item._id] = ref;
          }
        }}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        containerStyle={styles.swipeContainer}
        overshootRight={false}
      >
        <TouchableOpacity
          style={[
            styles.notificationRow,
            { backgroundColor: theme.colors.background },
            isUnread && styles.unreadRow
          ]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          {/* Ícone */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: `${color}20` }]}>
              <Icon name={icon} size={22} color={color} />
            </View>
            {isUnread && <View style={[styles.unreadDot, { backgroundColor: color }]} />}
          </View>

          {/* Conteúdo */}
          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.title,
                  { color: isUnread ? theme.colors.text.primary : theme.colors.text.secondary },
                  isUnread && styles.boldText
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={[styles.time, { color: theme.colors.text.tertiary }]}>
                {formattedTime}
              </Text>
            </View>
            <Text
              style={[styles.message, { color: theme.colors.text.secondary }]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Renderizar loading
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
        Carregando notificações...
      </Text>
    </View>
  );

  // Renderizar lista vazia
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bell-sleep-outline" size={80} color={theme.colors.text.tertiary} style={{ opacity: 0.5 }} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        Nenhuma notificação
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
        Quando tiveres novas notificações,{'\n'}elas aparecerão aqui.
      </Text>
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => fetchNotifications(true)}
      >
        <Icon name="refresh" size={20} color="#FFF" />
        <Text style={styles.refreshButtonText}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.surface} />
        {/* Header com ações */}
        <Header
          title="Notificações"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          showNotifications={false}
          rightIcon="check-all"
          onRightIconPress={markAllAsRead}
        />
        {/* Contador de não lidas */}
        {unreadCount > 0 && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {unreadCount} {unreadCount === 1 ? 'não lida' : 'não lidas'}
            </Text>
          </View>
        )}
        {/* Lista de notificações */}
        {loading && !refreshing ? (
          renderLoading()
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            ListEmptyComponent={renderEmptyList}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  counterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  counterText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  swipeContainer: {
    overflow: 'hidden',
  },
  notificationRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  unreadRow: {
    backgroundColor: '#F8FAFC',
  },
  iconContainer: {
    marginRight: 16,
    position: 'relative',
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  boldText: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.9,
  },
  separator: {
    height: 1,
    marginLeft: 80,
  },
  // Ações do swipe
  rightActionsContainer: {
    flexDirection: 'row',
    width: 160,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readAction: {
    backgroundColor: '#10B981', // Verde
  },
  deleteAction: {
    backgroundColor: '#EF4444', // Vermelho
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Componente com navegação inferior (APENAS 3 TABS)
const NotificationsScreenWithNav = (props: any) => {
  const navigation = useNavigation<any>();
  return (
    <>
      <NotificationsScreen {...props} />
      <BottomNavigationBar
        activeTab="notifications"
        onTabPress={(tabId: string) => {
          if (tabId === 'home') navigation.navigate('Home');
          if (tabId === 'correspondencias') navigation.navigate('MailAndPackages');
          if (tabId === 'messages') navigation.navigate('Messages');
          if (tabId === 'notifications') navigation.navigate('Notifications');
          if (tabId === 'profile') navigation.navigate('UserScreen');
        }}
      />
    </>
  );
};

export default NotificationsScreenWithNav;