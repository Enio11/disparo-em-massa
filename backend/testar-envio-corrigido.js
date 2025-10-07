require('dotenv').config();
const evolutionService = require('./src/services/evolutionService');

async function testar() {
  try {
    console.log('\n🧪 Testando correção de formato de número...\n');

    const instanceName = 'disparo_oficial_01';
    const numero = '5513981249212';

    console.log('📱 Instância:', instanceName);
    console.log('📞 Número original:', numero);
    console.log('📞 Número formatado:', evolutionService.formatNumber(numero));

    console.log('\n📤 Enviando mensagem de teste...');

    const resultado = await evolutionService.sendText(
      instanceName,
      numero,
      '🎉 Teste de correção da Evolution API! Se você recebeu essa mensagem, tudo está funcionando perfeitamente! 🚀'
    );

    if (resultado.success) {
      console.log('\n✅ SUCESSO! Mensagem enviada!');
      console.log('Resposta da API:', JSON.stringify(resultado.data, null, 2));
    } else {
      console.log('\n❌ ERRO ao enviar:');
      console.log(JSON.stringify(resultado.error, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Erro:', error);
  }

  process.exit(0);
}

testar();
