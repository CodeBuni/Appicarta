// SignupScreen.tsx - VERSÃO PREMIUM COM DOIS PASSOS E ANIMAÇÕES
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const logoInteira = require('../styles/logoInteira.png');

// ==================== POPUP PERSONALIZADO ====================
interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const CustomAlert = ({ visible, title, message, onClose, type = 'success' }: CustomAlertProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Icon name="check-circle" size={56} color="#4CAF50" />;
      case 'error':
        return <Icon name="alert-circle" size={56} color="#FF416C" />;
      default:
        return <Icon name="information" size={56} color="#FF416C" />;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.modalIcon}>{getIcon()}</View>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose} activeOpacity={0.8}>
            <LinearGradient
              colors={['#FF416C', '#FF4B2B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalButtonGradient}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const SignupScreen = () => {
  const navigation = useNavigation<any>();
  const { signup, isLoading: authLoading } = useAuth();
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = nome/email, 2 = password
  
  // Estados do popup personalizado
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: 'success' | 'error' }>({ title: '', message: '', type: 'success' });
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const step1Opacity = useRef(new Animated.Value(1)).current;
  const step2Opacity = useRef(new Animated.Value(0)).current;
  const step1TranslateX = useRef(new Animated.Value(0)).current;
  const step2TranslateX = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const errorShake = useRef(new Animated.Value(0)).current;

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(errorShake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const showCustomAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const goToPasswordStep = () => {
    if (!name.trim()) {
      shakeError();
      showCustomAlert('Erro', 'Por favor, insira o seu nome');
      return;
    }
    if (!email) {
      shakeError();
      showCustomAlert('Erro', 'Por favor, insira o seu email');
      return;
    }
    if (!validateEmail(email)) {
      shakeError();
      showCustomAlert('Erro', 'Por favor, insira um email válido');
      return;
    }

    Animated.parallel([
      Animated.timing(step1Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(step1TranslateX, { toValue: -50, duration: 300, useNativeDriver: true }),
      Animated.timing(step2Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(step2TranslateX, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setStep(2));
  };

  const goBackToStep1 = () => {
    Animated.parallel([
      Animated.timing(step1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(step1TranslateX, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(step2Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(step2TranslateX, { toValue: 50, duration: 300, useNativeDriver: true }),
    ]).start(() => setStep(1));
  };

  const handleSignup = async () => {
    if (!password) {
      shakeError();
      showCustomAlert('Erro', 'Por favor, insira a sua palavra-passe');
      return;
    }
    if (password.length < 6) {
      shakeError();
      showCustomAlert('Erro', 'A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setIsSubmitting(true);
    
    try {
      await signup(name, email, password);
      showCustomAlert('Sucesso!', 'Conta criada com sucesso!', 'success');
      setTimeout(() => {
        navigation.navigate('LoginScreen');
      }, 2000);
    } catch (error: any) {
      console.log('Erro no cadastro:', error);
      
      let errorMessage = 'Ocorreu um erro ao criar conta';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Email já está em uso';
        } else if (error.response.status === 422) {
          errorMessage = 'Dados inválidos';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Não foi possível conectar ao servidor';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showCustomAlert('Erro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handleGoBack = () => {
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Start');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: '', color: '', width: 0 };
    if (password.length < 6) return { text: 'Fraca', color: '#f44336', width: 33 };
    if (password.length < 8) return { text: 'Média', color: '#FF9800', width: 66 };
    return { text: 'Forte', color: '#4CAF50', width: 100 };
  };

  const isLoading = authLoading || isSubmitting;
  const strength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -40 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <LinearGradient
            colors={['#1a237e', '#283593', '#3949ab']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Fundo decorativo */}
            <View style={styles.backgroundOrbs}>
              <Animated.View style={[styles.orb1, { opacity: fadeAnim }]} />
              <Animated.View style={[styles.orb2, { opacity: fadeAnim }]} />
              <Animated.View style={[styles.orb3, { opacity: fadeAnim }]} />
            </View>

            {/* Seta de voltar */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: fadeAnim }] }}>
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </Animated.View>
            </TouchableOpacity>

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {/* Logo */}
              <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
                <Image 
                  source={logoInteira} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Indicador de passo */}
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, step === 1 && styles.stepDotActive]} />
                <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
                <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
              </View>

              {/* Passo 1: Nome e Email */}
              <Animated.View 
                style={[
                  styles.stepContainer,
                  {
                    opacity: step1Opacity,
                    transform: [{ translateX: step1TranslateX }],
                    position: step === 1 ? 'relative' : 'absolute',
                    zIndex: step === 1 ? 1 : 0,
                  }
                ]}
              >
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Como te chamas?</Text>
                </View>

                <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: errorShake }] }]}>
                  <Icon name="account-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.fieldIcon} />
                  <TextInput
                    ref={nameInputRef}
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                    selectionColor="#FF416C"
                  />
                  {name.length > 2 && <Icon name="check-circle" size={18} color="#4CAF50" />}
                </Animated.View>

                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Qual o teu email?</Text>
                </View>

                <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: errorShake }] }]}>
                  <Icon name="email-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.fieldIcon} />
                  <TextInput
                    ref={emailInputRef}
                    style={styles.input}
                    placeholder="exemplo@email.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={goToPasswordStep}
                    selectionColor="#FF416C"
                  />
                  {email.length > 0 && validateEmail(email) && (
                    <Icon name="check-circle" size={18} color="#4CAF50" />
                  )}
                </Animated.View>

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={goToPasswordStep}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#FF416C', '#FF4B2B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.nextButtonGradient}
                  >
                    <Text style={styles.nextButtonText}>Continuar</Text>
                    <Icon name="arrow-right" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Passo 2: Palavra-passe */}
              <Animated.View 
                style={[
                  styles.stepContainer,
                  {
                    opacity: step2Opacity,
                    transform: [{ translateX: step2TranslateX }],
                    position: step === 2 ? 'relative' : 'absolute',
                    zIndex: step === 2 ? 1 : 0,
                  }
                ]}
              >
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Cria uma palavra-passe</Text>
                </View>

                <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: errorShake }] }]}>
                  <Icon name="lock-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.fieldIcon} />
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSignup}
                    selectionColor="#FF416C"
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </TouchableOpacity>
                </Animated.View>

                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarBackground}>
                      <View style={[styles.strengthBar, { width: `${strength.width}%`, backgroundColor: strength.color }]} />
                    </View>
                    <Text style={[styles.strengthText, { color: strength.color }]}>{strength.text}</Text>
                  </View>
                )}

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={styles.signupButton}
                    onPress={handleSignup}
                    disabled={isLoading || password.length < 6}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#FF416C', '#FF4B2B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.signupButtonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Text style={styles.signupButtonText}>Criar Conta</Text>
                          <Icon name="arrow-right" size={20} color="#FFFFFF" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity 
                  style={styles.backToStep1Button}
                  onPress={goBackToStep1}
                  activeOpacity={0.7}
                >
                  <Icon name="arrow-left" size={18} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.backToStep1Text}>Voltar</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Link para login */}
              <View style={styles.loginSection}>
                <Text style={styles.loginText}>Já tem conta?</Text>
                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={handleLogin} 
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}> Entrar</Text>
                  <Icon name="arrow-right" size={16} color="#FF416C" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Popup personalizado */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type as 'success' | 'error' | 'info'}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  keyboardAvoid: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 65, 108, 0.1)',
    top: height * 0.1,
    right: -80,
  },
  orb2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 75, 43, 0.08)',
    bottom: height * 0.15,
    left: -50,
  },
  orb3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: height * 0.5,
    right: 40,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: width * 0.8,
    height: 100,
    maxWidth: 280,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepDotActive: {
    backgroundColor: '#FF416C',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#FF416C',
  },
  stepContainer: {
    width: '100%',
  },
  inputHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 18,
    height: 56,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  fieldIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  signupButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signupButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  backToStep1Button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
    gap: 8,
  },
  backToStep1Text: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  strengthBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 13,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  loginLink: {
    color: '#FF416C',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: width * 0.8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    borderRadius: 40,
    overflow: 'hidden',
    width: '100%',
  },
  modalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SignupScreen;