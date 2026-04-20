// testAll.mjs (ou testAll.js com imports ES)
import dns from 'dns';
import net from 'net';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { promisify } from 'util';

dotenv.config();

const dnsLookup = promisify(dns.lookup);

async function testAll() {
  console.log('🔍 TESTE COMPLETO DE CONECTIVIDADE\n');
  
  // Teste 1: Internet geral
  console.log('1️⃣ Testando internet...');
  try {
    const googleAddr = await dnsLookup('google.com');
    console.log('   ✅ Internet OK - Google:', googleAddr.address);
  } catch (err) {np
    console.error('   ❌ Sem internet:', err.message);
  }
  
  // Teste 2: DNS do MongoDB
  console.log('\n2️⃣ Testando DNS MongoDB...');
  const hosts = [
    'cluster0.xev52wp.mongodb.net',
    'appicarta.xev52wp.mongodb.net'
  ];
  
  for (const host of hosts) {
    try {
      const result = await dnsLookup(host);
      console.log(`   ✅ ${host}: ${result.address}`);
    } catch (err) {
      console.log(`   ⚠️  ${host}: ${err.code} - ${err.message}`);
    }
  }
  
  // Teste 3: Porta 27017
  console.log('\n3️⃣ Testando porta 27017...');
  await testPort('cluster0.xev52wp.mongodb.net', 27017);
  
  // Teste 4: Conexão MongoDB
  console.log('\n4️⃣ Testando conexão MongoDB...');
  
  if (!process.env.MONGODB_URI) {
    console.error('   ❌ MONGODB_URI não configurada no .env');
    console.log('   📁 Conteúdo do .env:');
    Object.keys(process.env).forEach(key => {
      if (key.includes('MONGODB') || key.includes('JWT')) {
        console.log(`      ${key}=${process.env[key] ? '***' : 'vazio'}`);
      }
    });
    return;
  }
  
  console.log('   🔗 URI (início):', process.env.MONGODB_URI.substring(0, 50) + '...');
  
  // Tentar com SRV
  console.log('   🔄 Tentando com SRV...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('   ✅ Conexão SRV bem-sucedida!');
    console.log('   🎯 Host:', mongoose.connection.host);
    await mongoose.disconnect();
  } catch (srvError) {
    console.log(`   ❌ SRV falhou: ${srvError.message}`);
    
    // Tentar sem SRV
    console.log('   🔄 Tentando sem SRV...');
    const noSrvUri = process.env.MONGODB_URI
      .replace('mongodb+srv://', 'mongodb://')
      .replace(/@([^\.]+)\.xev52wp/, '@cluster0.xev52wp');
    
    console.log('   🔗 URI sem SRV:', noSrvUri.split('@')[0] + '@...');
    
    try {
      await mongoose.connect(noSrvUri, {
        serverSelectionTimeoutMS: 10000
      });
      console.log('   ✅ Conexão sem SRV bem-sucedida!');
      console.log('   🎯 Host:', mongoose.connection.host);
      await mongoose.disconnect();
    } catch (noSrvError) {
      console.log(`   ❌ Sem SRV também falhou: ${noSrvError.message}`);
    }
  }
  
  console.log('\n🎯 SOLUÇÕES PARA TENTAR:');
  console.log('1. No .env, TROQUE: mongodb+srv:// → mongodb://');
  console.log('2. No .env, TROQUE: @appicarta.xev52wp → @cluster0.xev52wp');
  console.log('3. No Atlas, whitelist IP: 0.0.0.0/0');
  console.log('4. Desative firewall/antivírus temporariamente');
}

function testPort(host, port) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(5000);
    
    client.connect(port, host, () => {
      console.log(`   ✅ Porta ${port} acessível em ${host}`);
      client.destroy();
      resolve(true);
    });
    
    client.on('error', (err) => {
      console.log(`   ⚠️  Porta ${port} não acessível: ${err.message}`);
      resolve(false);
    });
    
    client.on('timeout', () => {
      console.log(`   ⚠️  Timeout na porta ${port}`);
      client.destroy();
      resolve(false);
    });
  });
}

// Execute
testAll().catch(console.error);