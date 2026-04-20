import express from 'express';
import Dispositivo from '../models/dispositivo.js';
import Arco from '../models/arco.js';
import User from '../models/user.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ REGISTRAR NOVO DISPOSITIVO (AGORA OBRIGATÓRIO PARA USAR A APP)
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { deviceId, nome, localizacao } = req.body;
    const userId = req.user._id;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId é obrigatório'
      });
    }
    
    // Verificar se usuário tem arco
    const user = await User.findById(userId);
    if (!user.arcoId) {
      return res.status(400).json({
        success: false,
        message: 'Precisa criar ou juntar-se a um arco primeiro'
      });
    }
    
    // Verificar se já existe dispositivo para este arco
    const dispositivoExistente = await Dispositivo.findOne({ 
      arcoId: user.arcoId,
      status: 'ativo'
    });
    
    if (dispositivoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um dispositivo ativo para este arco',
        data: dispositivoExistente
      });
    }
    
    // Verificar se deviceId já está em uso noutro arco
    const deviceIdEmUso = await Dispositivo.findOne({ 
      deviceId,
      _id: { $ne: dispositivoExistente?._id }
    });
    
    if (deviceIdEmUso) {
      return res.status(400).json({
        success: false,
        message: 'Este deviceId já está registrado noutro arco'
      });
    }
    
    // Criar novo dispositivo
    const dispositivo = new Dispositivo({
      deviceId,
      nome: nome || 'Dispositivo de Correio',
      arcoId: user.arcoId,
      localizacao: localizacao || 'Entrada Principal',
      status: 'ativo'
    });
    
    await dispositivo.save();
    
    res.status(201).json({
      success: true,
      message: 'Dispositivo registrado com sucesso',
      data: dispositivo,
      systemReady: true
    });
    
  } catch (error) {
    console.error('Erro ao registrar dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar dispositivo'
    });
  }
});

// ✅ OBTER DISPOSITIVOS DO ARCO
router.get('/my-dispositivos', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user.arcoId) {
      return res.json({
        success: true,
        data: [],
        hasArco: false,
        message: 'Não pertence a um arco'
      });
    }
    
    const dispositivos = await Dispositivo.find({ arcoId: user.arcoId });
    
    const dispositivoAtivo = dispositivos.find(d => d.status === 'ativo');
    
    res.json({
      success: true,
      data: dispositivos,
      hasArco: true,
      hasActiveDevice: !!dispositivoAtivo,
      activeDevice: dispositivoAtivo || null
    });
    
  } catch (error) {
    console.error('Erro ao obter dispositivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter dispositivos'
    });
  }
});

// ✅ VERIFICAR STATUS DO SISTEMA (para frontend)
router.get('/system-status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('arcoId');
    
    let sistemaPronto = false;
    let mensagens = [];
    let acoes = [];
    
    if (!user) {
      mensagens.push('Utilizador não encontrado');
    } else if (!user.arcoId) {
      mensagens.push('❌ Precisa criar ou juntar-se a um arco familiar');
      acoes.push({
        tipo: 'criar_arco',
        texto: 'Criar Arco',
        rota: '/arco/create'
      });
    } else {
      // Tem arco, verificar dispositivo
      const dispositivo = await Dispositivo.findOne({
        arcoId: user.arcoId._id,
        status: 'ativo'
      });
      
      if (!dispositivo) {
        mensagens.push('⚠️ Precisa configurar um dispositivo para monitorizar a caixa de correio');
        acoes.push({
          tipo: 'registrar_dispositivo',
          texto: 'Registrar Dispositivo',
          rota: '/dispositivos/register'
        });
      } else {
        sistemaPronto = true;
        mensagens.push('✅ Sistema totalmente configurado e pronto');
      }
    }
    
    res.json({
      success: true,
      data: {
        sistemaPronto,
        usuario: {
          nome: user?.nome,
          email: user?.email,
          temArco: !!user?.arcoId,
          arcoNome: user?.arcoId?.nome
        },
        mensagens,
        acoes,
        timestamp: new Date()
      }
    });
    
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do sistema'
    });
  }
});

// ✅ ATUALIZAR DISPOSITIVO
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, localizacao, status } = req.body;
    const userId = req.user._id;
    
    const dispositivo = await Dispositivo.findById(id);
    
    if (!dispositivo) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }
    
    // Verificar permissões
    const user = await User.findById(userId);
    const arco = await Arco.findById(dispositivo.arcoId);
    
    if (!arco || arco.adminId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o administrador do arco pode atualizar dispositivos'
      });
    }
    
    // Atualizar campos
    if (nome !== undefined) dispositivo.nome = nome;
    if (localizacao !== undefined) dispositivo.localizacao = localizacao;
    if (status !== undefined && ['ativo', 'inativo', 'manutencao'].includes(status)) {
      dispositivo.status = status;
    }
    
    await dispositivo.save();
    
    res.json({
      success: true,
      message: 'Dispositivo atualizado com sucesso',
      data: dispositivo
    });
    
  } catch (error) {
    console.error('Erro ao atualizar dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar dispositivo'
    });
  }
});

export default router;