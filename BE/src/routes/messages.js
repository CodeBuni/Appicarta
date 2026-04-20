// routes/messages.js - VERSÃO COM NOTIFICAÇÕES
import express from 'express';
import Message from '../models/message.js';
import User from '../models/user.js';
import Arco from '../models/arco.js';
import authMiddleware from '../middleware/authMiddleware.js';
import NotificationService from '../services/notificationService.js';

const router = express.Router();

// Enviar mensagem
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { toUserId, toArcoId, content } = req.body;
    const fromUserId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'O conteúdo da mensagem é obrigatório'
      });
    }

    const messageData = {
      fromUserId,
      content: content.trim(),
      readBy: [{ userId: fromUserId }]
    };

    if (toUserId) {
      // Mensagem individual
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({
          success: false,
          message: 'Utilizador não encontrado'
        });
      }
      messageData.toUserId = toUserId;
    } else if (toArcoId) {
      // Mensagem para arco
      const arco = await Arco.findById(toArcoId);
      if (!arco) {
        return res.status(404).json({
          success: false,
          message: 'Arco não encontrado'
        });
      }
      messageData.toArcoId = toArcoId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Destinatário (toUserId ou toArcoId) é obrigatório'
      });
    }

    const message = new Message(messageData);
    await message.save();

    // 🔔 CRIAR NOTIFICAÇÃO DE MENSAGEM (apenas para mensagens de arco)
    if (toArcoId) {
      try {
        const sender = await User.findById(fromUserId);
        const arco = await Arco.findById(toArcoId).populate('members');
        
        if (sender && arco) {
          await NotificationService.onNewMessage(message, sender, arco);
        }
      } catch (notifError) {
        console.error('⚠️ Erro ao criar notificação de mensagem:', notifError);
      }
    }

    // Popular dados do remetente
    await message.populate('fromUserId', 'nome email avatarUrl');

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: message
    });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem'
    });
  }
});

// Obter conversas do usuário
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('arcoId');
    const conversations = [];

    // 1. Se o usuário tem arco, adicionar conversas com todos os membros
    if (user.arcoId) {
      const arco = await Arco.findById(user.arcoId._id)
        .populate('members', 'nome avatarUrl role telefone');
      
      // Adicionar conversa do grupo do arco
      const arcoLastMessage = await Message.findOne({ toArcoId: user.arcoId._id })
        .sort({ createdAt: -1 })
        .populate('fromUserId', 'nome');

      const unreadArcoMessages = await Message.countDocuments({
        toArcoId: user.arcoId._id,
        'readBy.userId': { $ne: userId },
        fromUserId: { $ne: userId }
      });

      conversations.push({
        id: user.arcoId._id,
        type: 'group',
        name: `Arco: ${arco.nome}`,
        members: arco.members.length,
        lastMessage: arcoLastMessage ? 
          `${arcoLastMessage.fromUserId.nome}: ${arcoLastMessage.content}` : 
          'Comece a conversar com sua família',
        lastMessageTime: arcoLastMessage?.createdAt || new Date(),
        unread: unreadArcoMessages,
        isArcGroup: true,
        avatarUrl: null
      });

      // 2. Adicionar conversas individuais com TODOS os membros do arco
      for (const member of arco.members) {
        if (member._id.toString() !== userId.toString()) {
          // Verificar se já existe conversa com este membro
          const lastMessage = await Message.findOne({
            $or: [
              { fromUserId: userId, toUserId: member._id },
              { fromUserId: member._id, toUserId: userId }
            ]
          }).sort({ createdAt: -1 });

          const unreadMessages = await Message.countDocuments({
            fromUserId: member._id,
            toUserId: userId,
            'readBy.userId': { $ne: userId }
          });

          conversations.push({
            id: member._id,
            type: 'individual',
            name: member.nome,
            role: member.role || 'member',
            avatarUrl: member.avatarUrl,
            telefone: member.telefone,
            lastMessage: lastMessage ? lastMessage.content : 'Comece uma conversa...',
            lastMessageTime: lastMessage ? lastMessage.createdAt : new Date(),
            unread: unreadMessages,
            isOnline: true
          });
        }
      }
    }

    // 3. Adicionar outras conversas individuais (fora do arco)
    const otherConversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { fromUserId: userId, toUserId: { $exists: true } },
            { toUserId: userId }
          ],
          $expr: {
            $cond: [
              { $eq: ["$fromUserId", userId] },
              { $not: { $in: ["$toUserId", user.arcoId ? user.arcoId.members : []] } },
              { $not: { $in: ["$fromUserId", user.arcoId ? user.arcoId.members : []] } }
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$fromUserId", userId] },
              "$toUserId",
              "$fromUserId"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$toUserId", userId] },
                    { $not: { $in: [userId, "$readBy.userId"] } }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    for (const conv of otherConversations) {
      const otherUserId = conv._id;
      const otherUser = await User.findById(otherUserId)
        .select('nome email avatarUrl role telefone');

      if (otherUser) {
        conversations.push({
          id: otherUser._id,
          type: 'individual',
          name: otherUser.nome,
          role: otherUser.role,
          avatarUrl: otherUser.avatarUrl,
          telefone: otherUser.telefone,
          lastMessage: conv.lastMessage.content,
          lastMessageTime: conv.lastMessage.createdAt,
          unread: conv.unreadCount,
          isOnline: false
        });
      }
    }

    // Ordenar por última mensagem
    conversations.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Erro ao obter conversas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter conversas'
    });
  }
});
// Obter mensagens de uma conversa
router.get('/conversation/:targetId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const targetId = req.params.targetId;

    // Verificar se é arco ou usuário
    const isArco = await Arco.exists({ _id: targetId });
    const isUser = await User.exists({ _id: targetId });

    let messages;
    
    if (isArco) {
      // Mensagens do arco
      messages = await Message.find({ toArcoId: targetId })
        .sort({ createdAt: 1 })
        .populate('fromUserId', 'nome avatarUrl')
        .limit(100);
      
      // Marcar como lida para este usuário
      await Message.updateMany(
        { 
          toArcoId: targetId,
          'readBy.userId': { $ne: userId },
          fromUserId: { $ne: userId }
        },
        { $push: { readBy: { userId } } }
      );
    } else if (isUser) {
      // Mensagens individuais
      messages = await Message.find({
        $or: [
          { fromUserId: userId, toUserId: targetId },
          { fromUserId: targetId, toUserId: userId }
        ]
      })
      .sort({ createdAt: 1 })
      .populate('fromUserId', 'nome avatarUrl')
      .limit(100);
      
      // Marcar como lida
      await Message.updateMany(
        { fromUserId: targetId, toUserId: userId, 'readBy.userId': { $ne: userId } },
        { $push: { readBy: { userId } } }
      );
    } else {
      return res.status(404).json({
        success: false,
        message: 'Conversa não encontrada'
      });
    }

    // Obter informações do destinatário
    let recipientInfo = {};
    if (isArco) {
      const arco = await Arco.findById(targetId)
        .populate('members', 'nome avatarUrl role');
      recipientInfo = {
        type: 'group',
        name: arco.nome,
        members: arco.members
      };
    } else {
      const user = await User.findById(targetId)
        .select('nome email avatarUrl role telefone');
      recipientInfo = {
        type: 'individual',
        name: user.nome,
        avatarUrl: user.avatarUrl,
        role: user.role,
        telefone: user.telefone
      };
    }

    res.json({
      success: true,
      data: {
        recipient: recipientInfo,
        messages: messages
      }
    });

  } catch (error) {
    console.error('Erro ao obter conversa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter conversa'
    });
  }
});

// Obter membros do arco para a tela de mensagens
router.get('/arco-members', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate('arcoId');
    if (!user.arcoId) {
      return res.json({
        success: true,
        data: []
      });
    }

    const arco = await Arco.findById(user.arcoId._id)
      .populate('members', 'nome avatarUrl role telefone');
    
    // Filtrar o próprio usuário e ordenar por nome
    const members = arco.members
      .filter(member => member._id.toString() !== userId.toString())
      .sort((a, b) => a.nome.localeCompare(b.nome));

    res.json({
      success: true,
      data: members
    });

  } catch (error) {
    console.error('Erro ao obter membros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter membros do arco'
    });
  }
});

// Obter estatísticas de mensagens
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('arcoId');

    const totalMessages = await Message.countDocuments({
      $or: [
        { fromUserId: userId },
        { toUserId: userId },
        { toArcoId: user.arcoId?._id }
      ]
    });

    const unreadMessages = await Message.countDocuments({
      $or: [
        { toUserId: userId, 'readBy.userId': { $ne: userId } },
        { 
          toArcoId: user.arcoId?._id, 
          'readBy.userId': { $ne: userId },
          fromUserId: { $ne: userId }
        }
      ]
    });

    res.json({
      success: true,
      data: {
        totalMessages,
        unreadMessages
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

export default router;