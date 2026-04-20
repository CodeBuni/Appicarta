// backend/routes/users.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/user.js';
import Arco from '../models/arco.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Configurar diretório de uploads CORRETAMENTE
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📁 users.js __dirname:', __dirname);
console.log('📁 users.js processo atual:', process.cwd());

// ==================== CONFIGURAÇÃO MULTER ====================

// 1. PRIMEIRO definir a função fileFilter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  console.log(`📁 Verificando arquivo: ${file.originalname}, MIME: ${file.mimetype}, Ext: ${path.extname(file.originalname)}`);
  
  if (mimetype && extname) {
    console.log('✅ Tipo de arquivo aceito');
    return cb(null, true);
  } else {
    console.log('❌ Tipo de arquivo recusado');
    cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, GIF)'));
  }
};

// 2. DEPOIS configurar o storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usar caminho RELATIVO ao server.js
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    
    console.log('📁 Destino do upload:', uploadDir);
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`📁 Criada pasta: ${uploadDir}`);
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?._id || 'unknown';
    const timestamp = new Date().getTime(); // Usar getTime() para garantir timestamp correto
    const uniqueSuffix = timestamp + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname).toLowerCase();
    const filename = `avatar-${userId}-${uniqueSuffix}${extname}`;
    console.log(`📁 Nome do arquivo: ${filename}`);
    console.log(`📁 Timestamp usado: ${timestamp} (${new Date(timestamp)})`);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter // Agora fileFilter já está definido
});

// ==================== MIDDLEWARES ====================


// Middleware para verificar se o usuário tem role 'admin'
const checkAdminRole = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem executar esta ação.'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar role de admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar permissões'
    });
  }
};

// Middleware para verificar se o usuário é admin do arco
const checkArcoAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isArcoAdmin = await user.isAdminDoArco();
    
    if (!isAdmin && !isArcoAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem executar esta ação.'
      });
    }

    req.user.isArcoAdmin = isArcoAdmin;
    next();
  } catch (error) {
    console.error('Erro ao verificar admin do arco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar permissões'
    });
  }
};

// ==================== ROTAS PÚBLICAS ====================

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota /users funcionando',
    timestamp: new Date().toISOString()
  });
});

// ==================== ROTAS AUTENTICADAS ====================

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('arcoId', 'nome codigoConvite members adminId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const isArcoAdmin = await user.isAdminDoArco();
    
    let arcoInfo = null;
    if (user.arcoId) {
      const arco = await Arco.findById(user.arcoId)
        .populate('members', 'nome avatarUrl role');
      
      if (arco) {
        arcoInfo = {
          _id: arco._id,
          nome: arco.nome,
          codigoConvite: arco.codigoConvite,
          adminId: arco.adminId,
          totalMembros: arco.members ? arco.members.length : 0,
          membros: arco.members || [],
          isAdmin: isArcoAdmin
        };
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          isArcoAdmin
        },
        arco: arcoInfo,
        role: user.role,
        permissions: {
          canManageArco: user.role === 'admin' || user.role === 'super_admin',
          canAccessAdminPanel: user.role === 'admin' || user.role === 'super_admin'
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter informações do perfil'
    });
  }
});

router.get('/check-arco-admin', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const isArcoAdmin = await user.isAdminDoArco();
    const isSystemAdmin = user.role === 'admin' || user.role === 'super_admin';

    res.json({
      success: true,
      data: {
        isArcoAdmin,
        isSystemAdmin,
        role: user.role,
        userId: user._id,
        permissions: {
          canManageArco: isArcoAdmin || isSystemAdmin,
          canAccessAdminPanel: isSystemAdmin
        }
      }
    });

  } catch (error) {
    console.error('Erro ao verificar admin do arco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar permissões'
    });
  }
});

router.get('/arco-members', authMiddleware, checkArcoAdmin, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('arcoId');
    
    if (!user || !user.arcoId) {
      return res.status(404).json({
        success: false,
        message: 'Arco não encontrado'
      });
    }

    const arco = await Arco.findById(user.arcoId)
      .populate('members', 'nome avatarUrl email telefone role isArcoAdmin');
    
    if (!arco) {
      return res.status(404).json({
        success: false,
        message: 'Arco não encontrado'
      });
    }

    const members = arco.members.filter(member => 
      member._id.toString() !== userId.toString()
    );

    res.json({
      success: true,
      data: members,
      userRole: user.role
    });

  } catch (error) {
    console.error('Erro ao obter membros do arco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter membros do arco'
    });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .populate('arcoId', 'members');
    
    let stats = {
      totalMembrosArco: 0,
      isArcoAdmin: false,
      role: user?.role || 'user',
      permissions: {
        canManageArco: false,
        canAccessAdminPanel: false
      }
    };

    if (user && user.arcoId) {
      stats.totalMembrosArco = user.arcoId.members ? user.arcoId.members.length : 0;
      stats.isArcoAdmin = await user.isAdminDoArco();
      stats.permissions.canManageArco = stats.isArcoAdmin || user.role === 'admin' || user.role === 'super_admin';
      stats.permissions.canAccessAdminPanel = user.role === 'admin' || user.role === 'super_admin';
    }

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

router.get('/all', authMiddleware, checkAdminRole, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('arcoId', 'nome')
      .sort({ dataCriacao: -1 });

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Erro ao obter todos os usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter lista de usuários'
    });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { nome, email, telefone } = req.body;

    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }
    }

    const updateData = {};
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email.toLowerCase();
    if (telefone !== undefined) updateData.telefone = telefone;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: user,
      role: user.role
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil'
    });
  }
});

// UPLOAD DE AVATAR - VERSÃO CORRIGIDA
// UPLOAD DE AVATAR - VERSÃO CORRIGIDA
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    console.log('📤 Upload de avatar recebido');
    console.log('📁 Arquivo:', req.file);
    console.log('👤 Usuário ID:', req.user._id);
    
    if (!req.file) {
      console.log('❌ Nenhum arquivo enviado');
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem enviada'
      });
    }

    const userId = req.user._id;
    
    // DEBUG: Verificar caminhos
    console.log('📁 Diretório atual:', process.cwd());
    console.log('📁 Caminho do arquivo salvo:', req.file.path);
    
    // Verificar se o arquivo foi realmente salvo
    const fileExists = fs.existsSync(req.file.path);
    console.log('📁 Arquivo existe?', fileExists);
    
    if (!fileExists) {
      console.error('❌ ERRO CRÍTICO: Arquivo não foi salvo!');
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar arquivo no servidor'
      });
    }
    
    // Verificar tamanho do arquivo
    const fileStats = fs.statSync(req.file.path);
    console.log('📁 Tamanho do arquivo:', fileStats.size, 'bytes');
    
    // Criar URL de acesso
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.BASE_URL || `http://${req.get('host')}`)
      : `http://${req.get('host')}`;  // Usar o host da requisição
    
    console.log('🌐 Base URL:', baseUrl);
    
    // URL para acesso via HTTP
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    console.log('🌐 Avatar URL:', avatarUrl);
    
    // Atualizar usuário no banco de dados
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        avatarUrl: avatarUrl,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password');

    if (!user) {
      // Limpar arquivo se houver erro
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ Avatar salvo no banco:', user.avatarUrl);
    
    // TESTE: Verificar se a URL é acessível
    console.log('🔗 Testando URL...');
    console.log(`   Acessível em: ${avatarUrl}`);
    
    res.json({
      success: true,
      message: 'Avatar atualizado com sucesso',
      avatarUrl: avatarUrl,
      user: user,
      role: user.role
    });

  } catch (error) {
    console.error('❌ Erro detalhado no upload:', error);
    console.error('Stack:', error.stack);
    
    // Limpar arquivo em caso de erro
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🧹 Arquivo removido devido ao erro');
      } catch (cleanupError) {
        console.error('Erro ao limpar arquivo:', cleanupError);
      }
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Máximo: 5MB'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload do avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/avatar', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.avatarUrl) {
      const avatarFilename = path.basename(user.avatarUrl);
      const avatarPath = path.join(__dirname, 'uploads', 'avatars', avatarFilename);
      
      if (fs.existsSync(avatarPath)) {
        try {
          fs.unlinkSync(avatarPath);
          console.log(`🗑️  Arquivo deletado: ${avatarPath}`);
        } catch (fileError) {
          console.error('Erro ao deletar arquivo:', fileError);
        }
      }
    }

    user.avatarUrl = '';
    await user.save();

    res.json({
      success: true,
      message: 'Avatar removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover avatar'
    });
  }
});

export default router;