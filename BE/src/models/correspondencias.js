import mongoose from "mongoose";

const CorrespondenciaSchema = new mongoose.Schema({
  // Status: pendente ou retirada (agora sempre automático)
  status: {
    type: String,
    enum: ["pendente", "retirada"],
    required: true,
    default: "pendente",
    index: true
  },
  
  // Tipo: carta, encomenda, outro (inferido automaticamente se possível)
  tipo: {
    type: String,
    enum: ["carta", "encomenda", "outro"],
    default: "carta"
  },
  
  // Relacionamentos
  arcoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Arco",
    required: true,
    index: true
  },
  dispositivoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dispositivo",
    required: true
  },
  retiradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  
  // Timestamps
  detectadoEm: {
    type: Date,
    default: Date.now,
    index: true
  },
  retiradoEm: {
    type: Date,
    default: null
  },
  
  // ========= NOVOS CAMPOS PARA OCR E IMAGEM =========
  // Caminho da imagem guardada
  imagemPath: {
    type: String,
    default: null
  },
  
  // Texto extraído pelo OCR
  textoOcr: {
    type: String,
    default: null
  },
  
  // Informações estruturadas extraídas do texto
  informacoes: {
    remetente: { type: String, default: null },
    destinatario: { type: String, default: null },
    codigoPostal: { type: String, default: null },
    data: { type: String, default: null },
    tipoDocumento: { 
      type: String, 
      enum: ["fatura", "publicidade", "carta_registada", "carta_simples", "desconhecido"],
      default: "desconhecido"
    }
  },
  
  // Origem da deteção
  origem: {
    type: String,
    enum: ["sensor_ir", "botao", "esp32_cam", "manual"],
    default: "sensor_ir"
  },
  
  // URL pública da imagem (opcional)
  imagemUrl: {
    type: String,
    default: null
  },
  // ==================================================
  
  // Campos opcionais para futuro
  descricao: {
    type: String,
    default: ""
  },
  pesoEstimado: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// 🔥 MÉTODO ESTÁTICO IMPORTANTE: Processar sinal do Arduino
CorrespondenciaSchema.statics.processarSinalArduino = async function(sinal, dispositivoId) {
  try {
    console.log(`📡 Processando sinal Arduino ${sinal} para dispositivo ${dispositivoId}`);
    
    const dispositivo = await mongoose.model('Dispositivo').findById(dispositivoId)
      .populate('arcoId');
    
    if (!dispositivo) {
      throw new Error('Dispositivo não encontrado');
    }
    
    // Verificar se o dispositivo está ativo
    if (dispositivo.status !== 'ativo') {
      throw new Error('Dispositivo não está ativo');
    }
    
    if (sinal === 1) {
      // 📬 NOVA CORRESPONDÊNCIA DETETADA
      const correspondencia = new this({
        arcoId: dispositivo.arcoId._id,
        dispositivoId: dispositivo._id,
        status: "pendente",
        tipo: "carta", // Por padrão é carta, pode ser ajustado depois
        detectadoEm: new Date(),
        origem: "sensor_ir"
      });
      
      await correspondencia.save();
      console.log(`✅ Nova correspondência criada: ${correspondencia._id}`);
      return correspondencia;
      
    } else if (sinal === 3) {
      // ✅ CORREIO RECOLHIDO - Marcar a última pendente como retirada
      const ultimaPendente = await this.findOne({
        dispositivoId: dispositivoId,
        status: "pendente"
      }).sort({ detectadoEm: -1 });
      
      if (!ultimaPendente) {
        console.log('⚠️ Nenhuma correspondência pendente para marcar como retirada');
        return null;
      }
      
      ultimaPendente.status = "retirada";
      ultimaPendente.retiradoEm = new Date();
      await ultimaPendente.save();
      
      console.log(`✅ Correspondência ${ultimaPendente._id} marcada como retirada`);
      return ultimaPendente;
    }
    
    throw new Error(`Sinal inválido: ${sinal}. Use 1 (detetado) ou 3 (recolhido).`);
    
  } catch (error) {
    console.error('❌ Erro ao processar sinal Arduino:', error);
    throw error;
  }
};

// 📸 MÉTODO PARA ATUALIZAR COM OCR
CorrespondenciaSchema.methods.atualizarComOcr = async function(imagemPath, textoOcr, informacoesExtraidas) {
  this.imagemPath = imagemPath;
  this.textoOcr = textoOcr;
  
  // Atualizar informações se foram extraídas
  if (informacoesExtraidas) {
    this.informacoes = {
      ...this.informacoes,
      ...informacoesExtraidas
    };
    
    // Se detetou tipo de documento, atualizar o tipo da correspondência
    if (informacoesExtraidas.tipoDocumento === 'fatura') {
      this.tipo = 'carta'; // continua carta mas com metadata
    }
  }
  
  // Gerar URL pública (assumindo que o servidor serve /uploads)
  if (this.imagemPath) {
    const filename = this.imagemPath.split('/').pop();
    this.imagemUrl = `/uploads/cartas/${filename}`;
  }
  
  await this.save();
  return this;
};

// Índices para melhor performance
CorrespondenciaSchema.index({ arcoId: 1, status: 1 });
CorrespondenciaSchema.index({ dispositivoId: 1, status: 1 });
CorrespondenciaSchema.index({ detectadoEm: -1 });
// Novos índices para pesquisa
CorrespondenciaSchema.index({ textoOcr: 'text' }); // Para pesquisa full-text
CorrespondenciaSchema.index({ 'informacoes.remetente': 1 });
CorrespondenciaSchema.index({ 'informacoes.codigoPostal': 1 });

export default mongoose.model("Correspondencia", CorrespondenciaSchema);