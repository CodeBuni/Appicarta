import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../styles/ThemeContext';
import Header from '../components/Header';
import BottomNavigationBar from '../components/BottomNavigationBar';
import { Shimmer, SkeletonCard, SkeletonStats, SkeletonAvatar } from '../components/Shimmer';
import { EmptyState, EmptyStatePresets } from '../components/EmptyState';
import { HapticButton, FAB } from '../components/HapticButton';
import { showToast } from '../components/Toast';
import api from '../config/api';

const { width } = Dimensions.get('window');

interface MembroFamilia {
  _id: string;
  nome: string;
  avatarUrl?: string;
  role: string;
  telefone?: string;
  email?: string;
}

interface Correspondencia {
  _id: string;
  tipo: 'carta' | 'encomenda' | 'outro';
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
}

interface DadosUtilizador {
  _id: string;
  nome: string;
  email: string;
  avatarUrl?: string;
  role: string;
  arcoId?: string;
  arco?: {
    _id: string;
    nome: string;
  };
}

interface DadosArco {
  _id: string;
  nome: string;
  codigoConvite: string;
  members: MembroFamilia[];
  adminId: string;
}

interface SistemaStatus {
  sistemaPronto: boolean;
  hasArco: boolean;
  hasDevice: boolean;
  mensagens: string[];
  acoes: Array<{
    tipo: string;
    texto: string;
    rota: string;
  }>;
}

const opcoesStatusCorreio = {
  temCorreio: {
    title: 'Tens correio físico por levantar',
    icon: 'email-alert', 
    color: 'secondary' as const, 
    description: 'Urgente: recolha necessária',
    action: 'Ver detalhes'
  },
  tudoBem: {
    title: 'Tudo tranquilo',
    icon: 'check-circle-outline',
    color: 'primary' as const,
    description: 'Não há pendências de momento',
    action: 'Ver histórico'
  },
  sistemaIncompleto: {
    title: 'Sistema incompleto',
    icon: 'alert-circle-outline',
    color: 'warning' as const,
    description: 'Configuração necessária',
    action: 'Configurar agora'
  }
};

type TipoStatus = 'temCorreio' | 'tudoBem' | 'sistemaIncompleto';

const HomeScreen  = () => {
  console.log('🔍 Debug: HomeScreen rendering...'); 
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const [carregando, setCarregando] = useState(true);
  const [aAtualizar, setAAtualizar] = useState(false);
  const [estadoAtual, setEstadoAtual] = useState<TipoStatus>('sistemaIncompleto');
  const [dadosUtilizador, setDadosUtilizador] = useState<DadosUtilizador | null>(null);
  const [dadosArco, setDadosArco] = useState<DadosArco | null>(null);
  const [membrosFamilia, setMembrosFamilia] = useState<MembroFamilia[]>([]);
  const [correspondencias, setCorrespondencias] = useState<Correspondencia[]>([]);
  const [notificacoesPorLer, setNotificacoesPorLer] = useState(0);
  const [correspondenciasPendentes, setCorrespondenciasPendentes] = useState<Correspondencia[]>([]);
  const [correspondenciasRetiradas, setCorrespondenciasRetiradas] = useState<Correspondencia[]>([]);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    pendentes: 0,
    retiradas: 0,
    hoje: 0
  });
  const [sistemaStatus, setSistemaStatus] = useState<SistemaStatus>({
    sistemaPronto: false,
    hasArco: false,
    hasDevice: false,
    mensagens: [],
    acoes: []
  });

  // Estados para o popup de dispositivo
  const [modalDispositivoVisivel, setModalDispositivoVisivel] = useState(false);
  const [codigoDispositivo, setCodigoDispositivo] = useState('');
  const [nomeDispositivo, setNomeDispositivo] = useState('');
  const [localizacaoDispositivo, setLocalizacaoDispositivo] = useState('');
  const [aAssociarDispositivo, setAAssociarDispositivo] = useState(false);
  const [erroDispositivo, setErroDispositivo] = useState('');

  const styles = criarEstilos(theme);
  const statusData = opcoesStatusCorreio[estadoAtual];
  const corStatus = theme.colors[statusData.color];

  // Verificar se o usuário atual é admin do arco
  const isAdminArco = dadosUtilizador && dadosArco && dadosUtilizador._id === dadosArco.adminId;

  useEffect(() => {
    const carregarInicial = async () => {
      try {
        setCarregando(true);
        await buscarTodosDados();
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarInicial();
  }, []);

  const buscarTodosDados = useCallback(async () => {
    try {
      console.log('🔄 Buscando todos os dados...');
      
      await buscarDadosUtilizador();
      await buscarStatusSistema();
      
      // Só buscar o resto se o sistema estiver pronto
      if (sistemaStatus.sistemaPronto) {
        await Promise.all([
          buscarDadosArco(),
          buscarNotificacoes(),
          buscarCorrespondencias(),
          buscarEstatisticasCorrespondencias()
        ]);
      }
      
      console.log('✅ Dados carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
    }
  }, [sistemaStatus.sistemaPronto]);

  const buscarDadosUtilizador = async () => {
    try {
      console.log('👤 Buscando dados do usuário...');
      const response = await api.get('/api/auth/me');
      
      if (response.data.success) {
        const user = response.data.user;
        setDadosUtilizador(user);
        console.log(`✅ Usuário carregado: ${user.nome}`);
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      }
    }
  };

  const buscarStatusSistema = async () => {
    try {
      console.log('⚙️ Buscando status do sistema...');
      const response = await api.get('/api/dispositivos/system-status');
      
      if (response.data.success) {
        setSistemaStatus({
          sistemaPronto: response.data.data.sistemaPronto,
          hasArco: response.data.data.usuario?.temArco || false,
          hasDevice: response.data.data.sistemaPronto || false,
          mensagens: response.data.data.mensagens || [],
          acoes: response.data.data.acoes || []
        });
        
        // Atualizar estado com base no status
        if (!response.data.data.sistemaPronto) {
          setEstadoAtual('sistemaIncompleto');
        } else if (estatisticas.pendentes > 0) {
          setEstadoAtual('temCorreio');
        } else {
          setEstadoAtual('tudoBem');
        }
        
        console.log(`✅ Status: ${response.data.data.sistemaPronto ? 'Pronto' : 'Configurar'}`);
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    }
  };

  const buscarDadosArco = async () => {
    try {
      console.log('👨‍👩‍👧‍👦 Buscando arco familiar...');
      const response = await api.get('/api/arco/my-arco');
      
      if (response.data.success && response.data.data) {
        const arco = response.data.data;
        setDadosArco(arco);
        
        const membrosFormatados = arco.members.map((member: any) => ({
          _id: member._id,
          nome: member.nome,
          avatarUrl: member.avatarUrl,
          role: member.role,
          email: member.email,
          telefone: member.telefone
        }));
        
        setMembrosFamilia(membrosFormatados);
        console.log(`✅ Arco carregado: ${arco.nome} (${membrosFormatados.length} membros)`);
      }
    } catch (error) {
      console.error('Erro ao buscar arco:', error);
    }
  };

  const buscarNotificacoes = async () => {
    try {
      console.log('🔔 Buscando notificações...');
      
      const response = await api.get('/api/notifications/unread-count');
      if (response.data.success) {
        setNotificacoesPorLer(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const buscarCorrespondencias = async () => {
    try {
      console.log('📬 Buscando correspondências...');
      const response = await api.get('/api/correspondencias');
      
      if (response.data && response.data.success) {
        const correspondenciasData = response.data.data;
        setCorrespondencias(correspondenciasData);
        
        const pendentes = correspondenciasData.filter((c: Correspondencia) => c.status === 'pendente');
        const retiradas = correspondenciasData.filter((c: Correspondencia) => c.status === 'retirada');
        
        setCorrespondenciasPendentes(pendentes);
        setCorrespondenciasRetiradas(retiradas.slice(0, 3));
        
        // Atualizar estado baseado nas pendências
        if (pendentes.length > 0) {
          setEstadoAtual('temCorreio');
        } else if (sistemaStatus.sistemaPronto) {
          setEstadoAtual('tudoBem');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar correspondências:', error);
    }
  };

  const buscarEstatisticasCorrespondencias = async () => {
    try {
      console.log('📊 Buscando estatísticas...');
      const response = await api.get('/api/correspondencias/stats');
      
      if (response.data.success) {
        setEstatisticas(response.data.data);
        
        // Atualizar estado se houver pendências
        if (response.data.data.pendentes > 0) {
          setEstadoAtual('temCorreio');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

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
      if (diffDias < 7) return `há ${diffDias} dias`;
      
      return data.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short'
      });
    } catch (error) {
      return dataString;
    }
  };

  const aoAtualizar = useCallback(async () => {
    setAAtualizar(true);
    await buscarTodosDados();
    setAAtualizar(false);
  }, [buscarTodosDados]);

  useFocusEffect(
    useCallback(() => {
      if (!carregando) {
        buscarTodosDados();
      }
    }, [carregando, buscarTodosDados])
  );

  const aoClicarLogo = () => {
    navigation.navigate('AboutAppicartaScreen');
  };

  const aoClicarNotificacoes = () => {
    navigation.navigate('Notifications');
  };

  const aoClicarUtilizador = () => {
    navigation.navigate('UserScreen');
  };

  const aoClicarGerirArco = () => {
    navigation.navigate('GerirArcoFamiliar');
  };

  const aoClicarCriarJuntarArco = () => {
    navigation.navigate('JoinCreateArco');
  };

  const aoClicarConfigurarDispositivo = () => {
    // Abre o popup para inserir código do dispositivo
    setModalDispositivoVisivel(true);
    setCodigoDispositivo('');
    setNomeDispositivo('');
    setLocalizacaoDispositivo('');
    setErroDispositivo('');
  };

  const aoClicarDetalhesCorreio = () => {
    if (sistemaStatus.sistemaPronto) {
      navigation.navigate('MailAndPackages');
    } else {
      // Redirecionar para configuração
      if (!sistemaStatus.hasArco) {
        aoClicarCriarJuntarArco();
      } else if (!sistemaStatus.hasDevice) {
        aoClicarConfigurarDispositivo();
      }
    }
  };

  const aoClicarVerTodoCorreio = () => {
    if (sistemaStatus.sistemaPronto) {
      navigation.navigate('MailAndPackages');
    }
  };

  const aoClicarMembro = (membro: MembroFamilia) => {
    navigation.navigate('Chat', {
      userId: membro._id,
      userName: membro.nome
    });
  };

  const aoClicarCorrespondencia = (correspondencia: Correspondencia) => {
    if (sistemaStatus.sistemaPronto) {
      navigation.navigate('MailAndPackages', {
        correspondenciaId: correspondencia._id
      });
    }
  };

  const executarAcao = (acao: { tipo: string; rota: string }) => {
    switch(acao.tipo) {
      case 'criar_arco':
        navigation.navigate('JoinCreateArcoScreen');
        break;
      case 'registrar_dispositivo':
        aoClicarConfigurarDispositivo();
        break;
      default:
        console.log('Ação não implementada:', acao.tipo);
    }
  };

  // Função para associar dispositivo
const associarDispositivo = async () => {
  if (!codigoDispositivo.trim()) {
    setErroDispositivo('Por favor, insira o código do dispositivo');
    return;
  }

  try {
    setAAssociarDispositivo(true);
    setErroDispositivo('');

    const response = await api.post('/api/dispositivos/register', {
      deviceId: codigoDispositivo.trim(),
      nome: nomeDispositivo.trim() || 'Dispositivo de Correio',
      localizacao: localizacaoDispositivo.trim() || 'Entrada Principal'
    });

    if (response.data.success) {
      Alert.alert(
        'Sucesso',
        'Dispositivo associado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              setModalDispositivoVisivel(false);
              buscarTodosDados(); // Atualizar dados
            }
          }
        ]
      );
    }
  } catch (error: any) {
    console.error('Erro ao associar dispositivo:', error);
    const errorMessage = error.response?.data?.message || 'Erro ao associar dispositivo. Tente novamente.';
    setErroDispositivo(errorMessage);
  } finally {
    setAAssociarDispositivo(false);
  }
};

  // Fechar modal de dispositivo
  const fecharModalDispositivo = () => {
    setModalDispositivoVisivel(false);
    setCodigoDispositivo('');
    setNomeDispositivo('');
    setLocalizacaoDispositivo('');
    setErroDispositivo('');
  };

  // Tela de carregamento com Skeleton
  if (carregando) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Header
          onLogoPress={aoClicarLogo}
          onNotificationsPress={aoClicarNotificacoes}
          onUserPress={aoClicarUtilizador}
          unreadCount={notificacoesPorLer}
          userAvatar={dadosUtilizador?.avatarUrl}
        />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <SkeletonCard />
          <SkeletonStats />
          <View style={[styles.familyCard, { backgroundColor: theme.colors.surface }]}>
            <Shimmer width={150} height={20} borderRadius={4} />
            <SkeletonAvatar count={4} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />

      <Header
        onLogoPress={aoClicarLogo}
        onNotificationsPress={aoClicarNotificacoes}
        onUserPress={aoClicarUtilizador}
        unreadCount={notificacoesPorLer}
        userAvatar={dadosUtilizador?.avatarUrl}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={aAtualizar}
            onRefresh={aoAtualizar}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* CARD DE STATUS PRINCIPAL */}
        <View style={[styles.mainCard, { borderLeftColor: corStatus }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.statusIconContainer, {
              backgroundColor: `${corStatus}10`,
              borderColor: `${corStatus}20`
            }]}
            >
              <Icon name={statusData.icon} size={48} color={corStatus} />
            </View>
            <Text style={styles.cardTitle}>Estado Atual</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.statusText, { color: corStatus }]}>
              {statusData.title}
            </Text>

            <View style={styles.statusDetails}>
              <Icon name="information-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.statusDescription}>
                {estadoAtual === 'sistemaIncompleto' 
                  ? sistemaStatus.mensagens[0] || 'Configuração necessária'
                  : statusData.description
                }
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.detailsButton, {
              backgroundColor: `${corStatus}10`,
              borderColor: `${corStatus}20`
            }]}
            onPress={aoClicarDetalhesCorreio}
            activeOpacity={0.8}
          >
            <Text style={[styles.detailsButtonText, { color: corStatus }]}>
              {statusData.action}
            </Text>
            <Icon name="chevron-right" size={20} color={corStatus} />
          </TouchableOpacity>
        </View>

        {/* MENSAGENS DE CONFIGURAÇÃO */}
        {!sistemaStatus.sistemaPronto && sistemaStatus.mensagens.length > 0 && (
          <View style={styles.configCard}>
            <View style={styles.configHeader}>
              <Icon name="cog-outline" size={24} color={theme.colors.warning} />
              <Text style={styles.configTitle}>Configuração Necessária</Text>
            </View>
            
            <View style={styles.messagesContainer}>
              {sistemaStatus.mensagens.map((msg, index) => (
                <View key={index} style={styles.messageItem}>
                  <Icon name="information-outline" size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.messageText}>{msg}</Text>
                </View>
              ))}
            </View>

            {sistemaStatus.acoes.length > 0 && (
              <View style={styles.actionsContainer}>
                {sistemaStatus.acoes.map((acao, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => executarAcao(acao)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>{acao.texto}</Text>
                    <Icon name="arrow-right" size={16} color={theme.colors.white} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* CORRESPONDÊNCIAS PENDENTES (só mostrar se sistema pronto) */}
        {sistemaStatus.sistemaPronto && correspondenciasPendentes.length > 0 && (
          <View style={styles.pendingCard}>
            <View style={styles.mailPackagesHeader}>
              <Text style={styles.sectionTitle}>Pendente por recolher</Text>
              <TouchableOpacity onPress={aoClicarVerTodoCorreio}>
                <Text style={[styles.seeAllText, { color: theme.colors.secondary }]}>
                  Ver tudo
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              {correspondenciasPendentes.map((item, index) => {
                const corItem = item.tipo === 'carta' ? theme.colors.primary : theme.colors.secondary;
                const isCarta = item.tipo === 'carta';
                
                return (
                  <View key={item._id}>
                    <TouchableOpacity
                      style={styles.correspondenciaItem}
                      onPress={() => aoClicarCorrespondencia(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.correspondenciaHeader}>
                        <View style={styles.correspondenciaType}>
                          <Icon
                            name={isCarta ? 'email-outline' : 'package-variant'}
                            size={20}
                            color={corItem}
                          />
                          <Text style={[styles.correspondenciaTitle, { color: corItem }]}>
                            {isCarta ? 'Carta' : 'Encomenda'}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, {
                          backgroundColor: `${theme.colors.error}10`,
                          borderColor: `${theme.colors.error}30`
                        }]}>
                          <Text style={[styles.statusBadgeText, { color: theme.colors.error }]}>
                            Pendente
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.correspondenciaDetails}>
                        Detetada {formatarData(item.detectadoEm)}
                      </Text>
                    </TouchableOpacity>
                    {index < correspondenciasPendentes.length - 1 && <View style={styles.separator} />}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* HISTÓRICO RECENTE (só mostrar se sistema pronto) */}
        {sistemaStatus.sistemaPronto && correspondenciasRetiradas.length > 0 && (
          <View style={styles.historyCard}>
            <View style={styles.mailPackagesHeader}>
              <Text style={styles.sectionTitle}>Histórico Recente</Text>
              <TouchableOpacity onPress={aoClicarVerTodoCorreio}>
                <Text style={[styles.seeAllText, { color: theme.colors.secondary }]}>
                  Ver tudo
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              {correspondenciasRetiradas.map((item, index) => {
                const corItem = item.tipo === 'carta' ? theme.colors.primary : theme.colors.secondary;
                const isCarta = item.tipo === 'carta';
                
                return (
                  <View key={item._id}>
                    <TouchableOpacity
                      style={styles.correspondenciaItem}
                      onPress={() => aoClicarCorrespondencia(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.correspondenciaHeader}>
                        <View style={styles.correspondenciaType}>
                          <Icon
                            name={isCarta ? 'email-check' : 'package-variant'} 
                            size={20}
                            color={corItem}
                          />
                          <Text style={[styles.correspondenciaTitle, { color: corItem }]}>
                            {isCarta ? 'Carta' : 'Encomenda'}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, {
                          backgroundColor: `${theme.colors.primary}10`,
                          borderColor: `${theme.colors.primary}30`
                        }]}>
                          <Text style={[styles.statusBadgeText, { color: theme.colors.primary }]}>
                            Recolhida
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.correspondenciaDetails}>
                        {item.retiradoPor?.nome || 'Utilizador'} recolheu {item.retiradoEm ? formatarData(item.retiradoEm) : 'recentemente'}
                      </Text>
                    </TouchableOpacity>
                    {index < correspondenciasRetiradas.length - 1 && <View style={styles.separator} />}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* SEM CORRESPONDÊNCIAS (só mostrar se sistema pronto) */}
        {sistemaStatus.sistemaPronto && correspondenciasPendentes.length === 0 && correspondenciasRetiradas.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Icon name="email-outline" size={48} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyTitle}>Nenhuma correspondência</Text>
              <Text style={styles.emptySubtitle}>
                Quando o dispositivo detetar correio ou encomendas,{'\n'}
                aparecerão aqui automaticamente.
              </Text>
            </View>
          </View>
        )}

        {/* CARD DO ARCO FAMILIAR */}
        <View style={styles.familyCard}>
          <View style={styles.familyHeader}>
            <View style={styles.familyTitleContainer}>
              <Text style={styles.sectionTitle}>
                {dadosArco ? `Arco: ${dadosArco.nome}` : 'O teu Arco Familiar'}
              </Text>
              <Text style={styles.familySubtitle}>
                {dadosArco
                  ? `${membrosFamilia.length} membro${membrosFamilia.length !== 1 ? 's' : ''}`
                  : 'Junta-te a um arco familiar para começar'}
              </Text>
            </View>
            
            {/* Mostrar botão apenas para admin do arco */}
            {isAdminArco && sistemaStatus.hasArco && (
              <TouchableOpacity
                style={[styles.manageButton, {
                  backgroundColor: theme.colors.primary,
                  borderColor: `${theme.colors.primary}30`
                }]}
                onPress={aoClicarGerirArco}
                activeOpacity={0.8}
              >
                <Text style={styles.manageButtonText}>
                  Gerir Arco
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Se não for admin e tiver arco, mostrar botão para ver detalhes */}
            {dadosArco && !isAdminArco && sistemaStatus.hasArco && (
              <TouchableOpacity
                style={[styles.manageButton, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderLight
                }]}
                onPress={() => navigation.navigate('Messages')}
                activeOpacity={0.8}
              >
                <Text style={[styles.manageButtonText, { color: theme.colors.text.primary }]}>
                  Mensagens
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Se não tiver arco, mostrar botão para criar/participar */}
            {!sistemaStatus.hasArco && (
              <TouchableOpacity
                style={[styles.manageButton, {
                  backgroundColor: theme.colors.primary,
                  borderColor: `${theme.colors.primary}30`
                }]}
                onPress={aoClicarCriarJuntarArco}
                activeOpacity={0.8}
              >
                <Text style={styles.manageButtonText}>
                  Criar/Juntar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {membrosFamilia.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.familyList}
            >
              {membrosFamilia.map((membro) => (
                <View key={membro._id} style={styles.familyMemberWrapper}>
                  <TouchableOpacity
                    style={styles.familyMemberCard}
                    onPress={() => aoClicarMembro(membro)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.avatarContainer, {
                      backgroundColor: `${theme.colors.primary}05`,
                      borderColor: `${theme.colors.primary}15`
                    }]}
                    >
                      {membro.avatarUrl ? (
                        <Image
                          source={{ uri: membro.avatarUrl }}
                          style={styles.avatar}
                          onError={() => {}}
                        />
                      ) : (
                        <View style={[styles.avatarPlaceholder, {
                          backgroundColor: membro.role === 'admin'
                            ? theme.colors.primary
                            : theme.colors.secondary
                        }]}
                        >
                          <Text style={styles.avatarInitials}>
                            {membro.nome.charAt(0).toUpperCase()}
                          </Text>
                          {membro.role === 'admin' && (
                            <View style={styles.adminBadge}>
                              <Icon name="crown" size={10} color={theme.colors.white} />
                            </View>
                          )}
                        </View>
                      )}
                      <View style={[
                        styles.statusIndicator,
                        {
                          backgroundColor: theme.colors.success,
                          borderColor: theme.colors.surface
                        }
                      ]} />
                    </View>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {membro.nome}
                    </Text>
                    {membro.role === 'admin' && (
                      <Text style={styles.memberRole}>Admin</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyFamilyContainer}>
              <Icon name="account-group-outline" size={48} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyFamilyText}>
                {sistemaStatus.hasArco ? 'Sem membros no arco' : 'Ainda não tens um arco familiar'}
              </Text>
              <Text style={styles.emptyFamilySubtext}>
                {sistemaStatus.hasArco 
                  ? 'Convida membros para partilhar o sistema'
                  : 'Cria ou junta-te a um arco para começar'}
              </Text>
            </View>
          )}
        </View>

        {/* ESTATÍSTICAS (só mostrar se sistema pronto) */}
        {sistemaStatus.sistemaPronto && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Estatísticas</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="email-multiple" size={24} color={theme.colors.primary} />
                <Text style={styles.statNumber}>{estatisticas.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="clock-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.statNumber}>{estatisticas.pendentes}</Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="account-group" size={24} color={theme.colors.primary} />
                <Text style={styles.statNumber}>{membrosFamilia.length}</Text>
                <Text style={styles.statLabel}>Membros</Text>
              </View>
            </View>
          </View>
        )}

        {/* STATUS DO SISTEMA */}
        <View style={styles.systemStatusCard}>
          <View style={styles.systemStatusHeader}>
            <Icon name="chip" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.systemStatusTitle}>Estado do Sistema</Text>
          </View>
          <View style={styles.systemStatusItems}>
            <View style={styles.systemStatusItem}>
              <View style={[
                styles.statusDot,
                { backgroundColor: sistemaStatus.hasArco ? theme.colors.success : theme.colors.warning }
              ]} />
              <Text style={styles.systemStatusText}>
                {sistemaStatus.hasArco ? '✅ Arco configurado' : '⚠️ Sem arco'}
              </Text>
            </View>
            <View style={styles.systemStatusItem}>
              <View style={[
                styles.statusDot,
                { backgroundColor: sistemaStatus.hasDevice ? theme.colors.success : theme.colors.warning }
              ]} />
              <Text style={styles.systemStatusText}>
                {sistemaStatus.hasDevice ? '✅ Dispositivo ativo' : '⚠️ Sem dispositivo'}
              </Text>
            </View>
            <View style={styles.systemStatusItem}>
              <View style={[
                styles.statusDot,
                { backgroundColor: sistemaStatus.sistemaPronto ? theme.colors.success : theme.colors.warning }
              ]} />
              <Text style={styles.systemStatusText}>
                {sistemaStatus.sistemaPronto ? '✅ Sistema operacional' : '⏳ Configuração pendente'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL PARA ASSOCIAR DISPOSITIVO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalDispositivoVisivel}
        onRequestClose={fecharModalDispositivo}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Icon name="chip" size={28} color={theme.colors.primary} />
                <Text style={styles.modalTitle}>Associar Dispositivo</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={fecharModalDispositivo}
                >
                  <Icon name="close" size={24} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Insira o código do dispositivo para associá-lo ao seu arco familiar.
                Este código é único para cada dispositivo físico.
              </Text>

              <View style={styles.formContainer}>
                {/* Campo para código do dispositivo */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Código do Dispositivo <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputContainer}>
                    <Icon 
                      name="numeric" 
                      size={20} 
                      color={theme.colors.text.secondary} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: DEV-1234-ABCD"
                      placeholderTextColor={theme.colors.text.tertiary}
                      value={codigoDispositivo}
                      onChangeText={setCodigoDispositivo}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  </View>
                  {erroDispositivo && (
                    <View style={styles.errorContainer}>
                      <Icon name="alert-circle" size={16} color={theme.colors.error} />
                      <Text style={styles.errorText}>{erroDispositivo}</Text>
                    </View>
                  )}
                </View>

                {/* Campo para nome do dispositivo (opcional) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nome do Dispositivo</Text>
                  <View style={styles.inputContainer}>
                    <Icon 
                      name="tag-outline" 
                      size={20} 
                      color={theme.colors.text.secondary} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: Caixa de Correio Principal"
                      placeholderTextColor={theme.colors.text.tertiary}
                      value={nomeDispositivo}
                      onChangeText={setNomeDispositivo}
                    />
                  </View>
                </View>

                {/* Campo para localização (opcional) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Localização</Text>
                  <View style={styles.inputContainer}>
                    <Icon 
                      name="map-marker-outline" 
                      size={20} 
                      color={theme.colors.text.secondary} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: Entrada Principal, Portão"
                      placeholderTextColor={theme.colors.text.tertiary}
                      value={localizacaoDispositivo}
                      onChangeText={setLocalizacaoDispositivo}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={fecharModalDispositivo}
                  disabled={aAssociarDispositivo}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    (!codigoDispositivo.trim() || aAssociarDispositivo) && styles.disabledButton
                  ]}
                  onPress={associarDispositivo}
                  disabled={!codigoDispositivo.trim() || aAssociarDispositivo}
                >
                  {aAssociarDispositivo ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <>
                      <Icon name="check" size={20} color={theme.colors.white} style={styles.buttonIcon} />
                      <Text style={styles.confirmButtonText}>Associar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.modalFooter}>
                <Icon name="information-outline" size={16} color={theme.colors.text.secondary} />
                <Text style={styles.modalFooterText}>
                  O código do dispositivo encontra-se no próprio dispositivo físico.
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const criarEstilos = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  mainCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
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
  cardHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  cardBody: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  statusText: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.semiBold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusDescription: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'stretch',
    borderWidth: 1,
  },
  detailsButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
    marginRight: theme.spacing.xs,
  },
  configCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.warning}30`,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  configTitle: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  messagesContainer: {
    marginBottom: theme.spacing.lg,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  messageText: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.white,
  },
  pendingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`, 
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  mailPackagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  correspondenciaItem: {
    paddingVertical: theme.spacing.md,
  },
  correspondenciaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  correspondenciaType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  correspondenciaTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semiBold,
  },
  correspondenciaDetails: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  retirarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  retirarButtonText: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FFF',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  familyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  familyTitleContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  familySubtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  manageButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
  },
  manageButtonText: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.white,
  },
  familyList: {
    paddingRight: theme.spacing.lg,
  },
  familyMemberWrapper: {
    marginRight: theme.spacing.lg,
  },
  familyMemberCard: {
    alignItems: 'center',
    width: 70,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarInitials: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
  },
  adminBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  memberName: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
    marginTop: 2,
  },
  memberRole: {
    fontSize: 10,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: theme.typography.weights.bold,
    marginTop: 2,
  },
  emptyFamilyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyFamilyText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptyFamilySubtext: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  seeAllText: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.secondary,
  },
  statsSection: {
    marginBottom: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  statNumber: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  systemStatusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  systemStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  systemStatusTitle: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  systemStatusItems: {
    gap: theme.spacing.sm,
  },
  systemStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  systemStatusText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  // Estilos do modal de dispositivo
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  keyboardAvoidingView: {
    width: '100%',
    maxWidth: 450,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  modalDescription: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  formContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}05`,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
    padding: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.error,
    flex: 1,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderLight,
  },
  cancelButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.secondary,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: `${theme.colors.primary}50`,
    borderColor: `${theme.colors.primary}30`,
  },
  confirmButtonText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
  },
  buttonIcon: {
    marginRight: theme.spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}05`,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  modalFooterText: {
    flex: 1,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
});

const HomeScreenWithNav  = (props: any) => {
  const navigation = useNavigation<any>();

  const aoClicarTab = (tabId: string) => {
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
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      default:
        navigation.navigate('Home');
    }
  };

  return (
    <>
      <HomeScreen  {...props} />
      <BottomNavigationBar
        activeTab="home"
        onTabPress={aoClicarTab}
      />
    </>
  );
};

export default HomeScreenWithNav;