// src/screens/ChatScreen.tsx - VERSÃO MELHORADA COM AVATARES
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Modal, // ADICIONA ESTE IMPORT
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const { width } = Dimensions.get('window');

interface Message {
  _id: string;
  fromUserId: {
    _id: string;
    nome: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: Date;
  readBy: Array<{ userId: string }>;
}

interface RecipientInfo {
  type: 'individual' | 'group';
  name: string;
  avatarUrl?: string;
  role?: string;
  telefone?: string;
  email?: string;
  members?: Array<{
    _id: string;
    nome: string;
    avatarUrl?: string;
    role: string;
  }>;
}

interface MemberDetail {
  _id: string;
  nome: string;
  avatarUrl?: string;
  role: string;
  email?: string;
  telefone?: string;
}

// Define os tipos de parâmetros de navegação
type RootStackParamList = {
  UserProfile: {
    userId: string;
    userName: string;
    userAvatar?: string;
    userRole?: string;
    userPhone?: string;
    userEmail?: string;
  };
  // Adiciona outras rotas conforme necessário
};

const ChatScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<any>(); // Usa 'any' para evitar problemas de tipo
  const route = useRoute();
  const { user } = useAuth();
  
  const { targetId, type, name, avatarUrl, isArcGroup } = route.params as any;
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    type: type || 'individual',
    name: name || '',
    avatarUrl: avatarUrl
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersDetails, setMembersDetails] = useState<MemberDetail[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  const loadChat = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando chat para:', targetId);
      
      const response = await api.get(`/api/messages/conversation/${targetId}`);
      
      if (response.data.success) {
        console.log('✅ Chat carregado:', response.data.data.messages.length, 'mensagens');
        setMessages(response.data.data.messages);
        
        // Atualizar informações do destinatário
        const recipient = response.data.data.recipient;
        setRecipientInfo(recipient);
        
        // Se for grupo, carregar detalhes dos membros
        if (recipient.type === 'group' && recipient.members) {
          await loadMembersDetails(recipient.members);
        }
      } else {
        Alert.alert('Erro', response.data.message || 'Erro ao carregar chat');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar chat:', error);
      const errorMsg = error.response?.data?.message || 'Não foi possível carregar a conversa';
      Alert.alert('Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadMembersDetails = async (members: any[]) => {
    try {
      setLoadingMembers(true);
      const memberPromises = members.map(async (memberId) => {
        try {
          const response = await api.get(`/api/users/${memberId}`);
          if (response.data.success) {
            return response.data.data;
          }
        } catch (error) {
          console.error(`Erro ao carregar membro ${memberId}:`, error);
        }
        return null;
      });

      const membersData = await Promise.all(memberPromises);
      setMembersDetails(membersData.filter(m => m !== null));
    } catch (error) {
      console.error('Erro ao carregar detalhes dos membros:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadChat();
      
      // Recarregar a cada 10 segundos para novas mensagens
      const interval = setInterval(() => {
        loadChat();
      }, 10000);
      
      return () => clearInterval(interval);
    }, [targetId])
  );

  const sendMessage = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      console.log('📤 Enviando mensagem para:', targetId);
      
      const messageData: any = {
        content: message.trim()
      };

      if (recipientInfo.type === 'group' || isArcGroup) {
        messageData.toArcoId = targetId;
        console.log('📨 Enviando para grupo do arco');
      } else {
        messageData.toUserId = targetId;
        console.log('📨 Enviando para usuário individual');
      }

      const response = await api.post('/api/messages/send', messageData);
      
      if (response.data.success) {
        console.log('✅ Mensagem enviada com sucesso');
        const newMessage = response.data.data;
        
        // Adicionar a nova mensagem à lista
        setMessages(prev => [...prev, newMessage]);
        setMessage('');
        
        // Scroll para a nova mensagem
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        // Focar no input novamente
        textInputRef.current?.focus();
      } else {
        Alert.alert('Erro', response.data.message || 'Erro ao enviar mensagem');
      }
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error);
      const errorMsg = error.response?.data?.message || 'Não foi possível enviar a mensagem';
      Alert.alert('Erro', errorMsg);
    } finally {
      setSending(false);
    }
  };

  const renderAvatar = (avatarUrl?: string, name?: string, size = 40) => {
    const initials = name ? name.charAt(0).toUpperCase() : 'U';
    
    if (avatarUrl && avatarUrl.trim() !== '') {
      return (
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      );
    }
    
    return (
      <View style={[styles.avatarPlaceholder, {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primary,
      }]}>
        <Text style={[styles.avatarInitials, {
          color: '#FFFFFF',
          fontSize: size * 0.4,
        }]}>
          {initials}
        </Text>
      </View>
    );
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.fromUserId._id === user?.id;
    const senderName = isOwnMessage ? 'Você' : item.fromUserId.nome;
    const messageTime = new Date(item.createdAt);
    const formattedTime = messageTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Verificar se é a primeira mensagem de uma sequência do mesmo remetente
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isFirstInSequence = !prevMessage || 
      prevMessage.fromUserId._id !== item.fromUserId._id ||
      new Date(item.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 5 * 60 * 1000; // 5 minutos

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <>
            {isFirstInSequence && (
              <View style={styles.messageHeader}>
                {renderAvatar(item.fromUserId.avatarUrl, item.fromUserId.nome, 32)}
                <Text style={[styles.senderName, { color: theme.colors.text.primary }]}>
                  {senderName}
                </Text>
              </View>
            )}
          </>
        )}
        
        <View style={[
          styles.messageBubble,
          { 
            backgroundColor: isOwnMessage ? theme.colors.primary : theme.colors.surfaceVariant,
            marginTop: !isOwnMessage && isFirstInSequence ? 8 : 4,
            borderTopLeftRadius: isOwnMessage ? 20 : 4,
            borderTopRightRadius: isOwnMessage ? 4 : 20,
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isOwnMessage ? '#FFFFFF' : theme.colors.text.primary }
          ]}>
            {item.content}
          </Text>
        </View>
        
        <View style={[
          styles.messageMeta,
          { justifyContent: isOwnMessage ? 'flex-end' : 'flex-start' }
        ]}>
          <Text style={[styles.messageTime, { 
            color: isOwnMessage ? theme.colors.text.tertiary : theme.colors.text.tertiary,
            marginLeft: isOwnMessage ? 0 : 8,
            marginRight: isOwnMessage ? 8 : 0,
          }]}>
            {formattedTime}
          </Text>
          {isOwnMessage && item.readBy && item.readBy.length > 1 && (
            <Icon name="check-all" size={14} color={theme.colors.primary} style={styles.readIcon} />
          )}
        </View>
      </View>
    );
  };

  const Header = () => (
    <SafeAreaView style={{ backgroundColor: theme.colors.surface }}>
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.colors.borderLight,
      }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerContent}
          onPress={() => {
            if (recipientInfo.type === 'individual') {
              // Mostrar informações do usuário
              navigation.navigate('UserProfile', {
                userId: targetId,
                userName: recipientInfo.name,
                userAvatar: recipientInfo.avatarUrl,
                userRole: recipientInfo.role,
                userPhone: recipientInfo.telefone,
                userEmail: recipientInfo.email,
              });
            } else {
              setShowMembersModal(true);
            }
          }}
        >
          <View style={styles.headerAvatar}>
            {recipientInfo.type === 'individual' ? (
              renderAvatar(recipientInfo.avatarUrl, recipientInfo.name, 42)
            ) : (
              <View style={styles.groupAvatarContainer}>
                {membersDetails.slice(0, 2).map((member, index) => (
                  <View key={member._id} style={[
                    styles.groupAvatar,
                    { 
                      position: 'absolute',
                      left: index * 20,
                      zIndex: 2 - index,
                    }
                  ]}>
                    {renderAvatar(member.avatarUrl, member.nome, 32)}
                  </View>
                ))}
                {membersDetails.length > 2 && (
                  <View style={[styles.moreMembersBadge, {
                    left: 40,
                    backgroundColor: theme.colors.primary,
                  }]}>
                    <Text style={styles.moreMembersText}>+{membersDetails.length - 2}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.headerTextContainer}>
            <Text style={[styles.chatName, { color: theme.colors.text.primary }]}>
              {recipientInfo.name}
            </Text>
            <View style={styles.statusContainer}>
              {recipientInfo.type === 'individual' ? (
                <>
                  <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={[styles.chatStatus, { color: theme.colors.text.secondary }]}>
                    {recipientInfo.role === 'admin' ? 'Administrador' : 'Membro'} • Online
                  </Text>
                </>
              ) : (
                <Text style={[styles.chatStatus, { color: theme.colors.text.secondary }]}>
                  {membersDetails.length} membros • Arco Familiar
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            const options = recipientInfo.type === 'group' 
              ? ['Ver membros', 'Silenciar notificações', 'Informações do grupo']
              : ['Ver perfil', 'Silenciar notificações', 'Informações'];
            
            Alert.alert(
              'Opções do chat',
              undefined,
              [
                ...options.map(option => ({
                  text: option,
                  onPress: () => {
                    if (option === 'Ver membros') {
                      setShowMembersModal(true);
                    } else if (option === 'Ver perfil') {
                      navigation.navigate('UserProfile', {
                        userId: targetId,
                        userName: recipientInfo.name,
                        userAvatar: recipientInfo.avatarUrl,
                      });
                    }
                  }
                })),
                { text: 'Cancelar', style: 'cancel' }
              ]
            );
          }}
        >
          <Icon name="dots-vertical" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderMembersModal = () => (
    <Modal
      visible={showMembersModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowMembersModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { 
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.borderLight,
          }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              Membros do Arco ({membersDetails.length})
            </Text>
            <TouchableOpacity onPress={() => setShowMembersModal(false)}>
              <Icon name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {loadingMembers ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : membersDetails.length > 0 ? (
              membersDetails.map((member) => (
                <TouchableOpacity
                  key={member._id}
                  style={[styles.memberItem, { 
                    backgroundColor: theme.colors.surface,
                    borderBottomColor: theme.colors.borderLight,
                  }]}
                  onPress={() => {
                    setShowMembersModal(false);
                    setTimeout(() => {
                      navigation.navigate('UserProfile', {
                        userId: member._id,
                        userName: member.nome,
                        userAvatar: member.avatarUrl,
                        userRole: member.role,
                      });
                    }, 300);
                  }}
                >
                  {renderAvatar(member.avatarUrl, member.nome, 50)}
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: theme.colors.text.primary }]}>
                      {member.nome}
                    </Text>
                    <View style={styles.memberMeta}>
                      <Text style={[styles.memberRole, { color: theme.colors.text.secondary }]}>
                        {member.role === 'admin' ? 'Administrador' : 'Membro'}
                      </Text>
                      {member.telefone && (
                        <Text style={[styles.memberPhone, { color: theme.colors.text.tertiary }]}>
                          • {member.telefone}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.noMembersText, { color: theme.colors.text.secondary }]}>
                Nenhum membro encontrado
              </Text>
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowMembersModal(false)}
          >
            <Text style={styles.modalButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Carregando conversa...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.surface} 
      />
      
      <Header />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }}
        onLayout={() => {
          if (messages.length > 0) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { 
              backgroundColor: theme.colors.primary + '20' 
            }]}>
              <Icon name="message-outline" size={60} color={theme.colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
              {recipientInfo.type === 'group' 
                ? 'Inicie a conversa familiar!' 
                : 'Envie sua primeira mensagem!'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
              {recipientInfo.type === 'group'
                ? 'Esta conversa é compartilhada com todos os membros do seu arco.'
                : 'As mensagens são privadas entre vocês dois.'}
            </Text>
            <TouchableOpacity 
              style={[styles.startChatButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => textInputRef.current?.focus()}
            >
              <Icon name="message-plus" size={20} color="#FFFFFF" />
              <Text style={styles.startChatButtonText}>
                Começar conversa
              </Text>
            </TouchableOpacity>
          </View>
        }
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      <SafeAreaView style={{ backgroundColor: theme.colors.surface }}>
        <View style={[styles.inputContainer, { 
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.borderLight,
        }]}>
          <View style={[styles.messageInputWrapper, { 
            backgroundColor: theme.colors.surfaceVariant,
          }]}>
            <TextInput
              ref={textInputRef}
              style={[styles.messageInput, { 
                color: theme.colors.text.primary 
              }]}
              placeholder="Escreve uma mensagem..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              editable={!sending}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={styles.attachmentButton}
              onPress={() => {
                Alert.alert('Em breve', 'Anexos estarão disponíveis em breve!');
              }}
            >
              <Icon name="paperclip" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.sendButton, { 
              backgroundColor: message.trim() && !sending ? theme.colors.primary : theme.colors.surfaceVariant,
            }]}
            onPress={sendMessage}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={theme.colors.text.tertiary} />
            ) : (
              <Icon 
                name="send" 
                size={20} 
                color={message.trim() ? '#FFFFFF' : theme.colors.text.tertiary} 
              />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {renderMembersModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  headerAvatar: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  chatStatus: {
    fontSize: 13,
  },
  headerButton: {
    padding: 8,
  },
  groupAvatarContainer: {
    width: 52,
    height: 42,
    position: 'relative',
  },
  groupAvatar: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  moreMembersBadge: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  moreMembersText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageTime: {
    fontSize: 11,
  },
  readIcon: {
    marginLeft: 4,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    marginBottom: 32,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  messageInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    marginRight: 12,
    paddingHorizontal: 16,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingVertical: Platform.OS === 'ios' ? 12 : 12,
  },
  attachmentButton: {
    padding: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    maxHeight: '70%',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberRole: {
    fontSize: 13,
  },
  memberPhone: {
    fontSize: 13,
    marginLeft: 8,
  },
  noMembersText: {
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 40,
  },
  modalButton: {
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;