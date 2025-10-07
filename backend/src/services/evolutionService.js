const axios = require('axios');

class EvolutionService {
  constructor() {
    this.baseURL = process.env.EVOLUTION_API_URL || 'https://evolution.manager.capitaoclean.com';
    this.apiKey = process.env.EVOLUTION_API_KEY;
  }

  // Formatar número para o padrão WhatsApp
  formatNumber(number) {
    if (!number) return '';

    // Remover caracteres especiais e espaços
    let cleanNumber = number.toString().replace(/[^\d]/g, '');

    // Se já tem o sufixo @s.whatsapp.net, retornar como está
    if (number.includes('@s.whatsapp.net')) {
      return number;
    }

    // Adicionar sufixo do WhatsApp
    return `${cleanNumber}@s.whatsapp.net`;
  }

  async sendText(instanceName, number, text, options = {}) {
    try {
      const formattedNumber = this.formatNumber(number);

      const response = await axios.post(
        `${this.baseURL}/message/sendText/${instanceName}`,
        {
          number: formattedNumber,
          text,
          delay: options.delay || 1000,
          linkPreview: options.linkPreview || false,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar texto:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async sendMedia(instanceName, number, mediaData, options = {}) {
    try {
      const formattedNumber = this.formatNumber(number);

      const response = await axios.post(
        `${this.baseURL}/message/sendMedia/${instanceName}`,
        {
          number: formattedNumber,
          mediatype: mediaData.mediatype, // 'image' ou 'video'
          mimetype: mediaData.mimetype,
          media: mediaData.media, // URL ou base64
          fileName: mediaData.fileName,
          caption: mediaData.caption || '',
          delay: options.delay || 1000,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar mídia:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async getInstanceInfo(instanceName) {
    try {
      const response = await axios.get(
        `${this.baseURL}/instance/fetchInstances`,
        {
          headers: {
            'apikey': this.apiKey
          },
          params: {
            instanceName
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao buscar info da instância:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async checkConnection(instanceName) {
    try {
      const response = await axios.get(
        `${this.baseURL}/instance/connectionState/${instanceName}`,
        {
          headers: {
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        connected: response.data?.state === 'open' || response.data?.connectionStatus === 'open',
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao verificar conexão:', error.response?.data || error.message);
      return {
        success: false,
        connected: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Listar todas as instâncias
  async listInstances() {
    try {
      const response = await axios.get(
        `${this.baseURL}/instance/fetchInstances`,
        {
          headers: {
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao listar instâncias:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Enviar mensagem com botões
  async sendButtons(instanceName, number, buttonsData, options = {}) {
    try {
      const formattedNumber = this.formatNumber(number);

      const response = await axios.post(
        `${this.baseURL}/message/sendButton/${instanceName}`,
        {
          number: formattedNumber,
          title: buttonsData.title,
          description: buttonsData.description,
          footer: buttonsData.footer,
          buttons: buttonsData.buttons,
          delay: options.delay || 1000,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar botões:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Enviar lista/menu
  async sendList(instanceName, number, listData, options = {}) {
    try {
      const formattedNumber = this.formatNumber(number);

      const response = await axios.post(
        `${this.baseURL}/message/sendList/${instanceName}`,
        {
          number: formattedNumber,
          title: listData.title,
          description: listData.description,
          buttonText: listData.buttonText,
          footerText: listData.footerText,
          values: listData.values,
          delay: options.delay || 1000,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar lista:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Enviar enquete/poll
  async sendPoll(instanceName, number, pollData, options = {}) {
    try {
      const formattedNumber = this.formatNumber(number);

      const response = await axios.post(
        `${this.baseURL}/message/sendPoll/${instanceName}`,
        {
          number: formattedNumber,
          name: pollData.name,
          selectableCount: pollData.selectableCount || 1,
          values: pollData.values,
          delay: options.delay || 1000,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar enquete:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Enviar áudio
  async sendAudio(instanceName, number, audioData, options = {}) {
    try {
      const formattedNumber = this.formatNumber(number);

      const response = await axios.post(
        `${this.baseURL}/message/sendAudio/${instanceName}`,
        {
          number: formattedNumber,
          audio: audioData.audio, // URL ou base64
          delay: options.delay || 1000,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar áudio:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Enviar localização
  async sendLocation(instanceName, number, locationData, options = {}) {
    try {
      const formattedNumber = this.formatNumber(number);

      const response = await axios.post(
        `${this.baseURL}/message/sendLocation/${instanceName}`,
        {
          number: formattedNumber,
          name: locationData.name,
          address: locationData.address,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          delay: options.delay || 1000,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar localização:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Enviar contato
  async sendContact(instanceName, number, contactData, options = {}) {
    try {
      const formattedNumber = this.formatNumber(number);

      const response = await axios.post(
        `${this.baseURL}/message/sendContact/${instanceName}`,
        {
          number: formattedNumber,
          contact: contactData,
          delay: options.delay || 1000,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar contato:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Enviar sticker
  async sendSticker(instanceName, number, stickerData, options = {}) {
    try {
      const formattedNumber = this.formatNumber(number);

      const response = await axios.post(
        `${this.baseURL}/message/sendSticker/${instanceName}`,
        {
          number: formattedNumber,
          sticker: stickerData.sticker, // URL ou base64
          delay: options.delay || 1000,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar sticker:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

module.exports = new EvolutionService();
