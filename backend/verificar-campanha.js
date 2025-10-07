require('dotenv').config();
const db = require('./src/config/database');

async function verificarCampanha() {
  try {
    // Buscar campanhas recentes
    const result = await db.query(`
      SELECT id, nome, tipo, instance_name, status, created_at
      FROM campanhas
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('\n📊 Últimas Campanhas:');
    console.log('==========================================');
    result.rows.forEach(c => {
      console.log(`ID: ${c.id}`);
      console.log(`Nome: ${c.nome}`);
      console.log(`Tipo: ${c.tipo}`);
      console.log(`Instance Name: "${c.instance_name}" (${typeof c.instance_name})`);
      console.log(`Status: ${c.status}`);
      console.log(`Criada em: ${c.created_at}`);
      console.log('------------------------------------------');
    });

    // Verificar contatos da campanha 2
    const contatosResult = await db.query(`
      SELECT * FROM contatos WHERE campanha_id = 2
    `);

    console.log('\n📞 Contatos da Campanha 2:');
    console.log('==========================================');
    console.log(`Total: ${contatosResult.rows.length}`);
    contatosResult.rows.forEach(c => {
      console.log(`ID: ${c.id}, Telefone: ${c.telefone}, Nome: ${c.nome}`);
    });

    // Verificar disparos
    const disparosResult = await db.query(`
      SELECT * FROM disparos WHERE campanha_id = 2
    `);

    console.log('\n📤 Disparos da Campanha 2:');
    console.log('==========================================');
    console.log(`Total: ${disparosResult.rows.length}`);
    disparosResult.rows.forEach(d => {
      console.log(`ID: ${d.id}, Telefone: ${d.telefone}, Status: ${d.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

verificarCampanha();
