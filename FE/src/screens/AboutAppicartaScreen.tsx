import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Importa a imagem
const logoInteira = require('../styles/logoInteira.png');

const AboutAppicartaScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  
  const styles = createStyles(theme);

  // Remove animations — hero terá altura fixa
  const heroFixedHeight = height * 0.32;

  const features = [
    {
      icon: 'heart-circle-outline',
      title: 'Conecta Famílias',
      description: 'Une gerações através da partilha de momentos especiais',
      color: theme.colors.secondary,
    },
    {
      icon: 'email-fast-outline',
      title: 'Correio Digital',
      description: 'Transforma cartas físicas em mensagens digitais',
      color: theme.colors.primary,
    },
    {
      icon: 'shield-check-outline',
      title: 'Privacidade Garantida',
      description: 'Só partilha com quem realmente importa',
      color: theme.colors.success,
    },
    {
      icon: 'clock-outline',
      title: 'Poupe Tempo',
      description: 'Recolha de correio sem sair de casa',
      color: theme.colors.warning,
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Regista o teu Arco Familiar',
      description: 'Convida os teus familiares mais próximos para a tua rede privada',
    },
    {
      step: '2',
      title: 'Notificação de Correio',
      description: 'Recebe alertas quando alguém tem correio para recolher',
    },
    {
      step: '3',
      title: 'Pedir Recolha',
      description: 'Solicita a alguém do teu arco que recolha o teu correio',
    },
    {
      step: '4',
      title: 'Acompanha em Tempo Real',
      description: 'Segue o estado do teu correio desde a recolha até à entrega',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
        translucent
      />

      {/* Header */}
      <Header 
        title="Sobre a Appicarta"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showNotifications={false}
        showAvatar={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section com imagem */}
        <View style={[styles.heroSection, { height: heroFixedHeight }] }>
          <View style={styles.imageContainer}>
            <Image 
              source={logoInteira} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.heroOverlay, { opacity: 0.35 }]} />

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Appicarta</Text>
            <Text style={styles.heroSubtitle}>O futuro do correio familiar</Text>
          </View>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.contentContainer}>
          {/* Introdução */}
          <View style={styles.introCard}>            <View style={styles.sectionHeader}>
              <Icon name="information-outline" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>O que é a Appicarta?</Text>
            </View>
            
            <Text style={styles.introText}>
              A <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Appicarta</Text> é mais do que uma aplicação - é uma ponte digital que reconecta famílias através do simples gesto de partilhar correio. 
              Num mundo cada vez mais digital, mantemos viva a tradição das cartas físicas, tornando-as acessíveis a todos.
            </Text>
            
            <View style={styles.highlightBox}>
              <Icon name="lightbulb-on-outline" size={24} color={theme.colors.warning} />
              <Text style={styles.highlightText}>
                Imagine poder ter o seu correio recolhido por um familiar quando está fora, ou ajudar um avô a receber uma carta importante sem ele sair de casa.
              </Text>
            </View>
          </View>

          {/* Features em grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Porquê escolher a Appicarta?</Text>
            
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard} >
                  <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                    <Icon name={feature.icon} size={32} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Como funciona */}
          <View style={styles.howItWorksSection}>
            <View style={styles.sectionHeader}>
              <Icon name="cog-outline" size={28} color={theme.colors.secondary} />
              <Text style={styles.sectionTitle}>Como funciona?</Text>
            </View>
            
            {howItWorks.map((step, index) => (
              <View 
                key={index}
                style={styles.stepCard}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Mensagem final inspiradora */}
          <View style={styles.finalMessage}>
            <Icon 
              name="heart-outline" 
              size={48} 
              color={theme.colors.secondary}
              style={styles.heartIcon}
            />
            <Text style={styles.finalTitle}>
              Conectando corações, uma carta de cada vez
            </Text>
            <Text style={styles.finalText}>
              A Appicarta não é apenas sobre correio. É sobre cuidado, conexão e comunidade. 
              É sobre estar presente mesmo quando estamos longe. É sobre transformar uma simples 
              tarefa numa oportunidade de demonstrar amor e apoio.
            </Text>
            
            <TouchableOpacity 
              style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.goBack()}
            >
              <Icon name="check-circle-outline" size={24} color={theme.colors.white} />
              <Text style={styles.ctaText}>Começar a usar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.white}90`,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.subheading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  heroSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '80%',
    height: '80%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  heroContent: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.xl,
    right: theme.spacing.xl,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  introCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginTop: -theme.spacing.xl,
    ...theme.shadows.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  introText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.warning}10`,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  highlightText: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  featuresSection: {
    marginTop: theme.spacing.xl,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  howItWorksSection: {
    marginTop: theme.spacing.xl,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  stepNumberText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  finalMessage: {
    backgroundColor: `${theme.colors.primary}05`,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    borderWidth: 2,
    borderColor: `${theme.colors.primary}20`,
    borderStyle: 'dashed',
  },
  heartIcon: {
    marginBottom: theme.spacing.lg,
  },
  finalTitle: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 32,
  },
  finalText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  ctaText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
});

// ...existing code...


import BottomNavigationBar from '../components/BottomNavigationBar';

const AboutAppicartaScreenWithNav = (props: any) => {
  const navigation = useNavigation<any>();
  return <>
    <AboutAppicartaScreen {...props} />
    <BottomNavigationBar activeTab="home" onTabPress={(tabId: string) => {
      if (tabId === 'home') navigation.navigate('Home');
      if (tabId === 'correspondencias') navigation.navigate('MailAndPackages');
      if (tabId === 'messages') navigation.navigate('Messages');
    }} />
  </>;
};

export default AboutAppicartaScreenWithNav;