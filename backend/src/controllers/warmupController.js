const warmupService = require('../services/warmupService');
const antiBanService = require('../services/antiBanService');

class WarmupController {
  // Iniciar aquecimento
  async start(req, res) {
    try {
      const { instance_name } = req.body;

      if (!instance_name) {
        return res.status(400).json({
          success: false,
          error: 'Nome da instância é obrigatório'
        });
      }

      const result = await warmupService.startWarmup(instance_name);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Erro ao iniciar aquecimento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao iniciar aquecimento'
      });
    }
  }

  // Obter status do aquecimento
  async status(req, res) {
    try {
      const { instance_name } = req.params;

      const result = await warmupService.getWarmupStatus(instance_name);

      res.json(result);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar status do aquecimento'
      });
    }
  }

  // Parar aquecimento
  async stop(req, res) {
    try {
      const { instance_name } = req.body;

      if (!instance_name) {
        return res.status(400).json({
          success: false,
          error: 'Nome da instância é obrigatório'
        });
      }

      const result = await warmupService.stopWarmup(instance_name);

      res.json(result);
    } catch (error) {
      console.error('Erro ao parar aquecimento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao parar aquecimento'
      });
    }
  }

  // Obter cronograma completo
  async schedule(req, res) {
    try {
      const schedule = warmupService.getFullSchedule();

      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      console.error('Erro ao buscar cronograma:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar cronograma'
      });
    }
  }

  // Obter métricas anti-bloqueio
  async metrics(req, res) {
    try {
      const { instance_name } = req.params;

      // Status do aquecimento
      const warmupStatus = await warmupService.getWarmupStatus(instance_name);

      // Estatísticas anti-ban
      const antiBanStats = antiBanService.getStats(instance_name);

      res.json({
        success: true,
        data: {
          warmup: warmupStatus,
          antiBan: {
            messageCount: antiBanStats.messageCount,
            dailyCount: antiBanStats.dailyCount,
            hourlyCount: antiBanStats.hourlyCount,
            lastMessageTime: antiBanStats.lastMessageTime,
            isBusinessHours: antiBanStats.isBusinessHours,
            limits: {
              hourly: 50,
              daily: warmupStatus.isWarmingUp ? warmupStatus.maxMessagesPerDay : 500
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar métricas'
      });
    }
  }
}

module.exports = new WarmupController();
