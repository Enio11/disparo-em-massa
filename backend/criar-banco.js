require('dotenv').config();
const { Client } = require('pg');

async function criarBanco() {
  // Conectar ao postgres (banco padrão)
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Conecta ao banco padrão
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('🔌 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado!');

    console.log('📦 Criando banco disparo_capitao_clean...');
    await client.query('CREATE DATABASE disparo_capitao_clean;');
    console.log('✅ Banco criado com sucesso!');

  } catch (error) {
    if (error.code === '42P04') {
      console.log('⚠️  Banco já existe!');
    } else {
      console.error('❌ Erro:', error.message);
    }
  } finally {
    await client.end();
  }
}

criarBanco();
