import Dispositivo from '../models/dispositivo.js';
import User from '../models/user.js';

/**
 * Middleware que verifica se o utilizador tem dispositivo ativo
 * Se não tiver, retorna um erro claro para o frontend
 */
const checkDeviceMiddleware = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Se não tem arco, não precisa de dispositivo ainda
    if (!user.arcoId) {
      req.user.hasArco = false;
      req.user.hasDevice = false;
      return next();
    }
    
    // Buscar dispositivo ativo para este arco
    const dispositivo = await Dispositivo.findOne({
      arcoId: user.arcoId,
      status: 'ativo'
    });
    
    if (!dispositivo) {
      req.user.hasArco = true;
      req.user.hasDevice = false;
      // Não bloquear, apenas marcar que não tem dispositivo
      return next();
    }
    
    req.user.hasArco = true;
    req.user.hasDevice = true;
    req.user.dispositivoId = dispositivo._id;
    next();
    
  } catch (error) {
    console.error('Erro no middleware de dispositivo:', error);
    next(error);
  }
};

/**
 * Middleware que BLOQUEIA acesso se não houver dispositivo
 * Usar apenas em rotas que REQUEREM dispositivo
 */
const requireDeviceMiddleware = async (req, res, next) => {
  await checkDeviceMiddleware(req, res, () => {
    if (!req.user.hasDevice) {
      return res.status(403).json({
        success: false,
        message: 'Dispositivo não configurado',
        code: 'NO_DEVICE_CONFIGURED',
        details: 'É necessário configurar um dispositivo para aceder a esta funcionalidade'
      });
    }
    next();
  });
};

export { checkDeviceMiddleware, requireDeviceMiddleware };