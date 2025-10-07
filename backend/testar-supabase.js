require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testar() {
  console.log('🔍 Testando conexão com Supabase...\n');

  try {
    // Tentar buscar 1 cliente sem especificar colunas
    console.log('📋 Buscando estrutura da tabela clientes...');
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Sucesso! Estrutura da tabela:');
      console.log('\nColunas encontradas:');
      Object.keys(data[0]).forEach(col => {
        console.log(`  - ${col}: ${typeof data[0][col]}`);
      });

      console.log('\n📊 Exemplo de dados:');
      console.log(JSON.stringify(data[0], null, 2));

      console.log(`\n✅ Total de clientes: ${data.length > 0 ? 'Pelo menos 1' : '0'}`);
    } else {
      console.log('⚠️  Tabela existe mas está vazia');
    }

  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testar();
