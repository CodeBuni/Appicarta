import express from 'express';
import mongoose from 'mongoose'; // ADICIONADO
import Notification from '../models/notification.js'; // SINGULAR
import authMiddleware from '../middleware/authMiddleware.js'; // CORRIGIDO: authMiddleware.js

const router = express.Router();

// TESTE DO ENDPOINT
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint /notifications funcionando',
    timestamp: new Date().toISOString()
  });
});

// Obter notificações do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      unreadOnly = false,
      type
    } = req.query;
    
    // Construir query
    let query = { userId: req.user._id };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    if (type && ['mail', 'package', 'message', 'arco', 'system', 'alert', 'request'].includes(type)) {
      query.type = type;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments({ userId: req.user._id });
    const unread = await Notification.countDocuments({ 
      userId: req.user._id, 
      read: false 
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          unread,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter notificações:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter notificações'
    });
  }
});

// Criar notificação
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, title, message, data } = req.body;
    const userId = req.user._id;
    
    // Validação
    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tipo, título e mensagem são obrigatórios'
      });
    }
    
    const validTypes = ['mail', 'package', 'message', 'arco', 'system', 'alert', 'request'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Tipo inválido. Use: ${validTypes.join(', ')}`
      });
    }
    
    const notification = await Notification.createNotification(
      userId,
      type,
      title,
      message,
      data || {}
    );
    
    res.status(201).json({
      success: true,
      message: 'Notificação criada com sucesso',
      data: notification
    });
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar notificação'
    });
  }
});

// Obter contagem de não lidas
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });
    
    res.json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter contagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter contagem'
    });
  }
});

// Marcar como lida
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.user._id 
      },
      { 
        read: true,
        readAt: new Date()
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Notificação marcada como lida',
      data: notification
    });
  } catch (error) {
    console.error('❌ Erro ao marcar como lida:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao marcar como lida' 
    });
  }
});

// Marcar todas como lidas
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { 
        userId: req.user._id, 
        read: false 
      },
      { 
        read: true,
        readAt: new Date()
      }
    );
    
    res.json({ 
      success: true, 
      message: 'Todas as notificações marcadas como lidas',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('❌ Erro ao marcar notificações:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao marcar notificações' 
    });
  }
});

// Deletar notificação
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Notificação deletada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar notificação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar notificação' 
    });
  }
});

export default router;