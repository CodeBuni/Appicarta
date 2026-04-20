import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TRACKINGMORE_API_KEY = process.env.TRACKINGMORE_API_KEY;
const TRACKINGMORE_BASE_URL = 'https://api.trackingmore.com/v4';

class TrackingService {
  constructor() {
    this.apiKey = TRACKINGMORE_API_KEY;
    this.api = axios.create({
      baseURL: TRACKINGMORE_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Tracking-Api-Key': this.apiKey
      },
      timeout: 15000
    });
  }

  // Método para criar um tracking
  async criarTracking(trackingNumber, transportadora, titulo = '', descricao = '') {
    try {
      console.log(`📦 Criando tracking para: ${trackingNumber} (${transportadora})`);
      
      const payload = {
        tracking_number: trackingNumber,
        courier_code: this.getCarrierCode(transportadora)
      };
      
      // Adicionar campos opcionais se fornecidos
      if (titulo) payload.title = titulo;
      if (descricao) payload.note = descricao;
      
      console.log('📤 Payload para API:', JSON.stringify(payload, null, 2));
      
      const response = await this.api.post('/trackings/create', payload);
      
      console.log('✅ Tracking criado com sucesso:', response.data?.data?.id);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Tracking criado com sucesso'
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar tracking:', error.response?.data || error.message);
      
      const errorData = error.response?.data;
      
      // TRATAMENTO CRÍTICO: 4101 e 4006 NÃO são erros para nós!
      if (errorData?.meta?.code === 4101) {
        console.log('ℹ️  Tracking já existe na API (4101) - OK para nós!');
        console.log('📊 Dados retornados:', errorData.data);
        
        return {
          success: true,  // IMPORTANTE: true, não false!
          message: 'Tracking já existe na API, será criado no sistema local',
          code: 4101,
          data: errorData.data || null  // A API retorna os dados mesmo com erro
        };
      }
      
      if (errorData?.meta?.code === 4006) {
        console.log('ℹ️  Tracking já existe na API (4006) - OK para nós!');
        return {
          success: true,  // IMPORTANTE: true, não false!
          message: 'Tracking já existe na API',
          code: 4006,
          data: errorData.data || null
        };
      }
      
      // Só lançar erro para códigos REALMENTE problemáticos
      throw new Error(`Falha ao criar tracking: ${errorData?.meta?.message || error.message}`);
    }
  }

  // Método para obter status do tracking
  async obterStatusTracking(trackingNumber, courierCode = 'ctt') {
    try {
      console.log(`🔍 Obtendo status do tracking: ${trackingNumber} (${courierCode})`);
      
      const response = await this.api.get('/trackings/get', {
        params: {
          tracking_numbers: trackingNumber,
          courier_code: courierCode
        }
      });
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('✅ Status obtido com sucesso');
        return {
          success: true,
          data: response.data.data[0]
        };
      }
      
      return {
        success: false,
        message: 'Tracking não encontrado'
      };
    } catch (error) {
      console.error('❌ Erro ao obter status tracking:', error.response?.data || error.message);
      throw new Error(`Falha ao obter status: ${error.response?.data?.meta?.message || error.message}`);
    }
  }

  // Método para obter todos os trackings da conta
  async obterTodosTrackings() {
    try {
      console.log('📋 Obtendo todos os trackings da conta...');
      
      const response = await this.api.get('/trackings', {
        params: {
          limit: 100
        }
      });
      
      return {
        success: true,
        data: response.data.data?.items || []
      };
    } catch (error) {
      console.error('❌ Erro ao obter trackings:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Método para deletar um tracking
  async deletarTracking(trackingId) {
    try {
      console.log(`🗑️  Deletando tracking ID: ${trackingId}`);
      
      const response = await this.api.delete(`/trackings/${trackingId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Erro ao deletar tracking:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Método para atualizar um tracking
  async atualizarTracking(trackingId, updateData) {
    try {
      console.log(`✏️  Atualizando tracking ID: ${trackingId}`);
      
      const response = await this.api.put(`/trackings/${trackingId}`, updateData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar tracking:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Mapear transportadora para código da API
  getCarrierCode(transportadora) {
    const carriers = {
      'ctt': 'ctt',
      'dhl': 'dhl',
      'ups': 'ups',
      'fedex': 'fedex',
      'dpd': 'dpd',
      'chronopost': 'chronopost-portugal',
      'seur': 'seur',
      'correos': 'correos',
      'outra': 'other'
    };
    
    return carriers[transportadora] || transportadora;
  }

  // Traduzir status da API para português
  traduzirStatus(apiStatus) {
    const statusMap = {
      'pending': 'pendente',
      'transit': 'em_transito',
      'delivered': 'entregue',
      'exception': 'problema',
      'info_received': 'pendente',
      'pickedup': 'recolhido',
      'notfound': 'nao_encontrado',
      'inforeceived': 'pendente',
      'expired': 'expirado'
    };
    
    return statusMap[apiStatus?.toLowerCase()] || 'pendente';
  }

  // Método para detectar transportadora automaticamente
  async detectarTransportadora(trackingNumber) {
    try {
      console.log(`🔍 Detectando transportadora para: ${trackingNumber}`);
      
      const response = await this.api.post('/trackings/detect', {
        tracking_number: trackingNumber
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Erro ao detectar transportadora:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.meta || error.message
      };
    }
  }

  // Método para obter informações detalhadas de um tracking
  async obterDetalhesTracking(trackingNumber, courierCode = 'ctt') {
    try {
      console.log(`📋 Obtendo detalhes do tracking: ${trackingNumber}`);
      
      const response = await this.api.get(`/trackings/${courierCode}/${trackingNumber}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Erro ao obter detalhes:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

export default new TrackingService();