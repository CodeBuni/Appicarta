// routes/push.js
import express from 'express';
import User from '../models/user.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Guardar o token do dispositivo
router.post('/register-token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;
    
    // Guardar token no utilizador
    await User.findByIdAndUpdate(userId, { 
      $addToSet: { pushTokens: token } // Evita duplicados
    });
    
    console.log(`📱 Token registado para utilizador ${userId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao guardar token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enviar notificação push
router.post('/send', async (req, res) => {
  try {
    const { token, title, body, data } = req.body;
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: data || {},
      }),
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao enviar push:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enviar notificação para todos os utilizadores
router.post('/send-to-all', async (req, res) => {
  try {
    const { title, body, data } = req.body;
    
    // Buscar todos os tokens
    const users = await User.find({ pushTokens: { $exists: true, $ne: [] } });
    const tokens = users.flatMap(u => u.pushTokens);
    
    console.log(`📱 Enviando para ${tokens.length} dispositivos`);
    
    // Enviar para cada token
    const results = [];
    for (const token of tokens) {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: token, sound: 'default', title, body, data }),
      });
      results.push(await response.json());
    }
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;