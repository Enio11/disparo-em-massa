const db = require('../config/database');

class ContatoController {
  async listar(req, res) {
    try {
      const { campanha_id } = req.query;

      let query = 'SELECT * FROM contatos';
      let params = [];

      if (campanha_id) {
        query += ' WHERE campanha_id = $1';
        params.push(campanha_id);
      }

      query += ' ORDER BY id DESC';

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Erro ao listar contatos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar contatos'
      });
    }
  }

  async criar(req, res) {
    try {
      const { nome, telefone, campanha_id } = req.body;

      const result = await db.query(
        'INSERT INTO contatos (nome, telefone, campanha_id) VALUES ($1, $2, $3) RETURNING *',
        [nome, telefone, campanha_id]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar contato'
      });
    }
  }

  async importarLote(req, res) {
    try {
      const { contatos, campanha_id } = req.body;

      if (!Array.isArray(contatos) || contatos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Envie um array de contatos válido'
        });
      }

      const values = contatos.map((c, idx) => {
        const offset = idx * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      }).join(', ');

      const params = contatos.flatMap(c => [c.nome || '', c.telefone, campanha_id]);

      const result = await db.query(
        `INSERT INTO contatos (nome, telefone, campanha_id) VALUES ${values} RETURNING *`,
        params
      );

      res.status(201).json({
        success: true,
        message: `${result.rows.length} contatos importados com sucesso`,
        data: result.rows
      });
    } catch (error) {
      console.error('Erro ao importar contatos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao importar contatos'
      });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM contatos WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Contato não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contato deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar contato'
      });
    }
  }

  async deletarPorCampanha(req, res) {
    try {
      const { campanha_id } = req.params;

      const result = await db.query(
        'DELETE FROM contatos WHERE campanha_id = $1 RETURNING id',
        [campanha_id]
      );

      res.json({
        success: true,
        message: `${result.rows.length} contatos deletados com sucesso`
      });
    } catch (error) {
      console.error('Erro ao deletar contatos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar contatos'
      });
    }
  }
}

module.exports = new ContatoController();
