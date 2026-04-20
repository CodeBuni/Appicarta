import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Share,
  RefreshControl,
  FlatList,
  Dimensions,
  Platform,
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import Header from '../components/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const { width } = Dimensions.get('window');

// Interfaces
interface ArcoMember {
  _id: string;
  nome: string;
  avatarUrl?: string;
  role: string;
  email?: string;
  telefone?: string;
  isArcoAdmin?: boolean;
  isAdmin?: boolean;
}

interface UserArco {
  _id: string;
  nome: string;
  codigoConvite: string;
  adminId: any;
  members: any[];
  dataCriacao?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  token?: string;
}

const GerirArcoFamiliarScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { user, updateToken } = useAuth();
  const navigation = useNavigation<any>();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [arco, setArco] = useState<UserArco | null>(null);
  const [members, setMembers] = useState<ArcoMember[]>([]);
  
  // Modals
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newArcoName, setNewArcoName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  
  const [regenerateCodeModalVisible, setRegenerateCodeModalVisible] = useState(false);
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<ArcoMember | null>(null);
  const [memberActionsModalVisible, setMemberActionsModalVisible] = useState(false);
  
  const [confirmLeaveModalVisible, setConfirmLeaveModalVisible] = useState(false);

  // Carregar dados do arco
  const loadArcoData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando dados do arco...');
      
      // 1. Carregar arco do usuário
      const response = await api.get('/api/arco/my-arco');
      
      if (response.data.success && response.data.data) {
        const arcoData = response.data.data;
        console.log('✅ Arco carregado:', arcoData.nome);
        
        setArco(arcoData);
        
        // 2. Carregar detalhes dos membros
        try {
          const membersResponse = await api.get('/api/arco/members-details');
          
          if (membersResponse.data.success && Array.isArray(membersResponse.data.data)) {
            const detailedMembers = membersResponse.data.data.map((member: any) => ({
              _id: member._id,
              nome: member.nome || 'Membro',
              avatarUrl: member.avatarUrl || '',
              role: member.role || 'user',
              email: member.email || '',
              telefone: member.telefone || '',
              isArcoAdmin: member.isArcoAdmin || false,
              isAdmin: member.isAdmin || false
            }));
            
            console.log(`📊 ${detailedMembers.length} membros carregados`);
            setMembers(detailedMembers);
          } else {
            // Fallback: processar membros do arco
            const processedMembers = processMembersFromArco(arcoData);
            setMembers(processedMembers);
          }
        } catch (membersError) {
          console.log('⚠️  Erro nos detalhes dos membros, usando fallback');
          const processedMembers = processMembersFromArco(arcoData);
          setMembers(processedMembers);
        }
      } else {
        console.log('⚠️  Usuário não tem arco:', response.data.message);
        setArco(null);
        setMembers([]);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados do arco:', error.message);
      
      let errorMessage = 'Não foi possível carregar os dados do arco';
      
      if (error.response?.status === 401) {
        errorMessage = 'Sessão expirada';
      } else if (error.response?.status === 404) {
        errorMessage = 'Arco não encontrado';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Helper para processar membros do arco
  const processMembersFromArco = (arcoData: UserArco): ArcoMember[] => {
    if (!arcoData.members || !Array.isArray(arcoData.members)) {
      return [];
    }

    const userId = user?._id || user?.id;
    
    return arcoData.members
      .map((member: any) => {
        // Se member é um objeto populado
        if (typeof member === 'object' && member !== null && member._id) {
          const isAdmin = member._id.toString() === arcoData.adminId?._id?.toString() || 
                         member._id.toString() === arcoData.adminId?.toString();
          
          return {
            _id: member._id.toString(),
            nome: member.nome || 'Membro',
            avatarUrl: member.avatarUrl || '',
            role: member.role || (isAdmin ? 'admin' : 'user'),
            email: member.email || '',
            telefone: member.telefone || '',
            isArcoAdmin: isAdmin,
            isAdmin: isAdmin
          };
        }
        
        // Se member é apenas um ID
        const memberId = typeof member === 'string' ? member : member?.toString();
        const isAdmin = memberId === arcoData.adminId?._id?.toString() || 
                       memberId === arcoData.adminId?.toString();
        
        return {
          _id: memberId || 'unknown',
          nome: 'Membro',
          avatarUrl: '',
          role: isAdmin ? 'admin' : 'user',
          email: '',
          telefone: '',
          isArcoAdmin: isAdmin,
          isAdmin: isAdmin
        };
      })
      .filter((member: ArcoMember) => member._id !== (userId?.toString()));
  };

  // Atualizar quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadArcoData();
      return () => {};
    }, [loadArcoData])
  );

  // Atualizar dados
  const onRefresh = () => {
    setRefreshing(true);
    loadArcoData();
  };

  // Renomear arco
  const handleRenameArco = async () => {
    if (!newArcoName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um novo nome para o arco');
      return;
    }

    try {
      setRenameLoading(true);
      const response = await api.put('/api/arco/rename', {
        nome: newArcoName.trim()
      });

      if (response.data.success) {
        Alert.alert('Sucesso', 'Nome do arco atualizado com sucesso!');
        setArco(prev => prev ? { ...prev, nome: newArcoName.trim() } : null);
        setRenameModalVisible(false);
        setNewArcoName('');
      }
    } catch (error: any) {
      console.error('Erro ao renomear arco:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível renomear o arco');
    } finally {
      setRenameLoading(false);
    }
  };

  // Regenerar código
  const handleRegenerateCode = async () => {
    try {
      setRegenerateLoading(true);
      const response = await api.post('/api/arco/regenerate-code');

      if (response.data.success && response.data.data) {
        Alert.alert('Sucesso', 'Código de convite regenerado com sucesso!');
        setArco(prev => prev ? { 
          ...prev, 
          codigoConvite: response.data.data.codigoConvite 
        } : null);
        setRegenerateCodeModalVisible(false);
      }
    } catch (error: any) {
      console.error('Erro ao regenerar código:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível regenerar o código');
    } finally {
      setRegenerateLoading(false);
    }
  };

  // Tornar membro administrador
  const handleMakeAdmin = async (memberId: string) => {
    Alert.alert(
      'Transferir Administração',
      'Tem certeza que deseja transferir a administração para este membro? Você perderá os privilégios de administrador.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Transferir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.put(`/api/arco/make-admin/${memberId}`);
              
              if (response.data.success) {
                Alert.alert('Sucesso', 'Administração transferida com sucesso!');
                
                // Se há token novo, atualizar
                if (response.data.data?.oldAdminToken) {
                  await updateToken(response.data.data.oldAdminToken);
                }
                
                // Recarregar dados
                loadArcoData();
                setMemberActionsModalVisible(false);
              }
            } catch (error: any) {
              console.error('Erro ao transferir administração:', error);
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível transferir a administração');
            }
          }
        }
      ]
    );
  };

  // Remover membro
  const handleRemoveMember = async (memberId: string) => {
    Alert.alert(
      'Remover Membro',
      'Tem certeza que deseja remover este membro do arco?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/api/arco/remove-member/${memberId}`);
              
              if (response.data.success) {
                Alert.alert('Sucesso', 'Membro removido com sucesso!');
                loadArcoData();
                setMemberActionsModalVisible(false);
              }
            } catch (error: any) {
              console.error('Erro ao remover membro:', error);
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível remover o membro');
            }
          }
        }
      ]
    );
  };

  // Sair do arco
  const handleLeaveArco = async () => {
    try {
      const response = await api.delete('/api/arco/leave');
      
      if (response.data.success) {
        Alert.alert('Sucesso', 'Saiu do arco com sucesso!');
        
        // Atualizar token se necessário
        if (response.data.token) {
          await updateToken(response.data.token);
        }
        
        // Voltar para tela anterior
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Erro ao sair do arco:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível sair do arco');
    }
  };

  // Compartilhar código
  const handleShareArco = async () => {
    if (!arco || !user) return;

    const message = `🎉 Junta-te ao meu Arco Familiar!\n\n` +
      `🏠 Arco: ${arco.nome}\n` +
      `🔐 Código: ${arco.codigoConvite}\n` +
      `👤 Convite de: ${user.nome || user.email}\n\n` +
      `Para te juntares:\n` +
      `1. Abre o AppiCarta\n` +
      `2. Vai para "Arco Familiar"\n` +
      `3. Clica em "Juntar-se"\n` +
      `4. Insere o código: ${arco.codigoConvite}`;

    try {
      await Share.share({
        message,
        title: `Convite para ${arco.nome}`
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // Copiar código
  const copyToClipboard = () => {
    if (!arco) return;
    
    // Em React Native, use Clipboard ou expo-clipboard
    Alert.alert('Copiado!', `Código ${arco.codigoConvite} copiado`);
  };

  // Renderizar membro
  const renderMember = ({ item }: { item: ArcoMember }) => (
    <TouchableOpacity 
      style={[styles.memberCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => {
        setSelectedMember(item);
        setMemberActionsModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.memberHeader}>
        <View style={styles.memberAvatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.memberAvatar} />
          ) : (
            <View style={[
              styles.memberAvatarPlaceholder,
              { backgroundColor: item.isAdmin ? theme.colors.primary : theme.colors.secondary }
            ]}>
              <Text style={styles.memberAvatarText}>
                {item.nome.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {item.isAdmin && (
            <View style={styles.adminBadge}>
              <Icon name="crown" size={12} color="#FFD700" />
            </View>
          )}
        </View>
        
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={[styles.memberName, { color: theme.colors.text.primary }]}>
              {item.nome}
            </Text>
            {item.isAdmin && (
              <View style={[styles.roleBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Text style={[styles.roleBadgeText, { color: theme.colors.primary }]}>
                  Admin
                </Text>
              </View>
            )}
          </View>
          
          {item.email && (
            <Text style={[styles.memberEmail, { color: theme.colors.text.secondary }]}>
              {item.email}
            </Text>
          )}
          
          {item.telefone && (
            <Text style={[styles.memberPhone, { color: theme.colors.text.tertiary }]}>
              {item.telefone}
            </Text>
          )}
        </View>
        
        <Icon name="chevron-right" size={20} color={theme.colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );

  // Modal de renomear
  const renderRenameModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={renameModalVisible}
      onRequestClose={() => setRenameModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
            Renomear Arco
          </Text>
          
          <TextInput
            style={[styles.modalInput, { 
              color: theme.colors.text.primary,
              borderColor: theme.colors.borderLight,
              backgroundColor: theme.colors.surfaceVariant
            }]}
            placeholder="Novo nome do arco"
            placeholderTextColor={theme.colors.text.tertiary}
            value={newArcoName}
            onChangeText={setNewArcoName}
            autoFocus
            maxLength={50}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {
                setRenameModalVisible(false);
                setNewArcoName('');
              }}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.text.secondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, { 
                backgroundColor: theme.colors.primary,
                opacity: newArcoName.trim() ? 1 : 0.5
              }]}
              onPress={handleRenameArco}
              disabled={!newArcoName.trim() || renameLoading}
            >
              {renameLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Salvar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Modal de regenerar código
  const renderRegenerateCodeModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={regenerateCodeModalVisible}
      onRequestClose={() => setRegenerateCodeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
            Regenerar Código
          </Text>
          
          <Text style={[styles.modalText, { color: theme.colors.text.secondary, textAlign: 'center' }]}>
            O código atual será invalidado. Novos membros precisarão do novo código para se juntar.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => setRegenerateCodeModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.text.secondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#EF4444' }]}
              onPress={handleRegenerateCode}
              disabled={regenerateLoading}
            >
              {regenerateLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Regenerar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Modal de ações do membro
  const renderMemberActionsModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={memberActionsModalVisible}
      onRequestClose={() => setMemberActionsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.memberModalContent, { backgroundColor: theme.colors.surface }]}>
          {selectedMember && (
            <>
              <View style={styles.memberModalHeader}>
                <View style={styles.memberModalAvatar}>
                  {selectedMember.avatarUrl ? (
                    <Image source={{ uri: selectedMember.avatarUrl }} style={styles.memberModalAvatarImage} />
                  ) : (
                    <View style={[
                      styles.memberModalAvatarPlaceholder,
                      { backgroundColor: selectedMember.isAdmin ? theme.colors.primary : theme.colors.secondary }
                    ]}>
                      <Text style={styles.memberModalAvatarText}>
                        {selectedMember.nome.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.memberModalName, { color: theme.colors.text.primary }]}>
                  {selectedMember.nome}
                </Text>
                <View style={[
                  styles.memberModalRoleBadge,
                  { backgroundColor: selectedMember.isAdmin ? `${theme.colors.primary}20` : `${theme.colors.secondary}20` }
                ]}>
                  <Text style={[
                    styles.memberModalRoleText,
                    { color: selectedMember.isAdmin ? theme.colors.primary : theme.colors.secondary }
                  ]}>
                    {selectedMember.isAdmin ? 'Administrador' : 'Membro'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.memberActionsList}>
                {selectedMember._id !== (user?._id || user?.id) && !selectedMember.isAdmin && (
                  <TouchableOpacity 
                    style={[styles.memberActionButton]}
                    onPress={() => {
                      setMemberActionsModalVisible(false);
                      setTimeout(() => handleMakeAdmin(selectedMember._id), 300);
                    }}
                  >
                    <Icon name="crown" size={22} color={theme.colors.primary} />
                    <Text style={[styles.memberActionText, { color: theme.colors.text.primary }]}>
                      Tornar Administrador
                    </Text>
                  </TouchableOpacity>
                )}
                
                {selectedMember._id !== (user?._id || user?.id) && (
                  <TouchableOpacity 
                    style={[styles.memberActionButton]}
                    onPress={() => {
                      setMemberActionsModalVisible(false);
                      setTimeout(() => handleRemoveMember(selectedMember._id), 300);
                    }}
                  >
                    <Icon name="account-remove" size={22} color="#EF4444" />
                    <Text style={[styles.memberActionText, { color: '#EF4444' }]}>
                      Remover do Arco
                    </Text>
                  </TouchableOpacity>
                )}
                
                {selectedMember._id === (user?._id || user?.id) && (
                  <TouchableOpacity 
                    style={[styles.memberActionButton]}
                    onPress={() => {
                      setMemberActionsModalVisible(false);
                      setConfirmLeaveModalVisible(true);
                    }}
                  >
                    <Icon name="exit-to-app" size={22} color="#EF4444" />
                    <Text style={[styles.memberActionText, { color: '#EF4444' }]}>
                      Sair do Arco
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.cancelActionButton, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setMemberActionsModalVisible(false)}
              >
                <Text style={[styles.cancelActionText, { color: theme.colors.text.secondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // Modal de confirmação para sair
  const renderConfirmLeaveModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={confirmLeaveModalVisible}
      onRequestClose={() => setConfirmLeaveModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
            Sair do Arco
          </Text>
          
          <Text style={[styles.modalText, { color: theme.colors.text.secondary, textAlign: 'center' }]}>
            {arco?.members?.length === 1
              ? 'Você é o único membro. Ao sair, o arco será desativado permanentemente.'
              : 'Como administrador, você não pode sair do arco. Transfira a administração primeiro.'}
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => setConfirmLeaveModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.text.secondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            {arco?.members?.length === 1 && (
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#EF4444' }]}
                onPress={handleLeaveArco}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Sair e Desativar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  // Loading
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        <Header 
          title="Gerir Arco Familiar"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Carregando...
          </Text>
        </View>
      </View>
    );
  }

  // Sem arco
  if (!arco) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        <Header 
          title="Gerir Arco Familiar"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Icon name="account-group-off" size={60} color={theme.colors.text.tertiary} />
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            Você não pertence a nenhum arco
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.colors.text.secondary }]}>
            Crie ou junte-se a um arco familiar para gerenciar membros
          </Text>
          <TouchableOpacity 
            style={[styles.errorButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Tela principal
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      
      <Header 
        title="Gerir Arco Familiar"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Informações do Arco */}
        <View style={[styles.arcoInfoSection, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.arcoIconLarge, { backgroundColor: theme.colors.primary }]}>
            <Icon name="account-group" size={40} color="#FFFFFF" />
          </View>
          
          <Text style={[styles.arcoName, { color: theme.colors.text.primary }]}>
            {arco.nome}
          </Text>
          
          <View style={styles.codeContainer}>
            <Text style={[styles.codeLabel, { color: theme.colors.text.secondary }]}>
              Código de Convite:
            </Text>
            <Text style={[styles.codeValue, { color: theme.colors.text.primary }]}>
              {arco.codigoConvite}
            </Text>
          </View>
          
          <View style={styles.arcoStats}>
            <View style={styles.statItem}>
              <Icon name="account-multiple" size={20} color={theme.colors.text.secondary} />
              <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                {members.length + 1} membro(s)
              </Text>
            </View>
            {arco.dataCriacao && (
              <View style={styles.statItem}>
                <Icon name="calendar" size={20} color={theme.colors.text.secondary} />
                <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
                  {new Date(arco.dataCriacao).toLocaleDateString('pt-PT')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Ações Rápidas
          </Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => setRenameModalVisible(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Icon name="pencil" size={22} color={theme.colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.colors.text.primary }]}>
                Renomear
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => setRegenerateCodeModalVisible(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${theme.colors.warning}15` }]}>
                <Icon name="refresh" size={22} color={theme.colors.warning} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.colors.text.primary }]}>
                Novo Código
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
              onPress={handleShareArco}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Icon name="share-variant" size={22} color={theme.colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.colors.text.primary }]}>
                Compartilhar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
              onPress={copyToClipboard}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${theme.colors.secondary}15` }]}>
                <Icon name="content-copy" size={22} color={theme.colors.secondary} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.colors.text.primary }]}>
                Copiar Código
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de Membros */}
        <View style={styles.membersSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Membros do Arco
            </Text>
            <View style={[styles.membersCountBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.membersCount, { color: theme.colors.text.secondary }]}>
                {members.length + 1}
              </Text>
            </View>
          </View>
          
          {/* Você (Administrador) */}
          <View style={[styles.adminCard, { backgroundColor: `${theme.colors.primary}10` }]}>
            <View style={styles.adminCardHeader}>
              <View style={styles.adminAvatarContainer}>
                <View style={[styles.adminAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Icon name="crown" size={18} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.adminInfo}>
                <Text style={[styles.adminName, { color: theme.colors.text.primary }]}>
                  {user?.nome || user?.email || 'Você'}
                </Text>
                <View style={[styles.adminBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <Text style={[styles.adminBadgeText, { color: theme.colors.primary }]}>
                    Administrador
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Outros Membros */}
          {members.length > 0 ? (
            <FlatList
              data={members}
              renderItem={renderMember}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.membersList}
            />
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Icon name="account-group-outline" size={48} color={theme.colors.text.tertiary} />
              <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
                Apenas você no arco
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.text.tertiary }]}>
                Compartilhe o código para adicionar membros
              </Text>
            </View>
          )}
        </View>

        {/* Informação de Administrador */}
        <View style={[styles.adminInfoBox, { backgroundColor: `${theme.colors.primary}08`, borderColor: `${theme.colors.primary}20` }]}>
          <Icon name="shield-account" size={20} color={theme.colors.primary} />
          <Text style={[styles.adminInfoText, { color: theme.colors.text.primary }]}>
            Como administrador, você pode gerenciar membros, regenerar códigos e renomear o arco.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      {renderRenameModal()}
      {renderRegenerateCodeModal()}
      {renderMemberActionsModal()}
      {renderConfirmLeaveModal()}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Informações do Arco
  arcoInfoSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  arcoIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  arcoName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  arcoStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
  },
  
  // Ações Rápidas
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 40) / 2 - 6,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F1F1',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Lista de Membros
  membersSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membersCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membersCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  adminCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatarContainer: {
    marginRight: 12,
  },
  adminAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  adminBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F1F1',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminCrown: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 13,
  },
  
  // Empty State
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F1F1',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Informação do Admin
  adminInfoBox: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  adminInfoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  
  bottomSpacer: {
    height: 100,
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Member Modal
  memberModalContent: {
    width: '85%',
  },
  memberModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  memberModalAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberModalAvatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  memberModalAvatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberModalAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  memberModalName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  memberModalRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  memberModalRoleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  memberActionsList: {
    marginBottom: 16,
  },
  memberActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  memberActionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
    flex: 1,
  },
  cancelActionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GerirArcoFamiliarScreen;