// services/scheduler.js - VERSÃO CORRIGIDA
import freitasCloudService from './freitasCloudService.js';

class Scheduler {
  constructor() {
    this.syncInterval = null;
    this.isSyncing = false;
  }

  startAutoSync(intervalMinutes = 5) {
    console.log(`🔄 Iniciando sincronização automática a cada ${intervalMinutes} minutos`);
    
    // Converter minutos para milissegundos
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Função de sincronização
    const syncFunction = async () => {
      if (this.isSyncing) {
        console.log('⏳ Já está sincronizando, ignorando...');
        return;
      }
      
      try {
        this.isSyncing = true;
        // ✅ CORREÇÃO: Usar o nome correto do método
        const resultado = await freitasCloudService.sincronizarDadosCloud();
        
        if (resultado.sucesso) {
          console.log(`✅ Sincronização concluída: ${resultado.processados} sinais processados`);
        } else {
          console.log(`⚠️ Sincronização com problemas: ${resultado.mensagem || 'Erro desconhecido'}`);
        }
        
      } catch (error) {
        console.error('❌ Erro na sincronização automática:', error.message);
      } finally {
        this.isSyncing = false;
      }
    };
    
    // Executar imediatamente uma vez
    setTimeout(syncFunction, 2000); // Esperar 2 segundos para o servidor iniciar
    
    // Agendar periodicamente
    this.syncInterval = setInterval(syncFunction, intervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      console.log('⏹️ Sincronização automática parada');
    }
  }
}

export default new Scheduler();