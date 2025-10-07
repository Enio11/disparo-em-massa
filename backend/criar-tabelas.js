require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function criarTabelas() {
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

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '../database/init.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remover comandos que não funcionam no cliente
    sql = sql.replace(/CREATE DATABASE IF NOT EXISTS disparo_capitao_clean;/gi, '');
    sql = sql.replace(/\\c disparo_capitao_clean;/gi, '');

    console.log('📦 Criando tabelas...');
    await client.query(sql);
    console.log('✅ Tabelas criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

criarTabelas();
