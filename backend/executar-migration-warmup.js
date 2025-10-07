require('dotenv').config();
const db = require('./src/config/database');
const fs = require('fs');

async function executarMigration() {
  try {
    console.log('📊 Executando migration para tabela number_warmup...\n');

    const sql = fs.readFileSync('./criar-tabela-warmup.sql', 'utf8');

    await db.query(sql);

    console.log('✅ Tabela number_warmup criada com sucesso!');
    console.log('✅ Índices criados!');
    console.log('\n🎉 Migration executada com sucesso!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  }
}

executarMigration();
