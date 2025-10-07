require('dotenv').config();
const db = require('./src/config/database');

async function verificar() {
  try {
    // Buscar última campanha
    const campanhaResult = await db.query(`
      SELECT * FROM campanhas ORDER BY created_at DESC LIMIT 1
    `);

    const campanha = campanhaResult.rows[0];
    console.log('\n📊 Última Campanha:');
    console.log('==========================================');
    console.log('ID:', campanha.id);
    console.log('Nome:', campanha.nome);
    console.log('Tipo:', campanha.tipo);
    console.log('Instance Name:', `"${campanha.instance_name}"`, typeof campanha.instance_name);
    console.log('Status:', campanha.status);
    console.log('Mensagem:', campanha.mensagem);
    console.log('Created at:', campanha.created_at);

    // Buscar disparos
    const disparosResult = await db.query(`
      SELECT d.*, c.telefone, c.nome
      FROM disparos d
      JOIN contatos c ON d.contato_id = c.id
      WHERE d.campanha_id = $1
    `, [campanha.id]);

    console.log('\n📤 Disparos:');
    console.log('==========================================');
    disparosResult.rows.forEach(d => {
      console.log(`Telefone: ${d.telefone}`);
      console.log(`Nome: ${d.nome}`);
      console.log(`Status: ${d.status}`);
      console.log(`Resposta API:`, d.resposta_api);
      console.log('------------------------------------------');
    });

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

verificar();
