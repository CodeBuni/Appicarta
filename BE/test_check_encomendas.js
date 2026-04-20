// Adicione este teste rápido no seu terminal do projeto
// test_check_encomendas.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkEncomendas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Encomenda = (await import('./src/models/encomenda.js')).default;
    
    const encomendas = await Encomenda.find({});
    
    console.log(`📦 Encontradas ${encomendas.length} encomendas no banco:`);
    encomendas.forEach((enc, index) => {
      console.log(`\n${index + 1}. ${enc.trackingNumber} (${enc.transportadora})`);
      console.log(`   Título: ${enc.titulo}`);
      console.log(`   Status: ${enc.status}`);
      console.log(`   Criada: ${enc.createdAt}`);
    });
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkEncomendas();