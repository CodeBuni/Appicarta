// src/screens/MessagesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  FlatList,
  TextInput,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import Header from '../components/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import BottomNavigationBar from '../components/BottomNavigationBar';

interface Conversation {
  id: string;
  type: 'individual' | 'group';
  name: string;
  role?: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  isArcGroup?: boolean;
  members?: number;
  isOnline?: boolean;
}

interface ArcoMember {
  _id: string;
  nome: string;
  avatarUrl?: string;
  role: string;
}

interface UserArco {
  _id: string;
  nome: string;
  codigoConvite: string;
  adminId: string;
  members: string[];
}

const MessagesScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [arcMembers, setArcMembers] = useState<ArcoMember[]>([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userArco, setUserArco] = useState<UserArco | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadUserArco = async () => {
    try {
      const response = await api.get('/api/arco/my-arco');
      console.log('Resposta do arco:', response.data);
      
      if (response.data.success && response.data.data) {
        const arco = response.data.data;
        setUserArco(arco);
        
        const userId = user?.id || user?._id;
        
        // CORREÇÃO: Verifique tanto se adminId é string quanto se é objeto
        let adminIdString: string | undefined;
        if (typeof arco.adminId === 'object' && arco.adminId !== null) {
          adminIdString = arco.adminId._id?.toString();
        } else {
          adminIdString = arco.adminId?.toString();
        }
        
        const userIsAdmin = adminIdString === userId?.toString() || user?.role === 'admin';
        
        console.log('Admin check:', {
          userId,
          adminIdString,
          arcoAdminId: arco.adminId,
          userRole: user?.role,
          userIsAdmin
        });
        
        setIsAdmin(userIsAdmin);
        
        // CORREÇÃO: Carregar membros do arco diretamente da resposta
        if (arco.members && Array.isArray(arco.members)) {
          const members = arco.members
            .filter((member: any) => {
              const memberId = member._id?.toString() || member?.toString();
              return memberId !== userId?.toString();
            })
            .map((member: any) => ({
              _id: member._id || member,
              nome: member.nome || 'Membro',
              avatarUrl: member.avatarUrl || '',
              role: member.role || 'user'
            }));
          
          console.log('Membros do arco carregados:', members.length);
          setArcMembers(members);
        }
        
        await loadConversations();
      }
    } catch (error: any) {
      console.error('Erro ao carregar arco:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url
      });
    }
  };

  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get('/api/messages/conversations');
      
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserArco();
    }, [user?._id])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUserArco();
  }, [loadUserArco]);

  const handleNavigateToManageArco = () => {
    if (userArco && isAdmin) {
      navigation.navigate('ManageArcoFamiliar');
    }
  };

  const renderArcMember = ({ item }: { item: ArcoMember }) => (
    <TouchableOpacity 
      style={styles.arcMemberCard}
      onPress={() => navigation.navigate('Chat', { 
        targetId: item._id,
        type: 'individual',
        name: item.nome,
        avatarUrl: item.avatarUrl
      })}
    >
      <View style={styles.arcMemberAvatar}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarCircle, { backgroundColor: '#1c3cb4' }]}>
            <Text style={styles.avatarText}>{item.nome.charAt(0)}</Text>
          </View>
        )}
        <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
      </View>
      <Text style={[styles.arcMemberName, { color: theme.colors.text.primary }]}>
        {item.nome}
      </Text>
      <Text style={[styles.arcMemberRole, { color: theme.colors.text.secondary }]}>
        {item.role === 'admin' ? 'Administrador' : 'Membro'}
      </Text>
    </TouchableOpacity>
  );

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('Chat', { 
        targetId: item.id,
        type: item.type,
        name: item.name,
        avatarUrl: item.avatarUrl,
        isArcGroup: item.isArcGroup
      })}
    >
      <View style={[styles.conversationAvatar, { backgroundColor: item.isArcGroup ? '#1c3cb4' : '#4CAF50' }]}>
        {item.isArcGroup ? (
          <Icon name="account-group" size={24} color="#FFFFFF" />
        ) : item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        )}
      </View>
      
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, { color: theme.colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.conversationTime, { color: theme.colors.text.tertiary }]}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.conversationLastMessage, 
            { 
              color: item.unread > 0 ? theme.colors.text.primary : theme.colors.text.secondary,
              fontWeight: item.unread > 0 ? '600' : '400'
            }
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      
      {item.unread > 0 && (
        <View style={styles.conversationUnread}>
          <Text style={styles.conversationUnreadText}>
            {item.unread > 9 ? '9+' : item.unread.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const formatTime = (date: Date) => {
    try {
      const now = new Date();
      const messageDate = new Date(date);
      const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return 'Ontem';
      } else {
        return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
      }
    } catch (error) {
      return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      <Header 
        title="Mensagens"
        rightIcon={isAdmin ? "cog" : undefined}
        onRightIconPress={isAdmin ? handleNavigateToManageArco : undefined}
        showNotifications={false}
        showAvatar={false}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <Icon name="magnify" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Pesquisar conversas..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {!userArco ? (
          <View style={styles.noArcoContainer}>
            <View style={[styles.noArcoCard, { backgroundColor: theme.colors.surface }]}>
              <Icon name="account-group" size={60} color={theme.colors.primary} style={styles.noArcoIcon} />
              <Text style={[styles.noArcoTitle, { color: theme.colors.text.primary }]}>
                Arco Familiar
              </Text>
              <Text style={[styles.noArcoText, { color: theme.colors.text.secondary }]}>
                Junte-se ou crie um arco familiar para começar a conversar
              </Text>
              <TouchableOpacity 
                style={[styles.noArcoButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('JoinCreateArco')}
              >
                <Text style={styles.noArcoButtonText}>Configurar Arco</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.arcCard, { backgroundColor: theme.colors.surface }]}>
              <TouchableOpacity
                style={styles.arcContent}
                onPress={() => {
                  const arcGroup = conversations.find(c => c.isArcGroup);
                  if (arcGroup) {
                    navigation.navigate('Chat', { 
                      targetId: arcGroup.id,
                      type: 'group',
                      name: arcGroup.name,
                      isArcGroup: true
                    });
                  }
                }}
              >
                <View style={[styles.arcIcon, { backgroundColor: theme.colors.primary }]}>
                  <Icon name="account-group" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.arcInfo}>
                  <Text style={[styles.arcTitle, { color: theme.colors.text.primary }]}>
                    Arco Familiar
                  </Text>
                  <Text style={[styles.arcSubtitle, { color: theme.colors.text.secondary }]}>
                    {userArco.nome} • {arcMembers.length + 1} membros
                  </Text>
                  <Text style={[styles.arcStatus, { color: theme.colors.text.secondary }]}>
                    <Text style={{ color: '#4CAF50', fontSize: 14, marginRight: 6 }}>●</Text>
                    Online agora
                  </Text>
                </View>
              </TouchableOpacity>
              
              {isAdmin && (
                <TouchableOpacity 
                  onPress={handleNavigateToManageArco}
                  style={[styles.arcSettingsButton, { marginLeft: 'auto' }]}
                >
                  <Icon name="cog" size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              )}
              
              {(() => {
                const arcGroup = conversations.find(c => c.isArcGroup);
                return arcGroup && arcGroup.unread > 0 ? (
                  <View style={styles.arcBadge}>
                    <Text style={styles.arcBadgeText}>
                      {arcGroup.unread > 9 ? '9+' : arcGroup.unread.toString()}
                    </Text>
                  </View>
                ) : null;
              })()}
            </View>

            {arcMembers.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                    Membros do Arco
                  </Text>
                  <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                    {arcMembers.length}
                  </Text>
                </View>
                <FlatList
                  data={arcMembers}
                  renderItem={renderArcMember}
                  keyExtractor={(item) => item._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.arcMembersList}
                />
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Conversas
                </Text>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                  {conversations.filter(c => !c.isArcGroup).length}
                </Text>
              </View>
              
              {conversations.filter(c => !c.isArcGroup).length > 0 ? (
                <FlatList
                  data={conversations.filter(c => !c.isArcGroup)}
                  renderItem={renderConversation}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.conversationsList}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="message-outline" size={60} color={theme.colors.text.tertiary} />
                  <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
                    Nenhuma conversa ainda
                  </Text>
                  <Text style={[styles.emptyStateSubtext, { color: theme.colors.text.tertiary }]}>
                    Comece uma conversa com um membro do seu arco
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNavigationBar 
        activeTab="messages" 
        onTabPress={(tabId: string) => {
          if (tabId === 'home') navigation.navigate('Home');
          if (tabId === 'correspondencias') navigation.navigate('MailAndPackages');
          if (tabId === 'messages') navigation.navigate('Messages');
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  noArcoContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  noArcoCard: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  noArcoIcon: {
    marginBottom: 16,
  },
  noArcoTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  noArcoText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  noArcoButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noArcoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  arcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  arcContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  arcIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  arcInfo: {
    flex: 1,
  },
  arcTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  arcSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  arcStatus: {
    fontSize: 13,
  },
  arcSettingsButton: {
    padding: 8,
    marginLeft: 8,
  },
  arcBadge: {
    backgroundColor: '#f84234',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    marginLeft: 8,
  },
  arcBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  arcMembersList: {
    paddingHorizontal: 20,
  },
  arcMemberCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  arcMemberAvatar: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  arcMemberName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  arcMemberRole: {
    fontSize: 11,
    textAlign: 'center',
  },
  conversationsList: {
    paddingHorizontal: 20,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  conversationAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: 12,
  },
  conversationLastMessage: {
    fontSize: 14,
  },
  conversationUnread: {
    backgroundColor: '#f84234',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  conversationUnreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: { 
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 80,
  },
});

export default MessagesScreen;