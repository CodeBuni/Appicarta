import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
    pushTokens: [{
    type: String,
    default: []
  }],
  password: {
    type: String,
    required: [true, 'Password é obrigatória'],
    minlength: 6
  },
  telefone: {
    type: String,
    default: '',
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  arcoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arco',
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  // Flag para identificar se o usuário é admin de algum arco
  isArcoAdmin: {
    type: Boolean,
    default: false
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  ultimoLogin: {
    type: Date
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash da password antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Comparar password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar se o usuário é admin do seu arco
userSchema.methods.isAdminDoArco = async function() {
  if (!this.arcoId) return false;
  
  try {
    const Arco = mongoose.model('Arco');
    const arco = await Arco.findById(this.arcoId);
    return arco && arco.adminId && arco.adminId.toString() === this._id.toString();
  } catch (error) {
    console.error('Erro ao verificar admin do arco:', error);
    return false;
  }
};

// Método para atualizar role do usuário baseado no status do arco
userSchema.methods.updateRoleBasedOnArcoStatus = async function() {
  try {
    let newRole = 'user';
    
    if (this.arcoId) {
      const Arco = mongoose.model('Arco');
      const arco = await Arco.findById(this.arcoId);
      
      if (arco && arco.adminId && arco.adminId.toString() === this._id.toString()) {
        // Se é admin do arco, verifica se deve ser super_admin ou admin
        // Por enquanto, definimos como 'admin'. Você pode adicionar lógica para 'super_admin' se necessário
        newRole = 'admin';
        this.isArcoAdmin = true;
      } else {
        // Membro normal do arco
        newRole = 'user';
        this.isArcoAdmin = false;
      }
    } else {
      // Sem arco
      newRole = 'user';
      this.isArcoAdmin = false;
    }
    
    // Atualizar role apenas se mudou
    if (this.role !== newRole) {
      this.role = newRole;
      await this.save();
      console.log(`✅ Role atualizada para ${newRole} para usuário ${this.email}`);
    }
    
    return newRole;
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    return this.role;
  }
};

// Middleware para atualizar role quando arcoId muda
userSchema.pre('save', async function(next) {
  // Se arcoId foi modificado ou é um novo usuário, verificar role
  if (this.isModified('arcoId') || this.isNew) {
    try {
      if (this.arcoId) {
        const Arco = mongoose.model('Arco');
        const arco = await Arco.findById(this.arcoId);
        
        if (arco && arco.adminId && arco.adminId.toString() === this._id.toString()) {
          this.role = 'admin'; // Criador do arco vira admin
          this.isArcoAdmin = true;
        } else {
          this.role = 'user'; // Membro normal
          this.isArcoAdmin = false;
        }
      } else {
        // Sem arco = user normal
        this.role = 'user';
        this.isArcoAdmin = false;
      }
    } catch (error) {
      console.error('Erro ao atualizar role no middleware:', error);
      // Em caso de erro, manter role atual
    }
  }
  next();
});

// Remover password do retorno
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;