// src/services/notificationService.js
import Notification from '../models/notification.js';

class NotificationService {
  // Criar notificação
  static async createNotification(userId, type, title, message, data = {}, priority = 1) {
    try {
      console.log(`🔔 Criando notificação para usuário ${userId}: ${title}`);
      
      const notification = await Notification.createNotification(
        userId,
        type,
        title,
        message,
        data,
        priority
      );
      
      console.log(`✅ Notificação criada: ${notification._id}`);
      return notification;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Notificação quando uma correspondência é detectada
  static async onCorrespondenciaDetectada(correspondencia) {
    try {
      // Buscar todos os membros do arco
      const User = (await import('../models/user.js')).default;
      const Arco = (await import('../models/arco.js')).default;
      
      const arco = await Arco.findById(correspondencia.arcoId).populate('members');
      
      if (!arco) return;
      
      const tipoText = correspondencia.tipo === 'carta' ? 'Carta' : 'Encomenda';
      const emoji = correspondencia.tipo === 'carta' ? '📬' : '📦';
      const notificationType = correspondencia.tipo === 'carta' ? 'mail' : 'package';
      
      // Criar notificação para cada membro do arco
      for (const member of arco.members) {
        await this.createNotification(
          member._id,
          notificationType,
          `${emoji} Nova ${tipoText.toLowerCase()} recebida`,
          `${tipoText} detetada no dispositivo. Pode recolher quando quiser.`,
          {
            correspondenciaId: correspondencia._id,
            tipo: correspondencia.tipo,
            dispositivoId: correspondencia.dispositivoId,
            detectadoEm: correspondencia.detectadoEm
          },
          correspondencia.tipo === 'encomenda' ? 3 : 2 // Encomendas têm prioridade mais alta
        );
      }
      
      console.log(`✅ Notificações enviadas para ${arco.members.length} membros do arco`);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de correspondência:', error);
    }
  }

  // Notificação quando uma correspondência é retirada
  static async onCorrespondenciaRetirada(correspondencia, userId) {
    try {
      // Buscar quem retirou
      const User = (await import('../models/user.js')).default;
      const Arco = (await import('../models/arco.js')).default;
      
      const user = await User.findById(userId);
      const arco = await Arco.findById(correspondencia.arcoId).populate('members');
      
      if (!user || !arco) return;
      
      const tipoText = correspondencia.tipo === 'carta' ? 'carta' : 'encomenda';
      const emoji = correspondencia.tipo === 'carta' ? '📭' : '📦✅';
      
      // Notificar o próprio usuário (confirmação)
      await this.createNotification(
        userId,
        'system',
        `${emoji} ${tipoText.charAt(0).toUpperCase() + tipoText.slice(1)} recolhida`,
        `Recolheu a ${tipoText} com sucesso.`,
        {
          correspondenciaId: correspondencia._id,
          tipo: correspondencia.tipo,
          retiradoEm: new Date()
        },
        1
      );
      
      // Notificar outros membros do arco (exceto quem retirou)
      for (const member of arco.members) {
        if (member._id.toString() !== userId.toString()) {
          await this.createNotification(
            member._id,
            'system',
            `${user.nome} recolheu uma ${tipoText}`,
            `${user.nome} acabou de recolher uma ${tipoText} do dispositivo.`,
            {
              correspondenciaId: correspondencia._id,
              tipo: correspondencia.tipo,
              retiradoPor: userId,
              retiradoEm: new Date()
            },
            1
          );
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar notificação de retirada:', error);
    }
  }

  // Notificação quando alguém entra no arco
  static async onUserJoinedArco(user, arco) {
    try {
      // Notificar o novo membro
      await this.createNotification(
        user._id,
        'arco',
        `🎉 Bem-vindo(a) ao arco ${arco.nome}!`,
        `Agora faz parte do arco familiar ${arco.nome}. Pode ver as correspondências e mensagens partilhadas.`,
        {
          arcoId: arco._id,
          arcoNome: arco.nome,
          joinedAt: new Date()
        },
        1
      );
      
      // Notificar os membros existentes
      const User = (await import('../models/user.js')).default;
      
      for (const memberId of arco.members) {
        if (memberId.toString() !== user._id.toString()) {
          const member = await User.findById(memberId);
          if (member) {
            await this.createNotification(
              member._id,
              'arco',
              `👋 ${user.nome} entrou no arco`,
              `${user.nome} juntou-se ao arco ${arco.nome}.`,
              {
                arcoId: arco._id,
                newMemberId: user._id,
                newMemberName: user.nome
              },
              1
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar notificação de entrada no arco:', error);
    }
  }

  // Notificação quando alguém sai do arco
  static async onUserLeftArco(user, arco) {
    try {
      // Notificar os membros restantes
      const User = (await import('../models/user.js')).default;
      
      for (const memberId of arco.members) {
        const member = await User.findById(memberId);
        if (member && member._id.toString() !== user._id.toString()) {
          await this.createNotification(
            member._id,
            'arco',
            `👋 ${user.nome} saiu do arco`,
            `${user.nome} deixou o arco ${arco.nome}.`,
            {
              arcoId: arco._id,
              leftMemberId: user._id,
              leftMemberName: user.nome
            },
            1
          );
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar notificação de saída do arco:', error);
    }
  }

  // Notificação quando alguém é removido do arco
  static async onUserRemovedFromArco(removedUser, arco, removedBy) {
    try {
      // Notificar o usuário removido
      await this.createNotification(
        removedUser._id,
        'arco',
        `⚠️ Foi removido do arco ${arco.nome}`,
        `Foi removido do arco familiar ${arco.nome} por ${removedBy.nome}.`,
        {
          arcoId: arco._id,
          arcoNome: arco.nome,
          removedBy: removedBy._id,
          removedByNome: removedBy.nome,
          removedAt: new Date()
        },
        2
      );
      
      // Notificar os membros restantes
      const User = (await import('../models/user.js')).default;
      
      for (const memberId of arco.members) {
        const member = await User.findById(memberId);
        if (member && member._id.toString() !== removedBy._id.toString()) {
          await this.createNotification(
            member._id,
            'arco',
            `👋 ${removedUser.nome} foi removido do arco`,
            `${removedUser.nome} foi removido do arco ${arco.nome} por ${removedBy.nome}.`,
            {
              arcoId: arco._id,
              removedUserId: removedUser._id,
              removedUserName: removedUser.nome,
              removedBy: removedBy._id,
              removedByNome: removedBy.nome
            },
            1
          );
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar notificação de remoção do arco:', error);
    }
  }

  // Notificação de nova mensagem
  static async onNewMessage(message, sender, arco) {
    try {
      const User = (await import('../models/user.js')).default;
      
      // Notificar todos os membros do arco (exceto o remetente)
      for (const memberId of arco.members) {
        if (memberId.toString() !== sender._id.toString()) {
          const member = await User.findById(memberId);
          if (member) {
            await this.createNotification(
              member._id,
              'message',
              `💬 Nova mensagem de ${sender.nome}`,
              message.content.length > 50 ? 
                `${message.content.substring(0, 50)}...` : 
                message.content,
              {
                messageId: message._id,
                senderId: sender._id,
                senderName: sender.nome,
                arcoId: arco._id,
                timestamp: new Date()
              },
              2
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar notificação de mensagem:', error);
    }
  }

  // Notificação quando um arco é criado
  static async onArcoCreated(arco, adminUser) {
    try {
      // Notificar o admin que criou o arco
      await this.createNotification(
        adminUser._id,
        'arco',
        `🏠 Arco ${arco.nome} criado!`,
        `Criou o arco familiar ${arco.nome}. Convide membros usando o código: ${arco.codigoConvite}`,
        {
          arcoId: arco._id,
          arcoNome: arco.nome,
          codigoConvite: arco.codigoConvite,
          createdAt: new Date()
        },
        1
      );
    } catch (error) {
      console.error('❌ Erro ao criar notificação de criação de arco:', error);
    }
  }

  // Notificação de administração transferida
  static async onAdminTransferred(arco, oldAdmin, newAdmin) {
    try {
      // Notificar o antigo admin
      await this.createNotification(
        oldAdmin._id,
        'system',
        `👑 Administração transferida`,
        `Transferiu a administração do arco ${arco.nome} para ${newAdmin.nome}.`,
        {
          arcoId: arco._id,
          newAdminId: newAdmin._id,
          newAdminNome: newAdmin.nome,
          transferredAt: new Date()
        },
        2
      );
      
      // Notificar o novo admin
      await this.createNotification(
        newAdmin._id,
        'system',
        `👑 É agora o administrador do arco`,
        `Agora é o administrador do arco ${arco.nome}.`,
        {
          arcoId: arco._id,
          oldAdminId: oldAdmin._id,
          oldAdminNome: oldAdmin.nome,
          transferredAt: new Date()
        },
        3
      );
      
      // Notificar os outros membros
      const User = (await import('../models/user.js')).default;
      
      for (const memberId of arco.members) {
        if (memberId.toString() !== oldAdmin._id.toString() && memberId.toString() !== newAdmin._id.toString()) {
          const member = await User.findById(memberId);
          if (member) {
            await this.createNotification(
              member._id,
              'arco',
              `👑 Nova administração no arco`,
              `${newAdmin.nome} é agora o administrador do arco ${arco.nome}.`,
              {
                arcoId: arco._id,
                newAdminId: newAdmin._id,
                newAdminNome: newAdmin.nome
              },
              1
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar notificação de transferência:', error);
    }
  }
}

export default NotificationService;