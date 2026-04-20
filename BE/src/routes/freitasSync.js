// routes/freitasSync.js
import express from 'express';
import freitasCloudService from '../services/freitasCloudService.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Correspondencia from '../models/correspondencias.js';

const router = express.Router();

/**
 * ROTA PARA SINCRONIZAR DADOS HISTÓRICOS DA CLOUD
 */
router.post('/sincronizar-historico', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronização do histórico da cloud...');
    
    const resultado = await freitasCloudService.sincronizarDadosCloud();
    
    if (resultado.sucesso) {
      res.json({
        success: true,
        message: `Sincronização completa! Processados ${resultado.processados} sinais.`,
        data: resultado
      });
    } else {
      res.status(400).json({
        success: false,
        message: resultado.mensagem || 'Erro na sincronização',
        error: resultado.error
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * ROTA PÚBLICA - Webhook para receber sinais em tempo real
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Webhook recebido:', req.body);
    
    const { sinal, value, recorded_at } = req.body;
    
    // Determinar o sinal
    let sinalProcessar = sinal || value;
    if (!sinalProcessar) {
      return res.status(400).json({
        success: false,
        message: 'Sinal ou valor é obrigatório'
      });
    }

    // Converter para número
    sinalProcessar = Number(sinalProcessar);
    
    // Processar apenas sinais 1 e 3
    if (![1, 3].includes(sinalProcessar)) {
      console.log(`ℹ️ Sinal ${sinalProcessar} ignorado (não é carta)`);
      return res.json({
        success: true,
        message: 'Sinal recebido mas ignorado (não é carta)'
      });
    }

    // Processar o sinal
    const resultado = await freitasCloudService.processarSinalCloud(
      sinalProcessar,
      recorded_at || new Date().toISOString(),
      req.body
    );
    
    res.json({
      success: true,
      message: 'Sinal processado com sucesso',
      data: resultado
    });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * ROTA DE TESTE - Para testar manualmente os sinais
 */
router.post('/test-sinal', authMiddleware, async (req, res) => {
  try {
    const { sinal, timestamp } = req.body;
    
    if (!sinal) {
      return res.status(400).json({
        success: false,
        message: 'Sinal é obrigatório (1, 2 ou 3)'
      });
    }

    const sinalNum = Number(sinal);
    
    const resultado = await freitasCloudService.processarSinalCloud(
      sinalNum,
      timestamp || new Date().toISOString()
    );
    
    res.json({
      success: true,
      message: `Sinal ${sinalNum} processado`,
      data: resultado
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar sinal de teste'
    });
  }
});

/**
 * ROTA DE DIAGNÓSTICO - Mostra o que a cloud retorna
 */
router.get('/teste-simples', authMiddleware, async (req, res) => {
  try {
    console.log('🧪 Rota de teste simples acionada');
    
    const resultado = await freitasCloudService.getSensorInfo();
    
    res.json({
      success: true,
      dados_cloud: resultado
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * ROTA PARA STATUS DOS SINAIS
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    // Últimas 24 horas
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);
    
    const estatisticas = await Correspondencia.aggregate([
      {
        $match: {
          detectadoEm: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            tipo: '$tipo',
            status: '$status'
          },
          count: { $sum: 1 },
          ultima: { $max: '$detectadoEm' }
        }
      },
      {
        $sort: { ultima: -1 }
      }
    ]);
    
    // Últimas correspondências
    const ultimasCorrespondencias = await Correspondencia.find()
      .sort({ detectadoEm: -1 })
      .limit(10)
      .populate('dispositivoId', 'nome localizacao')
      .populate('retiradoPor', 'nome avatarUrl');
    
    res.json({
      success: true,
      data: {
        ultimoSinal: freitasCloudService.ultimoSinal,
        ultimoTimestamp: freitasCloudService.ultimoTimestamp,
        estatisticas,
        ultimasCorrespondencias,
        cloudAtiva: true,
        mensagem: freitasCloudService.ultimoSinal 
          ? `Último sinal: ${freitasCloudService.ultimoSinal}`
          : 'Aguardando sinais...'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter status',
      error: error.message
    });
  }
});

/**
 * ROTA SIMPLIFICADA PARA TESTE RÁPIDO
 */
router.get('/status-test', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        ultimoSinal: freitasCloudService.ultimoSinal,
        ultimoTimestamp: freitasCloudService.ultimoTimestamp,
        estatisticas: [],
        ultimasCorrespondencias: [],
        cloudAtiva: true,
        mensagem: freitasCloudService.ultimoSinal 
          ? `Último sinal: ${freitasCloudService.ultimoSinal}`
          : 'Aguardando sinais...'
      }
    });
  } catch (error) {
    console.error('❌ Erro no status-test:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno'
    });
  }
});

export default router;