// scripts/seedNotifications.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from '../models/notification.js';
import User from '../models/user.js';

dotenv.config();

const seedNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
    
    // Buscar um usuário
    const user = await User.findOne({ email: 'gabriel@gmail.com' });
    
    if (!user) {
      console.log('❌ Usuário não encontrado. Crie um usuário primeiro.');
      return;
    }
    
    console.log(`👤 Usuário encontrado: ${user.nome} (${user.email})`);
    
    // Verificar se já tem notificações
    const existingCount = await Notification.countDocuments({ userId: user._id });
    
    if (existingCount > 0) {
      console.log(`📊 Já existem ${existingCount} notificações. Pulando...`);
      return;
    }
    
    // Criar notificações de exemplo
    const notifications = [
      {
        userId: user._id,
        type: 'mail',
        title: 'Correio recebido',
        message: 'Tens uma carta do banco para recolher',
        data: { mailId: 'mail_001', priority: 2 },
        read: false,
        priority: 2
      },
      {
        userId: user._id,
        type: 'package',
        title: 'Encomenda em trânsito',
        message: 'A tua encomenda CTT #PT123456789 está a caminho',
        data: { tracking: 'PT123456789', carrier: 'CTT' },
        read: true,
        priority: 1
      },
      {
        userId: user._id,
        type: 'message',
        title: 'Nova mensagem',
        message: 'Maria Silva enviou-te uma mensagem',
        data: { fromUserId: 'user_002', conversationId: 'conv_001' },
        read: false,
        priority: 1
      },
      {
        userId: user._id,
        type: 'arco',
        title: 'Convite para arco familiar',
        message: 'Foste convidado para o arco "Família Silva"',
        data: { arcoId: 'arco_001', inviterId: 'user_003' },
        read: false,
        priority: 3
      },
      {
        userId: user._id,
        type: 'system',
        title: 'Atualização do sistema',
        message: 'Nova versão do Appicarta disponível',
        data: { version: '1.2.0' },
        read: true,
        priority: 1
      }
    ];
    
    await Notification.insertMany(notifications);
    console.log(`✅ ${notifications.length} notificações criadas com sucesso!`);
    
    // Mostrar estatísticas
    const total = await Notification.countDocuments({ userId: user._id });
    const unread = await Notification.countDocuments({ userId: user._id, read: false });
    
    console.log(`📊 Estatísticas:`);
    console.log(`   Total: ${total}`);
    console.log(`   Não lidas: ${unread}`);
    console.log(`   Lidas: ${total - unread}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar notificações:', error);
    process.exit(1);
  }
};

seedNotifications(); 