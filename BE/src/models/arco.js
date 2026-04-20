import mongoose from 'mongoose';

const arcoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do arco é obrigatório'],
    trim: true,
    minlength: [2, 'O nome do arco deve ter pelo menos 2 caracteres'],
    maxlength: [50, 'O nome do arco não pode exceder 50 caracteres']
  },
  codigoConvite: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 6,
    uppercase: true,
    index: true
  },
  endereco: {
    rua: {
      type: String,
      trim: true
    },
    cidade: {
      type: String,
      trim: true
    },
    codigoPostal: {
      type: String,
      trim: true
    }
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  ativo: {
    type: Boolean,
    default: true
  },
  ultimaAtividade: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para número de membros
arcoSchema.virtual('numMembros').get(function() {
  return this.members && Array.isArray(this.members) ? this.members.length : 0;
});


// Virtual para verificar se tem múltiplos membros
arcoSchema.virtual('temMultiplosMembros').get(function() {
  return this.members && Array.isArray(this.members) ? this.members.length > 1 : false;
});

// Middleware para atualizar timestamp de atividade
arcoSchema.pre('save', function(next) {
  this.ultimaAtividade = new Date();
  
  // Garantir que o admin está na lista de membros
  if (this.isNew && this.adminId && !this.members.includes(this.adminId)) {
    this.members.push(this.adminId);
  }
  
  next();
});

// Método estático para gerar código de convite único
arcoSchema.statics.gerarCodigoConvite = async function() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removido 0, O, 1, I para evitar confusão
  let codigo;
  let tentativas = 0;
  const maxTentativas = 10;
  
  do {
    codigo = '';
    for (let i = 0; i < 6; i++) {
      codigo += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const arcoExistente = await this.findOne({ codigoConvite: codigo });
    if (!arcoExistente) {
      return codigo;
    }
    
    tentativas++;
  } while (tentativas < maxTentativas);
  
  throw new Error('Não foi possível gerar um código de convite único após várias tentativas');
};

// Método de instância para obter informações do admin
arcoSchema.methods.getAdminInfo = async function() {
  return await mongoose.model('User').findById(this.adminId).select('nome email avatarUrl telefone role');
};

// Método de instância para obter membros detalhados
arcoSchema.methods.getMembrosDetalhados = async function() {
  return await mongoose.model('User').find({ _id: { $in: this.members } })
    .select('nome email avatarUrl telefone role isArcoAdmin')
    .sort({ nome: 1 });
};

// Método para adicionar membro
arcoSchema.methods.adicionarMembro = async function(userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
    this.ultimaAtividade = new Date();
    return await this.save();
  }
  return this;
};

// Método para remover membro
arcoSchema.methods.removerMembro = async function(userId) {
  this.members = this.members.filter(memberId => !memberId.equals(userId));
  this.ultimaAtividade = new Date();
  return await this.save();
};

// Índices compostos para melhor performance
arcoSchema.index({ codigoConvite: 1, ativo: 1 });
arcoSchema.index({ adminId: 1, ativo: 1 });
arcoSchema.index({ members: 1, ativo: 1 });
arcoSchema.index({ ultimaAtividade: -1 });

const Arco = mongoose.model('Arco', arcoSchema);

export default Arco;