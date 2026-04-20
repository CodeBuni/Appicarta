// routes/sensor.js
import express from 'express';
import SensorData from '../models/sensorData.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();


// ROTA PARA PROCESSAR SINAIS DO ARDUINO (carta/encomenda)
router.post('/arduino-sinal', async (req, res) => {
  try {
    const { public_key, private_key, value, device_id } = req.body;
    
    console.log(`📨 Sinal do Arduino recebido: value=${value}, device=${device_id}`);
    
    // Validação básica
    if (!public_key || !private_key || value === undefined || !device_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: public_key, private_key, value, device_id'
      });
    }
    
    // Buscar dispositivo pelo device_id
    const Dispositivo = await import('../models/dispositivo.js').then(m => m.default);
    const dispositivo = await Dispositivo.findOne({ deviceId: device_id });
    
    if (!dispositivo) {
      console.log(`❌ Dispositivo não registrado: ${device_id}`);
      return res.status(404).json({
        success: false,
        message: 'Dispositivo não encontrado'
      });
    }
    
    // Buscar o arco do dispositivo
    const Arco = await import('../models/arco.js').then(m => m.default);
    const arco = await Arco.findById(dispositivo.arcoId);
    
    if (!arco) {
      console.log(`❌ Arco não encontrado para dispositivo: ${device_id}`);
      return res.status(404).json({
        success: false,
        message: 'Arco não encontrado para este dispositivo'
      });
    }
    
    // Processar o valor
    let acao = '';
    let correspondenciaCriada = null;
    
    if (value === 1) {
      // Sensor detectou carta na caixa
      acao = 'Carta detectada na caixa de correio';
      
      // Criar correspondência pendente
      const Correspondencia = await import('../models/correspondencias.js').then(m => m.default);
      
      correspondenciaCriada = new Correspondencia({
        arcoId: arco._id,
        dispositivoId: dispositivo._id,
        tipo: 'carta', // Ou poderia ser encomenda se tivesse outro sensor
        status: 'pendente',
        detectadoEm: new Date()
      });
      
      await correspondenciaCriada.save();
      console.log(`✅ Correspondência criada: ${correspondenciaCriada._id}`);
      
    } else if (value === 2) {
      // Caixa foi aberta
      acao = 'Caixa de correio aberta';
      // Pode ser usado para log, mas não cria correspondência
      
    } else if (value === 3) {
      // Carta foi retirada
      acao = 'Carta retirada da caixa';
      
      // Buscar a última correspondência pendente para este arco
      const Correspondencia = await import('../models/correspondencias.js').then(m => m.default);
      
      const ultimaCorrespondencia = await Correspondencia.findOne({
        arcoId: arco._id,
        status: 'pendente'
      }).sort({ detectadoEm: -1 });
      
      if (ultimaCorrespondencia) {
        // Marcar como retirada automaticamente
        ultimaCorrespondencia.status = 'retirada';
        ultimaCorrespondencia.retiradoEm = new Date();
        ultimaCorrespondencia.retiradoPor = null; // Retirada automática
        
        await ultimaCorrespondencia.save();
        console.log(`✅ Correspondência marcada como retirada: ${ultimaCorrespondencia._id}`);
        
        correspondenciaCriada = ultimaCorrespondencia;
      } else {
        console.log('⚠️ Nenhuma correspondência pendente para marcar como retirada');
      }
    }
    
    // Salvar log no sensorData
    const sensorLog = new SensorData({
      publicKey: public_key,
      privateKey: private_key,
      value: value,
      unit: 'sinal',
      recordedAt: new Date(),
      source: 'arduino_appisensor',
      metadata: {
        device_id: device_id,
        arco_id: arco._id,
        acao: acao,
        correspondencia_id: correspondenciaCriada ? correspondenciaCriada._id : null
      }
    });
    
    await sensorLog.save();
    
    // Enviar para cloud Freitas (opcional)
    try {
      const freitasCloudService = await import('../services/freitasCloudService.js').then(m => m.default);
      await freitasCloudService.sendData(value);
    } catch (cloudError) {
      console.log('⚠️ Não foi possível enviar para cloud Freitas:', cloudError.message);
    }
    
    res.json({
      success: true,
      message: `Sinal processado: ${acao}`,
      data: {
        value: value,
        acao: acao,
        arco: arco.nome,
        dispositivo: dispositivo.nome,
        correspondencia: correspondenciaCriada,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar sinal do Arduino:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar sinal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ROTA PARA RECEBER DADOS DO ESP32 (pública)
router.post('/ingest', async (req, res) => {
  try {
    const { public_key, private_key, value, recorded_at } = req.body;
    
    // Verificar chaves (opcional, se quiser validar)
    if (!public_key || !private_key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'public_key, private_key e value são obrigatórios'
      });
    }
    
    // Criar registro no banco
    const sensorData = new SensorData({
      publicKey: public_key,
      privateKey: private_key,
      value: parseFloat(value),
      recordedAt: recorded_at ? new Date(recorded_at) : new Date(),
      source: 'esp32'
    });
    
    await sensorData.save();
    
    // Responder à cloud
    res.json({
      success: true,
      message: 'Dado recebido com sucesso',
      data: {
        id: sensorData._id,
        value: sensorData.value,
        recordedAt: sensorData.recordedAt
      }
    });
    
  } catch (error) {
    console.error('Erro ao processar dados do sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar dados'
    });
  }
});

// ROTA PARA OBTER INFORMAÇÕES DO SENSOR (pública)
router.post('/sensor-info', async (req, res) => {
  try {
    const { public_key } = req.body;
    
    if (!public_key) {
      return res.status(400).json({
        success: false,
        message: 'public_key é obrigatório'
      });
    }
    
    // Buscar informações do sensor (últimos dados, etc.)
    const lastData = await SensorData.findOne({ 
      publicKey: public_key 
    }).sort({ recordedAt: -1 });
    
    const totalReadings = await SensorData.countDocuments({ 
      publicKey: public_key 
    });
    
    res.json({
      success: true,
      data: {
        publicKey: public_key,
        lastReading: lastData ? {
          value: lastData.value,
          recordedAt: lastData.recordedAt
        } : null,
        totalReadings,
        status: 'active',
        lastUpdated: lastData ? lastData.recordedAt : null
      }
    });
    
  } catch (error) {
    console.error('Erro ao obter info do sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter informações'
    });
  }
});

// ROTA PARA APLICATIVO OBTER DADOS (protegida)
router.get('/data', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, public_key } = req.query;
    
    const query = {};
    if (public_key) {
      query.publicKey = public_key;
    }
    
    const sensorData = await SensorData.find(query)
      .sort({ recordedAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: sensorData
    });
    
  } catch (error) {
    console.error('Erro ao obter dados do sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter dados'
    });
  }
});

// ROTA PARA ESTATÍSTICAS (protegida)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { public_key, days = 7 } = req.query;
    
    const query = {};
    if (public_key) {
      query.publicKey = public_key;
    }
    
    // Últimos X dias
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    query.recordedAt = { $gte: startDate };
    
    const stats = await SensorData.aggregate([
      { $match: query },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$recordedAt" 
            } 
          },
          avgValue: { $avg: "$value" },
          maxValue: { $max: "$value" },
          minValue: { $min: "$value" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: stats
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