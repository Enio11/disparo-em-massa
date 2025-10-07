const supabaseService = require('../services/supabaseService');
const db = require('../config/database');

class ClienteSupabaseController {
  async listar(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;

      const resultado = await supabaseService.listarClientes(parseInt(limit), parseInt(offset));

      if (resultado.success) {
        res.json({
          success: true,
          data: resultado.data,
          total: resultado.total
        });
      } else {
        res.status(500).json({
          success: false,
          error: resultado.error
        });
      }
    } catch (error) {
      console.error('Erro ao listar clientes Supabase:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar clientes'
      });
    }
  }

  async buscar(req, res) {
    try {
      const { id } = req.params;

      const resultado = await supabaseService.buscarCliente(id);

      if (resultado.success) {
        res.json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar cliente'
      });
    }
  }

  async filtrar(req, res) {
    try {
      const filtros = req.body;

      const resultado = await supabaseService.filtrarClientes(filtros);

      if (resultado.success) {
        res.json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: resultado.error
        });
      }
    } catch (error) {
      console.error('Erro ao filtrar clientes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao filtrar clientes'
      });
    }
  }

  async importarParaCampanha(req, res) {
    try {
      const { cliente_whatsapps, campanha_id } = req.body;

      if (!Array.isArray(cliente_whatsapps) || cliente_whatsapps.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'WhatsApps de clientes inválidos'
        });
      }

      const contatos = [];

      // Buscar clientes do Supabase
      for (const whatsapp of cliente_whatsapps) {
        const resultado = await supabaseService.buscarCliente(whatsapp);
        if (resultado.success && resultado.data) {
          contatos.push({
            nome: resultado.data.nome || '',
            telefone: resultado.data.whatsapp,
            campanha_id: campanha_id
          });
        }
      }

      if (contatos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum cliente encontrado'
        });
      }

      // Inserir contatos na campanha
      const values = contatos.map((c, idx) => {
        const offset = idx * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      }).join(', ');

      const params = contatos.flatMap(c => [c.nome, c.telefone, c.campanha_id]);

      const result = await db.query(
        `INSERT INTO contatos (nome, telefone, campanha_id) VALUES ${values} RETURNING *`,
        params
      );

      res.status(201).json({
        success: true,
        message: `${result.rows.length} clientes importados para a campanha`,
        data: result.rows
      });
    } catch (error) {
      console.error('Erro ao importar clientes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao importar clientes'
      });
    }
  }

  async contar(req, res) {
    try {
      const resultado = await supabaseService.contarClientes();

      if (resultado.success) {
        res.json({
          success: true,
          total: resultado.total
        });
      } else {
        res.status(500).json({
          success: false,
          error: resultado.error
        });
      }
    } catch (error) {
      console.error('Erro ao contar clientes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao contar clientes'
      });
    }
  }
}

module.exports = new ClienteSupabaseController();
