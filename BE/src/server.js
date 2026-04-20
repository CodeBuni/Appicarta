// src/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sensorRoutes from './routes/sensor.js';
//import scheduler from './services/scheduler.js';
import freitasSyncRoutes from './routes/freitasSync.js';
import dispositivosRoutes from './routes/dispositivos.js';
import encomendasRoutes from './routes/encomendas.js';
import ocrRoutes from './routes/ocr.js';
import pushRoutes from './routes/push.js';



// Configuração do ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ==================== CONFIGURAÇÃO DE UPLOADS ====================
const projectRoot = process.cwd();
const uploadsPath = path.join(projectRoot, 'uploads');

console.log('📁 Diretório raiz do projeto:', projectRoot);
console.log('📁 Caminho dos uploads:', uploadsPath);

// Criar pasta uploads se não existir
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`✅ Pasta 'uploads' criada em: ${uploadsPath}`);
}

const avatarsPath = path.join(uploadsPath, 'avatars');
if (!fs.existsSync(avatarsPath)) {
  fs.mkdirSync(avatarsPath, { recursive: true });
  console.log(`✅ Pasta 'uploads/avatars' criada em: ${avatarsPath}`);
}

// CORREÇÃO: Servir arquivos estáticos do caminho correto
app.use('/uploads', express.static(uploadsPath));
console.log(`✅ Servindo arquivos estáticos de: ${uploadsPath}`);

// ==================== MIDDLEWARE ====================

// Middleware - CORREÇÃO DO CORS
app.use(cors({
  origin: ['http://localhost:8081', 'http://172.24.78.239:8081', 'exp://172.24.78.239:8081', 'http://localhost:19006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ==================== CONEXÃO MONGODB ====================

const connectDB = async () => {
  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    console.log('URI:', process.env.MONGODB_URI ? 'Definida' : 'Não definida');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Verificar conexão
    mongoose.connection.on('connected', () => {
      console.log('🟢 MongoDB conectado');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('🔴 Erro na conexão MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🟡 MongoDB desconectado');
    });
    
    return conn;
  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao conectar ao MongoDB Atlas:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
};

// ==================== ROTAS DE TESTE ====================

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API do Appicarta está funcionando! 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      arco: '/api/arco',
      messages: '/api/messages',
      notifications: '/api/notifications',
      status: '/api/status'
    }
  });
});

// Rota de status do servidor
app.get('/api/status', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[dbStatus] || 'unknown';
    
    res.json({
      success: true,
      server: {
        status: 'running',
        port: PORT,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        node_version: process.version
      },
      database: {
        status: statusText,
        readyState: dbStatus,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        models: Object.keys(mongoose.connection.models)
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Erro no endpoint /status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status'
    });
  }
});

// Rota para testar uploads
app.get('/api/uploads/test', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const avatarsDir = path.join(uploadsDir, 'avatars');
    
    const uploadsExists = fs.existsSync(uploadsDir);
    const avatarsExists = fs.existsSync(avatarsDir);
    
    let avatarFiles = [];
    if (avatarsExists) {
      avatarFiles = fs.readdirSync(avatarsDir);
    }
    
    res.json({
      success: true,
      data: {
        serverRoot: __dirname,
        uploadsPath: uploadsDir,
        uploadsExists,
        avatarsPath: avatarsDir,
        avatarsExists,
        avatarFiles: avatarFiles.slice(0, 20),
        totalAvatars: avatarFiles.length
      }
    });
  } catch (error) {
    console.error('Erro no teste de uploads:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar uploads',
      error: error.message
    });
  }
});

// ==================== IMPORTAR ROTAS ====================

let authRoutes, arcoRoutes, messagesRoutes, notificationsRoutes, correspondenciasRoutes, usersRoutes;
try {
  authRoutes = (await import('./routes/auth.js')).default;
  console.log('✅ Rota auth carregada');
} catch (error) {
  console.error('❌ Erro ao carregar auth:', error.message);
  authRoutes = express.Router();
  authRoutes.get('/test', (req, res) => res.json({ message: 'Auth route placeholder' }));
}

try {
  arcoRoutes = (await import('./routes/arco.js')).default;
  console.log('✅ Rota arco carregada');
} catch (error) {
  console.error('❌ Erro ao carregar arco:', error.message);
  arcoRoutes = express.Router();
  arcoRoutes.get('/test', (req, res) => res.json({ message: 'Arco route placeholder' }));
}

try {
  messagesRoutes = (await import('./routes/messages.js')).default;
  console.log('✅ Rota messages carregada');
} catch (error) {
  console.error('❌ Erro ao carregar messages:', error.message);
  messagesRoutes = express.Router();
  messagesRoutes.get('/test', (req, res) => res.json({ message: 'Messages route placeholder' }));
}

try {
  notificationsRoutes = (await import('./routes/notifications.js')).default;
  console.log('✅ Rota notifications carregada');
} catch (error) {
  console.error('❌ Erro ao carregar notifications:', error.message);
  notificationsRoutes = express.Router();
  notificationsRoutes.get('/test', (req, res) => res.json({ message: 'Notifications route placeholder' }));
}

try {
  correspondenciasRoutes = (await import('./routes/correspondencias.js')).default;
  console.log('✅ Rota correspondencias carregada');
} catch (error) {
  console.error('❌ Erro ao carregar correspondencias:', error.message);
  correspondenciasRoutes = express.Router();
  correspondenciasRoutes.get('/test', (req, res) => res.json({ message: 'Correspondencias route placeholder' }));
}

try {
  usersRoutes = (await import('./routes/users.js')).default;
  console.log('✅ Rota users carregada');
} catch (error) {
  console.error('❌ Erro ao carregar users:', error.message);
  usersRoutes = express.Router();
  usersRoutes.get('/test', (req, res) => res.json({ message: 'Users route placeholder' }));
}

// ==================== ROTAS DA API ====================

//scheduler.startAutoSync(5);
app.use('/api/auth', authRoutes);
app.use('/api/arco', arcoRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/correspondencias', correspondenciasRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/api/freitas', freitasSyncRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/ocr', ocrRoutes);  
app.use('/api/correspondencias', correspondenciasRoutes);
app.use('/api/push', pushRoutes);
console.log('\n🔄 Verificando rotas carregadas:');
console.log('✅ /api/auth');
console.log('✅ /api/ocr');
console.log('✅ /api/arco');
console.log('✅ /api/messages');
console.log('✅ /api/notifications');
console.log('✅ /api/users');
console.log('✅ /api/correspondencias');
console.log('✅ /api/sensor');
console.log('✅ /api/freitas');
console.log('✅ /api/dispositivos');
console.log('✅ /api/encomendas');
console.log('');
app.use('/api/encomendas', encomendasRoutes);



// ==================== ROTAS ADICIONAIS ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'appicarta-backend'
  });
});

app.get('/', (req, res) => {
  res.redirect('/api/test');
});

// ==================== MIDDLEWARE DE ERRO ====================

app.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Rota ${req.originalUrl} não encontrada`,
    availableRoutes: [
      'GET  /api/test',
      'GET  /api/status',
      'GET  /api/uploads/test',
      'GET  /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'GET  /api/arco/my-arco',
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Registro duplicado',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido no corpo da requisição'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    requestId: req.id || Date.now()
  });
});

// ==================== INICIAR SERVIDOR ====================

const startServer = async () => {
  try {
    console.log('🚀 Iniciando Appicarta Backend...');
    console.log(`📁 Diretório: ${__dirname}`);
    console.log(`⚙️  Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 JWT_SECRET: ${process.env.JWT_SECRET ? 'Definido' : 'NÃO DEFINIDO!'}`);
    console.log(`🌐 PORT: ${PORT}`);
    
    await connectDB();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor iniciado na porta ${PORT}`);
      console.log(`🌐 URL local: http://localhost:${PORT}`);
      console.log(`🌐 URL rede: http://10.48.28.239:${PORT}`);
      console.log(`📚 Teste: http://localhost:${PORT}/api/test`);
      console.log(`📊 Status: http://localhost:${PORT}/api/status`);
      console.log(`📁 Teste uploads: http://localhost:${PORT}/api/uploads/test`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
      console.log('\n🔄 Rotas disponíveis:');
      console.log('  POST /api/auth/register');
      console.log('  POST /api/auth/login');
      console.log('  GET  /api/auth/me');
      console.log('  GET  /api/arco/my-arco');
      console.log('  POST /api/users/upload-avatar');
      console.log('  POST /api/freitas/sincronizar-historico');
      console.log('  POST /api/freitas/test-sinal');
      console.log('  GET  /api/freitas/status');
    });
    
    // SINCRONIZAÇÃO AUTOMÁTICA DA CLOUD FREITAS
//aqui foi tudo a vida mas ta no deepseek
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${PORT} já está em uso!`);
        console.log('Tente:');
        console.log('1. Matar o processo na porta:', PORT);
        console.log('2. Usar outra porta: PORT=5001 npm start');
        process.exit(1);
      } else {
        console.error('❌ Erro no servidor:', error);
        process.exit(1);
      }
    });
    
    const shutdown = async () => {
      console.log('\n🔻 Recebido sinal de desligamento...');
      
      server.close(() => {
        console.log('✅ Servidor HTTP fechado');
      });
      
      await mongoose.connection.close();
      console.log('✅ Conexão com MongoDB fechada');
      
      process.exit(0);
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
  } catch (error) {
    console.error('❌ ERRO ao iniciar servidor:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

const seedTestData = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('🌱 Verificando dados de teste...');
      
      const User = (await import('./models/user.js')).default;
      const Arco = (await import('./models/arco.js')).default;
      
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        console.log('📝 Criando dados de teste...');
        
        const adminUser = new User({
          nome: 'Admin Teste',
          email: 'admin@appicarta.com',
          password: '123456',
          role: 'admin',
          telefone: '+351 912 345 678',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        });
        await adminUser.save();
        console.log(`✅ user admin criado: ${adminUser.email}`);
        
        const usersData = [
          { 
            nome: 'Maria Silva', 
            email: 'maria@appicarta.com', 
            password: '123456',
            telefone: '+351 913 456 789',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
          },
          { 
            nome: 'João Santos', 
            email: 'joao@appicarta.com', 
            password: '123456',
            telefone: '+351 914 567 890',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao'
          },
          { 
            nome: 'Ana Pereira', 
            email: 'ana@appicarta.com', 
            password: '123456',
            telefone: '+351 915 678 901',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
          },
        ];
        
        for (const userData of usersData) {
          const user = new User(userData);
          await user.save();
          console.log(`✅ user criado: ${user.email}`);
        }
        
        const arco = new Arco({
          nome: 'Família Silva',
          codigoConvite: await Arco.gerarCodigoConvite(),
          adminId: adminUser._id,
          members: [adminUser._id],
          endereco: {
            rua: 'Rua das Flores, 123',
            cidade: 'Lisboa'
          }
        });
        await arco.save();
        
        const maria = await User.findOne({ email: 'maria@appicarta.com' });
        const joao = await User.findOne({ email: 'joao@appicarta.com' });
        
        if (maria && joao) {
          arco.members.push(maria._id, joao._id);
          await arco.save();
          
          maria.arcoId = arco._id;
          joao.arcoId = arco._id;
          await maria.save();
          await joao.save();
          
          adminUser.isArcoAdmin = true;
          adminUser.adminArcoId = arco._id;
          await adminUser.save();
        }
        
        console.log(`✅ Arco criado: ${arco.nome} (Código: ${arco.codigoConvite})`);
        console.log(`✅ Admin do arco definido: ${adminUser.email}`);
        console.log('✅ Dados de teste populados com sucesso!');
      } else {
        console.log(`📊 Já existem ${userCount} users no banco de dados`);
      }
    } catch (error) {
      console.error('❌ Erro ao popular dados de teste:', error);
    }
  }
};

// Iniciar tudo
startServer().then(async () => {
  setTimeout(async () => {
    if (mongoose.connection.readyState === 1) {
      await seedTestData();
    } else {
      console.log('⚠️ MongoDB não conectado, pulando seed de dados');
    }
  }, 1000);
});

export default app;