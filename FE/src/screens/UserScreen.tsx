// src/screens/UserScreen.tsx - VERSÃO CORRIGIDA E FUNCIONAL
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  Switch,
  Platform,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../styles/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import BottomNavigationBar from '../components/BottomNavigationBar';
import api from '../config/api';

type RootStackParamList = {
  AboutAppicartaScreen: undefined;
  Home: undefined;
  MailAndPackages: undefined;
  Messages: undefined;
  Notifications: undefined;
};

interface UserData {
  nome: string;
  email: string;
  telefone?: string;
  avatarUrl?: string;
}

const UserScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, logout, updateUser } = useAuth();
  
  // Estados
  const [userData, setUserData] = useState<UserData>({
    nome: user?.nome || 'Utilizador',
    email: user?.email || 'email@exemplo.com',
    telefone: user?.telefone || '',
    avatarUrl: user?.avatarUrl || '',
  });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Para forçar re-render
  
  const userStats = [
    { id: '1', label: 'Cartas', value: '85', icon: 'email', color: '#1c3cb4' },
    { id: '2', label: 'Encomendas', value: '3', icon: 'package-variant', color: '#4CAF50' },
  ];

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setUserData({
        nome: user.nome || 'Utilizador',
        email: user.email || 'email@exemplo.com',
        telefone: user.telefone || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  // LOGOUT
  const handleLogout = () => {
    Alert.alert(
      'Terminar sessão',
      'Tem a certeza que deseja terminar sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar sessão',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível terminar sessão');
            }
          },
        },
      ]
    );
  };

  // ESCOLHER FOTO DA GALERIA
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'Precisa permitir o acesso à galeria para escolher uma foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        await uploadAvatar(selectedImage.uri);
      }
    } catch (error) {
      console.error('Erro ao escolher imagem:', error);
      Alert.alert('Erro', 'Não foi possível escolher a imagem');
    }
  };

// UPLOAD DA FOTO - VERSÃO CORRIGIDA PARA REACT NATIVE
const uploadAvatar = async (imageUri: string) => {
  if (isUploadingAvatar) return;
  
  setIsUploadingAvatar(true);
  
  try {
    // 1. Preparar FormData corretamente para React Native
    const formData = new FormData();
    
    // Extrair nome do arquivo da URI
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    
    // Detectar tipo MIME baseado na extensão
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    let mimeType = 'image/jpeg'; // padrão
    
    if (extension === 'png') {
      mimeType = 'image/png';
    } else if (extension === 'gif') {
      mimeType = 'image/gif';
    } else if (extension === 'webp') {
      mimeType = 'image/webp';
    }
    
    console.log('📤 Preparando upload:');
    console.log('   URI:', imageUri);
    console.log('   Nome:', filename);
    console.log('   Tipo:', mimeType);
    console.log('   Extensão:', extension);
    
    // 2. Adicionar arquivo ao FormData - CORREÇÃO PARA REACT NATIVE
    // Usar any para evitar erros do TypeScript
    const imageObject: any = {
      uri: imageUri,
      name: filename,
      type: mimeType,
    };
    
    formData.append('avatar', imageObject);
    
    // 3. Verificar se temos token no contexto de autenticação
    // Ajuste conforme sua implementação do AuthContext
    let token = '';
    if (user && (user as any).token) {
      token = (user as any).token;
    } else if (api.defaults.headers.common['Authorization']) {
      // Se o token está configurado no axios
      const authHeader = api.defaults.headers.common['Authorization'] as string;
      token = authHeader.replace('Bearer ', '');
    }
    
    // 4. Configurar headers para o upload
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 5. Fazer upload
    console.log('🔄 Enviando para API...');
    const response = await api.post('/api/users/upload-avatar', formData, {
      headers: headers,
      timeout: 60000, // 60 segundos timeout
    });
    
    console.log('📥 Resposta da API:', response.data);
    
    if (response.data.success) {
      // 6. Atualizar contexto e estado
      const updatedAvatarUrl = response.data.avatarUrl || response.data.user?.avatarUrl;
      
      console.log('✅ Avatar URL recebida:', updatedAvatarUrl);
      
      if (updatedAvatarUrl && user && updateUser) {
        // Adicionar timestamp para evitar cache
        const avatarUrlWithTimestamp = `${updatedAvatarUrl}?t=${Date.now()}`;
        
        updateUser({
          ...user,
          avatarUrl: avatarUrlWithTimestamp,
        });
        
        setUserData(prev => ({
          ...prev,
          avatarUrl: avatarUrlWithTimestamp,
        }));
        
        // Forçar re-render da imagem
        setAvatarKey(Date.now());
        
        Alert.alert('✅ Sucesso', 'Foto atualizada com sucesso!');
      }
    } else {
      throw new Error(response.data.message || 'Erro no servidor');
    }
  } catch (error: any) {
    console.error('❌ Erro detalhado no upload:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });
    
    let errorMessage = 'Não foi possível atualizar a foto';
    
    if (error.response?.status === 413) {
      errorMessage = 'Arquivo muito grande. Máximo: 5MB';
    } else if (error.response?.status === 415) {
      errorMessage = 'Tipo de arquivo não suportado. Use JPEG, PNG ou GIF';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data.message || 'Arquivo inválido';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Tempo esgotado. Tente novamente';
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Erro de conexão. Verifique sua internet';
    }
    
    Alert.alert('❌ Erro', errorMessage);
  } finally {
    setIsUploadingAvatar(false);
  }
};

  // SALVAR ALTERAÇÕES DO PERFIL
  const handleSaveChanges = async () => {
    if (!userData.nome.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    if (!userData.email.trim()) {
      Alert.alert('Erro', 'O email é obrigatório');
      return;
    }

    setIsEditing(true);
    
    try {
      console.log('📤 Enviando dados para atualização:', userData);
      const response = await api.put('/api/users/profile', {
        nome: userData.nome,
        email: userData.email,
        telefone: userData.telefone || '',
      });

      console.log('📥 Resposta da API:', response.data);

      if (response.data.success) {
        // CORREÇÃO: Acessar a estrutura correta
        const data = response.data.data || response.data;
        const updatedUser = data.user || data;
        
        console.log('👤 Usuário atualizado:', updatedUser);

        // Atualizar no contexto
        if (user && updateUser) {
          updateUser({
            ...user,
            nome: updatedUser.nome || userData.nome,
            email: updatedUser.email || userData.email,
            telefone: updatedUser.telefone || userData.telefone,
            avatarUrl: updatedUser.avatarUrl || userData.avatarUrl,
          });
        }
        
        // Atualizar estado local
        setUserData({
          nome: updatedUser.nome || userData.nome,
          email: updatedUser.email || userData.email,
          telefone: updatedUser.telefone || userData.telefone,
          avatarUrl: updatedUser.avatarUrl || userData.avatarUrl,
        });
        
        // Fechar modal
        setShowEditModal(false);
        
        Alert.alert('✅ Sucesso', 'Perfil atualizado com sucesso!');
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar perfil');
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = 'Não foi possível atualizar o perfil';
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Dados inválidos';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erro de conexão com o servidor';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('❌ Erro', errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  // ALTERAR SENHA
  const handleChangePassword = () => {
    Alert.prompt(
      'Alterar Palavra-passe',
      'Digite a sua password atual:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: async (currentPassword?: string) => {
            if (!currentPassword) {
              Alert.alert('Erro', 'Digite a password atual');
              return;
            }

            Alert.prompt(
              'Nova Palavra-passe',
              'Digite a nova password:',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Confirmar',
                  onPress: async (newPassword?: string) => {
                    if (!newPassword || newPassword.length < 6) {
                      Alert.alert('Erro', 'A nova password deve ter pelo menos 6 caracteres');
                      return;
                    }

                    Alert.prompt(
                      'Confirmar',
                      'Digite novamente a nova password:',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Alterar',
                          onPress: async (confirmPassword?: string) => {
                            if (newPassword !== confirmPassword) {
                              Alert.alert('Erro', 'As passwords não coincidem');
                              return;
                            }

                            try {
                              const response = await api.put('/api/auth/change-password', {
                                currentPassword,
                                newPassword
                              });

                              if (response.data.success) {
                                Alert.alert('✅ Sucesso', 'Password alterada com sucesso!');
                              }
                            } catch (error: any) {
                              Alert.alert('Erro', error.response?.data?.message || 'Erro ao alterar password');
                            }
                          }
                        }
                      ]
                    );
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  // CONFIGURAÇÕES
  const settingsOptions = [
    { 
      id: '1', 
      label: 'Modo escuro', 
      icon: 'theme-light-dark', 
      color: '#1c3cb4',
      type: 'toggle' as const,
      value: isDarkMode,
      onPress: toggleTheme
    },
    { 
      id: '2', 
      label: 'Notificações', 
      icon: 'bell', 
      color: '#4CAF50',
      type: 'toggle' as const,
      value: notificationsEnabled,
      onPress: () => setNotificationsEnabled(!notificationsEnabled)
    },
    { 
      id: '3', 
      label: 'Sobre a AppiCarta', 
      icon: 'information', 
      color: '#666',
      type: 'navigate' as const,
      onPress: () => navigation.navigate('AboutAppicartaScreen')
    },
  ];

  // RENDERIZAÇÃO DOS COMPONENTES
  const renderStatCard = (stat: any) => (
    <View key={stat.id} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
        <Icon name={stat.icon} size={20} color={stat.color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stat.value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{stat.label}</Text>
    </View>
  );

  const renderSettingItem = (item: any) => {
    if (item.type === 'toggle') {
      return (
        <View key={item.id} style={[styles.optionCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: `${item.color}15` }]}>
              <Icon name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={[styles.optionLabel, { color: theme.colors.text.primary }]}>{item.label}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: '#CCCCCC', true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.optionCard, { backgroundColor: theme.colors.surface }]}
        activeOpacity={0.7}
        onPress={item.onPress}
      >
        <View style={styles.optionLeft}>
          <View style={[styles.optionIcon, { backgroundColor: `${item.color}15` }]}>
            <Icon name={item.icon} size={20} color={item.color} />
          </View>
          <Text style={[styles.optionLabel, { color: theme.colors.text.primary }]}>{item.label}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={theme.colors.text.tertiary} />
      </TouchableOpacity>
    );
  };

  // MODAL DE EDIÇÃO
  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEditModal(false)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface }]}>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.modalCloseButton}>
                <Icon name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Editar Perfil</Text>
              <TouchableOpacity onPress={handleSaveChanges} style={styles.modalSaveButton} disabled={isEditing}>
                {isEditing ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={[styles.modalSaveText, { color: theme.colors.primary }]}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Seção da Foto - VERSÃO CORRIGIDA */}
              <View style={[styles.photoSection, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.avatarContainer}>
                  {isUploadingAvatar ? (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                  ) : userData.avatarUrl ? (
                    <View key={`avatar-${avatarKey}`}>
                      <Image 
                        source={{ 
                          uri: userData.avatarUrl.includes('?') 
                            ? userData.avatarUrl 
                            : `${userData.avatarUrl}?t=${avatarKey}`,
                          cache: 'reload'
                        }} 
                        style={styles.avatarImage}
                        onError={(e) => {
                          console.error('❌ Erro ao carregar imagem:', e.nativeEvent.error);
                          setUserData(prev => ({ ...prev, avatarUrl: '' }));
                        }}
                        onLoad={() => console.log('✅ Imagem carregada com sucesso')}
                      />
                    </View>
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.avatarText}>
                        {userData.nome.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={[styles.changePhotoButton, { 
                      backgroundColor: theme.colors.primary,
                      opacity: isUploadingAvatar ? 0.5 : 1 
                    }]}
                    onPress={handlePickImage}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Icon name="camera" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={[styles.changePhotoText, { color: theme.colors.text.secondary }]}>
                  {isUploadingAvatar ? 'A enviar foto...' : 'Toque para alterar foto'}
                </Text>
              </View>

              {/* Formulário */}
              <View style={styles.formSection}>
                <Text style={[styles.formSectionTitle, { color: theme.colors.text.primary }]}>
                  Informações Pessoais
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Nome Completo</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="account" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.text.primary }]}
                      value={userData.nome}
                      onChangeText={(text) => setUserData({...userData, nome: text})}
                      placeholder="Digite seu nome"
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Email</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="email" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.text.primary }]}
                      value={userData.email}
                      onChangeText={(text) => setUserData({...userData, email: text})}
                      placeholder="seu@email.com"
                      placeholderTextColor={theme.colors.text.tertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Telefone</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="phone" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.text.primary }]}
                      value={userData.telefone}
                      onChangeText={(text) => setUserData({...userData, telefone: text})}
                      placeholder="+351 912 345 678"
                      placeholderTextColor={theme.colors.text.tertiary}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.passwordButton, { backgroundColor: theme.colors.surface }]}
                  onPress={handleChangePassword}
                >
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                      <Icon name="lock" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.optionLabel, { color: theme.colors.text.primary }]}>
                      Alterar palavra-passe
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Perfil</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editButton}>
          <Icon name="pencil" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Seção do utilizador */}
        <View style={[styles.userSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.avatarContainer}>
            {userData.avatarUrl ? (
              <View key={`main-avatar-${avatarKey}`}>
                <Image 
                  source={{ 
                    uri: userData.avatarUrl.includes('?') 
                      ? userData.avatarUrl 
                      : `${userData.avatarUrl}?t=${avatarKey}`,
                    cache: 'reload'
                  }} 
                  style={styles.avatarImage}
                  onError={(e) => {
                    console.error('❌ Erro ao carregar imagem principal:', e.nativeEvent.error);
                    setUserData(prev => ({ ...prev, avatarUrl: '' }));
                  }}
                />
              </View>
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>
                  {userData.nome.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>{userData.nome}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.text.secondary }]}>{userData.email}</Text>
          <Text style={[styles.userPhone, { color: theme.colors.text.secondary }]}>{userData.telefone || 'Sem telefone'}</Text>
          <Text style={[styles.joinDate, { color: theme.colors.text.tertiary }]}>Membro desde Jan 2024</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Visão Geral</Text>
          <View style={styles.statsGrid}>{userStats.map(renderStatCard)}</View>
        </View>

        {/* Configurações */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Configurações</Text>
          {settingsOptions.map(renderSettingItem)}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.surface }]}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <View style={styles.optionLeft}>
            <View style={[styles.optionIcon, { backgroundColor: 'rgba(248, 66, 52, 0.1)' }]}>
              <Icon name="logout" size={20} color="#f84234" />
            </View>
            <Text style={[styles.optionLabel, { color: '#f84234' }]}>Terminar sessão</Text>
          </View>
          <Icon name="chevron-right" size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        {/* Footer */}
        <View style={[styles.infoFooter, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
            AppiCarta v1.0.0 • A tua caixa de correio inteligente
          </Text>
        </View>
      </ScrollView>

      {/* Modal de Edição */}
      {renderEditModal()}

      {/* Bottom Navigation */}
      <BottomNavigationBar 
        activeTab="profile" 
        onTabPress={(tabId: string) => {
          if (tabId === 'home') navigation.navigate('Home');
          if (tabId === 'correspondencias') navigation.navigate('MailAndPackages');
          if (tabId === 'messages') navigation.navigate('Messages');
          if (tabId === 'notifications') navigation.navigate('Notifications');
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  editButton: { padding: 8 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  userSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  joinDate: { fontSize: 12 },
  statsSection: { marginHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 13, textAlign: 'center', fontWeight: '500' },
  settingsSection: { marginHorizontal: 16, marginTop: 24 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: { fontSize: 16, fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  infoFooter: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoText: { fontSize: 12, textAlign: 'center', lineHeight: 16 },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalCloseButton: { padding: 8 },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  modalSaveButton: { padding: 8, minWidth: 60, alignItems: 'flex-end' },
  modalSaveText: { fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1 },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 8,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    fontSize: 13,
    marginTop: 12,
    fontWeight: '500',
  },
  formSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 8,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 15,
    marginBottom: 10,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '500',
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
});

export default UserScreen;