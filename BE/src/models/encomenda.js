// models/Encomenda.js
import mongoose from 'mongoose';

const EncomendaSchema = new mongoose.Schema({
  // Informações básicas
  trackingNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  transportadora: {
    type: String,
    required: true,
    enum: ['ctt', 'dhl', 'ups', 'fedex', 'dpd', 'chronopost', 'seur', 'correos', 'outra']
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
    enum: ['pendente', 'em_transito', 'entregue', 'problema'],
    default: 'pendente'
  },
  
  // Dados do TrackingMore
  trackingData: {
    type: Object,
    default: {}
  },
  trackingApiId: {  // ← ADICIONE ESTE CAMPO
    type: String,
    index: true
  },
  
  // Informações da encomenda
  titulo: {
    type: String,
    default: ''
  },
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
  
  // Notificações
  notificarAoEntregar: {
    type: Boolean,
    default: true
  }
}, {
  // REMOVA os campos manuais 'dataCriacao' e 'ultimaAtualizacao' 
  // e use apenas timestamps (que cria createdAt e updatedAt automaticamente)
  timestamps: true
});

// Índices para melhor performance - CORRIGIDO O ÍNDICE ÚNICO
EncomendaSchema.index({ userId: 1, status: 1 });
EncomendaSchema.index({ arcoId: 1, createdAt: -1 });
// REMOVA ou MODIFIQUE o índice único se quiser permitir mesmo tracking em arcos diferentes
// EncomendaSchema.index({ trackingNumber: 1, transportadora: 1, arcoId: 1 }, { unique: true });

export default mongoose.model('Encomenda', EncomendaSchema);    