// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 Verificando autenticação...');
    
    // Verificar se o token existe
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    console.log('Token recebido:', token ? 'Sim' : 'Não');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Token não fornecido.'
      });
    }

    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);
    
    // Buscar usuário
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Utilizador não encontrado.'
      });
    }

    // Adicionar usuário à requisição
    req.user = user;
    req.userId = decoded.userId;
    
    console.log(`✅ Usuário autenticado: ${user.email}`);
    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro na autenticação.'
    });
  }
};

export default authMiddleware;