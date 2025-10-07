/**
 * Sistema de Aquecimento de Números WhatsApp
 *
 * Baseado em melhores práticas 2025:
 * - Processo gradual de 3-4 semanas
 * - Aumenta limites progressivamente
 * - Monitora taxa de resposta
 */

const db = require('../config/database');

class WarmupService {
  constructor() {
    // Cronograma de aquecimento (em dias)
    this.warmupSchedule = [
      // Semana 1 - Muito conservador
      { day: 1, maxMessages: 10, description: 'Dia 1 - Início muito lento' },
      { day: 2, maxMessages: 10, description: 'Dia 2 - Mantendo ritmo baixo' },
      { day: 3, maxMessages: 15, description: 'Dia 3 - Leve aumento' },
      { day: 4, maxMessages: 15, description: 'Dia 4 - Consolidando' },
      { day: 5, maxMessages: 20, description: 'Dia 5 - Pequeno aumento' },
      { day: 6, maxMessages: 20, description: 'Dia 6 - Consolidando' },
      { day: 7, maxMessages: 25, description: 'Dia 7 - Fim da semana 1' },

      // Semana 2 - Aumento moderado
      { day: 8, maxMessages: 30, description: 'Dia 8 - Aumento moderado' },
      { day: 9, maxMessages: 35, description: 'Dia 9 - Continuando' },
      { day: 10, maxMessages: 40, description: 'Dia 10 - Progresso' },
      { day: 11, maxMessages: 50, description: 'Dia 11 - Aumento significativo' },
      { day: 12, maxMessages: 60, description: 'Dia 12 - Consolidando' },
      { day: 13, maxMessages: 70, description: 'Dia 13 - Progresso' },
      { day: 14, maxMessages: 80, description: 'Dia 14 - Fim da semana 2' },

      // Semana 3 - Aceleração
      { day: 15, maxMessages: 100, description: 'Dia 15 - 100 mensagens!' },
      { day: 16, maxMessages: 120, description: 'Dia 16 - Acelerando' },
      { day: 17, maxMessages: 150, description: 'Dia 17 - Progresso' },
      { day: 18, maxMessages: 180, description: 'Dia 18 - Consolidando' },
      { day: 19, maxMessages: 200, description: 'Dia 19 - 200 mensagens' },
      { day: 20, maxMessages: 250, description: 'Dia 20 - Acelerando' },
      { day: 21, maxMessages: 300, description: 'Dia 21 - Fim da semana 3' },

      // Semana 4 - Capacidade total
      { day: 22, maxMessages: 350, description: 'Dia 22 - Quase lá' },
      { day: 23, maxMessages: 400, description: 'Dia 23 - Progresso' },
      { day: 24, maxMessages: 450, description: 'Dia 24 - Consolidando' },
      { day: 25, maxMessages: 500, description: 'Dia 25 - Capacidade total!' },
      { day: 26, maxMessages: 500, description: 'Dia 26 - Manutenção' },
      { day: 27, maxMessages: 500, description: 'Dia 27 - Manutenção' },
      { day: 28, maxMessages: 500, description: 'Dia 28 - Aquecimento completo!' }
    ];
  }

  /**
   * Iniciar aquecimento para uma instância
   */
  async startWarmup(instanceName) {
    try {
      // Verificar se já existe aquecimento ativo
      const existing = await db.query(
        `SELECT * FROM number_warmup WHERE instance_name = $1 AND status = 'ativo'`,
        [instanceName]
      );

      if (existing.rows.length > 0) {
        return {
          success: false,
          error: 'Já existe um aquecimento ativo para esta instância'
        };
      }

      // Criar registro de aquecimento
      const result = await db.query(
        `INSERT INTO number_warmup (instance_name, start_date, current_day, status)
         VALUES ($1, NOW(), 1, 'ativo')
         RETURNING *`,
        [instanceName]
      );

      return {
        success: true,
        data: result.rows[0],
        schedule: this.warmupSchedule[0]
      };
    } catch (error) {
      console.error('Erro ao iniciar aquecimento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter status do aquecimento
   */
  async getWarmupStatus(instanceName) {
    try {
      const result = await db.query(
        `SELECT * FROM number_warmup WHERE instance_name = $1 AND status = 'ativo'`,
        [instanceName]
      );

      if (result.rows.length === 0) {
        return {
          success: true,
          isWarmingUp: false,
          isComplete: false
        };
      }

      const warmup = result.rows[0];
      const currentDay = this.calculateCurrentDay(warmup.start_date);
      const schedule = this.getScheduleForDay(currentDay);

      // Verificar se completou
      if (currentDay > 28) {
        await this.completeWarmup(instanceName);

        return {
          success: true,
          isWarmingUp: false,
          isComplete: true,
          completedAt: warmup.updated_at
        };
      }

      return {
        success: true,
        isWarmingUp: true,
        isComplete: false,
        currentDay,
        maxMessagesPerDay: schedule.maxMessages,
        description: schedule.description,
        progress: Math.round((currentDay / 28) * 100),
        startDate: warmup.start_date
      };
    } catch (error) {
      console.error('Erro ao buscar status do aquecimento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calcular dia atual do aquecimento
   */
  calculateCurrentDay(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Obter cronograma para um dia específico
   */
  getScheduleForDay(day) {
    if (day > 28) {
      return this.warmupSchedule[this.warmupSchedule.length - 1];
    }

    const schedule = this.warmupSchedule.find(s => s.day === day);
    return schedule || this.warmupSchedule[0];
  }

  /**
   * Completar aquecimento
   */
  async completeWarmup(instanceName) {
    try {
      await db.query(
        `UPDATE number_warmup
         SET status = 'completo', updated_at = NOW()
         WHERE instance_name = $1 AND status = 'ativo'`,
        [instanceName]
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao completar aquecimento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parar aquecimento
   */
  async stopWarmup(instanceName) {
    try {
      await db.query(
        `UPDATE number_warmup
         SET status = 'pausado', updated_at = NOW()
         WHERE instance_name = $1 AND status = 'ativo'`,
        [instanceName]
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao parar aquecimento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter cronograma completo
   */
  getFullSchedule() {
    return this.warmupSchedule;
  }

  /**
   * Validar se pode enviar mensagens (considerando aquecimento)
   */
  async canSendMessage(instanceName, messagesToday) {
    const status = await this.getWarmupStatus(instanceName);

    if (!status.success) {
      return { canSend: true, reason: 'Erro ao verificar aquecimento' };
    }

    if (!status.isWarmingUp) {
      return { canSend: true, reason: 'Não está em aquecimento' };
    }

    if (messagesToday >= status.maxMessagesPerDay) {
      return {
        canSend: false,
        reason: `Limite de aquecimento atingido: ${status.maxMessagesPerDay} mensagens/dia (Dia ${status.currentDay}/28)`,
        maxMessages: status.maxMessagesPerDay,
        currentDay: status.currentDay
      };
    }

    return {
      canSend: true,
      reason: 'Dentro do limite de aquecimento',
      remaining: status.maxMessagesPerDay - messagesToday,
      maxMessages: status.maxMessagesPerDay,
      currentDay: status.currentDay
    };
  }
}

module.exports = new WarmupService();
