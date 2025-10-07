const db = require('../config/database');
const evolutionService = require('../services/evolutionService');

class InstanciaController {
  async listar(req, res) {
    try {
      const result = await db.query('SELECT * FROM instancias ORDER BY id');

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Erro ao listar instâncias:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar instâncias'
      });
    }
  }

  async criar(req, res) {
    try {
      const { nome, instance_name } = req.body;

      // Verificar conexão com Evolution API
      const conexao = await evolutionService.checkConnection(instance_name);

      const result = await db.query(
        'INSERT INTO instancias (nome, instance_name, status) VALUES ($1, $2, $3) RETURNING *',
        [nome, instance_name, conexao.connected ? 'ativa' : 'inativa']
      );

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar instância'
      });
    }
  }

  async verificarConexao(req, res) {
    try {
      const { id } = req.params;

      const instanciaResult = await db.query(
        'SELECT * FROM instancias WHERE id = $1',
        [id]
      );

      if (instanciaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Instância não encontrada'
        });
      }

      const instancia = instanciaResult.rows[0];
      const conexao = await evolutionService.checkConnection(instancia.instance_name);

      // Atualizar status no banco
      await db.query(
        'UPDATE instancias SET status = $2 WHERE id = $1',
        [id, conexao.connected ? 'ativa' : 'inativa']
      );

      res.json({
        success: true,
        connected: conexao.connected,
        data: conexao.data
      });
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar conexão'
      });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM instancias WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Instância não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Instância deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar instância'
      });
    }
  }

  async listarEvolution(req, res) {
    try {
      const resultado = await evolutionService.listInstances();

      if (resultado.success && Array.isArray(resultado.data)) {
        // Mapear para formato mais simples
        const instancias = resultado.data.map(inst => ({
          id: inst.id,
          name: inst.name,
          connectionStatus: inst.connectionStatus,
          integration: inst.integration,
          number: inst.number,
          profileName: inst.profileName,
          connected: inst.connectionStatus === 'open'
        }));

        res.json({
          success: true,
          data: instancias,
          total: instancias.length
        });
      } else {
        res.status(500).json({
          success: false,
          error: resultado.error || 'Erro ao listar instâncias'
        });
      }
    } catch (error) {
      console.error('Erro ao listar instâncias Evolution:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar instâncias Evolution'
      });
    }
  }

  // ==================== GERENCIAMENTO EVOLUTION API ====================

  // Criar instância na Evolution API
  async criarEvolution(req, res) {
    try {
      const instanceData = req.body;

      if (!instanceData.instanceName) {
        return res.status(400).json({
          success: false,
          error: 'instanceName é obrigatório'
        });
      }

      const resultado = await evolutionService.createInstance(instanceData);

      if (resultado.success) {
        res.status(201).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao criar instância Evolution:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar instância na Evolution API'
      });
    }
  }

  // Deletar instância da Evolution API
  async deletarEvolution(req, res) {
    try {
      const { instanceName } = req.params;

      if (!instanceName) {
        return res.status(400).json({
          success: false,
          error: 'instanceName é obrigatório'
        });
      }

      const resultado = await evolutionService.deleteInstance(instanceName);

      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao deletar instância Evolution:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar instância da Evolution API'
      });
    }
  }

  // Reiniciar instância
  async reiniciarEvolution(req, res) {
    try {
      const { instanceName } = req.params;

      if (!instanceName) {
        return res.status(400).json({
          success: false,
          error: 'instanceName é obrigatório'
        });
      }

      const resultado = await evolutionService.restartInstance(instanceName);

      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao reiniciar instância Evolution:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao reiniciar instância'
      });
    }
  }

  // Conectar instância (obter QR code/pairing code)
  async conectarEvolution(req, res) {
    try {
      const { instanceName } = req.params;
      const { number } = req.query;

      if (!instanceName) {
        return res.status(400).json({
          success: false,
          error: 'instanceName é obrigatório'
        });
      }

      const resultado = await evolutionService.connectInstance(instanceName, number);

      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao conectar instância Evolution:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao conectar instância'
      });
    }
  }

  // Logout/Desconectar instância
  async logoutEvolution(req, res) {
    try {
      const { instanceName } = req.params;

      if (!instanceName) {
        return res.status(400).json({
          success: false,
          error: 'instanceName é obrigatório'
        });
      }

      const resultado = await evolutionService.logoutInstance(instanceName);

      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao fazer logout da instância:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer logout da instância'
      });
    }
  }

  // Obter QR Code
  async obterQRCode(req, res) {
    try {
      const { instanceName } = req.params;

      if (!instanceName) {
        return res.status(400).json({
          success: false,
          error: 'instanceName é obrigatório'
        });
      }

      const resultado = await evolutionService.getQRCode(instanceName);

      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter QR Code'
      });
    }
  }

  // Obter status de conexão detalhado
  async statusConexao(req, res) {
    try {
      const { instanceName } = req.params;

      if (!instanceName) {
        return res.status(400).json({
          success: false,
          error: 'instanceName é obrigatório'
        });
      }

      const resultado = await evolutionService.getConnectionStatus(instanceName);

      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Erro ao obter status de conexão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter status de conexão'
      });
    }
  }
}

module.exports = new InstanciaController();
