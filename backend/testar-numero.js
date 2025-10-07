require('dotenv').config();
const axios = require('axios');

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

async function testarNumero() {
  try {
    console.log('\n🔍 Testando número no WhatsApp...\n');

    // Testar se o número existe no WhatsApp
    const instanceName = 'disparo_oficial_01';
    const numero = '5513981249212';

    console.log('Instância:', instanceName);
    console.log('Número:', numero);
    console.log('Evolution URL:', EVOLUTION_URL);
    console.log('API Key:', API_KEY ? 'Configurada ✅' : 'NÃO configurada ❌');

    // Verificar se a instância está conectada
    console.log('\n📱 Verificando status da instância...');
    const statusResponse = await axios.get(
      `${EVOLUTION_URL}/instance/fetchInstances`,
      {
        headers: { 'apikey': API_KEY },
        params: { instanceName }
      }
    );

    console.log('\nStatus da instância:', JSON.stringify(statusResponse.data, null, 2));

    // Tentar enviar mensagem de teste
    console.log('\n📤 Tentando enviar mensagem...');
    const sendResponse = await axios.post(
      `${EVOLUTION_URL}/message/sendText/${instanceName}`,
      {
        number: numero,
        text: 'Teste de conexão',
        delay: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      }
    );

    console.log('\n✅ Resposta do envio:', JSON.stringify(sendResponse.data, null, 2));

  } catch (error) {
    console.error('\n❌ Erro:', error.response?.data || error.message);
    if (error.response?.data) {
      console.log('\nDetalhes do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }

  process.exit(0);
}

testarNumero();
