// models/EncomendaManual.js
import mongoose from 'mongoose';

const EncomendaManualSchema = new mongoose.Schema({
  // Informações básicas
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  
  transportadora: {
    type: String,
    required: true,
    default: 'manual',
    enum: ['manual', 'ctt', 'dhl', 'ups', 'fedex', 'dpd', 'chronopost', 'seur', 'correos', 'outra']
  },
  
  // Relacionamentos
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  arcoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arco',
    required: true
  },
  
  // Status da encomenda
  status: {
    type: String,
    enum: ['pendente', 'entregue', 'problema'],
    default: 'pendente'
  },
  
  // Informações da encomenda
  descricao: {
    type: String,
    default: ''
  },
  dataEstimadaEntrega: {
    type: Date,
    default: null
  },
  dataEntregaReal: {
    type: Date,
    default: null
  },
  
  // Notificações (desativadas por padrão para manuais)
  notificarAoEntregar: {
    type: Boolean,
    default: false
  },
  
  // Flag para identificar que é manual
  isManual: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices
EncomendaManualSchema.index({ userId: 1, status: 1 });
EncomendaManualSchema.index({ arcoId: 1, createdAt: -1 });

export default mongoose.model('EncomendaManual', EncomendaManualSchema);