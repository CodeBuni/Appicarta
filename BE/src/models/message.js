import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.toArcoId; // Requerido apenas se não tiver toArcoId
    }
  },
  toArcoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arco',
    required: function() {
      return !this.toUserId; // Requerido apenas se não tiver toUserId
    }
  },
  content: {
    type: String,
    required: [true, 'Conteúdo da mensagem é obrigatório'],
    trim: true,
    maxlength: 2000
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para melhor performance
messageSchema.index({ fromUserId: 1, createdAt: -1 });
messageSchema.index({ toUserId: 1, createdAt: -1 });
messageSchema.index({ toArcoId: 1, createdAt: -1 });
messageSchema.index({ 'readBy.userId': 1 });

// Middleware para adicionar o remetente ao readBy
messageSchema.pre('save', function(next) {
  if (this.isNew) {
    this.readBy = [{ userId: this.fromUserId }];
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);

export default Message;