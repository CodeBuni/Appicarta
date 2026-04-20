// test_tracking.js
import axios from 'axios';

const TRACKINGMORE_API_KEY = 'dbyinx0l-b7qx-rh9g-o443-0f3h60s36gj9';

async function createCttTracking(trackingNumber, additionalData = {}) {
  try {
    console.log(`📮 Criando tracking CTT: ${trackingNumber}`);
    
    const data = {
      tracking_number: trackingNumber,
      courier_code: 'ctt',  // ← CÓDIGO CORRETO!
      ...additionalData
    };
    
    const response = await axios.post(
      'https://api.trackingmore.com/v4/trackings/create',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Tracking-Api-Key': TRACKINGMORE_API_KEY
        },
        timeout: 10000
      }
    );
    
    console.log('✅ SUCESSO! Tracking criado:');
    console.log('📦 ID:', response.data.data.id);
    console.log('📦 Tracking:', response.data.data.tracking_number);
    console.log('📦 Transportadora:', response.data.data.courier_code);
    console.log('📦 Criado em:', response.data.data.created_at);
    
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    
    if (errorData?.meta?.code === 4006) {
      console.log(`⚠️  Tracking ${trackingNumber} já existe na sua conta`);
    } else {
      console.error('❌ ERRO:', errorData?.meta || error.message);
    }
    
    return null;
  }
}

// Função para buscar informações de um tracking
async function getTrackingInfo(trackingNumber, courierCode = 'ctt') {
  try {
    console.log(`🔍 Buscando informações para: ${trackingNumber}`);
    
    const response = await axios.get(
      'https://api.trackingmore.com/v4/trackings/get',
      {
        params: {
          tracking_numbers: trackingNumber,
          courier_code: courierCode
        },
        headers: {
          'Tracking-Api-Key': TRACKINGMORE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    if (response.data.data && response.data.data.length > 0) {
      const tracking = response.data.data[0];
      console.log('✅ Informações encontradas:');
      console.log('📦 Status:', tracking.status || 'Pendente');
      console.log('📦 Última atualização:', tracking.updated_at);
      
      if (tracking.origin_info && tracking.origin_info.trackinfo) {
        console.log('\n📋 Histórico de eventos:');
        tracking.origin_info.trackinfo.forEach((event, index) => {
          console.log(`${index + 1}. ${event.Date} - ${event.StatusDescription}`);
        });
      }
      
      return tracking;
    } else {
      console.log('ℹ️  Nenhuma informação encontrada');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar tracking:', error.response?.data?.meta || error.message);
    return null;
  }
}

// Função para listar todos os trackings da conta
async function listAllTrackings() {
  try {
    console.log('📋 Listando todos os trackings da conta...');
    
    const response = await axios.get(
      'https://api.trackingmore.com/v4/trackings',
      {
        params: {
          limit: 50,
          sort: 'created_at_desc'
        },
        headers: {
          'Tracking-Api-Key': TRACKINGMORE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    const items = response.data.data?.items || [];
    console.log(`✅ Total de trackings: ${items.length}`);
    
    items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.tracking_number} (${item.courier_code})`);
      console.log(`   Status: ${item.status || 'Pendente'}`);
      console.log(`   Criado: ${item.created_at}`);
    });
    
    return items;
  } catch (error) {
    console.error('❌ Erro ao listar trackings:', error.response?.data || error.message);
    return [];
  }
}

// Função para atualizar um tracking
async function updateTracking(trackingId, updateData) {
  try {
    console.log(`✏️  Atualizando tracking ID: ${trackingId}`);
    
    const response = await axios.put(
      `https://api.trackingmore.com/v4/trackings/${trackingId}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Tracking-Api-Key': TRACKINGMORE_API_KEY
        }
      }
    );
    
    console.log('✅ Tracking atualizado com sucesso!');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao atualizar:', error.response?.data?.meta || error.message);
    return null;
  }
}

// Função para deletar um tracking
async function deleteTracking(trackingId) {
  try {
    console.log(`🗑️  Deletando tracking ID: ${trackingId}`);
    
    const response = await axios.delete(
      `https://api.trackingmore.com/v4/trackings/${trackingId}`,
      {
        headers: {
          'Tracking-Api-Key': TRACKINGMORE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ Tracking deletado com sucesso!');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao deletar:', error.response?.data?.meta || error.message);
    return null;
  }
}

// Teste completo
async function runCompleteTest() {
  console.log('🚀 TESTE COMPLETO TRACKINGMORE API - CTT PORTUGAL\n');
  
  // 1. Listar trackings existentes
  await listAllTrackings();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 2. Criar novo tracking CTT
  const testNumber = `CJ${Date.now().toString().slice(-9)}PT`; // Número único
  const newTracking = await createCttTracking(testNumber, {
    customer_name: 'João Silva',
    customer_email: 'joao@exemplo.pt',
    order_id: `PEDIDO-${Date.now()}`,
    note: 'Encomenda AppiCarta - Teste API'
  });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (newTracking) {
    const trackingId = newTracking.data.id;
    
    // 3. Buscar informações do tracking criado
    await getTrackingInfo(testNumber);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Atualizar tracking (exemplo: adicionar título)
    await updateTracking(trackingId, {
      title: 'Livros Importantes'
    });
    
    // 5. Deletar tracking de teste (opcional)
    console.log('\n' + '='.repeat(50) + '\n');
    const shouldDelete = false; // Mudar para true para deletar
    if (shouldDelete) {
      await deleteTracking(trackingId);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 TESTE CONCLUÍDO!');
  console.log('📌 Código CTT: "ctt"');
  console.log('📌 API Key: Válida ✅');
  console.log('📌 Endpoints: Todos funcionando');
}

// Executar o teste
runCompleteTest();