require('dotenv').config();
const axios = require('axios');

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;

async function testar() {
  console.log('🔍 Testando Evolution API...\n');
  console.log(`URL: ${EVOLUTION_URL}`);
  console.log(`API Key: ${EVOLUTION_KEY?.substring(0, 10)}...\n`);

  try {
    // 1. Buscar todas as instâncias
    console.log('📋 Listando todas as instâncias...');
    const response = await axios.get(
      `${EVOLUTION_URL}/instance/fetchInstances`,
      {
        headers: {
          'apikey': EVOLUTION_KEY
        }
      }
    );

    if (response.data) {
      console.log('\n✅ Instâncias encontradas:');

      if (Array.isArray(response.data)) {
        console.log(`\nTotal: ${response.data.length} instâncias\n`);

        // Mostrar estrutura da primeira instância
        console.log('📄 Estrutura da primeira instância (RAW):');
        console.log(JSON.stringify(response.data[0], null, 2));
        console.log('\n' + '='.repeat(60) + '\n');

        // Listar todas
        response.data.forEach((inst, idx) => {
          console.log(`\n  ${idx + 1}. Nome: ${inst.name}`);
          console.log(`     Status: ${inst.connectionStatus}`);
          console.log(`     Integration: ${inst.integration}`);
          console.log(`     Number: ${inst.number || 'N/A'}`);
        });
      } else {
        console.log(JSON.stringify(response.data, null, 2));
      }
    }

  } catch (error) {
    console.error('\n❌ Erro ao testar Evolution API:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Mensagem: ${error.response?.data?.message || error.message}`);
    console.error(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`);
  }
}

testar();
