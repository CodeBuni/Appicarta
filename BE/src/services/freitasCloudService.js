// services/freitasCloudService.js - VERSÃO CORRIGIDA (SEM DUPLICADOS)
import Correspondencia from '../models/correspondencias.js';
import Dispositivo from '../models/dispositivo.js';

class FreitasCloudService {
  constructor() {
    this.publicKey = 'pub_f39538bd0e7cc7cd31505b05ad92d378';
    this.baseUrl = 'https://apiv.freitasrodrigues.pt/laravel/public/';
    this.ultimoSinal = null;
    this.ultimoTimestamp = null;
    this.sincronizando = false;
  }

  /**
   * Busca dados do sensor na cloud
   */
  async getSensorInfo() {
    try {
      const response = await fetch(`${this.baseUrl}?path=sensor-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_key: this.publicKey })
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao consultar cloud:', error.message);
      throw error;
    }
  }

  /**
   * GARANTE QUE EXISTE UM DISPOSITIVO
   */
  async obterOuCriarDispositivo() {
    try {
      let dispositivo = await Dispositivo.findOne();
      
      if (!dispositivo) {
        console.log('📱 A criar dispositivo...');
        dispositivo = new Dispositivo({
          nome: 'Cloud Freitas',
          tipo: 'sensor',
          status: 'ativo'
        });
        await dispositivo.save();
        console.log('✅ Dispositivo criado:', dispositivo._id);
      }
      
      return dispositivo;
    } catch (error) {
      console.error('❌ Erro ao obter dispositivo:', error);
      return null;
    }
  }

  /**
   * Processa sinal individual (usado pelo /test-sinal e /webhook)
   */
  async processarSinalCloud(sinal, timestamp, readingOriginal = null) {
    try {
      console.log(`📥 processarSinalCloud: sinal=${sinal}, timestamp=${timestamp}`);
      
      const sinalNum = Number(sinal);
      
      // Só processar 1 e 3
      if (![1, 3].includes(sinalNum)) {
        console.log(`ℹ️ Sinal ${sinal} ignorado - não é 1 ou 3`);
        return null;
      }

      const dataRegisto = timestamp ? new Date(timestamp) : new Date();
      
      // 🔥 VERIFICAÇÃO MAIS ROBUSTA: Não processar sinais com mais de 7 dias
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 7);
      
      if (dataRegisto < dataLimite) {
        console.log(`⏭️ Sinal de ${timestamp} ignorado (mais de 7 dias)`);
        return null;
      }

      // Obter dispositivo
      const dispositivo = await this.obterOuCriarDispositivo();
      if (!dispositivo) {
        console.log('❌ Sem dispositivo disponível');
        return null;
      }

      // 🔥 VERIFICAÇÃO MAIS ROBUSTA: Evitar duplicados
      // Procura por sinal e timestamp exato OU por sinal com margem de 1 segundo
      const existe = await Correspondencia.findOne({
        $or: [
          { 'metadata.timestamp': dataRegisto.toISOString(), 'metadata.sinal': sinalNum },
          { 
            'metadata.timestamp': { $gte: new Date(dataRegisto.getTime() - 1000), $lte: new Date(dataRegisto.getTime() + 1000) },
            'metadata.sinal': sinalNum 
          }
        ]
      });

      if (existe) {
        console.log(`📋 Sinal já processado em ${timestamp} (carta ${existe._id})`);
        return existe;
      }

      let resultado;

      if (sinalNum === 1) {
        // NOVA CARTA
        console.log('📬 A criar nova carta...');
        
        const carta = new Correspondencia({
          tipo: 'carta',
          status: 'pendente',
          detectadoEm: dataRegisto,
          dispositivoId: dispositivo._id,
          descricao: 'Carta recebida',
          metadata: {
            sinal: 1,
            timestamp: dataRegisto.toISOString(),
            origem: 'cloud_freitas',
            readingOriginal
          }
        });

        try {
          await carta.save();
          console.log(`✅ Carta criada: ${carta._id}`);
          resultado = carta;
        } catch (err) {
          if (err.message.includes('arcoId')) {
            console.log('⚠️ Erro de arcoId, a tentar com valor padrão...');
            
            const Arco = (await import('../models/arco.js')).default;
            const qualquerArco = await Arco.findOne();
            
            if (qualquerArco) {
              carta.arcoId = qualquerArco._id;
              await carta.save();
              console.log(`✅ Carta criada com arcoId: ${carta._id}`);
              resultado = carta;
            } else {
              console.log('❌ Sem arco disponível');
              return null;
            }
          } else {
            throw err;
          }
        }

      } else if (sinalNum === 3) {
        // MARCAR COMO RETIRADA
        console.log('📤 A marcar cartas como retiradas...');
        
        const result = await Correspondencia.updateMany(
          { status: 'pendente' },
          { 
            status: 'retirada',
            retiradoEm: dataRegisto,
            'metadata.retiradoPor': 'sistema',
            'metadata.sinalRetirada': 3
          }
        );
        
        console.log(`📤 ${result.modifiedCount} cartas retiradas`);
        resultado = { count: result.modifiedCount };
      }

      // Atualizar último sinal
      this.ultimoSinal = sinalNum;
      this.ultimoTimestamp = dataRegisto.toISOString();

      return resultado;

    } catch (error) {
      console.error('❌ Erro ao processar sinal:', error);
      return null;
    }
  }

  /**
   * SINCRONIZAÇÃO EM MASSA - Busca apenas os últimos 30 dias
   */
  async sincronizarDadosCloud() {
    if (this.sincronizando) {
      return { sucesso: false, mensagem: 'Já está a sincronizar' };
    }

    try {
      this.sincronizando = true;
      console.log('🔄 Sincronizando cloud (apenas últimos 30 dias)...');

      // 1. Buscar dados da cloud
      const response = await fetch(`${this.baseUrl}?path=sensor-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_key: this.publicKey })
      });

      const data = await response.json();
      let readings = data.readings?.items || [];
      
      // 🔥 FILTRO: Apenas sinais dos últimos 30 dias
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);
      
      readings = readings.filter(item => {
        const dataRegisto = new Date(item.recorded_at);
        return dataRegisto >= dataLimite;
      });
      
      console.log(`📊 Encontrados ${readings.length} registos (últimos 30 dias)`);

      if (readings.length === 0) {
        return { sucesso: false, mensagem: 'Sem dados recentes' };
      }

      // 2. Processar cada reading
      let processados = 0;
      let ignorados = 0;

      for (const item of readings) {
        const sinal = item.value;
        const timestamp = item.recorded_at;

        const resultado = await this.processarSinalCloud(sinal, timestamp, item);
        
        if (resultado) {
          processados++;
        } else {
          ignorados++;
        }
      }

      console.log(`✅ Sincronização concluída! Processados: ${processados}, Ignorados: ${ignorados}`);

      return {
        sucesso: true,
        processados,
        ignorados
      };

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      return { sucesso: false, mensagem: error.message };
    } finally {
      this.sincronizando = false;
    }
  }
}

// Exportar instância única
const instance = new FreitasCloudService();
export default instance;