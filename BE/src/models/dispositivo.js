// models/dispositivo.js
import mongoose from "mongoose";

const DispositivoSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  nome: {
    type: String,
    required: true,
    default: "Dispositivo de Correio"
  },
  arcoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Arco",
    required: true
  },
  localizacao: {
    type: String,
    default: "Entrada Principal"
  },
  status: {
    type: String,
    enum: ["ativo", "inativo", "manutencao"],
    default: "ativo"
  }
}, {
  timestamps: true
});

export default mongoose.model("Dispositivo", DispositivoSchema);