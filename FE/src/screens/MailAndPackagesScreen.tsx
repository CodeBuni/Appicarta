// src/screens/MailAndPackagesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import BottomNavigationBar from '../components/BottomNavigationBar';
import api from '../config/api';
import { showCartaNotification } from '../services/simpleNotification';
import { useRef } from 'react';

const { width } = Dimensions.get('window');

// Tipos para os dados
interface Correspondencia {
  _id: string;
  tipo: 'carta' | 'encomenda';
  status: 'pendente' | 'retirada';
  detectadoEm: string;
  retiradoPor?: {
    _id: string;
    nome: string;
    avatarUrl?: string;
  };
  retiradoEm?: string;
  dispositivoId?: {
    _id: string;
    nome: string;
  };
  // Campos para OCR e imagem
  imagemUrl?: string;
  textoOcr?: string;
  informacoes?: {
    remetente?: string;
    destinatario?: string;
    codigoPostal?: string;
    data?: string;
    tipoDocumento?: string;
  };
}

interface EncomendaRastreada {
  _id: string;
  trackingNumber: string | null;
  transportadora: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_transito' | 'entregue' | 'problema';
  dataEstimadaEntrega?: string;
  dataEntregaReal?: string;
  createdAt: string;
  updatedAt: string;
  trackingData?: {
    status?: string;
    lastEvent?: string;
    estimatedDelivery?: string;
  };
  notificarAoEntregar?: boolean;
}

type FilterType = 'all' | 'carta' | 'encomenda' | 'pendente';
type TabType = 'correspondencias' | 'encomendas';

const MailAndPackagesScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('correspondencias');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [correspondencias, setCorrespondencias] = useState<Correspondencia[]>([]);
  const [encomendas, setEncomendas] = useState<EncomendaRastreada[]>([]);
  
  // Estados para modais de adição
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    transportadora: '',
    titulo: '',
    descricao: '',
  });
  const [manualFormData, setManualFormData] = useState({
    titulo: '',
    descricao: '',
    transportadora: 'manual',
  });
  const [showTransportadoras, setShowTransportadoras] = useState(false);
  
  // Estados para edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [encomendaEditando, setEncomendaEditando] = useState<EncomendaRastreada | null>(null);
  const [editFormData, setEditFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'pendente' as 'pendente' | 'em_transito' | 'entregue' | 'problema',
    notificarAoEntregar: true,
  });
  
  const [updatingTracking, setUpdatingTracking] = useState<string | null>(null);
  
  // Estados para o modal de detalhes da carta
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);
  const [cartaSelecionada, setCartaSelecionada] = useState<Correspondencia | null>(null);

  const styles = createStyles(theme);

  const transportadoras = [
    { codigo: 'ctt', nome: 'CTT - Correios de Portugal', logo: 'truck' },
    { codigo: 'dhl', nome: 'DHL Express', logo: 'truck-fast' },
    { codigo: 'ups', nome: 'UPS', logo: 'package' },
    { codigo: 'fedex', nome: 'FedEx', logo: 'airplane' },
    { codigo: 'dpd', nome: 'DPD', logo: 'truck-delivery' },
    { codigo: 'chronopost', nome: 'Chronopost', logo: 'clock-fast' },
    { codigo: 'seur', nome: 'SEUR', logo: 'map-marker' },
    { codigo: 'correos', nome: 'Correos', logo: 'email' },
    { codigo: 'outra', nome: 'Outra Transportadora', logo: 'package-variant' },
  ];
// Dentro do componente, depois das declarações de estado
const ultimaCartaNotificadaRef = useRef<string | null>(null);

// Função para verificar e notificar cartas novas (APENAS UMA VEZ)
const verificarCartasNovas = useCallback(async () => {
  try {
    const response = await api.get('/api/correspondencias');
    const cartas = response.data.data || [];
    const cartasPendentes = cartas.filter((c: Correspondencia) => c.status === 'pendente');
    
    if (cartasPendentes.length > 0) {
      const ultimaCarta = cartasPendentes[0];
      
      // Só notifica se for uma carta diferente da última notificada
      if (ultimaCartaNotificadaRef.current !== ultimaCarta._id) {
        ultimaCartaNotificadaRef.current = ultimaCarta._id;
        
        // Mostrar notificação push
        await showCartaNotification();
      }
    }
  } catch (error) {
    console.error('Erro ao verificar cartas:', error);
  }
}, []);

// Verificar ao carregar a tela (apenas uma vez)
useEffect(() => {
  verificarCartasNovas();
}, []);

// Quando a tela ganha foco, só recarrega os dados, NÃO notifica novamente
useFocusEffect(
  useCallback(() => {
    carregarDados();
  }, [])
);

  // =========== FUNÇÕES PRINCIPAIS ===========

  const buscarCorrespondencias = async () => {
    try {
      console.log('📬 Buscando correspondências...');
      const response = await api.get('/api/correspondencias');
      
      console.log('📦 RESPOSTA COMPLETA:', JSON.stringify(response.data, null, 2));
      console.log('📦 response.data.success:', response.data?.success);
      console.log('📦 response.data.data:', response.data?.data);
      console.log('📦 response.data.data.length:', response.data?.data?.length);
      
      if (response.data && response.data.success) {
        const correspondenciasData = response.data.data;
        console.log('📊 correspondenciasData:', correspondenciasData);
        
        if (correspondenciasData && correspondenciasData.length > 0) {
          console.log('✅ Primeira carta:', correspondenciasData[0]);
        }
        
        setCorrespondencias(correspondenciasData || []);
        console.log(`✅ ${correspondenciasData?.length || 0} correspondências carregadas`);
      } else {
        console.log('⚠️ response.data.success é false ou não existe');
      }
    } catch (error: any) {
      console.error('❌ Erro detalhado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        Alert.alert('Sessão expirada', 'Faça login novamente');
        navigation.navigate('Login');
      } else {
        Alert.alert('Erro', 'Não foi possível carregar as correspondências');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const buscarEncomendas = async () => {
    try {
      console.log('📦 Buscando encomendas rastreadas...');
      const response = await api.get('/api/encomendas/minhas');
      
      if (response.data && response.data.success) {
        const encomendasData = response.data.data;
        console.log(`✅ ${encomendasData.length} encomendas rastreadas carregadas`);
        
        setEncomendas(encomendasData || []);
      } else {
        console.log('⚠️  Resposta sem sucesso:', response.data);
        setEncomendas([]);
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar encomendas:', error);
      setEncomendas([]);
      
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      } 
    }
  };

  const carregarDados = async () => {
    setLoading(true);
    await Promise.all([
      buscarCorrespondencias(), 
      buscarEncomendas()
    ]);
    setLoading(false);
  };

  // =========== FUNÇÕES DE ENCOMENDAS ===========

  const adicionarEncomendaComTracking = async () => {
    if (!formData.trackingNumber.trim()) {
      Alert.alert('Erro', 'Por favor, insira o número de tracking');
      return;
    }

    if (!formData.transportadora) {
      Alert.alert('Erro', 'Por favor, selecione a transportadora');
      return;
    }

    try {
      const response = await api.post('/api/encomendas/nova', {
        trackingNumber: formData.trackingNumber,
        transportadora: formData.transportadora,
        titulo: formData.titulo || `Encomenda ${formData.trackingNumber.slice(-8)}`,
        descricao: formData.descricao,
      });

      if (response.data.success) {
        Alert.alert('Sucesso', 'Encomenda adicionada com sucesso!');
        setFormData({
          trackingNumber: '',
          transportadora: '',
          titulo: '',
          descricao: '',
        });
        setShowAddModal(false);
        buscarEncomendas();
      } else {
        Alert.alert('Erro', response.data.message || 'Erro ao adicionar encomenda');
      }
    } catch (error: any) {
      console.error('❌ Erro ao adicionar encomenda com tracking:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível adicionar a encomenda');
    }
  };

  const adicionarEncomendaManual = async () => {
    console.log('📝 Adicionando encomenda manual:', manualFormData);
    
    if (!manualFormData.titulo.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para a encomenda');
      return;
    }

    try {
      const response = await api.post('/api/encomendas/nova-manual', {
        titulo: manualFormData.titulo,
        descricao: manualFormData.descricao,
        transportadora: manualFormData.transportadora,
      });

      console.log('📝 Resposta da API:', response.data);

      if (response.data.success) {
        Alert.alert('Sucesso', 'Encomenda manual adicionada com sucesso!');
        setManualFormData({
          titulo: '',
          descricao: '',
          transportadora: 'manual',
        });
        setShowManualModal(false);
        buscarEncomendas();
      } else {
        Alert.alert('Erro', response.data.message || 'Erro ao adicionar encomenda');
      }
    } catch (error: any) {
      console.error('❌ Erro ao adicionar encomenda manual:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível adicionar a encomenda');
    }
  };

  const atualizarStatusEncomenda = async (encomendaId: string) => {
    try {
      setUpdatingTracking(encomendaId);
      console.log('🔄 Atualizando status da encomenda:', encomendaId);
      
      const response = await api.get(`/api/encomendas/atualizar/${encomendaId}`);
      
      if (response.data.success) {
        Alert.alert('Sucesso', 'Status da encomenda atualizado!');
        buscarEncomendas();
      } else {
        Alert.alert('Erro', response.data.message || 'Erro ao atualizar status');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar o status');
    } finally {
      setUpdatingTracking(null);
    }
  };

  // =========== FUNÇÕES DE EDIÇÃO ===========

  const carregarEncomendaParaEdicao = async (encomendaId: string) => {
    try {
      console.log('🔍 Carregando encomenda para edição:', encomendaId);
      
      const response = await api.get(`/api/encomendas/${encomendaId}`);
      
      if (response.data && response.data.success) {
        const encomenda = response.data.data;
        setEncomendaEditando(encomenda);
        
        setEditFormData({
          titulo: encomenda.titulo || '',
          descricao: encomenda.descricao || '',
          status: encomenda.status,
          notificarAoEntregar: encomenda.notificarAoEntregar !== false,
        });
        
        setShowEditModal(true);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os dados da encomenda');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar encomenda:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar a encomenda');
    }
  };

  const salvarEdicaoEncomenda = async () => {
    if (!encomendaEditando) return;

    if (!editFormData.titulo.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para a encomenda');
      return;
    }

    try {
      console.log('💾 Salvando edição da encomenda:', encomendaEditando._id);
      
      const response = await api.put(`/api/encomendas/${encomendaEditando._id}`, editFormData);
      
      if (response.data && response.data.success) {
        Alert.alert('Sucesso', 'Encomenda atualizada com sucesso!');
        setShowEditModal(false);
        setEncomendaEditando(null);
        buscarEncomendas();
      } else {
        Alert.alert('Erro', response.data.message || 'Erro ao atualizar encomenda');
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar encomenda:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar a encomenda');
    }
  };

  const deletarEncomenda = async (encomendaId: string, titulo: string) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir "${titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/api/encomendas/${encomendaId}`);
              
              if (response.data && response.data.success) {
                Alert.alert('Sucesso', 'Encomenda excluída com sucesso!');
                buscarEncomendas();
              } else {
                Alert.alert('Erro', response.data.message || 'Erro ao excluir encomenda');
              }
            } catch (error: any) {
              console.error('❌ Erro ao excluir encomenda:', error);
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir a encomenda');
            }
          }
        }
      ]
    );
  };

  // =========== FUNÇÕES AUXILIARES ===========

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      const agora = new Date();
      const diffMs = agora.getTime() - data.getTime();
      const diffMinutos = Math.floor(diffMs / 60000);
      const diffHoras = Math.floor(diffMinutos / 60);
      const diffDias = Math.floor(diffHoras / 24);
      
      if (diffMinutos < 1) return 'agora';
      if (diffMinutos < 60) return `há ${diffMinutos} min`;
      if (diffHoras < 24) return `há ${diffHoras} h`;
      if (diffDias === 1) return 'ontem';
      if (diffDias < 7) return `há ${diffDias} dias`;
      
      return data.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: diffDias > 365 ? 'numeric' : undefined
      });
    } catch (error) {
      return dataString;
    }
  };

  const formatarDataDisplay = (dataString?: string) => {
    if (!dataString) return 'Data desconhecida';
    
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dataString;
    }
  };

  const formatarDataCompleta = (dataString?: string) => {
    if (!dataString) return 'Data desconhecida';
    
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dataString;
    }
  };

  const traduzirStatus = (status: string) => {
    const statusMap: Record<string, { texto: string; cor: string }> = {
      'pendente': { texto: 'Pendente', cor: theme.colors.primary },
      'em_transito': { texto: 'Em Trânsito', cor: theme.colors.primary },
      'entregue': { texto: 'Entregue', cor: theme.colors.primary },
      'problema': { texto: 'Problema', cor: theme.colors.error },
      'retirada': { texto: 'Recolhida', cor: theme.colors.primary },
    };
    
    return statusMap[status] || { texto: status, cor: theme.colors.text.secondary };
  };

  const traduzirTipoDocumento = (tipo?: string) => {
    const tipos: Record<string, string> = {
      'fatura': 'Fatura',
      'publicidade': 'Publicidade',
      'carta_registada': 'Carta Registada',
      'carta_simples': 'Carta Simples',
      'desconhecido': 'Documento'
    };
    return tipo ? tipos[tipo] || tipo : 'Documento';
  };

  // =========== FUNÇÕES DO MODAL DE DETALHES ===========

  const abrirDetalhesCarta = (carta: Correspondencia) => {
    setCartaSelecionada(carta);
    setModalDetalhesVisivel(true);
  };

  const fecharDetalhesCarta = () => {
    setModalDetalhesVisivel(false);
    setCartaSelecionada(null);
  };

  // =========== USE EFFECTS ===========

  useEffect(() => {
    carregarDados();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFilterPress = (filterId: FilterType) => {
    setActiveFilter(filterId);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  // Filtragem das correspondências
  const filteredCorrespondencias = correspondencias.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'carta') return item.tipo === 'carta';
    if (activeFilter === 'encomenda') return item.tipo === 'encomenda';
    if (activeFilter === 'pendente') return item.status === 'pendente';
    return true;
  });

  // Separar correspondências por status
  const correspondenciasPendentes = filteredCorrespondencias.filter(item => item.status === 'pendente');
  const correspondenciasRetiradas = filteredCorrespondencias.filter(item => item.status === 'retirada');

  // Determinar item recente mais importante
  const getRecentItem = () => {
    if (correspondenciasPendentes.length > 0) {
      const ultimaPendente = correspondenciasPendentes[0];
      return {
        id: ultimaPendente._id,
        tipo: ultimaPendente.tipo,
        icon: ultimaPendente.tipo === 'carta' ? 'email-multiple' : 'package-variant-closed',
        title: ultimaPendente.tipo === 'carta' ? 'Carta por recolher' : 'Encomenda por recolher',
        subtitle: `Detetada ${formatarData(ultimaPendente.detectadoEm)}`,
        status: 'pendente',
        statusColor: 'primary' as const,
        details: ultimaPendente.tipo === 'carta' ? 'Carta na caixa de correio' : 'Encomenda no dispositivo'
      };
    } else if (correspondenciasRetiradas.length > 0) {
      const ultimaRetirada = correspondenciasRetiradas[0];
      return {
        id: ultimaRetirada._id,
        tipo: ultimaRetirada.tipo,
        icon: ultimaRetirada.tipo === 'carta' ? 'email-check' : 'package-variant',
        title: ultimaRetirada.tipo === 'carta' ? 'Última carta recolhida' : 'Última encomenda recolhida',
        subtitle: `Recolhida ${formatarData(ultimaRetirada.retiradoEm || '')}`,
        status: 'recolhida',
        statusColor: 'primary' as const,
        details: ultimaRetirada.retiradoPor?.nome 
          ? `Recolhida por ${ultimaRetirada.retiradoPor.nome}` 
          : 'Recolhida recentemente'
      };
    }
    
    return null;
  };

  const recentItem = getRecentItem();

  // Filtros disponíveis para correspondências
  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'Tudo', icon: 'view-grid' },
    { id: 'carta', label: 'Cartas', icon: 'email-outline' },
    { id: 'encomenda', label: 'Encomendas', icon: 'package-variant' },
    { id: 'pendente', label: 'Pendentes', icon: 'clock-outline' },
  ];

  // =========== RENDER FUNCTIONS ===========

  const renderAddOptionsModal = () => (
    <Modal
      visible={showAddOptions}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddOptions(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Encomenda</Text>
            <TouchableOpacity onPress={() => setShowAddOptions(false)}>
              <Icon name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.optionCard}
              onPress={() => {
                setShowAddOptions(false);
                setFormData({ trackingNumber: '', transportadora: '', titulo: '', descricao: '' });
                setTimeout(() => setShowAddModal(true), 300);
              }}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Icon name="barcode-scan" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Com Número de Tracking</Text>
                <Text style={styles.optionSubtitle}>Adicione uma encomenda com número de rastreamento para acompanhar o seu estado</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionCard}
              onPress={() => {
                setShowAddOptions(false);
                setManualFormData({ titulo: '', descricao: '', transportadora: 'manual' });
                setTimeout(() => setShowManualModal(true), 300);
              }}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Icon name="package-variant" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Manual (sem tracking)</Text>
                <Text style={styles.optionSubtitle}>Apenas para informar a família que vai receber uma encomenda</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowAddOptions(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderManualModal = () => (
    <Modal
      visible={showManualModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowManualModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Encomenda Manual</Text>
            <TouchableOpacity onPress={() => setShowManualModal(false)}>
              <Icon name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título da Encomenda *</Text>
              <TextInput
                style={styles.input}
                value={manualFormData.titulo}
                onChangeText={(text) => setManualFormData({...manualFormData, titulo: text})}
                placeholder="Ex: Livros da Amazon"
                placeholderTextColor={theme.colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={manualFormData.descricao}
                onChangeText={(text) => setManualFormData({...manualFormData, descricao: text})}
                placeholder="Detalhes sobre a encomenda..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowManualModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={adicionarEncomendaManual}
              >
                <Icon name="plus" size={18} color="#FFF" />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Encomenda</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Icon name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de Tracking *</Text>
              <TextInput
                style={styles.input}
                value={formData.trackingNumber}
                onChangeText={(text) => setFormData({...formData, trackingNumber: text})}
                placeholder="Ex: LX123456789PT"
                placeholderTextColor={theme.colors.text.tertiary}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transportadora *</Text>
              <TouchableOpacity 
                style={styles.transportadoraSelect}
                onPress={() => setShowTransportadoras(true)}
              >
                {formData.transportadora ? (
                  <View style={styles.transportadoraSelected}>
                    <Icon 
                      name={transportadoras.find(t => t.codigo === formData.transportadora)?.logo || 'package-variant'} 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.transportadoraSelectText}>
                      {transportadoras.find(t => t.codigo === formData.transportadora)?.nome}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.transportadoraSelectText, { color: theme.colors.text.tertiary }]}>
                    Selecionar transportadora
                  </Text>
                )}
                <Icon name="chevron-down" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título (Opcional)</Text>
              <TextInput
                style={styles.input}
                value={formData.titulo}
                onChangeText={(text) => setFormData({...formData, titulo: text})}
                placeholder="Ex: Telemóvel novo"
                placeholderTextColor={theme.colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descricao}
                onChangeText={(text) => setFormData({...formData, descricao: text})}
                placeholder="Detalhes sobre a encomenda..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={adicionarEncomendaComTracking}
              >
                <Icon name="plus" size={18} color="#FFF" />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowEditModal(false);
        setEncomendaEditando(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {encomendaEditando?.trackingNumber 
                ? 'Editar Encomenda'
                : 'Editar Encomenda Manual'
              }
            </Text>
            <TouchableOpacity onPress={() => {
              setShowEditModal(false);
              setEncomendaEditando(null);
            }}>
              <Icon name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título da Encomenda *</Text>
              <TextInput
                style={styles.input}
                value={editFormData.titulo}
                onChangeText={(text) => setEditFormData({...editFormData, titulo: text})}
                placeholder="Ex: Livros da Amazon"
                placeholderTextColor={theme.colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editFormData.descricao}
                onChangeText={(text) => setEditFormData({...editFormData, descricao: text})}
                placeholder="Detalhes sobre a encomenda..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusOptions}>
                {encomendaEditando?.trackingNumber ? (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        editFormData.status === 'pendente' && styles.statusOptionSelected
                      ]}
                      onPress={() => setEditFormData({...editFormData, status: 'pendente'})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        editFormData.status === 'pendente' && styles.statusOptionTextSelected
                      ]}>
                        Pendente
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        editFormData.status === 'em_transito' && styles.statusOptionSelected
                      ]}
                      onPress={() => setEditFormData({...editFormData, status: 'em_transito'})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        editFormData.status === 'em_transito' && styles.statusOptionTextSelected
                      ]}>
                        Em Trânsito
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        editFormData.status === 'entregue' && styles.statusOptionSelected
                      ]}
                      onPress={() => setEditFormData({...editFormData, status: 'entregue'})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        editFormData.status === 'entregue' && styles.statusOptionTextSelected
                      ]}>
                        Entregue
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        editFormData.status === 'problema' && styles.statusOptionSelected
                      ]}
                      onPress={() => setEditFormData({...editFormData, status: 'problema'})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        editFormData.status === 'problema' && styles.statusOptionTextSelected
                      ]}>
                        Problema
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        editFormData.status === 'pendente' && styles.statusOptionSelected
                      ]}
                      onPress={() => setEditFormData({...editFormData, status: 'pendente'})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        editFormData.status === 'pendente' && styles.statusOptionTextSelected
                      ]}>
                        Pendente
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        editFormData.status === 'entregue' && styles.statusOptionSelected
                      ]}
                      onPress={() => setEditFormData({...editFormData, status: 'entregue'})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        editFormData.status === 'entregue' && styles.statusOptionTextSelected
                      ]}>
                        Entregue
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusOption,
                        editFormData.status === 'problema' && styles.statusOptionSelected
                      ]}
                      onPress={() => setEditFormData({...editFormData, status: 'problema'})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        editFormData.status === 'problema' && styles.statusOptionTextSelected
                      ]}>
                        Problema
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {encomendaEditando?.trackingNumber && (
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setEditFormData({
                    ...editFormData,
                    notificarAoEntregar: !editFormData.notificarAoEntregar
                  })}
                >
                  <View style={[
                    styles.checkbox,
                    editFormData.notificarAoEntregar && styles.checkboxChecked
                  ]}>
                    {editFormData.notificarAoEntregar && (
                      <Icon name="check" size={16} color="#FFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Notificar quando for entregue
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setEncomendaEditando(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={salvarEdicaoEncomenda}
              >
                <Icon name="content-save" size={18} color="#FFF" />
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderTransportadorasModal = () => (
    <Modal
      visible={showTransportadoras}
      transparent={true}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.transportadorasOverlay}
        activeOpacity={1}
        onPress={() => setShowTransportadoras(false)}
      >
        <View style={styles.transportadorasModal}>
          <Text style={styles.transportadorasTitle}>Selecionar Transportadora</Text>
          {transportadoras.map((transp) => (
            <TouchableOpacity
              key={transp.codigo}
              style={[
                styles.transportadoraOption,
                formData.transportadora === transp.codigo && styles.transportadoraOptionSelected
              ]}
              onPress={() => {
                setFormData({...formData, transportadora: transp.codigo});
                setShowTransportadoras(false);
              }}
            >
              <View style={styles.transportadoraOptionContent}>
                <Icon 
                  name={transp.logo} 
                  size={20} 
                  color={formData.transportadora === transp.codigo ? theme.colors.primary : theme.colors.text.primary}
                />
                <Text style={[
                  styles.transportadoraOptionText,
                  formData.transportadora === transp.codigo && styles.transportadoraOptionTextSelected
                ]}>
                  {transp.nome}
                </Text>
              </View>
              {formData.transportadora === transp.codigo && (
                <Icon name="check" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // =========== NOVO MODAL DE DETALHES DA CARTA ===========
  const renderDetalhesCartaModal = () => {
    if (!cartaSelecionada) return null;

    const isPendente = cartaSelecionada.status === 'pendente';
    const corStatus = isPendente ? theme.colors.error : theme.colors.primary;
    const textoStatus = isPendente ? 'Pendente' : 'Recolhida';
    const iconeStatus = isPendente ? 'clock-outline' : 'check-circle';

    const temImagem = !!cartaSelecionada.imagemUrl;
    const temOcr = !!cartaSelecionada.textoOcr;
    const temInfoOCR = cartaSelecionada.informacoes && Object.values(cartaSelecionada.informacoes).some(v => v);

    return (
      <Modal
        visible={modalDetalhesVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={fecharDetalhesCarta}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Correspondência</Text>
              <TouchableOpacity onPress={fecharDetalhesCarta}>
                <Icon name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Status e Tipo */}
              <View style={styles.detalhesStatusContainer}>
                <View style={[styles.detalhesStatusBadge, { backgroundColor: `${corStatus}15` }]}>
                  <Icon name={iconeStatus} size={16} color={corStatus} />
                  <Text style={[styles.detalhesStatusText, { color: corStatus }]}>{textoStatus}</Text>
                </View>
                <View style={[styles.detalhesTipoBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <Icon 
                    name={cartaSelecionada.tipo === 'carta' ? 'email-outline' : 'package-variant'} 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                  <Text style={[styles.detalhesTipoText, { color: theme.colors.primary }]}>
                    {cartaSelecionada.tipo === 'carta' ? 'Carta' : 'Encomenda'}
                  </Text>
                </View>
              </View>

              {/* Imagem (se disponível) */}
              {temImagem && (
                <View style={styles.detalhesImagemContainer}>
                  <Image 
                    source={{ uri: cartaSelecionada.imagemUrl }} 
                    style={styles.detalhesImagem}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Informações Principais */}
              <View style={styles.detalhesInfoContainer}>
                <View style={styles.detalhesInfoItem}>
                  <Icon name="calendar" size={18} color={theme.colors.text.secondary} />
                  <Text style={styles.detalhesInfoLabel}>Detetado em:</Text>
                  <Text style={styles.detalhesInfoValue}>
                    {formatarDataCompleta(cartaSelecionada.detectadoEm)}
                  </Text>
                </View>

                {cartaSelecionada.retiradoEm && (
                  <View style={styles.detalhesInfoItem}>
                    <Icon name="check-circle" size={18} color={theme.colors.primary} />
                    <Text style={styles.detalhesInfoLabel}>Recolhido em:</Text>
                    <Text style={styles.detalhesInfoValue}>
                      {formatarDataCompleta(cartaSelecionada.retiradoEm)}
                    </Text>
                  </View>
                )}

                {cartaSelecionada.retiradoPor && (
                  <View style={styles.detalhesInfoItem}>
                    <Icon name="account" size={18} color={theme.colors.text.secondary} />
                    <Text style={styles.detalhesInfoLabel}>Recolhido por:</Text>
                    <Text style={styles.detalhesInfoValue}>
                      {cartaSelecionada.retiradoPor.nome}
                    </Text>
                  </View>
                )}

                {cartaSelecionada.dispositivoId && (
                  <View style={styles.detalhesInfoItem}>
                    <Icon name="chip" size={18} color={theme.colors.text.secondary} />
                    <Text style={styles.detalhesInfoLabel}>Dispositivo:</Text>
                    <Text style={styles.detalhesInfoValue}>
                      {cartaSelecionada.dispositivoId.nome}
                    </Text>
                  </View>
                )}
              </View>

              {/* INFORMAÇÕES DO OCR (quando disponíveis) */}
              {(temOcr || temInfoOCR) && (
                <View style={styles.detalhesOcrContainer}>
                  <View style={styles.detalhesOcrHeader}>
                    <Icon name="text-recognition" size={22} color={theme.colors.primary} />
                    <Text style={styles.detalhesOcrTitle}>Informações Extraídas</Text>
                  </View>

                  {cartaSelecionada.informacoes?.tipoDocumento && (
                    <View style={styles.detalhesOcrItem}>
                      <Text style={styles.detalhesOcrLabel}>Tipo:</Text>
                      <Text style={styles.detalhesOcrValue}>
                        {traduzirTipoDocumento(cartaSelecionada.informacoes.tipoDocumento)}
                      </Text>
                    </View>
                  )}

                  {cartaSelecionada.informacoes?.remetente && (
                    <View style={styles.detalhesOcrItem}>
                      <Text style={styles.detalhesOcrLabel}>Remetente:</Text>
                      <Text style={styles.detalhesOcrValue}>{cartaSelecionada.informacoes.remetente}</Text>
                    </View>
                  )}

                  {cartaSelecionada.informacoes?.destinatario && (
                    <View style={styles.detalhesOcrItem}>
                      <Text style={styles.detalhesOcrLabel}>Destinatário:</Text>
                      <Text style={styles.detalhesOcrValue}>{cartaSelecionada.informacoes.destinatario}</Text>
                    </View>
                  )}

                  {cartaSelecionada.informacoes?.codigoPostal && (
                    <View style={styles.detalhesOcrItem}>
                      <Text style={styles.detalhesOcrLabel}>Código Postal:</Text>
                      <Text style={styles.detalhesOcrValue}>{cartaSelecionada.informacoes.codigoPostal}</Text>
                    </View>
                  )}

                  {cartaSelecionada.informacoes?.data && (
                    <View style={styles.detalhesOcrItem}>
                      <Text style={styles.detalhesOcrLabel}>Data:</Text>
                      <Text style={styles.detalhesOcrValue}>
                        {new Date(cartaSelecionada.informacoes.data).toLocaleDateString('pt-PT')}
                      </Text>
                    </View>
                  )}

                  {temOcr && (
                    <>
                      <View style={styles.detalhesOcrDivider} />
                      <Text style={styles.detalhesOcrTextoLabel}>Texto completo:</Text>
                      <Text style={styles.detalhesOcrTexto}>{cartaSelecionada.textoOcr}</Text>
                    </>
                  )}
                </View>
              )}

              {/* Mensagem quando não há OCR */}
              {!temOcr && !temInfoOCR && (
                <View style={styles.detalhesSemOcrContainer}>
                  <Icon name="image-off" size={40} color={theme.colors.text.tertiary} />
                  <Text style={styles.detalhesSemOcrTitle}>Sem informações disponíveis</Text>
                  <Text style={styles.detalhesSemOcrText}>
                    Esta correspondência ainda não foi processada pelo sistema OCR.
                    Quando a câmara capturar uma imagem, as informações aparecerão aqui.
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton, styles.detalhesFecharButton]}
              onPress={fecharDetalhesCarta}
            >
              <Text style={styles.cancelButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderEncomendaCard = (encomenda: EncomendaRastreada) => {
    const statusInfo = traduzirStatus(encomenda.status);
    const isManual = !encomenda.trackingNumber;
    const transportadoraInfo = transportadoras.find(t => t.codigo === encomenda.transportadora);
    
    return (
      <View key={encomenda._id} style={styles.encomendaCard}>
        <View style={styles.encomendaHeader}>
          <View style={styles.encomendaInfo}>
            <View style={styles.transportadoraLogoContainer}>
              <Icon 
                name={isManual ? 'package-variant' : (transportadoraInfo?.logo || 'package-variant')} 
                size={24} 
                color={theme.colors.primary} 
              />
            </View>
            <View style={styles.encomendaTextContainer}>
              <Text style={styles.encomendaTitle}>
                {encomenda.titulo || (isManual ? 'Encomenda Manual' : `Encomenda ${encomenda.trackingNumber?.slice(-8)}`)}
              </Text>
              <Text style={styles.encomendaTracking}>
                {isManual 
                  ? 'Encomenda manual (sem tracking)'
                  : `${encomenda.trackingNumber} • ${transportadoraInfo?.nome || encomenda.transportadora}`
                }
              </Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.cor}15` }]}>
            <Text style={[styles.statusBadgeText, { color: statusInfo.cor }]}>
              {statusInfo.texto}
            </Text>
          </View>
        </View>
        
        <View style={styles.encomendaDetails}>
          {encomenda.descricao ? (
            <Text style={styles.encomendaDescription}>{encomenda.descricao}</Text>
          ) : null}
          
          <View style={styles.encomendaDates}>
            <View style={styles.dateInfo}>
              <Icon name="calendar" size={14} color={theme.colors.text.secondary} />
              <Text style={styles.dateText}>
                Criada: {formatarDataDisplay(encomenda.createdAt)}
              </Text>
            </View>
            
            {encomenda.dataEstimadaEntrega && !isManual && (
              <View style={styles.dateInfo}>
                <Icon name="clock-outline" size={14} color={theme.colors.text.secondary} />
                <Text style={styles.dateText}>
                  Estimada: {formatarDataDisplay(encomenda.dataEstimadaEntrega)}
                </Text>
              </View>
            )}
            
            {encomenda.dataEntregaReal && (
              <View style={styles.dateInfo}>
                <Icon name="check-circle" size={14} color={theme.colors.primary} />
                <Text style={[styles.dateText, { color: theme.colors.primary }]}>
                  Entregue: {formatarDataDisplay(encomenda.dataEntregaReal)}
                </Text>
              </View>
            )}
            
            {isManual && (
              <View style={[styles.dateInfo, { marginTop: 4 }]}>
                <Icon name="information" size={14} color={theme.colors.text.secondary} />
                <Text style={styles.dateText}>
                  Encomenda informada manualmente
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => carregarEncomendaParaEdicao(encomenda._id)}
          >
            <Icon name="pencil" size={16} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              Editar
            </Text>
          </TouchableOpacity>
          
          {!isManual && encomenda.trackingNumber && (
            <TouchableOpacity
              style={[styles.actionButton, styles.updateButton]}
              onPress={() => atualizarStatusEncomenda(encomenda._id)}
              disabled={updatingTracking === encomenda._id}
            >
              {updatingTracking === encomenda._id ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Icon name="refresh" size={16} color="#FFF" />
                  <Text style={[styles.actionButtonText, { color: '#FFF' }]}>
                    Atualizar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deletarEncomenda(encomenda._id, encomenda.titulo || 'Encomenda')}
          >
            <Icon name="trash-can-outline" size={16} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
              Excluir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========== RENDER PRINCIPAL ===========

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.colors.surface} 
        />
        
        <Header 
          title="Correspondências"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotifications={false}
          showAvatar={false}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>A carregar dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.surface} 
      />
      
      <Header 
        title="Correspondências"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotifications={false}
        showAvatar={false}
      />

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'correspondencias' && styles.activeTab]}
          onPress={() => setActiveTab('correspondencias')}
        >
          <Text style={[styles.tabText, activeTab === 'correspondencias' && styles.activeTabText]}>
            Correspondências
          </Text>
          {activeTab === 'correspondencias' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'encomendas' && styles.activeTab]}
          onPress={() => setActiveTab('encomendas')}
        >
          <Text style={[styles.tabText, activeTab === 'encomendas' && styles.activeTabText]}>
            Encomendas Rastreadas
          </Text>
          {activeTab === 'encomendas' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {activeTab === 'correspondencias' ? (
          <>
            {recentItem && (
              <View style={[
                styles.highlightCard, 
                { 
                  borderLeftColor: theme.colors[recentItem.statusColor],
                  backgroundColor: theme.colors.surface
                }
              ]}>
                <View style={styles.highlightHeader}>
                  <View style={[
                    styles.highlightIconContainer, 
                    { backgroundColor: `${theme.colors[recentItem.statusColor]}15` }
                  ]}>
                    <Icon name={recentItem.icon} size={40} color={theme.colors[recentItem.statusColor]} />
                  </View>
                  <View style={styles.highlightTextContainer}>
                    <Text style={styles.highlightTitle}>{recentItem.title}</Text>
                    <Text style={styles.highlightSubtitle}>{recentItem.subtitle}</Text>
                  </View>
                </View>
                
                <Text style={styles.highlightDetails}>{recentItem.details}</Text>
                
                <View style={styles.highlightActions}>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: `${theme.colors[recentItem.statusColor]}10` }
                  ]}>
                    <Text style={[styles.statusBadgeText, { color: theme.colors[recentItem.statusColor] }]}>
                      {recentItem.status === 'pendente' ? 'Por recolher' : 'Recolhida'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.filtersContainer}>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersList}
              >
                {filters.map(filter => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterChip,
                      activeFilter === filter.id && styles.filterChipActive,
                      activeFilter === filter.id && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => handleFilterPress(filter.id)}
                  >
                    <Icon 
                      name={filter.icon} 
                      size={16} 
                      color={activeFilter === filter.id ? theme.colors.white : theme.colors.text.secondary}
                      style={styles.filterIcon}
                    />
                    <Text style={[
                      styles.filterChipText,
                      activeFilter === filter.id && { color: theme.colors.white }
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{correspondencias.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {correspondenciasPendentes.length}
                </Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {correspondenciasRetiradas.length}
                </Text>
                <Text style={styles.statLabel}>Recolhidas</Text>
              </View>
            </View>

            {correspondenciasPendentes.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Por recolher</Text>
                  <Text style={styles.sectionCount}>{correspondenciasPendentes.length}</Text>
                </View>
                
                <View style={styles.correspondenciasList}>
                  {correspondenciasPendentes.map((item) => {
                    const isCarta = item.tipo === 'carta';
                    const iconColor = theme.colors.primary;
                    
                    return (
                      <TouchableOpacity
                        key={item._id}
                        style={[
                          styles.correspondenciaCard,
                          styles.pendingCard
                        ]}
                        onPress={() => abrirDetalhesCarta(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.correspondenciaHeader}>
                          <View style={styles.correspondenciaInfo}>
                            <Icon 
                              name={isCarta ? 'email-outline' : 'package-variant'} 
                              size={24} 
                              color={iconColor} 
                            />
                            <View style={styles.correspondenciaTextContainer}>
                              <Text style={styles.correspondenciaType}>
                                {isCarta ? 'Carta' : 'Encomenda'}
                              </Text>
                              <Text style={styles.correspondenciaDate}>
                                Detetada {formatarData(item.detectadoEm)}
                              </Text>
                            </View>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.primary}10` }]}>
                            <Text style={[styles.statusBadgeText, { color: theme.colors.primary }]}>
                              Pendente
                            </Text>
                          </View>
                        </View>
                        
                        {item.imagemUrl && (
                          <View style={styles.correspondenciaThumbnail}>
                            <Icon name="image" size={16} color={theme.colors.text.secondary} />
                            <Text style={styles.correspondenciaThumbnailText}>Ver imagem disponível</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {correspondenciasRetiradas.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Histórico</Text>
                  <Text style={styles.sectionCount}>{correspondenciasRetiradas.length}</Text>
                </View>
                
                <View style={styles.correspondenciasList}>
                  {correspondenciasRetiradas.slice(0, 5).map((item) => {
                    const isCarta = item.tipo === 'carta';
                    const iconColor = theme.colors.primary;
                    
                    return (
                      <TouchableOpacity
                        key={item._id}
                        style={styles.correspondenciaCard}
                        onPress={() => abrirDetalhesCarta(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.correspondenciaHeader}>
                          <View style={styles.correspondenciaInfo}>
                            <Icon 
                              name={isCarta ? 'email-check' : 'package-variant'} 
                              size={24} 
                              color={iconColor} 
                            />
                            <View style={styles.correspondenciaTextContainer}>
                              <Text style={styles.correspondenciaType}>
                                {isCarta ? 'Carta' : 'Encomenda'}
                              </Text>
                              <Text style={styles.correspondenciaDate}>
                                {item.retiradoPor?.nome || 'Recolhida'} {formatarData(item.retiradoEm || '')}
                              </Text>
                            </View>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.primary}10` }]}>
                            <Text style={[styles.statusBadgeText, { color: theme.colors.primary }]}>
                              Recolhida
                            </Text>
                          </View>
                        </View>
                        
                        {item.imagemUrl && (
                          <View style={styles.correspondenciaThumbnail}>
                            <Icon name="image" size={16} color={theme.colors.text.secondary} />
                            <Text style={styles.correspondenciaThumbnailText}>Ver imagem disponível</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {filteredCorrespondencias.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Icon 
                  name="email-outline" 
                  size={80} 
                  color={theme.colors.text.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>
                  {activeFilter === 'all' 
                    ? 'Nenhuma correspondência'
                    : activeFilter === 'pendente'
                    ? 'Nada pendente'
                    : activeFilter === 'carta'
                    ? 'Nenhuma carta'
                    : 'Nenhuma encomenda'
                  }
                </Text>
                <Text style={styles.emptySubtitle}>
                  {activeFilter === 'all' 
                    ? 'Quando algo chegar, aparece aqui automaticamente'
                    : 'Não há itens correspondentes a este filtro'
                  }
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{encomendas.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {encomendas.filter(e => e.status === 'pendente').length}
                </Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {encomendas.filter(e => e.status === 'entregue').length}
                </Text>
                <Text style={styles.statLabel}>Entregues</Text>
              </View>
            </View>

            {encomendas.length > 0 ? (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Suas Encomendas</Text>
                  <Text style={styles.sectionCount}>{encomendas.length}</Text>
                </View>
                
                <View style={styles.encomendasList}>
                  {encomendas.map(renderEncomendaCard)}
                </View>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon 
                  name="package-variant" 
                  size={80} 
                  color={theme.colors.text.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>Nenhuma encomenda rastreada</Text>
                <Text style={styles.emptySubtitle}>
                  Adicione uma encomenda para rastrear o seu estado
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {activeTab === 'encomendas' && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddOptions(true)}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      {renderAddOptionsModal()}
      {renderManualModal()}
      {renderAddModal()}
      {renderEditModal()}
      {renderTransportadorasModal()}
      {renderDetalhesCartaModal()}
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: theme.colors.background,
  },
  tabText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semiBold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  // Botão Flutuante (FAB)
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  highlightCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  highlightIconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  highlightTextContainer: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  highlightSubtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  highlightDetails: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  highlightActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semiBold,
  },
  filtersContainer: {
    marginBottom: theme.spacing.lg,
  },
  filtersList: {
    paddingRight: theme.spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceVariant,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  filterChipActive: {
    borderColor: theme.colors.primary,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterChipText: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.borderLight,
  },
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  sectionCount: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  correspondenciasList: {
    gap: theme.spacing.md,
  },
  encomendasList: {
    gap: theme.spacing.md,
  },
  correspondenciaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  encomendaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  pendingCard: {
    borderColor: `${theme.colors.primary}20`,
    backgroundColor: theme.colors.surface,
  },
  correspondenciaContent: {
    flex: 1,
  },
  correspondenciaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  encomendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  correspondenciaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  encomendaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  transportadoraLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correspondenciaTextContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  encomendaTextContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  correspondenciaType: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  encomendaTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  encomendaTracking: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
  },
  correspondenciaDate: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
  },
  encomendaDescription: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  encomendaDetails: {
    marginBottom: theme.spacing.md,
  },
  encomendaDates: {
    gap: theme.spacing.xs,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: `${theme.colors.error}10`,
    borderColor: theme.colors.error,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semiBold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 28,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Estilos de modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  transportadoraSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  transportadoraSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transportadoraSelectText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  transportadorasOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  transportadorasModal: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    padding: 16,
  },
  transportadorasTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  transportadoraOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  transportadoraOptionSelected: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  transportadoraOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transportadoraOptionText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  transportadoraOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  // Estilos para edição
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statusOption: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
  },
  statusOptionSelected: {
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: theme.colors.primary,
  },
  statusOptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    margin: 20,
    marginTop: 0,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  // Estilos para o modal de detalhes da carta
  correspondenciaThumbnail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    padding: theme.spacing.xs,
    backgroundColor: `${theme.colors.primary}05`,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  correspondenciaThumbnailText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
  },
  detalhesStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  detalhesStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: 6,
  },
  detalhesStatusText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
  },
  detalhesTipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: 6,
  },
  detalhesTipoText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
  },
  detalhesImagemContainer: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  detalhesImagem: {
    width: '100%',
    height: 200,
  },
  detalhesInfoContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  detalhesInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detalhesInfoLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    width: 90,
  },
  detalhesInfoValue: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  detalhesOcrContainer: {
    backgroundColor: `${theme.colors.primary}05`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },
  detalhesOcrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  detalhesOcrTitle: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  detalhesOcrItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    paddingVertical: 2,
  },
  detalhesOcrLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    width: 100,
  },
  detalhesOcrValue: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
  },
  detalhesOcrDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  detalhesOcrTextoLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  detalhesOcrTexto: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  detalhesSemOcrContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.lg,
  },
  detalhesSemOcrTitle: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  detalhesSemOcrText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  detalhesFecharButton: {
    margin: 20,
    marginTop: 0,
  },
});

// Wrapper com navegação inferior
const MailAndPackagesScreenWithNav = (props: any) => {
  const navigation = useNavigation<any>();
  return (
    <>
      <MailAndPackagesScreen {...props} />
      <BottomNavigationBar 
        activeTab="correspondencias" 
        onTabPress={(tabId: string) => {
          if (tabId === 'home') navigation.navigate('Home');
          if (tabId === 'correspondencias') navigation.navigate('MailAndPackages');
          if (tabId === 'messages') navigation.navigate('Messages');
          if (tabId === 'notifications') navigation.navigate('Notifications');
        }} 
      />
    </>
  );
};

export default MailAndPackagesScreenWithNav;