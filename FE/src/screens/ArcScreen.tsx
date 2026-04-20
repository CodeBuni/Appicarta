// src/screens/ArcScreen.tsx
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import Header from '../components/Header';


// Dados de exemplo para membros do Arco
const arcMembers = [
  {
    id: '1',
    name: 'Maria Silva',
    role: 'Mãe',
    status: 'online',
    mailAccess: 'full',
    lastActive: 'Há 5 min',
    trustScore: 95,
    avatar: null,
    color: '#1c3cb4',
  },
  {
    id: '2',
    name: 'João Santos',
    role: 'Pai',
    status: 'online',
    mailAccess: 'full',
    lastActive: 'Agora',
    trustScore: 92,
    avatar: null,
    color: '#4CAF50',
  },
  {
    id: '3',
    name: 'Ana Pereira',
    role: 'Filha',
    status: 'offline',
    mailAccess: 'limited',
    lastActive: 'Há 2 horas',
    trustScore: 88,
    avatar: null,
    color: '#2196F3',
  },
  {
    id: '4',
    name: 'Pedro Costa',
    role: 'Avô',
    status: 'online',
    mailAccess: 'full',
    lastActive: 'Há 30 min',
    trustScore: 90,
    avatar: null,
    color: '#9C27B0',
  },
  {
    id: '5',
    name: 'Sofia Oliveira',
    role: 'Vizinha',
    status: 'offline',
    mailAccess: 'read-only',
    lastActive: 'Ontem',
    trustScore: 85,
    avatar: null,
    color: '#FF9800',
  },
  {
    id: '6',
    name: 'Carlos Mendes',
    role: 'Amigo',
    status: 'online',
    mailAccess: 'limited',
    lastActive: 'Agora',
    trustScore: 82,
    avatar: null,
    color: '#FF5722',
  },
];

const ArcScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState('grid');
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const renderMemberCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.memberCard,
        { backgroundColor: theme.colors.surface }
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.memberHeader}>
        {/* Avatar */}
        <View style={[
          styles.memberAvatar,
          { backgroundColor: item.avatar ? 'transparent' : item.color }
        ]}>
          {item.avatar ? (
            <Image source={item.avatar} style={styles.avatarImage} />
          ) : (
            <Text style={styles.memberAvatarText}>
              {item.name.charAt(0)}
            </Text>
          )}
          
          {/* Status indicator */}
          <View style={[
            styles.memberStatus,
            { backgroundColor: item.status === 'online' ? '#4CAF50' : '#CCCCCC' }
          ]} />
        </View>
        
        {/* Informações básicas */}
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, { color: theme.colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.memberRole, { color: theme.colors.text.secondary }]}>
            {item.role}
          </Text>
        </View>
        
        {/* Trust score */}
        <View style={styles.trustBadge}>
          <Icon name="shield-check" size={16} color="#4CAF50" />
          <Text style={styles.trustScore}>{item.trustScore}</Text>
        </View>
      </View>
      
      {/* Detalhes */}
      <View style={styles.memberDetails}>
        <View style={styles.detailRow}>
          <Icon name="clock-outline" size={16} color={theme.colors.text.tertiary} />
          <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
            {item.lastActive}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="email" size={16} color={theme.colors.text.tertiary} />
          <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
            {item.mailAccess === 'full' ? 'Acesso total' : 
             item.mailAccess === 'limited' ? 'Acesso limitado' : 'Só leitura'}
          </Text>
        </View>
      </View>
      
      {/* Ações */}
      <View style={styles.memberActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.infoLight }]}>
          <Icon name="message-text" size={18} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>
            Mensagem
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: `${theme.colors.secondary}15` }]}>
          <Icon name="email-send" size={18} color={theme.colors.secondary} />
          <Text style={[styles.actionText, { color: theme.colors.secondary }]}>
            Pedir ajuda
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statItem}>
        <Icon name="account-group" size={24} color={theme.colors.primary} />
        <Text style={[styles.statNumber, { color: theme.colors.text.primary }]}>6</Text>
        <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Membros</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Icon name="shield-check" size={24} color="#4CAF50" />
        <Text style={[styles.statNumber, { color: theme.colors.text.primary }]}>92%</Text>
        <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Confiança</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Icon name="email-check" size={24} color={theme.colors.secondary} />
        <Text style={[styles.statNumber, { color: theme.colors.text.primary }]}>24</Text>
        <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Recolhas</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Icon name="clock-check" size={24} color="#FF9800" />
        <Text style={[styles.statNumber, { color: theme.colors.text.primary }]}>2.4h</Text>
        <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Tempo médio</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      {/* Header */}
      <Header 
        title="Arco Familiar"
        showNotifications={false}
        rightIcon={showSearch ? 'close' : 'magnify'}
        onRightIconPress={() => setShowSearch(!showSearch)}
      />


        {/* Barra de pesquisa - só aparece quando showSearch é true */}
        {showSearch && (
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
            <Icon name="magnify" size={20} color={theme.colors.text.tertiary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
              placeholder="Pesquisar membros..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Icon name="close-circle" size={20} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats */}
        {renderStats()}
        
        {/* Seção de convite */}
        <View style={[styles.inviteSection, { backgroundColor: theme.colors.primary }]}>
          <Icon name="account-group" size={32} color="#FFFFFF" />
          <View style={styles.inviteContent}>
            <Text style={styles.inviteTitle}>Convida alguém</Text>
            <Text style={styles.inviteText}>
              Aumenta o teu Arco Familiar e partilha confiança
            </Text>
          </View>
          <TouchableOpacity style={styles.inviteButton}>
            <Icon name="plus" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Controlos de visualização */}
        <View style={styles.viewControls}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Membros do Arco
          </Text>
          
          <View style={styles.viewButtons}>
            <TouchableOpacity 
              style={[
                styles.viewButton, 
                viewMode === 'grid' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setViewMode('grid')}
            >
              <Icon 
                name="view-grid" 
                size={20} 
                color={viewMode === 'grid' ? '#FFFFFF' : theme.colors.text.secondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.viewButton, 
                viewMode === 'list' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setViewMode('list')}
            >
              <Icon 
                name="format-list-bulleted" 
                size={20} 
                color={viewMode === 'list' ? '#FFFFFF' : theme.colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Lista de membros */}
        <FlatList
          data={arcMembers}
          renderItem={renderMemberCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.membersList}
        />
        
        {/* Info footer */}
        <View style={[styles.infoFooter, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Icon name="shield-lock" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
            O Arco Familiar é uma rede privada e segura. Só tu controlas quem faz parte.
          </Text>
        </View>

        {/* Espaço para o bottom bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Mais espaço para o bottom bar
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 6,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 8,
  },
  inviteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
  },
  inviteContent: {
    flex: 1,
    marginLeft: 16,
  },
  inviteTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  inviteText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20, // AUMENTEI o marginBottom para dar mais espaço
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  membersList: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Adicionei padding bottom
  },
  memberCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    overflow: 'visible', // IMPORTANTE: Permite que o status seja visível
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  memberStatus: {
    position: 'absolute',
    bottom: -3, // Ajustado para fora do círculo
    right: -3, // Ajustado para fora do círculo
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  trustScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  memberDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 80,
  },
});

// ...existing code...


import BottomNavigationBar from '../components/BottomNavigationBar';

const ArcScreenWithNav = (props: any) => {
  const navigation = useNavigation<any>();
  return <>
    <ArcScreen {...props} />
    <BottomNavigationBar activeTab="home" onTabPress={(tabId: string) => {
      if (tabId === 'home') navigation.navigate('Home');
      if (tabId === 'correspondencias') navigation.navigate('MailAndPackages');
      if (tabId === 'messages') navigation.navigate('Messages');
    }} />
  </>;
};

export default ArcScreenWithNav;