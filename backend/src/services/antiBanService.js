/**
 * Sistema Anti-Bloqueio WhatsApp - Melhores Práticas 2025
 *
 * Baseado em:
 * - Limites oficiais do WhatsApp Business API
 * - Recomendações de segurança Evolution API
 * - Práticas de mercado para evitar ban
 */

class AntiBanService {
  constructor() {
    // Configurações padrão
    this.config = {
      // Delays entre mensagens (em milissegundos)
      minDelay: 15000,        // 15 segundos (mínimo absoluto)
      maxDelay: 90000,        // 90 segundos (máximo para números novos)
      standardMinDelay: 20000, // 20 segundos (padrão mínimo)
      standardMaxDelay: 60000, // 60 segundos (padrão máximo)

      // Limites de mensagens
      maxMessagesPerHour: 50,        // Máximo por hora
      maxMessagesPerDay: 500,        // Máximo por dia (conta aquecida)
      maxMessagesPerDayNewAccount: 20, // Máximo para conta nova (primeiros 10 dias)

      // Pausas preventivas
      pauseAfterMessages: 20,        // Pausar a cada X mensagens
      pauseDuration: 300000,         // 5 minutos de pausa
      pauseDurationLong: 1800000,    // 30 minutos de pausa longa

      // Horários permitidos (formato 24h)
      allowedStartHour: 8,   // 8h da manhã
      allowedEndHour: 20,    // 8h da noite

      // Aquecimento de conta (dias)
      warmupDays: 10,

      // Randomização
      randomVariation: 0.3,  // 30% de variação aleatória
    };

    // Contadores
    this.messageCounters = new Map(); // Por instância
    this.dailyCounters = new Map();
    this.hourlyCounters = new Map();
    this.lastMessageTime = new Map();
  }

  /**
   * Calcular delay inteligente baseado em contexto
   */
  calculateSmartDelay(instanceName, isNewAccount = false) {
    let minDelay, maxDelay;

    if (isNewAccount) {
      // Conta nova: delays maiores
      minDelay = 30000; // 30 segundos
      maxDelay = this.config.maxDelay; // 90 segundos
    } else {
      // Conta aquecida: delays padrão
      minDelay = this.config.standardMinDelay; // 20 segundos
      maxDelay = this.config.standardMaxDelay; // 60 segundos
    }

    // Adicionar randomização (evitar padrões)
    const baseDelay = minDelay + Math.random() * (maxDelay - minDelay);
    const variation = baseDelay * this.config.randomVariation;
    const finalDelay = baseDelay + (Math.random() - 0.5) * 2 * variation;

    return Math.floor(finalDelay);
  }

  /**
   * Verificar se está em horário comercial
   */
  isBusinessHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Domingo, 6 = Sábado

    // Evitar finais de semana
    if (day === 0 || day === 6) {
      return false;
    }

    // Verificar horário (8h - 20h)
    return hour >= this.config.allowedStartHour && hour < this.config.allowedEndHour;
  }

  /**
   * Calcular tempo até próximo horário comercial
   */
  getTimeUntilBusinessHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Se é fim de semana, esperar até segunda 8h
    if (day === 0) { // Domingo
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + 1);
      nextMonday.setHours(this.config.allowedStartHour, 0, 0, 0);
      return nextMonday.getTime() - now.getTime();
    }

    if (day === 6) { // Sábado
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + 2);
      nextMonday.setHours(this.config.allowedStartHour, 0, 0, 0);
      return nextMonday.getTime() - now.getTime();
    }

    // Se está antes das 8h, esperar até 8h
    if (hour < this.config.allowedStartHour) {
      const today8am = new Date(now);
      today8am.setHours(this.config.allowedStartHour, 0, 0, 0);
      return today8am.getTime() - now.getTime();
    }

    // Se está depois das 20h, esperar até amanhã 8h
    if (hour >= this.config.allowedEndHour) {
      const tomorrow8am = new Date(now);
      tomorrow8am.setDate(now.getDate() + 1);
      tomorrow8am.setHours(this.config.allowedStartHour, 0, 0, 0);
      return tomorrow8am.getTime() - now.getTime();
    }

    return 0; // Já está em horário comercial
  }

  /**
   * Verificar se atingiu limite de mensagens
   */
  hasReachedLimit(instanceName, isNewAccount = false) {
    const dailyCount = this.getDailyCount(instanceName);
    const hourlyCount = this.getHourlyCount(instanceName);

    const dailyLimit = isNewAccount
      ? this.config.maxMessagesPerDayNewAccount
      : this.config.maxMessagesPerDay;

    return {
      hourly: hourlyCount >= this.config.maxMessagesPerHour,
      daily: dailyCount >= dailyLimit,
      hourlyCount,
      dailyCount,
      hourlyLimit: this.config.maxMessagesPerHour,
      dailyLimit
    };
  }

  /**
   * Verificar se precisa de pausa preventiva
   */
  needsPreventivePause(instanceName) {
    const count = this.getMessageCount(instanceName);

    // Pausa curta a cada 20 mensagens
    if (count > 0 && count % this.config.pauseAfterMessages === 0) {
      return {
        needed: true,
        duration: this.config.pauseDuration,
        reason: `Pausa preventiva após ${count} mensagens`
      };
    }

    // Pausa longa a cada 100 mensagens
    if (count > 0 && count % 100 === 0) {
      return {
        needed: true,
        duration: this.config.pauseDurationLong,
        reason: `Pausa longa após ${count} mensagens`
      };
    }

    return { needed: false };
  }

  /**
   * Registrar envio de mensagem
   */
  registerMessage(instanceName) {
    // Incrementar contador geral
    const currentCount = this.getMessageCount(instanceName);
    this.messageCounters.set(instanceName, currentCount + 1);

    // Incrementar contador diário
    const dailyKey = `${instanceName}_${this.getCurrentDate()}`;
    const dailyCount = this.dailyCounters.get(dailyKey) || 0;
    this.dailyCounters.set(dailyKey, dailyCount + 1);

    // Incrementar contador horário
    const hourlyKey = `${instanceName}_${this.getCurrentHour()}`;
    const hourlyCount = this.hourlyCounters.get(hourlyKey) || 0;
    this.hourlyCounters.set(hourlyKey, hourlyCount + 1);

    // Registrar timestamp
    this.lastMessageTime.set(instanceName, Date.now());
  }

  /**
   * Obter contador de mensagens
   */
  getMessageCount(instanceName) {
    return this.messageCounters.get(instanceName) || 0;
  }

  /**
   * Obter contador diário
   */
  getDailyCount(instanceName) {
    const dailyKey = `${instanceName}_${this.getCurrentDate()}`;
    return this.dailyCounters.get(dailyKey) || 0;
  }

  /**
   * Obter contador horário
   */
  getHourlyCount(instanceName) {
    const hourlyKey = `${instanceName}_${this.getCurrentHour()}`;
    return this.hourlyCounters.get(hourlyKey) || 0;
  }

  /**
   * Resetar contadores
   */
  resetCounters(instanceName) {
    this.messageCounters.set(instanceName, 0);
  }

  /**
   * Data atual (YYYY-MM-DD)
   */
  getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Hora atual (YYYY-MM-DD-HH)
   */
  getCurrentHour() {
    const now = new Date();
    return `${this.getCurrentDate()}-${now.getHours()}`;
  }

  /**
   * Variação de mensagem (personalização)
   */
  personalizeMessage(message, contact) {
    let personalized = message;

    // Substituir {{nome}} pelo nome do contato
    if (contact.nome) {
      personalized = personalized.replace(/\{\{nome\}\}/gi, contact.nome);
      personalized = personalized.replace(/\{\{name\}\}/gi, contact.nome);
    }

    // Substituir {{telefone}} pelo telefone
    if (contact.telefone) {
      personalized = personalized.replace(/\{\{telefone\}\}/gi, contact.telefone);
      personalized = personalized.replace(/\{\{phone\}\}/gi, contact.telefone);
    }

    return personalized;
  }

  /**
   * Validar número (limpar e formatar)
   */
  validateNumber(number) {
    if (!number) return null;

    // Remover caracteres especiais
    const cleaned = number.toString().replace(/[^\d]/g, '');

    // Validar se tem pelo menos 10 dígitos (DDD + número)
    if (cleaned.length < 10) {
      return null;
    }

    return cleaned;
  }

  /**
   * Obter estatísticas
   */
  getStats(instanceName) {
    return {
      messageCount: this.getMessageCount(instanceName),
      dailyCount: this.getDailyCount(instanceName),
      hourlyCount: this.getHourlyCount(instanceName),
      lastMessageTime: this.lastMessageTime.get(instanceName),
      isBusinessHours: this.isBusinessHours(),
      timeUntilBusinessHours: this.getTimeUntilBusinessHours()
    };
  }
}

module.exports = new AntiBanService();
