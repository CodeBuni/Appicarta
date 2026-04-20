import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Image,
  ImageSourcePropType,
  Animated,
  Easing,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/theme';

type RootStackParamList = {
  Start: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  Home: undefined;
  MailAndPackages: undefined;
  Messages: undefined;
  Notifications: undefined;
  Chat: undefined;
  UserScreen: undefined;
  AboutAppicartaScreen: undefined;
};

const logoIlustracao: ImageSourcePropType = require('../styles/logoIlustracao.png');
const logoMascote: ImageSourcePropType = require('../styles/logoMascote.png');

const { width, height } = Dimensions.get('window');

type StartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Start'>;

const HOW_OPTIONS = [
  { id: 'friends', label: 'Amigos', icon: 'account-group-outline' },
  { id: 'social', label: 'Redes Sociais', icon: 'instagram' },
  { id: 'search', label: 'Pesquisa', icon: 'google' },
  { id: 'other', label: 'Outro', icon: 'dots-horizontal-circle-outline' },
];

const USE_OPTIONS = [
  {
    id: 'family',
    label: 'Família',
    description: 'Moro com a minha família',
    icon: 'home-heart',
    gradient: ['#FF6B9D', '#C44B8A'] as [string, string],
  },
  {
    id: 'alone',
    label: 'Sozinho',
    description: 'Moro sozinho ou com colegas',
    icon: 'account-outline',
    gradient: ['#4ECDC4', '#2BA8A0'] as [string, string],
  },
  {
    id: 'company',
    label: 'Empresa',
    description: 'Uso profissional / escritório',
    icon: 'office-building-outline',
    gradient: ['#A78BFA', '#7C3AED'] as [string, string],
  },
];

const SETUP_STEPS = [
  {
    id: 'arc',
    number: '01',
    title: 'Cria ou junta-te a um Arco Familiar',
    description:
      'O Arco Familiar é o teu grupo de confiança. Cria um novo e convida quem queres, ou entra num já existente com o código que alguém te enviou.',
    icon: 'account-group',
    iconBg: ['#FF6B9D', '#C44B8A'] as [string, string],
    tip: 'Podes ter vários membros — família, colegas de casa, quem preferires.',
  },
  {
    id: 'sensor',
    number: '02',
    title: 'Liga o código do Appisensor',
    description:
      'O Appisensor é o dispositivo que deteta quando há carta ou encomenda. Vai a Definições › Appisensor e insere o código que está colado no teu dispositivo.',
    icon: 'chip',
    iconBg: ['#4ECDC4', '#2BA8A0'] as [string, string],
    tip: 'O código tem o formato XXXX-XXXX e está na parte de baixo do sensor.',
  },
  {
    id: 'done',
    number: '03',
    title: 'Está tudo pronto! 🎉',
    description:
      'Assim que o sensor detetar carta, todos os membros do teu Arco Familiar recebem uma notificação. Podes também enviar mensagens dentro do grupo!',
    icon: 'check-decagram',
    iconBg: ['#F59E0B', '#D97706'] as [string, string],
    tip: 'Nunca mais vais perder uma carta importante.',
  },
];

const TOTAL_STEPS = 4;

const Start = () => {
  const navigation = useNavigation<StartScreenNavigationProp>();
  const [step, setStep] = useState(0);
  const [selectedHow, setSelectedHow] = useState<string | null>(null);
  const [selectedUse, setSelectedUse] = useState<string | null>(null);
  const [activeSetupStep, setActiveSetupStep] = useState(0);

  // Animações
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ((step + 1) / TOTAL_STEPS) * width,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [step]);

  const animateTransition = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      setSelectedHow(null);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.back(0.8)),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (step === 0) {
      animateTransition(1);
    } else if (step === 1 && selectedHow) {
      animateTransition(2);
    } else if (step === 2 && selectedUse) {
      animateTransition(3);
    }
  };

  const handleGetStarted = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('SignupScreen');
    });
  };

  const handleLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handleSetupStepPress = (index: number) => {
    Animated.sequence([
      Animated.timing(cardScale[index], {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale[index], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveSetupStep(index);
  };

  // Barra de progresso
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <Animated.View style={[styles.progressFill, { width: progressAnim }]} />
      </View>
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>{step + 1} / {TOTAL_STEPS}</Text>
      </View>
    </View>
  );

  const renderBackground = () => (
    <View style={styles.background}>
      <LinearGradient
        colors={[colors.primary, '#1a237e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />
    </View>
  );

  // ─── Step 0: Boas-vindas ───────────────────────────────────────────────────
  const renderWelcome = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.illustrationWrapper}>
        <Image source={logoIlustracao} style={styles.illustrationImage} resizeMode="contain" />
      </View>

      <View style={styles.mascotWrapper}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            Olá! 👋{'\n'}Bem-vindo à <Text style={styles.speechBold}>Appicarta</Text>
          </Text>
          <View style={styles.bubbleTail} />
        </View>
        <Image source={logoMascote} style={styles.mascotImage} resizeMode="contain" />
      </View>

      <TouchableOpacity style={styles.mainButton} onPress={handleNext} activeOpacity={0.9}>
        <LinearGradient
          colors={['#FFFFFF', '#f0f0f0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.mainButtonText}>Começar</Text>
          <Icon name="arrow-right" size={20} color={colors.primary} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  // ─── Step 1: Como ficaste a saber ─────────────────────────────────────────
  const renderHowDidYouHear = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.questionWrapper}>
        <Image source={logoMascote} style={styles.mascotSmall} resizeMode="contain" />
        <View style={styles.questionBubble}>
          <Text style={styles.questionText}>
            Como ficaste a saber{'\n'}da <Text style={styles.speechBold}>Appicarta</Text>?
          </Text>
          <View style={styles.questionTail} />
        </View>
      </View>

      <View style={styles.optionsGrid}>
        {HOW_OPTIONS.map((opt) => {
          const isSelected = selectedHow === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => setSelectedHow(opt.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                <Icon name={opt.icon} size={24} color={isSelected ? colors.primary : '#FFFFFF'} />
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {opt.label}
              </Text>
              {isSelected && (
                <View style={styles.checkMark}>
                  <Icon name="check" size={12} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.mainButton, !selectedHow && styles.mainButtonDisabled]}
        onPress={handleNext}
        disabled={!selectedHow}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={selectedHow ? ['#FFFFFF', '#f0f0f0'] : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={[styles.mainButtonText, !selectedHow && styles.mainButtonTextDisabled]}>
            Continuar
          </Text>
          <Icon name="arrow-right" size={20} color={selectedHow ? colors.primary : 'rgba(255,255,255,0.6)'} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  // ─── Step 2: Como vais usar ────────────────────────────────────────────────
  const renderHowWillYouUse = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.questionWrapper}>
        <Image source={logoMascote} style={styles.mascotSmall} resizeMode="contain" />
        <View style={styles.questionBubble}>
          <Text style={styles.questionText}>
            Como vais usar{'\n'}a <Text style={styles.speechBold}>Appicarta</Text>?
          </Text>
          <View style={styles.questionTail} />
        </View>
      </View>

      <View style={styles.useOptionsContainer}>
        {USE_OPTIONS.map((opt) => {
          const isSelected = selectedUse === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.useCard, isSelected && styles.useCardSelected]}
              onPress={() => setSelectedUse(opt.id)}
              activeOpacity={0.85}
            >
              {isSelected ? (
                <LinearGradient
                  colors={opt.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.useCardGradient}
                >
                  <View style={styles.useCardInner}>
                    <View style={styles.useIconWrapperSelected}>
                      <Icon name={opt.icon} size={26} color="#FFF" />
                    </View>
                    <View style={styles.useCardText}>
                      <Text style={[styles.useCardLabel, { color: '#FFF' }]}>{opt.label}</Text>
                      <Text style={[styles.useCardDescription, { color: 'rgba(255,255,255,0.8)' }]}>
                        {opt.description}
                      </Text>
                    </View>
                    <Icon name="check-circle" size={22} color="rgba(255,255,255,0.9)" />
                  </View>
                </LinearGradient>
              ) : (
                <View style={styles.useCardInner}>
                  <LinearGradient
                    colors={opt.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.useIconWrapper}
                  >
                    <Icon name={opt.icon} size={26} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.useCardText}>
                    <Text style={styles.useCardLabel}>{opt.label}</Text>
                    <Text style={styles.useCardDescription}>{opt.description}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.4)" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.mainButton, !selectedUse && styles.mainButtonDisabled]}
        onPress={handleNext}
        disabled={!selectedUse}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={selectedUse ? ['#FFFFFF', '#f0f0f0'] : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={[styles.mainButtonText, !selectedUse && styles.mainButtonTextDisabled]}>
            Continuar
          </Text>
          <Icon name="arrow-right" size={20} color={selectedUse ? colors.primary : 'rgba(255,255,255,0.6)'} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  // ─── Step 3: Como funciona + Escolha de auth ──────────────────────────────
  const renderSetupAndAuth = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      {/* Cabeçalho */}
      <View style={styles.setupHeader}>
        <Image source={logoMascote} style={styles.mascotSmall} resizeMode="contain" />
        <View style={styles.questionBubble}>
          <Text style={styles.questionText}>
            É fácil de configurar!{'\n'}
            <Text style={styles.speechBold}>3 passos simples</Text> e estás pronto 🚀
          </Text>
          <View style={styles.questionTail} />
        </View>
      </View>

      {/* Cards dos passos */}
      <ScrollView
        style={styles.setupScrollView}
        contentContainerStyle={styles.setupScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SETUP_STEPS.map((s, index) => {
          const isActive = activeSetupStep === index;
          return (
            <Animated.View key={s.id} style={{ transform: [{ scale: cardScale[index] }] }}>
              <TouchableOpacity
                style={[styles.setupCard, isActive && styles.setupCardActive]}
                onPress={() => handleSetupStepPress(index)}
                activeOpacity={0.85}
              >
                {/* Número + Ícone */}
                <View style={styles.setupCardLeft}>
                  <LinearGradient
                    colors={s.iconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.setupIconCircle}
                  >
                    <Icon name={s.icon} size={22} color="#FFF" />
                  </LinearGradient>
                  {index < SETUP_STEPS.length - 1 && (
                    <View style={[styles.setupConnector, isActive && styles.setupConnectorActive]} />
                  )}
                </View>

                {/* Conteúdo */}
                <View style={styles.setupCardContent}>
                  <View style={styles.setupCardHeader}>
                    <Text style={styles.setupStepNumber}>{s.number}</Text>
                    <Text style={styles.setupCardTitle}>{s.title}</Text>
                  </View>

                  {isActive && (
                    <Animated.View>
                      <Text style={styles.setupCardDescription}>{s.description}</Text>
                      <View style={styles.setupTipRow}>
                        <Icon name="lightbulb-on-outline" size={14} color="#F59E0B" />
                        <Text style={styles.setupTipText}>{s.tip}</Text>
                      </View>
                    </Animated.View>
                  )}
                </View>

                {/* Chevron */}
                <Icon
                  name={isActive ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Separador */}
        <View style={styles.authSeparator}>
          <View style={styles.authSeparatorLine} />
          <Text style={styles.authSeparatorText}>Pronto para começar?</Text>
          <View style={styles.authSeparatorLine} />
        </View>

        {/* Cards de autenticação */}
        <View style={styles.authCards}>
          <TouchableOpacity style={styles.authCard} onPress={handleGetStarted} activeOpacity={0.85}>
            <LinearGradient
              colors={['#FF416C', '#FF4B2B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.authGradient}
            >
              <Icon name="account-plus-outline" size={26} color="#FFF" />
              <View style={styles.authCardTextCol}>
                <Text style={styles.authCardTitle}>Criar Conta</Text>
                <Text style={styles.authCardSub}>Novo por aqui?</Text>
              </View>
              <Icon name="arrow-right" size={16} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authCard, styles.authCardSecondary]}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <View style={styles.authSecondaryContent}>
              <Icon name="login" size={26} color={colors.primary} />
              <View style={styles.authCardTextCol}>
                <Text style={[styles.authCardTitle, styles.authCardTitleSecondary]}>Entrar</Text>
                <Text style={[styles.authCardSub, styles.authCardSubSecondary]}>Já tenho conta</Text>
              </View>
              <Icon name="arrow-right" size={16} color={`${colors.primary}88`} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {renderBackground()}
      {renderProgressBar()}
      <View style={styles.content}>
        {step === 0 && renderWelcome()}
        {step === 1 && renderHowDidYouHear()}
        {step === 2 && renderHowWillYouUse()}
        {step === 3 && renderSetupAndAuth()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },

  background: { ...StyleSheet.absoluteFillObject },
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -80,
    right: -80,
  },
  orb2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: height * 0.2,
    left: -50,
  },
  orb3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: height * 0.5,
    right: 30,
  },

  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  stepIndicator: { alignItems: 'flex-end', marginTop: 8 },
  stepText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },

  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 40 },
  stepContent: { flex: 1, justifyContent: 'space-between', paddingVertical: 20 },

  // Ilustração
  illustrationWrapper: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  illustrationImage: { width: width * 0.75, height: width * 0.5, maxWidth: 300, maxHeight: 200 },

  // Mascote
  mascotWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 12,
  },
  mascotImage: { width: 70, height: 70 },
  mascotSmall: { width: 55, height: 55 },

  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxWidth: width * 0.6,
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute',
    right: -10,
    bottom: 16,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
  },
  speechText: { fontSize: 15, color: colors.primary, lineHeight: 22 },
  speechBold: { fontWeight: '800' },

  questionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  questionBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flex: 1,
    position: 'relative',
  },
  questionTail: {
    position: 'absolute',
    left: -10,
    top: 20,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
  },
  questionText: { fontSize: 16, color: colors.primary, lineHeight: 24, fontWeight: '600' },

  // HOW options grid (step 1)
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 40,
  },
  optionCard: {
    width: (width - 62) / 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    position: 'relative',
  },
  optionCardSelected: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: { backgroundColor: colors.primary + '20' },
  optionLabel: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  optionLabelSelected: { color: colors.primary, fontWeight: '700' },
  checkMark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // USE options (step 2)
  useOptionsContainer: { gap: 12, marginBottom: 32 },
  useCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  useCardSelected: {
    borderColor: 'transparent',
  },
  useCardGradient: { borderRadius: 18 },
  useCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  useIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useIconWrapperSelected: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  useCardText: { flex: 1 },
  useCardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  useCardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },

  // Botão principal
  mainButton: { borderRadius: 16, overflow: 'hidden' },
  mainButtonDisabled: { opacity: 0.5 },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  mainButtonText: { fontSize: 17, fontWeight: '700', color: colors.primary },
  mainButtonTextDisabled: { color: 'rgba(0,0,0,0.4)' },

  // Setup (step 3)
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  setupScrollView: { flex: 1 },
  setupScrollContent: { paddingBottom: 16 },

  setupCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 14,
  },
  setupCardActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  setupCardLeft: {
    alignItems: 'center',
  },
  setupIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupConnector: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 6,
    borderRadius: 1,
  },
  setupConnectorActive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  setupCardContent: { flex: 1 },
  setupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  setupStepNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  setupCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
  },
  setupCardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 10,
    marginTop: 4,
  },
  setupTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  setupTipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    flex: 1,
    lineHeight: 17,
  },

  // Separador
  authSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  authSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  authSeparatorText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },

  // Auth cards
  authCards: { gap: 12, marginBottom: 8 },
  authCard: { borderRadius: 18, overflow: 'hidden' },
  authCardSecondary: { backgroundColor: '#FFFFFF' },
  authGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  authSecondaryContent: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  authCardTextCol: { flex: 1 },
  authCardTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  authCardTitleSecondary: { color: colors.primary },
  authCardSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  authCardSubSecondary: { color: `${colors.primary}99` },
});

export default Start;