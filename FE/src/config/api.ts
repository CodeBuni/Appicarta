// src/config/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// CONFIGURAÇÃO PARA EXPO GO NO TELEMÓVEL
export const API_CONFIG = {
  BASE_URL: 'http://172.24.78.239:5001', // SEU IP ATUAL
  TIMEOUT: 30000,
};

console.log('📱 EXPO GO configurado para:', API_CONFIG.BASE_URL);
console.log('📱 Platform:', Platform.OS);
  
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de debug
api.interceptors.request.use(
  async (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    try {
      const token = await AsyncStorage.getItem('@Appicarta:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token adicionado');
      }
    } catch (error) {
      console.log('⚠️ Sem token');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} de ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Erro: ${error.message}`);
    console.error('URL:', error.config?.url);
    console.error('BaseURL:', error.config?.baseURL);
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 ERRO DE REDE - Verifique:');
      console.error('1. Servidor está rodando?');
      console.error('2. IP correto? (10.94.96.239:5001)');
      console.error('3. Mesma rede WiFi?');
      console.error('4. Firewall desativado?');
    }
    
    return Promise.reject(error);
  }
);

export default api;