// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

type User = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatarUrl?: string;
  _id?: string;
  role: 'admin' | 'user';
  isArcoAdmin?: boolean;
  arcoId?: string;
};

type AuthContextData = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (nome: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updateUserFromResponse: (userData: any) => void;
  updateToken: (newToken: string) => Promise<void>; // NOVA FUNÇÃO
  updateUserAndToken: (userData: any, newToken?: string) => Promise<void>; // NOVA FUNÇÃO
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@Appicarta:token');
        const storedUser = await AsyncStorage.getItem('@Appicarta:user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Configurar token global no api
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.log('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentando login com:', email);
      
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      console.log('Resposta do login:', response.data);

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        const formattedUser = {
          ...userData,
          id: userData._id || userData.id,
          _id: userData._id || userData.id,
          role: userData.role || 'user',
          isArcoAdmin: userData.isArcoAdmin || false,
          arcoId: userData.arcoId || null
        };
        
        setToken(newToken);
        setUser(formattedUser);
        
        // Configurar token global
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        await AsyncStorage.setItem('@Appicarta:token', newToken);
        await AsyncStorage.setItem('@Appicarta:user', JSON.stringify(formattedUser));
        
        console.log('Login bem sucedido, usuário:', formattedUser);
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(response.data.message || 'Login falhou'));
      }
    } catch (error: any) {
      console.log('Erro no login:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  };

  const signup = async (nome: string, email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/register', {
        nome,
        email,
        password
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        const formattedUser = {
          ...userData,
          id: userData._id || userData.id,
          _id: userData._id || userData.id,
          role: userData.role || 'user',
          isArcoAdmin: userData.isArcoAdmin || false,
          arcoId: userData.arcoId || null
        };
        
        setToken(newToken);
        setUser(formattedUser);
        
        // Configurar token global
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        await AsyncStorage.setItem('@Appicarta:token', newToken);
        await AsyncStorage.setItem('@Appicarta:user', JSON.stringify(formattedUser));
        
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(response.data.message || 'Registo falhou'));
      }
    } catch (error: any) {
      console.log('Erro no registo:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  };

  // Função para atualizar apenas o token
  const updateToken = async (newToken: string): Promise<void> => {
    try {
      console.log('Atualizando token no contexto...');
      
      setToken(newToken);
      
      // Configurar token global
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      await AsyncStorage.setItem('@Appicarta:token', newToken);
      
      console.log('✅ Token atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar token:', error);
      throw error;
    }
  };

  // Função para atualizar usuário e token ao mesmo tempo
  const updateUserAndToken = async (userData: any, newToken?: string): Promise<void> => {
    try {
      console.log('Atualizando usuário e token no contexto...');
      
      const formattedUser = {
        ...userData,
        id: userData._id || userData.id,
        _id: userData._id || userData.id,
        role: userData.role || 'user',
        isArcoAdmin: userData.isArcoAdmin || false,
        arcoId: userData.arcoId || null
      };
      
      setUser(formattedUser);
      await AsyncStorage.setItem('@Appicarta:user', JSON.stringify(formattedUser));
      
      if (newToken) {
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        await AsyncStorage.setItem('@Appicarta:token', newToken);
      }
      
      console.log('✅ Usuário e token atualizados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário e token:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('@Appicarta:user', JSON.stringify(updatedUser));
      console.log('Usuário atualizado:', updatedUser);
    }
  };

  const updateUserFromResponse = (userData: any) => {
    try {
      const formattedUser = {
        ...userData,
        id: userData._id || userData.id,
        _id: userData._id || userData.id,
        role: userData.role || 'user',
        isArcoAdmin: userData.isArcoAdmin || false,
        arcoId: userData.arcoId || null
      };
      
      console.log('Atualizando usuário no contexto:', formattedUser);
      setUser(formattedUser);
      AsyncStorage.setItem('@Appicarta:user', JSON.stringify(formattedUser));
    } catch (error) {
      console.log('Erro ao atualizar usuário:', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      
      // Remover token global
      delete api.defaults.headers.common['Authorization'];
      
      await AsyncStorage.multiRemove(['@Appicarta:token', '@Appicarta:user']);
      console.log('Logout realizado com sucesso');
      return Promise.resolve();
    } catch (error) {
      console.log('Erro no logout:', error);
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        updateUserFromResponse,
        updateToken,        // Adicionado
        updateUserAndToken, // Adicionado
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};