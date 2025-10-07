require('dotenv').config();
const db = require('./src/config/database');

async function atualizar() {
  console.log('📝 Adicionando coluna instance_name na tabela campanhas...\n');

  try {
    await db.query(`
      ALTER TABLE campanhas
      ADD COLUMN IF NOT EXISTS instance_name VARCHAR(255);
    `);

    console.log('✅ Coluna instance_name adicionada com sucesso!\n');

    // Migrar dados existentes
    console.log('📝 Migrando dados existentes...\n');

    const result = await db.query(`
      UPDATE campanhas c
      SET instance_name = i.instance_name
      FROM instancias i
      WHERE c.instancia_id = i.id
      AND c.instance_name IS NULL
    `);

    console.log(`✅ ${result.rowCount} registros migrados!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

atualizar();
