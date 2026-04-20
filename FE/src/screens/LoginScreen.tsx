// LoginScreen.tsx - FLUXO DE DOIS PASSOS CORRIGIDO
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
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const logoInteira = require('../styles/logoInteira.png');

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = email, 2 = password
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const emailOpacity = useRef(new Animated.Value(1)).current;
  const passwordOpacity = useRef(new Animated.Value(0)).current;
  const emailTranslateX = useRef(new Animated.Value(0)).current;
  const passwordTranslateX = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const errorShake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada
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

  const goToPasswordStep = () => {
    if (!email) {
      shakeError();
      Alert.alert('Erro', 'Por favor, insira o seu email');
      return;
    }
    if (!validateEmail(email)) {
      shakeError();
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    // Animação de transição para o passo 2
    Animated.parallel([
      Animated.timing(emailOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(emailTranslateX, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(passwordOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(passwordTranslateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(2);
    });
  };

  const goBackToEmail = () => {
    // Animação de transição para o passo 1
    Animated.parallel([
      Animated.timing(emailOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(emailTranslateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(passwordOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(passwordTranslateX, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(1);
    });
  };

  const handleLogin = async () => {
    if (!password) {
      shakeError();
      Alert.alert('Erro', 'Por favor, insira a sua palavra-passe');
      return;
    }

    // Animação do botão
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setIsSubmitting(true);
    
    try {
      await login(email, password);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } catch (error: any) {
      console.log('Erro no login:', error);
      
      let errorMessage = 'Ocorreu um erro no login';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Email ou senha incorretos';
          shakeError();
        } else if (error.response.status === 404) {
          errorMessage = 'Usuário não encontrado';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Não foi possível conectar ao servidor';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = () => {
    navigation.navigate('SignupScreen');
  };

  const handleGoBack = () => {
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Start');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const isLoading = authLoading || isSubmitting;

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

              {/* Passo 1: Email */}
              <Animated.View 
                style={[
                  styles.stepContainer,
                  {
                    opacity: emailOpacity,
                    transform: [{ translateX: emailTranslateX }],
                    position: step === 1 ? 'relative' : 'absolute',
                    zIndex: step === 1 ? 1 : 0,
                  }
                ]}
              >
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Qual o seu email?</Text>
                </View>

                <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: errorShake }] }]}>
                  <Icon name="email-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.fieldIcon} />
                  <TextInput
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
                    autoFocus
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
                    opacity: passwordOpacity,
                    transform: [{ translateX: passwordTranslateX }],
                    position: step === 2 ? 'relative' : 'absolute',
                    zIndex: step === 2 ? 1 : 0,
                  }
                ]}
              >
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Insira a sua palavra-passe</Text>
                </View>

                <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: errorShake }] }]}>
                  <Icon name="lock-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Palavra-passe"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
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

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#FF416C', '#FF4B2B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButtonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Text style={styles.loginButtonText}>Entrar</Text>
                          <Icon name="arrow-right" size={20} color="#FFFFFF" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity 
                  style={styles.backToEmailButton}
                  onPress={goBackToEmail}
                  activeOpacity={0.7}
                >
                  <Icon name="arrow-left" size={18} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.backToEmailText}>Voltar ao email</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Link para criar conta */}
              <View style={styles.signupSection}>
                <Text style={styles.signupText}>Não tem conta?</Text>
                <TouchableOpacity 
                  style={styles.signupButton}
                  onPress={handleSignup} 
                  activeOpacity={0.7}
                >
                  <Text style={styles.signupLink}> Criar conta</Text>
                  <Icon name="arrow-right" size={16} color="#FF416C" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    marginBottom: 40,
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
  },
  inputLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 24,
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
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  backToEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
    gap: 8,
  },
  backToEmailText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  signupLink: {
    color: '#FF416C',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;