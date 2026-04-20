import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Arco from '../models/arco.js';
import User from '../models/user.js';
import authMiddleware from '../middleware/authMiddleware.js';
import NotificationService from '../services/notificationService.js';

const router = express.Router();

// ==================== ENDPOINTS DO ARCO ====================

// GET /api/arco/my-arco - Obter arco do usuário
router.get('/my-arco', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Buscar usuário com arcoId
    const user = await User.findById(userId).select('arcoId nome email role isArcoAdmin');
    
    if (!user || !user.arcoId) {
      return res.json({
        success: true,
        data: null,
        message: 'Não pertence a nenhum arco familiar'
      });
    }

    // Buscar arco com membros e admin populados
    const arco = await Arco.findById(user.arcoId)
      .populate('adminId', 'nome email avatarUrl telefone role isArcoAdmin')
      .populate('members', 'nome email avatarUrl telefone role isArcoAdmin');

    if (!arco) {
      // Se arco não existe mais, limpar referência do usuário
      user.arcoId = null;
      user.isArcoAdmin = false;
      user.role = 'user';
      await user.save();
      
      return res.json({
        success: true,
        data: null,
        message: 'Arco não encontrado. Sua associação foi removida.'
      });
    }

    // Verificar se o usuário ainda é membro
    const isMember = arco.members.some(member => 
      member._id.toString() === userId.toString()
    );
    
    if (!isMember) {
      // Remover associação se não é mais membro
      user.arcoId = null;
      user.isArcoAdmin = false;
      user.role = 'user';
      await user.save();
      
      return res.json({
        success: true,
        data: null,
        message: 'Você não é mais membro deste arco'
      });
    }

    res.json({
      success: true,
      data: arco
    });
  } catch (error) {
    console.error('Erro ao obter arco:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter informações do arco' 
    });
  }
});

// POST /api/arco/create - Criar novo arco
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { nome } = req.body;
    const adminId = req.user._id;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome do arco é obrigatório'
      });
    }

    // Verificar se usuário já tem arco
    const user = await User.findById(adminId);
    if (user.arcoId) {
      return res.status(400).json({
        success: false,
        message: 'Já pertence a um arco familiar'
      });
    }

    // Gerar código único
    const codigoConvite = await Arco.gerarCodigoConvite();
    
    // Criar novo arco
    const arco = new Arco({
      nome: nome.trim(),
      codigoConvite,
      adminId,
      members: [adminId]
    });

    await arco.save();

    // Atualizar usuário
    user.arcoId = arco._id;
    user.isArcoAdmin = true;
    user.role = 'admin';
    await user.save();

    // 🔥 ADICIONAR INFORMAÇÃO SOBRE DISPOSITIVO
    const dispositivoInfo = {
      configured: false,
      message: 'Configure um dispositivo para começar a monitorizar a caixa de correio'
    };

    // Gerar novo token (manter existente)
    const newToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: 'admin',
        isArcoAdmin: true,
        arcoId: arco._id,
        deviceConfigured: false // 🔥 NOVO: informação sobre dispositivo
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    // Notificação
    try {
      await NotificationService.onArcoCreated(arco, user);
    } catch (notifError) {
      console.error('Erro na notificação:', notifError);
    }

    // Popular dados
    const populatedArco = await Arco.findById(arco._id)
      .populate('adminId', 'nome email avatarUrl telefone role isArcoAdmin')
      .populate('members', 'nome email avatarUrl telefone role isArcoAdmin');

    res.json({
      success: true,
      message: 'Arco familiar criado com sucesso!',
      token: newToken,
      data: {
        ...populatedArco.toObject(),
        dispositivoInfo // 🔥 ADICIONAR
      },
      systemStatus: {
        hasArco: true,
        hasDevice: false,
        nextStep: 'configure_device'
      }
    });
  } catch (error) {
    console.error('Erro ao criar arco:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erro ao criar arco' 
    });
  }
});

// POST /api/arco/join - Juntar-se a arco existente
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { codigoConvite } = req.body;
    const userId = req.user._id;

    if (!codigoConvite) {
      return res.status(400).json({
        success: false,
        message: 'Código de convite é obrigatório'
      });
    }

    const user = await User.findById(userId);
    if (user.arcoId) {
      return res.status(400).json({
        success: false,
        message: 'Já pertence a um arco familiar'
      });
    }

    // Buscar arco pelo código
    const arco = await Arco.findOne({ 
      codigoConvite: codigoConvite.toUpperCase(),
      ativo: true 
    });

    if (!arco) {
      return res.status(404).json({
        success: false,
        message: 'Código de convite inválido ou arco inativo'
      });
    }

    // Verificar se já é membro
    const jaMembro = arco.members.some(
      memberId => memberId.toString() === userId.toString()
    );
    
    if (jaMembro) {
      return res.status(400).json({
        success: false,
        message: 'Já é membro deste arco'
      });
    }

    // Adicionar como membro
    await arco.adicionarMembro(userId);

    // Atualizar usuário
    user.arcoId = arco._id;
    user.isArcoAdmin = false;
    user.role = 'user';
    await user.save();

    // Gerar novo token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: 'user',
        isArcoAdmin: false,
        arcoId: arco._id
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    // Notificação
    try {
      await NotificationService.onUserJoinedArco(user, arco);
    } catch (notifError) {
      console.error('Erro na notificação:', notifError);
    }

    res.json({
      success: true,
      message: 'Juntou-se ao arco familiar com sucesso',
      token: newToken,
      data: arco
    });
  } catch (error) {
    console.error('Erro ao juntar-se ao arco:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao juntar-se ao arco' 
    });
  }
});

// PUT /api/arco/rename - Renomear arco
router.put('/rename', authMiddleware, async (req, res) => {
  try {
    const { nome } = req.body;
    const userId = req.user._id;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Novo nome é obrigatório'
      });
    }

    // Buscar arco onde usuário é admin
    const arco = await Arco.findOne({ 
      adminId: userId,
      ativo: true 
    });

    if (!arco) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o administrador pode renomear o arco'
      });
    }

    // Atualizar nome
    arco.nome = nome.trim();
    await arco.save();

    res.json({
      success: true,
      message: 'Arco renomeado com sucesso',
      data: arco
    });
  } catch (error) {
    console.error('Erro ao renomear arco:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao renomear arco' 
    });
  }
});

// POST /api/arco/regenerate-code - Regenerar código de convite
router.post('/regenerate-code', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar arco onde usuário é admin
    const arco = await Arco.findOne({ 
      adminId: userId,
      ativo: true 
    });

    if (!arco) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o administrador pode regenerar o código'
      });
    }

    // Gerar novo código
    const novoCodigo = await Arco.gerarCodigoConvite();
    arco.codigoConvite = novoCodigo;
    await arco.save();

    res.json({
      success: true,
      message: 'Código regenerado com sucesso',
      data: {
        codigoConvite: novoCodigo,
        arcoNome: arco.nome
      }
    });
  } catch (error) {
    console.error('Erro ao regenerar código:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erro ao regenerar código' 
    });
  }
});

// PUT /api/arco/make-admin/:memberId - Tornar membro administrador
router.put('/make-admin/:memberId', authMiddleware, async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user._id;

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do membro inválido'
      });
    }

    // Buscar arco onde usuário é admin
    const arco = await Arco.findOne({ 
      adminId: userId,
      ativo: true 
    });

    if (!arco) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o administrador pode transferir administração'
      });
    }

    // Verificar se membro pertence ao arco
    const isMember = arco.members.some(id => id.toString() === memberId);
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'Membro não encontrado no arco'
      });
    }

    // Buscar usuários
    const oldAdmin = await User.findById(userId);
    const newAdmin = await User.findById(memberId);

    if (!oldAdmin || !newAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar arco
    arco.adminId = memberId;
    await arco.save();

    // Atualizar roles
    oldAdmin.isArcoAdmin = false;
    oldAdmin.role = 'user';
    await oldAdmin.save();

    newAdmin.isArcoAdmin = true;
    newAdmin.role = 'admin';
    await newAdmin.save();

    // Gerar novos tokens
    const oldAdminToken = jwt.sign(
      { 
        userId: oldAdmin._id,
        email: oldAdmin.email,
        role: 'user',
        isArcoAdmin: false,
        arcoId: arco._id
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    const newAdminToken = jwt.sign(
      { 
        userId: newAdmin._id,
        email: newAdmin.email,
        role: 'admin',
        isArcoAdmin: true,
        arcoId: arco._id
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    // Notificação
    try {
      await NotificationService.onAdminTransferred(arco, oldAdmin, newAdmin);
    } catch (notifError) {
      console.error('Erro na notificação:', notifError);
    }

    res.json({
      success: true,
      message: 'Administração transferida com sucesso',
      data: {
        oldAdminToken,
        newAdminToken,
        arcoNome: arco.nome
      }
    });
  } catch (error) {
    console.error('Erro ao transferir administração:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao transferir administração' 
    });
  }
});

// DELETE /api/arco/remove-member/:memberId - Remover membro do arco
router.delete('/remove-member/:memberId', authMiddleware, async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user._id;

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do membro inválido'
      });
    }

    // Verificar se não está tentando remover a si mesmo
    if (memberId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Não pode remover a si mesmo. Use a opção "Sair do Arco".'
      });
    }

    // Buscar arco onde usuário é admin
    const arco = await Arco.findOne({ 
      adminId: userId,
      ativo: true 
    });

    if (!arco) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o administrador pode remover membros'
      });
    }

    // Verificar se membro pertence ao arco
    const isMember = arco.members.some(id => id.toString() === memberId);
    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: 'Membro não encontrado no arco'
      });
    }

    // Buscar membro a ser removido
    const memberToRemove = await User.findById(memberId);
    if (!memberToRemove) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Remover do arco
    await arco.removerMembro(memberId);

    // Atualizar usuário removido
    memberToRemove.arcoId = null;
    memberToRemove.isArcoAdmin = false;
    memberToRemove.role = 'user';
    await memberToRemove.save();

    // Gerar novo token para o usuário removido
    const newToken = jwt.sign(
      { 
        userId: memberToRemove._id,
        email: memberToRemove.email,
        role: 'user',
        isArcoAdmin: false,
        arcoId: null
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    // Notificação
    try {
      await NotificationService.onUserRemovedFromArco(memberToRemove, arco, req.user);
    } catch (notifError) {
      console.error('Erro na notificação:', notifError);
    }

    res.json({
      success: true,
      message: 'Membro removido com sucesso',
      data: {
        removedUserId: memberId,
        newToken: memberToRemove._id.toString() === userId.toString() ? newToken : undefined
      }
    });
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao remover membro' 
    });
  }
});

// DELETE /api/arco/leave - Sair do arco
router.delete('/leave', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.arcoId) {
      return res.status(400).json({
        success: false,
        message: 'Não pertence a nenhum arco'
      });
    }

    const arco = await Arco.findById(user.arcoId);
    if (!arco) {
      // Arco não existe mais
      user.arcoId = null;
      user.isArcoAdmin = false;
      user.role = 'user';
      await user.save();

      const newToken = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          role: 'user',
          isArcoAdmin: false,
          arcoId: null
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        message: 'Saiu do arco com sucesso',
        token: newToken
      });
    }

    // Verificar se é administrador
    const isAdmin = arco.adminId.toString() === userId.toString();

    if (isAdmin) {
      // Administrador tentando sair
      if (arco.members.length === 1) {
        // Único membro - desativar arco
        arco.ativo = false;
        arco.members = [];
        await arco.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Administrador não pode sair do arco. Transfira a administração primeiro.'
        });
      }
    } else {
      // Membro normal - remover do arco
      await arco.removerMembro(userId);
    }

    // Atualizar usuário
    user.arcoId = null;
    user.isArcoAdmin = false;
    user.role = 'user';
    await user.save();

    // Gerar novo token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: 'user',
        isArcoAdmin: false,
        arcoId: null
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    // Notificação (se não for admin único saindo)
    if (!isAdmin || arco.members.length > 0) {
      try {
        await NotificationService.onUserLeftArco(user, arco);
      } catch (notifError) {
        console.error('Erro na notificação:', notifError);
      }
    }

    res.json({
      success: true,
      message: 'Saiu do arco com sucesso',
      token: newToken
    });
  } catch (error) {
    console.error('Erro ao sair do arco:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao sair do arco' 
    });
  }
});

// GET /api/arco/members-details - Obter detalhes dos membros
router.get('/members-details', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.arcoId) {
      return res.json({
        success: true,
        data: [],
        message: 'Não pertence a nenhum arco'
      });
    }

    const arco = await Arco.findById(user.arcoId);
    if (!arco || !arco.ativo) {
      return res.json({
        success: true,
        data: [],
        message: 'Arco não encontrado ou inativo'
      });
    }

    // Obter membros detalhados usando o método do modelo
    const membrosDetalhados = await arco.getMembrosDetalhados();

    // Formatar resposta
    const membrosFormatados = membrosDetalhados.map(membro => ({
      _id: membro._id.toString(),
      nome: membro.nome || 'Membro',
      email: membro.email || '',
      avatarUrl: membro.avatarUrl || '',
      telefone: membro.telefone || '',
      role: membro.role || 'user',
      isArcoAdmin: membro.isArcoAdmin || false,
      isAdmin: membro._id.toString() === arco.adminId.toString()
    }));

    res.json({
      success: true,
      data: membrosFormatados
    });
  } catch (error) {
    console.error('Erro ao obter detalhes dos membros:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter detalhes dos membros' 
    });
  }
});

// GET /api/arco/invite-code - Obter código de convite
router.get('/invite-code', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.arcoId) {
      return res.status(400).json({
        success: false,
        message: 'Não pertence a nenhum arco'
      });
    }

    const arco = await Arco.findById(user.arcoId);
    if (!arco || !arco.ativo) {
      return res.status(404).json({
        success: false,
        message: 'Arco não encontrado ou inativo'
      });
    }

    // Verificar se é administrador
    const isAdmin = arco.adminId.toString() === userId.toString();
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o administrador pode ver o código de convite'
      });
    }

    res.json({
      success: true,
      data: {
        codigoConvite: arco.codigoConvite,
        arcoNome: arco.nome,
        totalMembros: arco.members.length,
        criadoEm: arco.dataCriacao
      }
    });
  } catch (error) {
    console.error('Erro ao obter código de convite:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter código de convite' 
    });
  }
});

// GET /api/arco/check-admin - Verificar status de administrador
router.get('/check-admin', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.arcoId) {
      return res.json({
        success: true,
        data: {
          isAdmin: false,
          hasArco: false,
          message: 'Não pertence a nenhum arco'
        }
      });
    }

    const arco = await Arco.findById(user.arcoId);
    const isAdmin = arco && arco.adminId.toString() === userId.toString();

    res.json({
      success: true,
      data: {
        isAdmin,
        hasArco: true,
        arcoId: user.arcoId,
        arcoNome: arco?.nome,
        codigoConvite: arco?.codigoConvite,
        numMembros: arco?.members.length || 0
      }
    });
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar status de administrador' 
    });
  }
});

// GET /api/arco/stats - Estatísticas do arco
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.arcoId) {
      return res.status(400).json({
        success: false,
        message: 'Não pertence a nenhum arco'
      });
    }

    const arco = await Arco.findById(user.arcoId)
      .populate('members', 'nome role');
    
    if (!arco) {
      return res.status(404).json({
        success: false,
        message: 'Arco não encontrado'
      });
    }

    // Contar membros por role
    const adminCount = arco.members.filter(m => m.role === 'admin').length;
    const userCount = arco.members.filter(m => m.role === 'user').length;

    res.json({
      success: true,
      data: {
        totalMembros: arco.members.length,
        adminCount,
        userCount,
        criadoEm: arco.dataCriacao,
        ultimaAtividade: arco.ultimaAtividade,
        ativo: arco.ativo
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter estatísticas do arco' 
    });
  }
});

// GET /api/arco/test - Testar rota
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota /arco está funcionando',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET    /my-arco',
      'POST   /create',
      'POST   /join',
      'PUT    /rename',
      'POST   /regenerate-code',
      'PUT    /make-admin/:id',
      'DELETE /remove-member/:id',
      'DELETE /leave',
      'GET    /members-details',
      'GET    /check-admin',
      'GET    /invite-code',
      'GET    /stats'
    ]
  });
});

export default router;