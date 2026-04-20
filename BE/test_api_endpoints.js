// test_api_endpoints.js
import axios from 'axios';

const BASE_URL = 'http://10.247.163.239:5001';

async function testEndpoints() {
  try {
    console.log('🔍 Testando endpoints da API...\n');
    
    // 1. Testar login
    console.log('1. Testando login...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'buni@gmail.combo',
      password: '123456' // Use a senha correta
    });
    
    const token = loginRes.data.data.token;
    console.log('✅ Login realizado, token obtido');
    
    // 2. Testar endpoint de encomendas
    console.log('\n2. Testando GET /api/encomendas/minhas...');
    const encomendasRes = await axios.get(`${BASE_URL}/api/encomendas/minhas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Status:', encomendasRes.status);
    console.log('📊 Dados:', JSON.stringify(encomendasRes.data, null, 2));
    
    // 3. Testar endpoint de correspondências
    console.log('\n3. Testando GET /api/correspondencias...');
    const corresRes = await axios.get(`${BASE_URL}/api/correspondencias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Status:', corresRes.status);
    console.log('📊 Total correspondências:', corresRes.data.data?.length || 0);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testEndpoints();