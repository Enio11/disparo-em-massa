const db = require('../config/database');
const evolutionService = require('./evolutionService');
const supabaseService = require('./supabaseService');
const antiBanService = require('./antiBanService');

class DisparoService {
  constructor() {
    this.campanhaPaused = new Map(); // Armazena estado de pausa das campanhas
    this.campanhaRunning = new Map(); // Armazena campanhas em execução
  }

  async iniciarCampanha(campanhaId) {
    try {
      // Buscar dados da campanha
      const campanhaResult = await db.query(
        'SELECT * FROM campanhas WHERE id = $1',
        [campanhaId]
      );

      if (campanhaResult.rows.length === 0) {
        throw new Error('Campanha não encontrada');
      }

      const campanha = campanhaResult.rows[0];

      // Validar que tem instance_name
      if (!campanha.instance_name) {
        throw new Error('Campanha não possui instância configurada');
      }

      // Verificar se campanha já está rodando
      if (this.campanhaRunning.get(campanhaId)) {
        throw new Error('Campanha já está em execução');
      }

      // Buscar contatos pendentes
      const contatosResult = await db.query(
        `SELECT c.* FROM contatos c
         LEFT JOIN disparos d ON c.id = d.contato_id
         WHERE c.campanha_id = $1 AND (d.status IS NULL OR d.status = 'pendente' OR d.status = 'erro')
         ORDER BY c.id`,
        [campanhaId]
      );

      const contatos = contatosResult.rows;

      if (contatos.length === 0) {
        await db.query(
          "UPDATE campanhas SET status = 'concluida', finished_at = NOW() WHERE id = $1",
          [campanhaId]
        );
        return { message: 'Nenhum contato pendente para envio' };
      }

      // Atualizar status da campanha
      await db.query(
        "UPDATE campanhas SET status = 'enviando', started_at = NOW(), total_contatos = $2 WHERE id = $1",
        [campanhaId, contatos.length]
      );

      // Marcar como rodando
      this.campanhaRunning.set(campanhaId, true);
      this.campanhaPaused.set(campanhaId, false);

      // Processar envios em background
      this.processarEnvios(campanhaId, campanha, contatos);

      return {
        message: 'Campanha iniciada com sucesso',
        totalContatos: contatos.length
      };

    } catch (error) {
      console.error('Erro ao iniciar campanha:', error);
      throw error;
    }
  }

  async processarEnvios(campanhaId, campanha, contatos) {
    let enviados = 0;
    let erros = 0;
    const instanceName = campanha.instance_name;

    console.log(`🚀 Iniciando disparo com sistema anti-bloqueio ativado`);
    console.log(`📊 Total de contatos: ${contatos.length}`);

    for (const contato of contatos) {
      // Verificar se campanha foi pausada
      if (this.campanhaPaused.get(campanhaId)) {
        console.log(`⏸️ Campanha ${campanhaId} pausada`);
        break;
      }

      // ===== SISTEMA ANTI-BAN: Verificações =====

      // 1. Verificar horário comercial
      if (!antiBanService.isBusinessHours()) {
        const waitTime = antiBanService.getTimeUntilBusinessHours();
        const waitHours = Math.floor(waitTime / (1000 * 60 * 60));
        const waitMinutes = Math.floor((waitTime % (1000 * 60 * 60)) / (1000 * 60));

        console.log(`⏰ Fora do horário comercial! Aguardando ${waitHours}h ${waitMinutes}min até próximo horário permitido...`);

        // Pausar campanha até horário comercial
        this.campanhaPaused.set(campanhaId, true);
        await db.query(
          `UPDATE campanhas SET status = 'pausada' WHERE id = $1`,
          [campanhaId]
        );

        // Aguardar e retomar
        await this.sleep(waitTime);
        this.campanhaPaused.set(campanhaId, false);
        await db.query(
          `UPDATE campanhas SET status = 'enviando' WHERE id = $1`,
          [campanhaId]
        );
      }

      // 2. Verificar limites (assumir conta aquecida, você pode adicionar lógica pra detectar conta nova)
      const limits = antiBanService.hasReachedLimit(instanceName, false);

      if (limits.hourly) {
        console.log(`⚠️ Limite horário atingido (${limits.hourlyCount}/${limits.hourlyLimit}). Aguardando próxima hora...`);
        await this.sleep(60 * 60 * 1000); // Aguardar 1 hora
        continue;
      }

      if (limits.daily) {
        console.log(`⚠️ Limite diário atingido (${limits.dailyCount}/${limits.dailyLimit}). Pausando campanha...`);

        // Pausar campanha até amanhã
        this.campanhaPaused.set(campanhaId, true);
        await db.query(
          `UPDATE campanhas SET status = 'pausada' WHERE id = $1`,
          [campanhaId]
        );
        break;
      }

      // 3. Verificar necessidade de pausa preventiva
      const pauseCheck = antiBanService.needsPreventivePause(instanceName);
      if (pauseCheck.needed) {
        const pauseMinutes = Math.floor(pauseCheck.duration / (1000 * 60));
        console.log(`⏸️ ${pauseCheck.reason}. Aguardando ${pauseMinutes} minutos...`);
        await this.sleep(pauseCheck.duration);
      }

      try {
        // Criar registro de disparo
        const disparoResult = await db.query(
          `INSERT INTO disparos (campanha_id, contato_id, telefone, status)
           VALUES ($1, $2, $3, 'pendente')
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [campanhaId, contato.id, contato.telefone]
        );

        if (disparoResult.rows.length === 0) {
          // Já existe disparo, buscar o ID
          const existingDisparo = await db.query(
            'SELECT id FROM disparos WHERE campanha_id = $1 AND contato_id = $2',
            [campanhaId, contato.id]
          );

          if (existingDisparo.rows.length === 0) continue;

          var disparoId = existingDisparo.rows[0].id;
        } else {
          var disparoId = disparoResult.rows[0].id;
        }

        // ===== SISTEMA ANTI-BAN: Personalização e Envio =====

        // Personalizar mensagem (substituir {{nome}}, {{telefone}}, etc.)
        const mensagemPersonalizada = antiBanService.personalizeMessage(
          campanha.mensagem || '',
          contato
        );

        // Calcular delay inteligente e randomizado
        const smartDelay = antiBanService.calculateSmartDelay(instanceName, false);
        console.log(`⏱️ Delay inteligente: ${Math.floor(smartDelay / 1000)}s para ${contato.telefone}`);

        // Enviar mensagem
        let resultado;
        const dadosInterativos = campanha.dados_interativos ? JSON.parse(campanha.dados_interativos) : null;

        switch (campanha.tipo) {
          case 'texto':
            resultado = await evolutionService.sendText(
              campanha.instance_name,
              contato.telefone,
              mensagemPersonalizada,
              { delay: smartDelay }
            );
            break;

          case 'imagem':
          case 'video':
            resultado = await evolutionService.sendMedia(
              campanha.instance_name,
              contato.telefone,
              {
                mediatype: campanha.tipo === 'imagem' ? 'image' : 'video',
                mimetype: campanha.mimetype,
                media: campanha.media_url,
                fileName: campanha.media_filename,
                caption: mensagemPersonalizada
              },
              { delay: smartDelay }
            );
            break;

          case 'botoes':
            if (dadosInterativos) {
              resultado = await evolutionService.sendButtons(
                campanha.instance_name,
                contato.telefone,
                dadosInterativos,
                { delay: smartDelay }
              );
            }
            break;

          case 'lista':
            if (dadosInterativos) {
              resultado = await evolutionService.sendList(
                campanha.instance_name,
                contato.telefone,
                dadosInterativos,
                { delay: smartDelay }
              );
            }
            break;

          case 'enquete':
          case 'poll':
            if (dadosInterativos) {
              resultado = await evolutionService.sendPoll(
                campanha.instance_name,
                contato.telefone,
                dadosInterativos,
                { delay: smartDelay }
              );
            }
            break;

          case 'audio':
            resultado = await evolutionService.sendAudio(
              campanha.instance_name,
              contato.telefone,
              {
                audio: campanha.media_url
              },
              { delay: smartDelay }
            );
            break;

          case 'localizacao':
          case 'location':
            if (dadosInterativos) {
              resultado = await evolutionService.sendLocation(
                campanha.instance_name,
                contato.telefone,
                dadosInterativos,
                { delay: smartDelay }
              );
            }
            break;

          case 'contato':
          case 'contact':
            if (dadosInterativos) {
              resultado = await evolutionService.sendContact(
                campanha.instance_name,
                contato.telefone,
                dadosInterativos,
                { delay: smartDelay }
              );
            }
            break;

          case 'sticker':
            resultado = await evolutionService.sendSticker(
              campanha.instance_name,
              contato.telefone,
              {
                sticker: campanha.media_url
              },
              { delay: smartDelay }
            );
            break;

          default:
            // Tipo não suportado, enviar como texto
            resultado = await evolutionService.sendText(
              campanha.instance_name,
              contato.telefone,
              mensagemPersonalizada || 'Mensagem sem conteúdo',
              { delay: smartDelay }
            );
        }

        // Atualizar registro de disparo
        if (resultado.success) {
          await db.query(
            `UPDATE disparos
             SET status = 'enviado', mensagem_id = $2, resposta_api = $3, enviado_em = NOW()
             WHERE id = $1`,
            [disparoId, resultado.data?.key?.id || null, JSON.stringify(resultado.data)]
          );

          // Atualizar data_follow no Supabase se o telefone foi importado de lá
          try {
            await supabaseService.atualizarDataFollow(contato.telefone);
          } catch (error) {
            console.log(`Não foi possível atualizar data_follow para ${contato.telefone}:`, error.message);
          }

          // ===== SISTEMA ANTI-BAN: Registrar envio =====
          antiBanService.registerMessage(instanceName);

          enviados++;
          console.log(`✅ Mensagem enviada com sucesso para ${contato.telefone} (${enviados}/${contatos.length})`);
        } else {
          await db.query(
            `UPDATE disparos
             SET status = 'erro', erro_mensagem = $2, resposta_api = $3, tentativas = tentativas + 1
             WHERE id = $1`,
            [disparoId, JSON.stringify(resultado.error), JSON.stringify(resultado)]
          );
          erros++;
          console.log(`❌ Erro ao enviar para ${contato.telefone}:`, resultado.error);
        }

        // ===== SISTEMA ANTI-BAN: Aguardar delay inteligente entre envios =====
        await this.sleep(smartDelay);

      } catch (error) {
        console.error(`Erro ao processar contato ${contato.telefone}:`, error);
        erros++;
      }
    }

    // Atualizar campanha ao final
    await db.query(
      `UPDATE campanhas
       SET status = 'concluida', total_enviados = $2, total_erros = $3, finished_at = NOW()
       WHERE id = $1`,
      [campanhaId, enviados, erros]
    );

    // Remover da lista de campanhas rodando
    this.campanhaRunning.delete(campanhaId);
    this.campanhaPaused.delete(campanhaId);

    // ===== SISTEMA ANTI-BAN: Estatísticas finais =====
    const stats = antiBanService.getStats(instanceName);
    console.log(`\n🎉 Campanha ${campanhaId} finalizada!`);
    console.log(`📊 Estatísticas:`);
    console.log(`   ✅ Enviados: ${enviados}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log(`   📈 Total de mensagens hoje: ${stats.dailyCount}`);
    console.log(`   ⏱️ Total de mensagens nesta hora: ${stats.hourlyCount}`);
    console.log(`   🔒 Sistema Anti-Bloqueio: ATIVO ✅`);
  }

  async pausarCampanha(campanhaId) {
    this.campanhaPaused.set(campanhaId, true);
    await db.query(
      "UPDATE campanhas SET status = 'pausada' WHERE id = $1",
      [campanhaId]
    );
  }

  async retomarCampanha(campanhaId) {
    // Se já está rodando, apenas despausar
    if (this.campanhaRunning.get(campanhaId)) {
      this.campanhaPaused.set(campanhaId, false);
      await db.query(
        "UPDATE campanhas SET status = 'enviando' WHERE id = $1",
        [campanhaId]
      );
    } else {
      // Se não está rodando, reiniciar
      return this.iniciarCampanha(campanhaId);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new DisparoService();
