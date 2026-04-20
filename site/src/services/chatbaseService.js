// src/services/chatbaseService.js
export const sendMessageToChatbase = async (message) => {
  const CHATBASE_API_URL = 'https://www.chatbase.co/api/v1/chat';
  const CHATBASE_API_KEY = '6xe12kbf6lty4g2cs8h5xtsn752x49o5';
  const CHATBOT_ID = 'trZBk42RkQYDqobohv_Yn';

  try {
    console.log('🔵 Enviando para Chatbase:', message);
    
    const response = await fetch(CHATBASE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        chatbotId: CHATBOT_ID,
        stream: false,
        temperature: 0.7
      })
    });

    console.log('📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da API:', data);
    
    // A Chatbase retorna a resposta em data.text
    if (data.text) {
      return data.text;
    } else {
      throw new Error('Resposta da API sem texto');
    }
  } catch (error) {
    console.error('💥 Erro completo:', error);
    throw error;
  }
};