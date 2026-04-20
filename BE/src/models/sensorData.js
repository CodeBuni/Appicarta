import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
  publicKey: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  recordedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    enum: ['arduino', 'freitas_cloud', 'manual'],
    default: 'freitas_cloud'
  },
  
  // Processamento automático
  tipoSinal: {
    type: String,
    enum: ['correio_detetado', 'caixa_aberta', 'correio_recolhido', 'outro'],
    default: 'outro'
  },
  
  // Relacionamento com correspondência (se aplicável)
  correspondenciaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Correspondencia',
    default: null
  },
  
  metadata: {
    deviceId: String,
    temperatura: Number,
    umidade: Number,
    bateria: Number
  }
}, {
  timestamps: true
});

// Middleware para classificar automaticamente o sinal
sensorDataSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Classificar o valor do Arduino
    switch(this.value) {
      case 1:
        this.tipoSinal = 'correio_detetado';
        break;
      case 2:
        this.tipoSinal = 'caixa_aberta';
        break;
      case 3:
        this.tipoSinal = 'correio_recolhido';
        break;
      default:
        this.tipoSinal = 'outro';
    }
  }
  next();
});

// Índices compostos
sensorDataSchema.index({ recordedAt: -1, value: 1 });
sensorDataSchema.index({ tipoSinal: 1, recordedAt: -1 });

export default mongoose.model('SensorData', sensorDataSchema);