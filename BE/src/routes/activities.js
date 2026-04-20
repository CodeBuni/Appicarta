// routes/activities.js
import express from 'express';
import Notification from '../models/notification.js';
import Message from '../models/message.js';
import Arco from '../models/arco.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Obter atividades recentes do usuário
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    
    // Buscar notificações recentes
    const notifications = await Notification.find({
      userId: userId,
      type: { $in: ['mail', 'package', 'arco', 'system', 'alert', 'request', 'message'] }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
    
    // Buscar mensagens não lidas recentes
    const unreadMessages = await Message.find({
      $or: [
        { toUserId: userId, 'readBy.userId': { $ne: userId } },
        { toArcoId: { $exists: true }, 'readBy.userId': { $ne: userId } }
      ]
    })
    .populate('fromUserId', 'nome')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
    
    // Formatar mensagens como atividades
    const messageActivities = unreadMessages.map(msg => ({
      _id: msg._id,
      type: 'message',
      title: 'Nova mensagem',
      message: msg.fromUserId 
        ? `${msg.fromUserId.nome}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`
        : msg.content.substring(0, 50),
      createdAt: msg.createdAt,
      read: msg.readBy.some(r => r.userId.toString() === userId.toString()),
      data: {
        messageId: msg._id,
        fromUserId: msg.fromUserId?._id,
        toArcoId: msg.toArcoId
      }
    }));
    
    // Combinar e ordenar por data
    const allActivities = [...notifications, ...messageActivities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    
    // Marcar notificações como lidas se necessário
    const unreadIds = notifications
      .filter(n => !n.read)
      .map(n => n._id);
    
    if (unreadIds.length > 0 && req.query.markAsRead === 'true') {
      await Notification.updateMany(
        { _id: { $in: unreadIds } },
        { $set: { read: true } }
      );
    }
    
    res.json({
      success: true,
      data: allActivities,
      count: allActivities.length,
      unreadCount: unreadIds.length
    });
    
  } catch (error) {
    console.error('Erro ao obter atividades recentes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter atividades recentes' 
    });
  }
});

// Obter estatísticas de atividade
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Contar notificações não lidas
    const unreadNotifications = await Notification.countDocuments({
      userId: userId,
      read: false
    });
    
    // Contar mensagens não lidas
    const unreadMessages = await Message.countDocuments({
      $or: [
        { toUserId: userId, 'readBy.userId': { $ne: userId } },
        { 
          toArcoId: { $exists: true },
          'readBy.userId': { $ne: userId },
          fromUserId: { $ne: userId }
        }
      ]
    });
    
    // Obter última atividade
    const lastActivity = await Notification.findOne({ userId })
      .sort({ createdAt: -1 })
      .select('type title createdAt')
      .lean();
    
    res.json({
      success: true,
      data: {
        unreadNotifications,
        unreadMessages,
        totalUnread: unreadNotifications + unreadMessages,
        lastActivity
      }
    });
    
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter estatísticas' 
    });
  }
});

// Criar atividade/notificação
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { type, title, message, data } = req.body;
    const userId = req.user._id;
    
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data: { ...data, createdBy: userId }
    });
    
    await notification.save();

    res.json({
      success: true,
      message: 'Atividade registrada com sucesso',
      data: notification
    });
    
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar atividade' 
    });
  }
});

// Limpar atividades antigas
router.delete('/cleanup', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await Notification.deleteMany({
      userId,
      createdAt: { $lt: cutoffDate },
      read: true
    });
    
    res.json({
      success: true,
      message: `Atividades antigas limpas`,
      data: {
        deletedCount: result.deletedCount
      }
    });
    
  } catch (error) {
    console.error('Erro ao limpar atividades:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao limpar atividades' 
    });
  }
});

export default router;