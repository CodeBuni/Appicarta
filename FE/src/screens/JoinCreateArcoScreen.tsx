// src/screens/JoinCreateArcoScreen.tsx
import React, { useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JoinCreateArcoScreen = () => {
  const { theme } = useTheme();
  const { updateUserFromResponse } = useAuth();
  const navigation = useNavigation<any>();
  
  const [action, setAction] = useState<'join' | 'create'>('join');
  const [inviteCode, setInviteCode] = useState('');
  const [arcoName, setArcoName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinArco = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Erro', 'Por favor, insira o código de convite');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/arco/join', {
        codigoConvite: inviteCode.trim()
      });

      if (response.data.success) {
        await AsyncStorage.setItem('@Appicarta:token', response.data.token);
        
        if (updateUserFromResponse && response.data.user) {
          updateUserFromResponse(response.data.user);
        }
        
        Alert.alert('Sucesso', 'Juntou-se ao arco familiar com sucesso!');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Erro ao juntar-se ao arco:', error);
      Alert.alert(
        'Erro', 
        error.response?.data?.message || 'Não foi possível juntar-se ao arco'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArco = async () => {
    if (!arcoName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para o arco');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/arco/create', {
        nome: arcoName.trim()
      });

      if (response.data.success) {
        await AsyncStorage.setItem('@Appicarta:token', response.data.token);
        
        if (updateUserFromResponse && response.data.user) {
          updateUserFromResponse(response.data.user);
        }
        
        Alert.alert(
          'Sucesso', 
          `Arco "${arcoName}" criado com sucesso!\n\nCódigo de convite: ${response.data.data.codigoConvite}\n\nCompartilhe este código com os membros da sua família.`
        );
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Erro ao criar arco:', error);
      Alert.alert(
        'Erro', 
        error.response?.data?.message || 'Não foi possível criar o arco'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      <Header 
        title="Arco Familiar"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Icon name="account-group" size={80} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Arco Familiar
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Conecte sua família para conversar e colaborar
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                action === 'join' && [styles.tabButtonActive, { backgroundColor: theme.colors.primary }]
              ]}
              onPress={() => setAction('join')}
            >
              <Text style={[
                styles.tabButtonText, 
                { color: action === 'join' ? '#FFFFFF' : theme.colors.text.secondary }
              ]}>
                Juntar-se
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                action === 'create' && [styles.tabButtonActive, { backgroundColor: theme.colors.primary }]
              ]}
              onPress={() => setAction('create')}
            >
              <Text style={[
                styles.tabButtonText, 
                { color: action === 'create' ? '#FFFFFF' : theme.colors.text.secondary }
              ]}>
                Criar
              </Text>
            </TouchableOpacity>
          </View>

          {action === 'join' ? (
            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="key" size={24} color={theme.colors.text.tertiary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text.primary }]}
                  placeholder="Código de convite (ex: ABC123)"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>
              
              <Text style={[styles.helpText, { color: theme.colors.text.secondary }]}>
                Peça o código de convite ao administrador do arco familiar
              </Text>
              
              <TouchableOpacity 
                style={[styles.submitButton, { 
                  backgroundColor: inviteCode.trim() ? theme.colors.primary : theme.colors.surfaceVariant,
                  opacity: inviteCode.trim() ? 1 : 0.5
                }]}
                onPress={handleJoinArco}
                disabled={!inviteCode.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="login" size={20} color={inviteCode.trim() ? '#FFFFFF' : theme.colors.text.tertiary} />
                    <Text style={[styles.submitButtonText, { 
                      color: inviteCode.trim() ? '#FFFFFF' : theme.colors.text.tertiary 
                    }]}>
                      Juntar-se ao Arco
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="home" size={24} color={theme.colors.text.tertiary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text.primary }]}
                  placeholder="Nome do arco familiar"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={arcoName}
                  onChangeText={setArcoName}
                />
              </View>
              
              <Text style={[styles.helpText, { color: theme.colors.text.secondary }]}>
                Crie um nome para identificar seu grupo familiar
              </Text>
              
              <TouchableOpacity 
                style={[styles.submitButton, { 
                  backgroundColor: arcoName.trim() ? theme.colors.primary : theme.colors.surfaceVariant,
                  opacity: arcoName.trim() ? 1 : 0.5
                }]}
                onPress={handleCreateArco}
                disabled={!arcoName.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="plus" size={20} color={arcoName.trim() ? '#FFFFFF' : theme.colors.text.tertiary} />
                    <Text style={[styles.submitButtonText, { 
                      color: arcoName.trim() ? '#FFFFFF' : theme.colors.text.tertiary 
                    }]}>
                      Criar Novo Arco
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <View style={[styles.infoBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="information" size={20} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                  Como administrador, você poderá gerenciar membros, alterar configurações e muito mais.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  helpText: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default JoinCreateArcoScreen;