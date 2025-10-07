require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function executarMigracao() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('🔌 Conectando ao banco disparo_capitao_clean...');
    await client.connect();
    console.log('✅ Conectado!');

    // Ler o arquivo de migração
    const sqlPath = path.join(__dirname, '../database/migration-novos-tipos.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📦 Executando migração...');
    await client.query(sql);
    console.log('✅ Migração executada com sucesso!');
    console.log('');
    console.log('🎉 Novos recursos disponíveis:');
    console.log('   - Tabela de mídias criada');
    console.log('   - Campos novos nas campanhas');
    console.log('   - Suporte a 9 tipos de mensagens');
    console.log('');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    await client.end();
  }
}

executarMigracao();
