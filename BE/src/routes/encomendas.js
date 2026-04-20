import express from 'express';
import Encomenda from '../models/encomenda.js';
import EncomendaManual from '../models/encomendaManual.js'; 
import TrackingService from '../services/trackingService.js';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/user.js';

const router = express.Router();

// =========== ROTAS PARA ENCOMENDAS COM TRACKING ===========

// Adicionar nova encomenda COM tracking
router.post('/nova', authMiddleware, async (req, res) => {
  try {
    const { trackingNumber, transportadora, titulo, descricao, notificarAoEntregar } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    console.log(`📦 Novo pedido de encomenda de: ${userEmail}`);
    console.log('📋 Dados recebidos:', { trackingNumber, transportadora, titulo, descricao });

    // Validações
    if (!trackingNumber || !transportadora) {
      return res.status(400).json({
        success: false,
        message: 'Número de tracking e transportadora são obrigatórios'
      });
    }

    // Formatar tracking number
    const formattedTrackingNumber = trackingNumber.trim().toUpperCase();

    // Verificar se o usuário tem arco
    const user = await User.findById(userId);
    if (!user || !user.arcoId) {
      return res.status(400).json({
        success: false,
        message: 'Precisa pertencer a um arco para adicionar encomendas'
      });
    }

    // VERIFICAR se já existe este tracking
    const existeNoBanco = await Encomenda.findOne({
      trackingNumber: formattedTrackingNumber,
      transportadora,
      arcoId: user.arcoId
    });

    if (existeNoBanco) {
      console.log(`⚠️  Tracking ${formattedTrackingNumber} já existe no banco para este arco`);
      
      return res.status(400).json({
        success: false,
        message: 'Esta encomenda já está a ser rastreada no seu arco',
        data: {
          id: existeNoBanco._id,
          trackingNumber: existeNoBanco.trackingNumber,
          titulo: existeNoBanco.titulo,
          status: existeNoBanco.status
        }
      });
    }

    // Tentar criar tracking na API
    let trackingResult;
    try {
      trackingResult = await TrackingService.criarTracking(
        formattedTrackingNumber, 
        transportadora,
        titulo,
        descricao
      );
      
      console.log('📊 Resultado da API:', trackingResult);
      
      if (trackingResult.success === true) {
        console.log(`✅ Tracking processado: ${trackingResult.message}`);
      } else {
        return res.status(400).json({
          success: false,
          message: `Erro na API de rastreamento: ${trackingResult.error?.message || 'Erro desconhecido'}`
        });
      }
      
    } catch (apiError) {
      console.error('❌ Erro crítico na API TrackingMore:', apiError);
      return res.status(400).json({
        success: false,
        message: `Erro na API de rastreamento: ${apiError.message || 'Erro desconhecido'}`
      });
    }

    // Criar a encomenda no banco
    const novaEncomenda = new Encomenda({
      trackingNumber: formattedTrackingNumber,
      transportadora,
      userId,
      arcoId: user.arcoId,
      titulo: titulo || `Encomenda ${formattedTrackingNumber.slice(-8)}`,
      descricao: descricao || '',
      notificarAoEntregar: notificarAoEntregar !== false,
      status: 'pendente',
      trackingApiId: trackingResult.data?.id || null,
      trackingData: trackingResult.data || {}
    });

    await novaEncomenda.save();

    console.log('✅ Encomenda salva no banco com ID:', novaEncomenda._id);

    res.status(201).json({
      success: true,
      message: 'Encomenda adicionada com sucesso!',
      data: {
        id: novaEncomenda._id,
        trackingNumber: novaEncomenda.trackingNumber,
        transportadora: novaEncomenda.transportadora,
        titulo: novaEncomenda.titulo,
        status: novaEncomenda.status,
        createdAt: novaEncomenda.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar encomenda:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Esta encomenda já está a ser rastreada'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar encomenda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =========== ROTAS PARA ENCOMENDAS MANUAIS ===========

// Adicionar encomenda manual (sem tracking)
router.post('/nova-manual', authMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, transportadora } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    console.log(`📦 Novo pedido de encomenda MANUAL de: ${userEmail}`);
    console.log('📋 Dados recebidos manual:', { titulo, descricao, transportadora });

    // Validações básicas
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'O título da encomenda é obrigatório'
      });
    }

    // Verificar se o usuário tem arco
    const user = await User.findById(userId);
    if (!user || !user.arcoId) {
      return res.status(400).json({
        success: false,
        message: 'Precisa pertencer a um arco para adicionar encomendas'
      });
    }

    // Criar encomenda manual
    const novaEncomendaManual = new EncomendaManual({
      titulo: titulo.trim(),
      descricao: descricao || '',
      transportadora: transportadora || 'manual',
      userId,
      arcoId: user.arcoId,
      status: 'pendente',
      notificarAoEntregar: false,
      isManual: true
    });

    await novaEncomendaManual.save();

    console.log('✅ Encomenda MANUAL salva no banco com ID:', novaEncomendaManual._id);
    console.log('📊 Detalhes:', {
      id: novaEncomendaManual._id,
      titulo: novaEncomendaManual.titulo,
      transportadora: novaEncomendaManual.transportadora
    });

    res.status(201).json({
      success: true,
      message: 'Encomenda manual adicionada com sucesso!',
      data: {
        id: novaEncomendaManual._id,
        titulo: novaEncomendaManual.titulo,
        transportadora: novaEncomendaManual.transportadora,
        descricao: novaEncomendaManual.descricao,
        status: novaEncomendaManual.status,
        isManual: true,
        createdAt: novaEncomendaManual.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar encomenda manual:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar encomenda manual',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =========== ROTAS QUE COMBINAM AMBOS OS TIPOS ===========

// Listar TODAS as encomendas do usuário (tracking + manuais)
router.get('/minhas', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    console.log(`🔍 [SERVER] Buscando encomendas para user ${userId}`);
    console.log(`🔍 [SERVER] User email: ${req.user.email}`);

    // Buscar encomendas com tracking
    const filtroTracking = { userId };
    if (status) filtroTracking.status = status;
    
    const encomendasTracking = await Encomenda.find(filtroTracking)
      .sort({ createdAt: -1 })
      .populate({
        path: 'arcoId',
        select: 'nome',
        options: { lean: true, autopopulate: false }
      });

    // Buscar encomendas manuais
    const filtroManual = { userId };
    if (status) filtroManual.status = status;
    
    const encomendasManuais = await EncomendaManual.find(filtroManual)
      .sort({ createdAt: -1 })
      .populate({
        path: 'arcoId',
        select: 'nome',
        options: { lean: true, autopopulate: false }
      });

    // Combinar resultados
    const todasEncomendas = [
      ...encomendasTracking,
      ...encomendasManuais.map(manual => ({
        ...manual.toObject(),
        trackingNumber: null, // Para compatibilidade com a interface
        isManual: true
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`✅ [SERVER] Total encontradas: ${todasEncomendas.length} encomendas`);
    console.log(`📊 [SERVER] Tracking: ${encomendasTracking.length}, Manuais: ${encomendasManuais.length}`);

    res.json({
      success: true,
      data: todasEncomendas,
      total: todasEncomendas.length,
      stats: {
        tracking: encomendasTracking.length,
        manual: encomendasManuais.length
      }
    });

  } catch (error) {
    console.error('❌ [SERVER] Erro ao listar encomendas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar encomendas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Listar TODAS as encomendas do ARCO
router.get('/do-arco', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user || !user.arcoId) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        message: 'Não pertence a nenhum arco'
      });
    }
    
    console.log(`🔍 [SERVER] Buscando encomendas do arco: ${user.arcoId}`);
    
    // Buscar encomendas com tracking do arco
    const encomendasTracking = await Encomenda.find({ arcoId: user.arcoId })
      .sort({ createdAt: -1 })
      .populate('userId', 'nome email avatarUrl')
      .populate('arcoId', 'nome');
    
    // Buscar encomendas manuais do arco
    const encomendasManuais = await EncomendaManual.find({ arcoId: user.arcoId })
      .sort({ createdAt: -1 })
      .populate('userId', 'nome email avatarUrl')
      .populate('arcoId', 'nome');
    
    // Combinar
    const todasEncomendas = [
      ...encomendasTracking,
      ...encomendasManuais.map(manual => ({
        ...manual.toObject(),
        trackingNumber: null,
        isManual: true
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`✅ [SERVER] Encontradas ${todasEncomendas.length} encomendas no arco`);

    res.json({
      success: true,
      data: todasEncomendas,
      total: todasEncomendas.length,
      arco: user.arcoId
    });
    
  } catch (error) {
    console.error('❌ [SERVER] Erro ao listar encomendas do arco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar encomendas do arco'
    });
  }
});

// Obter transportadoras disponíveis (incluir manual)
router.get('/transportadoras', authMiddleware, (req, res) => {
  const transportadoras = [
    { codigo: 'ctt', nome: 'CTT - Correios de Portugal', pais: 'Portugal' },
    { codigo: 'dhl', nome: 'DHL Express', pais: 'Internacional' },
    { codigo: 'ups', nome: 'UPS', pais: 'Internacional' },
    { codigo: 'fedex', nome: 'FedEx', pais: 'Internacional' },
    { codigo: 'dpd', nome: 'DPD', pais: 'Europa' },
    { codigo: 'chronopost', nome: 'Chronopost', pais: 'França' },
    { codigo: 'seur', nome: 'SEUR', pais: 'Espanha' },
    { codigo: 'correos', nome: 'Correos', pais: 'Espanha' },
    { codigo: 'outra', nome: 'Outra Transportadora', pais: 'Vários' },
    { codigo: 'manual', nome: 'Manual (sem tracking)', pais: 'N/A' }
  ];

  res.json({
    success: true,
    data: transportadoras
  });
});

// Obter uma encomenda específica
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log(`🔍 Buscando encomenda ${id} para user ${userId}`);

    // TENTA ENCONTRAR EM AMBOS OS MODELOS
    // Primeiro: encomenda com tracking
    let encomenda = await Encomenda.findOne({ _id: id })
      .populate({
        path: 'arcoId',
        select: 'nome', // APENAS nome, sem virtuals
        options: { autopopulate: false }
      })
      .populate('userId', 'nome email');

    // Segundo: encomenda manual
    if (!encomenda) {
      encomenda = await EncomendaManual.findOne({ _id: id })
        .populate({
          path: 'arcoId',
          select: 'nome', // APENAS nome, sem virtuals
          options: { autopopulate: false }
        })
        .populate('userId', 'nome email');
    }

    // Se não encontrou em nenhum
    if (!encomenda) {
      return res.status(404).json({
        success: false,
        message: 'Encomenda não encontrada'
      });
    }

    console.log(`✅ Encomenda encontrada: ${encomenda.titulo}`);

    res.json({
      success: true,
      data: encomenda
    });

  } catch (error) {
    console.error('❌ Erro ao obter encomenda:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro ao obter encomenda',
      error: error.message
    });
  }
});


// Atualizar encomenda (qualquer tipo)
// Atualizar encomenda (qualquer tipo) - VERSÃO CORRIGIDA
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { titulo, descricao, status, dataEstimadaEntrega, dataEntregaReal, notificarAoEntregar } = req.body;

    console.log(`✏️  Atualizando encomenda ${id} para user ${userId}`);

    // Buscar o usuário para obter o arcoId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Se o usuário não tem arco, só pode atualizar suas próprias encomendas
    const queryFilter = user.arcoId 
      ? { _id: id, arcoId: user.arcoId }  // Se tem arco, filtrar por arcoId
      : { _id: id, userId: userId };      // Se não tem arco, filtrar por userId

    console.log('🔍 Filtro de busca para atualização:', queryFilter);

    // Primeiro tentar encontrar como encomenda com tracking
    let encomenda = await Encomenda.findOne(queryFilter);

    let isManual = false;

    // Se não encontrou, tentar como encomenda manual
    if (!encomenda) {
      encomenda = await EncomendaManual.findOne(queryFilter);
      isManual = true;
    }

    if (!encomenda) {
      return res.status(404).json({
        success: false,
        message: 'Encomenda não encontrada'
      });
    }

    // Atualizar campos comuns
    if (titulo !== undefined && titulo.trim() !== '') {
      encomenda.titulo = titulo.trim();
    }

    if (descricao !== undefined) {
      encomenda.descricao = descricao;
    }

    if (notificarAoEntregar !== undefined) {
      encomenda.notificarAoEntregar = notificarAoEntregar;
    }

    // Atualizar status
    if (status !== undefined) {
      if (isManual) {
        // Para manuais: apenas 'pendente', 'entregue', 'problema'
        if (['pendente', 'entregue', 'problema'].includes(status)) {
          encomenda.status = status;
          
          if (status === 'entregue' && !encomenda.dataEntregaReal) {
            encomenda.dataEntregaReal = new Date();
          }
        }
      } else {
        // Para tracking: todos os status
        if (['pendente', 'em_transito', 'entregue', 'problema'].includes(status)) {
          encomenda.status = status;
          
          if (status === 'entregue' && !encomenda.dataEntregaReal) {
            encomenda.dataEntregaReal = new Date();
          }
        }
      }
    }

    // Atualizar datas
    if (dataEstimadaEntrega !== undefined) {
      encomenda.dataEstimadaEntrega = dataEstimadaEntrega ? new Date(dataEstimadaEntrega) : null;
    }

    if (dataEntregaReal !== undefined) {
      encomenda.dataEntregaReal = dataEntregaReal ? new Date(dataEntregaReal) : null;
      
      // Se dataEntregaReal foi definida, atualizar status para 'entregue'
      if (dataEntregaReal && encomenda.status !== 'entregue') {
        encomenda.status = 'entregue';
      }
    }

    encomenda.updatedAt = new Date();
    await encomenda.save();

    console.log(`✅ Encomenda atualizada: ${encomenda.titulo}`);

    res.json({
      success: true,
      message: 'Encomenda atualizada com sucesso',
      data: encomenda
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar encomenda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar encomenda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Atualizar encomenda manual (endpoint específico para compatibilidade)
router.put('/manual/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { titulo, descricao, status } = req.body;

    const encomenda = await EncomendaManual.findOne({
      _id: id,
      userId
    });

    if (!encomenda) {
      return res.status(404).json({
        success: false,
        message: 'Encomenda manual não encontrada'
      });
    }

    // Atualizar campos
    if (titulo !== undefined) encomenda.titulo = titulo.trim();
    if (descricao !== undefined) encomenda.descricao = descricao;
    if (status !== undefined && ['pendente', 'entregue', 'problema'].includes(status)) {
      encomenda.status = status;
      
      // Se marcar como entregue, atualizar dataEntregaReal
      if (status === 'entregue' && !encomenda.dataEntregaReal) {
        encomenda.dataEntregaReal = new Date();
      }
    }

    await encomenda.save();

    res.json({
      success: true,
      message: 'Encomenda manual atualizada com sucesso',
      data: encomenda
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar encomenda manual:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar encomenda manual'
    });
  }
});

// Deletar encomenda (qualquer tipo)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Buscar o usuário para obter o arcoId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Se o usuário não tem arco, só pode deletar suas próprias encomendas
    const queryFilter = user.arcoId 
      ? { _id: id, arcoId: user.arcoId }  // Se tem arco, filtrar por arcoId
      : { _id: id, userId: userId };      // Se não tem arco, filtrar por userId

    console.log('🔍 Filtro de busca para deleção:', queryFilter);

    // Primeiro tentar deletar como encomenda com tracking
    let encomenda = await Encomenda.findOneAndDelete(queryFilter);

    // Se não encontrou, tentar como encomenda manual
    if (!encomenda) {
      encomenda = await EncomendaManual.findOneAndDelete(queryFilter);
    }

    if (!encomenda) {
      return res.status(404).json({
        success: false,
        message: 'Encomenda não encontrada'
      });
    }

    // Se for encomenda com tracking e tiver API ID, tentar deletar da API
    if (encomenda.trackingNumber && encomenda.trackingApiId) {
      try {
        await TrackingService.deletarTracking(encomenda.trackingApiId);
      } catch (apiError) {
        console.warn('⚠️ Não foi possível deletar da API, mas foi deletado localmente');
      }
    }

    res.json({
      success: true,
      message: 'Encomenda removida com sucesso',
      tipo: encomenda.trackingNumber ? 'tracking' : 'manual'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar encomenda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar encomenda'
    });
  }
});


// Atualizar tracking de encomenda específica
router.get('/atualizar/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);

    console.log(`🔄 Atualizando tracking da encomenda ${id} para user ${userId}`);

    // Buscar a encomenda (só tracking, não manuais) - filtrar por arcoId
    const encomenda = await Encomenda.findOne({
      _id: id,
      arcoId: user.arcoId  // MUDOU AQUI: filtrar por arcoId
    });

    if (!encomenda) {
      return res.status(404).json({
        success: false,
        message: 'Encomenda não encontrada ou não tem tracking'
      });
    }

    if (!encomenda.trackingApiId) {
      return res.status(400).json({
        success: false,
        message: 'Esta encomenda não tem tracking ativo'
      });
    }

    // Atualizar tracking na API
    const trackingResult = await TrackingService.atualizarTracking(encomenda.trackingApiId);

    if (trackingResult.success) {
      // Atualizar dados locais
      encomenda.trackingData = trackingResult.data || {};
      encomenda.updatedAt = new Date();
      
      // Atualizar status se necessário
      if (trackingResult.data?.status) {
        const statusMapping = {
          'pending': 'pendente',
          'in_transit': 'em_transito',
          'delivered': 'entregue',
          'exception': 'problema'
        };
        
        const newStatus = statusMapping[trackingResult.data.status] || 'pendente';
        if (newStatus !== encomenda.status) {
          encomenda.status = newStatus;
          
          // Se foi entregue, atualizar data de entrega
          if (newStatus === 'entregue' && !encomenda.dataEntregaReal) {
            encomenda.dataEntregaReal = new Date();
          }
        }
      }
      
      await encomenda.save();

      res.json({
        success: true,
        message: 'Tracking atualizado com sucesso',
        data: encomenda
      });
    } else {
      res.status(400).json({
        success: false,
        message: trackingResult.message || 'Erro ao atualizar tracking'
      });
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar tracking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;