require('dotenv').config();
const evolutionService = require('./src/services/evolutionService');

async function listar() {
  try {
    console.log('\n📱 Listando todas as instâncias da Evolution API...\n');

    const resultado = await evolutionService.listInstances();

    if (!resultado.success || !resultado.data) {
      console.log('❌ Erro ao listar instâncias:', resultado.error);
      process.exit(1);
    }

    const instancias = Array.isArray(resultado.data) ? resultado.data : [];

    console.log(`Total de instâncias: ${instancias.length}\n`);
    console.log('==========================================');

    instancias.forEach((inst, index) => {
      console.log(`\n${index + 1}. ${inst.name}`);
      console.log('   Status:', inst.connectionStatus);
      console.log('   Tipo:', inst.integration || 'N/A');
      console.log('   Business ID:', inst.businessId || 'N/A');
      console.log('   Number:', inst.number || 'N/A');
      console.log('   Connected:', inst.connectionStatus === 'open' ? '✅ SIM' : '❌ NÃO');

      if (inst.integration === 'WHATSAPP-BUSINESS') {
        console.log('   ⚠️  Esta é uma instância Business API (tem restrições!)');
      } else {
        console.log('   ✅ Esta é uma instância WhatsApp Web (mais flexível)');
      }
    });

    console.log('\n==========================================');

    const conectadas = instancias.filter(i => i.connectionStatus === 'open');
    const webInstances = conectadas.filter(i => i.integration !== 'WHATSAPP-BUSINESS');

    console.log(`\nInstâncias conectadas: ${conectadas.length}`);
    console.log(`Instâncias WhatsApp Web conectadas: ${webInstances.length}`);

    if (webInstances.length > 0) {
      console.log('\n✅ Recomendação: Use uma dessas instâncias WhatsApp Web para testes:');
      webInstances.forEach(inst => {
        console.log(`   - ${inst.name}`);
      });
    } else {
      console.log('\n⚠️  Todas as instâncias são Business API. Você precisará:');
      console.log('   1. Usar templates aprovados pelo Facebook, OU');
      console.log('   2. Conectar uma instância via QR Code (WhatsApp Web)');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }

  process.exit(0);
}

listar();
