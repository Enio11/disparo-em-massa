require('dotenv').config();
const evolutionService = require('./src/services/evolutionService');

async function testar() {
  try {
    console.log('\n🧪 Testando com instância WhatsApp Web...\n');

    const instanceName = 'finaliza-atendimento'; // WhatsApp Web (BAILEYS)
    const numero = '5513981249212';

    console.log('📱 Instância:', instanceName);
    console.log('📱 Tipo: WhatsApp Web (WHATSAPP-BAILEYS)');
    console.log('📞 Número destino:', numero);
    console.log('📞 Número formatado:', evolutionService.formatNumber(numero));

    console.log('\n📤 Enviando mensagem de teste...\n');

    const resultado = await evolutionService.sendText(
      instanceName,
      numero,
      '🎉 TESTE FUNCIONANDO! Mensagem enviada via WhatsApp Web através da Evolution API v2! 🚀\n\nSe você recebeu isso, o sistema está 100% operacional!'
    );

    if (resultado.success) {
      console.log('✅ ✅ ✅ SUCESSO! Mensagem enviada!\n');
      console.log('Resposta da API:');
      console.log(JSON.stringify(resultado.data, null, 2));
      console.log('\n🎊 Verifique seu WhatsApp!');
    } else {
      console.log('❌ ERRO ao enviar:');
      console.log(JSON.stringify(resultado.error, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Erro:', error);
  }

  process.exit(0);
}

testar();
