// src/routes/auth.js - VERSÃO CORRIGIDA E MELHORADA
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Arco from '../models/arco.js';
import authMiddleware from "../middleware/authMiddleware.js"; // CORRIGIDO: authMiddleware.js

const router = express.Router();

// ROTA DE TESTE (pública) - DEVE SER A PRIMEIRA
router.get('/test', (req, res) => {
  console.log('🧪 Teste de rota auth');
  res.json({
    success: true,
    message: 'Rota /api/auth funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me (protected)',
      update: 'PUT /api/auth/update-profile',
      changePassword: 'PUT /api/auth/change-password'
    }
  });
});

// REGISTRO
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registro recebido:', req.body);
    const { nome, email, password } = req.body;
    
    // Validações
    if (!nome || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e password são obrigatórios.'
      });
    }
    
    // Verificar se usuário já existe
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já registrado.'
      });
    }
    
    // Criar usuário
    const user = new User({
      nome,
      email: email.toLowerCase(),
      password,
      role: 'user' // Mudei para member por padrão
    });
    
    await user.save();
    
    // Gerar token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    // Remover password da resposta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    console.log('✅ Usuário registrado:', user.email);
    
    res.status(201).json({
      success: true,
      message: 'Registro realizado com sucesso!',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login recebido:', req.body.email);
    const { email, password } = req.body;
    
    // Validações
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e password são obrigatórios.'
      });
    }
    
    // Buscar usuário
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.'
      });
    }
    
    // Verificar password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Password inválida para:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.'
      });
    }
    
    // Atualizar último login
    user.ultimoLogin = new Date();
    await user.save();
    
    // Gerar token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    // Remover password da resposta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    console.log('✅ Login bem sucedido:', user.email);
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login.'
    });
  }
});

// PERFIL DO USUÁRIO (protegido) - ENDPOINT /me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log('👤 Buscando perfil do usuário:', req.user.email);
    
    // Popular o arco se existir
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('arcoId', 'nome codigoConvite members');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado.'
      });
    }
    
    // Se tiver arco, buscar membros
    let arcoData = null;
    if (user.arcoId) {
      arcoData = await Arco.findById(user.arcoId._id)
        .populate('members', 'nome email avatarUrl role')
        .populate('adminId', 'nome email');
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || '',
        avatarUrl: user.avatarUrl || '',
        role: user.role,
        arcoId: user.arcoId?._id || null,
        arco: arcoData
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ATUALIZAR PERFIL
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    console.log('✏️  Atualização de perfil recebida para:', req.user.email);
    console.log('Dados:', req.body);
    
    const { nome, email, telefone } = req.body;
    const userId = req.user._id;

    // Buscar usuário
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado.'
      });
    }

    // Verificar se o email já está em uso por outro utilizador
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso por outro utilizador.'
        });
      }
    }

    // Atualizar campos
    const updates = {};
    if (nome !== undefined && nome !== '') updates.nome = nome;
    if (email !== undefined && email !== '') updates.email = email.toLowerCase();
    if (telefone !== undefined) updates.telefone = telefone;
    
    // Aplicar atualizações
    Object.assign(user, updates);
    await user.save();

    // Preparar resposta
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Perfil atualizado:', user.email);
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: userResponse
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email duplicado.'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ALTERAR PASSWORD
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    // Validações
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password atual e nova password são obrigatórias.'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova password deve ter pelo menos 6 caracteres.'
      });
    }

    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado.'
      });
    }

    // Verificar password atual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password atual incorreta.'
      });
    }

    // Atualizar password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password alterada com sucesso!'
    });
    
  } catch (error) {
    console.error('❌ Erro ao alterar password:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar password.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// VERIFICAÇÃO DE TOKEN (para debug)
router.get('/verify-token', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: {
      _id: req.user._id,
      nome: req.user.nome,
      email: req.user.email
    }
  });
});

// ROTA DE HEALTH CHECK
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'auth-service',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

export default router;