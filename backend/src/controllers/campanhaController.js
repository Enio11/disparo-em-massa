const db = require('../config/database');
const disparoService = require('../services/disparoService');

class CampanhaController {
  async listar(req, res) {
    try {
      const result = await db.query(`
        SELECT c.*, i.nome as instancia_nome, i.instance_name
        FROM campanhas c
        LEFT JOIN instancias i ON c.instancia_id = i.id
        ORDER BY c.created_at DESC
      `);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Erro ao listar campanhas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar campanhas'
      });
    }
  }

  async buscar(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(`
        SELECT c.*, i.nome as instancia_nome, i.instance_name
        FROM campanhas c
        LEFT JOIN instancias i ON c.instancia_id = i.id
        WHERE c.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Campanha não encontrada'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao buscar campanha:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar campanha'
      });
    }
  }

  async criar(req, res) {
    try {
      const {
        nome,
        tipo,
        mensagem,
        media_url,
        media_filename,
        mimetype,
        delay_entre_envios,
        instancia_id,
        instance_name
      } = req.body;

      const result = await db.query(
        `INSERT INTO campanhas (nome, tipo, mensagem, media_url, media_filename, mimetype, delay_entre_envios, instancia_id, instance_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [nome, tipo, mensagem, media_url, media_filename, mimetype, delay_entre_envios || 5000, instancia_id, instance_name]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar campanha'
      });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        tipo,
        mensagem,
        media_url,
        media_filename,
        mimetype,
        delay_entre_envios,
        instancia_id
      } = req.body;

      const result = await db.query(
        `UPDATE campanhas
         SET nome = COALESCE($2, nome),
             tipo = COALESCE($3, tipo),
             mensagem = COALESCE($4, mensagem),
             media_url = COALESCE($5, media_url),
             media_filename = COALESCE($6, media_filename),
             mimetype = COALESCE($7, mimetype),
             delay_entre_envios = COALESCE($8, delay_entre_envios),
             instancia_id = COALESCE($9, instancia_id)
         WHERE id = $1
         RETURNING *`,
        [id, nome, tipo, mensagem, media_url, media_filename, mimetype, delay_entre_envios, instancia_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Campanha não encontrada'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar campanha'
      });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM campanhas WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Campanha não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Campanha deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar campanha:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar campanha'
      });
    }
  }

  async iniciar(req, res) {
    try {
      const { id } = req.params;

      const resultado = await disparoService.iniciarCampanha(parseInt(id));

      res.json({
        success: true,
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao iniciar campanha:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao iniciar campanha'
      });
    }
  }

  async pausar(req, res) {
    try {
      const { id } = req.params;

      await disparoService.pausarCampanha(parseInt(id));

      res.json({
        success: true,
        message: 'Campanha pausada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao pausar campanha:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao pausar campanha'
      });
    }
  }

  async retomar(req, res) {
    try {
      const { id } = req.params;

      const resultado = await disparoService.retomarCampanha(parseInt(id));

      res.json({
        success: true,
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao retomar campanha:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao retomar campanha'
      });
    }
  }

  async estatisticas(req, res) {
    try {
      const { id } = req.params;

      const disparosResult = await db.query(
        `SELECT
          status,
          COUNT(*) as total
         FROM disparos
         WHERE campanha_id = $1
         GROUP BY status`,
        [id]
      );

      const stats = {
        pendente: 0,
        enviado: 0,
        erro: 0,
        falha: 0
      };

      disparosResult.rows.forEach(row => {
        stats[row.status] = parseInt(row.total);
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar estatísticas'
      });
    }
  }
}

module.exports = new CampanhaController();
