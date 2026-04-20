import express from "express";
import Correspondencia from "../models/correspondencias.js";
import Dispositivo from "../models/dispositivo.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import NotificationService from '../services/notificationService.js';

const router = express.Router();

// =====================================================
// ROTA DE TESTE
// =====================================================
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ Rota correspondencias está funcionando!",
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// OBTER TODAS AS CORRESPONDÊNCIAS (SEM AUTENTICAÇÃO)
// =====================================================
router.get("/", async (req, res) => {
  try {
    console.log('📋 Buscando todas as correspondências...');
    
    const correspondencias = await Correspondencia.find()
      .populate("retiradoPor", "nome avatarUrl")
      .populate("dispositivoId", "nome localizacao")
      .sort({ detectadoEm: -1 });

    console.log(`✅ Encontradas ${correspondencias.length} correspondências`);
    
    return res.json({
      success: true,
      data: correspondencias
    });
    
  } catch (error) {
    console.error("Erro ao obter correspondências:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao obter correspondências"
    });
  }
});

// =====================================================
// ESTATÍSTICAS (SEM AUTENTICAÇÃO)
// =====================================================
router.get("/stats", async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const estatisticas = await Correspondencia.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pendentes: {
            $sum: { $cond: [{ $eq: ['$status', 'pendente'] }, 1, 0] }
          },
          retiradas: {
            $sum: { $cond: [{ $eq: ['$status', 'retirada'] }, 1, 0] }
          },
          hoje: {
            $sum: {
              $cond: [{ $gte: ['$detectadoEm', hoje] }, 1, 0]
            }
          }
        }
      }
    ]);

    const resultado = estatisticas[0] || {
      total: 0,
      pendentes: 0,
      retiradas: 0,
      hoje: 0
    };

    return res.json({
      success: true,
      data: resultado
    });
    
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao obter estatísticas"
    });
  }
});

// =====================================================
// OBTER CORRESPONDÊNCIAS POR ARCO (SEM AUTENTICAÇÃO)
// =====================================================
router.get("/arco/:arcoId", async (req, res) => {
  try {
    const { arcoId } = req.params;
    
    const correspondencias = await Correspondencia.find({ arcoId })
      .populate("retiradoPor", "nome avatarUrl")
      .populate("dispositivoId", "nome localizacao")
      .sort({ detectadoEm: -1 });

    return res.json({
      success: true,
      data: correspondencias
    });
    
  } catch (error) {
    console.error("Erro ao obter correspondências por arco:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao obter correspondências"
    });
  }
});

// =====================================================
// OBTER CORRESPONDÊNCIA POR ID
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const correspondencia = await Correspondencia.findById(id)
      .populate("retiradoPor", "nome avatarUrl")
      .populate("dispositivoId", "nome localizacao");
    
    if (!correspondencia) {
      return res.status(404).json({
        success: false,
        message: "Correspondência não encontrada"
      });
    }
    
    return res.json({
      success: true,
      data: correspondencia
    });
    
  } catch (error) {
    console.error("Erro ao obter correspondência:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao obter correspondência"
    });
  }
});

// =====================================================
// FUNÇÃO PARA ENVIAR NOTIFICAÇÕES PUSH
// =====================================================
async function enviarNotificacaoPush(novaCarta, userPadrao) {
  try {
    // Buscar tokens dos utilizadores
    const users = await User.find({ pushTokens: { $exists: true, $ne: [] } });
    const tokens = users.flatMap(u => u.pushTokens);
    
    console.log(`📱 Enviando notificação push para ${tokens.length} dispositivos`);
    
    // Enviar para cada token
    for (const token of tokens) {
      try {
        const response = await fetch('http://localhost:5001/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token,
            title: '📬 Nova Carta!',
            body: 'Uma nova carta acabou de chegar à caixa de correio.',
            data: { type: 'mail', cartaId: novaCarta._id.toString() }
          })
        });
        
        if (response.ok) {
          console.log(`✅ Push enviado para token: ${token.substring(0, 20)}...`);
        }
      } catch (err) {
        console.error(`❌ Erro ao enviar push para um token:`, err.message);
      }
    }
    
    // Criar notificação no banco de dados para cada utilizador
    for (const user of users) {
      try {
        await Notification.create({
          userId: user._id,
          type: 'mail',
          title: 'Nova carta',
          message: 'Uma nova carta chegou à caixa de correio',
          data: { cartaId: novaCarta._id.toString() },
          read: false
        });
        console.log(`✅ Notificação BD criada para user: ${user._id}`);
      } catch (err) {
        console.error(`❌ Erro ao criar notificação BD:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar notificações push:', error);
  }
}

// =====================================================
// SIMULAR SINAL ARDUINO
// =====================================================
router.post("/simular-arduino", async (req, res) => {
  try {
    const { sinal } = req.body;
    
    console.log('📡 Sinal recebido:', { sinal });
    
    if (![1, 3].includes(sinal)) {
      return res.status(400).json({
        success: false,
        message: "Sinal inválido. Use 1 (detetado) ou 3 (recolhido)"
      });
    }
    
    // Sinal 3: Recolher todas as cartas pendentes
    if (sinal === 3) {
      console.log('🔘 Recolhendo todas as cartas pendentes...');
      
      const result = await Correspondencia.updateMany(
        { status: 'pendente' },
        { 
          $set: { 
            status: 'retirada',
            retiradoEm: new Date()
          }
        }
      );
      
      console.log(`✅ ${result.modifiedCount} cartas recolhidas`);
      
      return res.json({
        success: true,
        message: `✅ ${result.modifiedCount} cartas recolhidas`,
        data: {
          cartasRecolhidas: result.modifiedCount
        }
      });
    }
    
    // Sinal 1: Nova carta
    if (sinal === 1) {
      console.log('📬 Criando nova carta...');
      
      // Buscar ou criar um utilizador padrão
      let userPadrao = await User.findOne({ email: 'padrao@appicarta.com' });
      
      if (!userPadrao) {
        userPadrao = new User({
          nome: 'Utilizador Padrão',
          email: 'padrao@appicarta.com',
          password: '123456',
          role: 'admin',
          telefone: '+351 900 000 000'
        });
        await userPadrao.save();
        console.log('✅ Utilizador padrão criado:', userPadrao._id);
      }
      
      // Buscar ou criar um arco padrão
      const Arco = (await import('../models/arco.js')).default;
      let arcoPadrao = await Arco.findOne({ nome: 'Padrão' });
      
      if (!arcoPadrao) {
        arcoPadrao = new Arco({
          nome: 'Padrão',
          descricao: 'Arco padrão para testes',
          codigoConvite: '676767',
          adminId: userPadrao._id,
          members: [userPadrao._id]
        });
        await arcoPadrao.save();
        console.log('✅ Arco padrão criado:', arcoPadrao._id);
        
        userPadrao.arcoId = arcoPadrao._id;
        userPadrao.isArcoAdmin = true;
        userPadrao.adminArcoId = arcoPadrao._id;
        await userPadrao.save();
      }
      
      // Buscar ou criar um dispositivo padrão
      let dispositivoPadrao = await Dispositivo.findOne({ nome: 'Padrão' });
      
      if (!dispositivoPadrao) {
        dispositivoPadrao = new Dispositivo({
          nome: 'Padrão',
          tipo: 'sensor',
          status: 'ativo',
          descricao: 'Dispositivo padrão para testes',
          arcoId: arcoPadrao._id,
          deviceId: 'PADRAO_001'
        });
        await dispositivoPadrao.save();
        console.log('✅ Dispositivo padrão criado:', dispositivoPadrao._id);
      }
      
      const novaCarta = new Correspondencia({
        tipo: 'carta',
        status: 'pendente',
        detectadoEm: new Date(),
        origem: 'sensor_ir',
        descricao: 'Carta detetada',
        dispositivoId: dispositivoPadrao._id,
        arcoId: arcoPadrao._id
      });
      
      await novaCarta.save();
      console.log(`✅ Nova carta criada: ${novaCarta._id}`);
      
      // =====================================================
      // ENVIAR NOTIFICAÇÕES PUSH
      // =====================================================
      await enviarNotificacaoPush(novaCarta, userPadrao);
      
      return res.json({
        success: true,
        message: "📬 Nova carta detetada",
        data: novaCarta
      });
    }
    
  } catch (error) {
    console.error("❌ Erro:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erro ao simular sinal"
    });
  }
});

// =====================================================
// MARCAR CORRESPONDÊNCIA COMO RETIRADA
// =====================================================
router.put("/:id/retirar", async (req, res) => {
  try {
    const { id } = req.params;
    
    const correspondencia = await Correspondencia.findById(id);
    
    if (!correspondencia) {
      return res.status(404).json({
        success: false,
        message: "Correspondência não encontrada"
      });
    }
    
    correspondencia.status = 'retirada';
    correspondencia.retiradoEm = new Date();
    await correspondencia.save();
    
    return res.json({
      success: true,
      message: "Correspondência marcada como retirada",
      data: correspondencia
    });
    
  } catch (error) {
    console.error("Erro ao retirar correspondência:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao retirar correspondência"
    });
  }
});

// =====================================================
// ASSOCIAR TODAS AS CARTAS A UM ARCO
// =====================================================
router.post("/associar-arco/:arcoId", async (req, res) => {
  try {
    const { arcoId } = req.params;
    
    console.log(`🎯 Associando todas as cartas ao arco: ${arcoId}`);
    
    const totalCartas = await Correspondencia.countDocuments();
    console.log(`📊 Total de cartas na BD: ${totalCartas}`);
    
    const resultado = await Correspondencia.updateMany(
      {},
      { $set: { arcoId: arcoId } }
    );
    
    console.log(`✅ ${resultado.modifiedCount} cartas associadas ao arco ${arcoId}`);
    
    res.json({
      success: true,
      message: `${resultado.modifiedCount} cartas associadas ao arco`,
      data: {
        cartasAssociadas: resultado.modifiedCount,
        arcoId: arcoId,
        totalCartas: totalCartas
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;