# 🛡️ Sistema Anti-Bloqueio WhatsApp - Documentação Completa

## 📋 Visão Geral

Sistema completo de proteção contra bloqueio de conta WhatsApp, implementado com base nas **melhores práticas de 2025** para disparos em massa.

## ✨ Funcionalidades Implementadas

### 1. ⏱️ Delays Inteligentes e Randomizados

**O que faz:**
- Calcula delays diferentes para cada mensagem (entre 20-90 segundos)
- Adiciona variação aleatória de 30% para evitar padrões detectáveis
- Delays maiores para contas novas (30-90s)
- Delays menores para contas aquecidas (20-60s)

**Benefício:** Imita comportamento humano, evitando detecção de padrões pelo WhatsApp.

---

### 2. 📊 Limites de Mensagens

**Limites configurados:**
- **Por hora:** 50 mensagens
- **Por dia (conta aquecida):** 500 mensagens
- **Por dia (conta nova):** 20 mensagens

**O que acontece ao atingir limites:**
- Limite horário: Sistema aguarda automaticamente até próxima hora
- Limite diário: Campanha pausada até o próximo dia

**Benefício:** Respeita os limites do WhatsApp, evitando bloqueio por spam.

---

### 3. 🕐 Horário Comercial (8h - 20h, Seg-Sex)

**Restrições automáticas:**
- ❌ Não envia antes das 8h da manhã
- ❌ Não envia depois das 20h
- ❌ Não envia aos finais de semana (sábado/domingo)

**O que acontece fora do horário:**
- Sistema calcula tempo até próximo horário comercial
- Pausa campanha automaticamente
- Retoma no horário permitido

**Benefício:** Evita denúncias de spam por mensagens em horários inadequados.

---

### 4. ⏸️ Pausas Preventivas

**Pausas automáticas:**
- **A cada 20 mensagens:** Pausa de 5 minutos
- **A cada 100 mensagens:** Pausa de 30 minutos

**Benefício:** Reduz chance de detecção de disparo em massa.

---

### 5. 🎯 Personalização de Mensagens

**Variáveis disponíveis:**
- `{{nome}}` ou `{{name}}` - Nome do contato
- `{{telefone}}` ou `{{phone}}` - Telefone do contato

**Exemplo:**
```
Olá {{nome}}! Temos uma oferta especial para você.
```

Se o contato se chamar "João", ele receberá:
```
Olá João! Temos uma oferta especial para você.
```

**Benefício:** Mensagens personalizadas têm menor chance de ser marcadas como spam.

---

### 6. ✅ Validação de Números

**O que faz:**
- Remove caracteres especiais (, ), -, espaços
- Valida se número tem pelo menos 10 dígitos
- Formata corretamente para Evolution API (`número@s.whatsapp.net`)

**Benefício:** Garante que apenas números válidos sejam processados.

---

### 7. 📈 Monitoramento em Tempo Real

**Estatísticas rastreadas:**
- Total de mensagens enviadas (geral)
- Mensagens por hora
- Mensagens por dia
- Horário da última mensagem

**Benefício:** Visibilidade completa sobre o status do disparo.

---

## 🎯 Configurações Padrão

### Delays
```javascript
minDelay: 15000,          // 15 segundos (mínimo absoluto)
maxDelay: 90000,          // 90 segundos (máximo para números novos)
standardMinDelay: 20000,  // 20 segundos (padrão mínimo)
standardMaxDelay: 60000,  // 60 segundos (padrão máximo)
```

### Limites
```javascript
maxMessagesPerHour: 50,               // Máximo por hora
maxMessagesPerDay: 500,               // Máximo por dia (conta aquecida)
maxMessagesPerDayNewAccount: 20,      // Máximo para conta nova
```

### Pausas
```javascript
pauseAfterMessages: 20,     // Pausar a cada 20 mensagens
pauseDuration: 300000,      // 5 minutos de pausa
pauseDurationLong: 1800000, // 30 minutos de pausa longa
```

### Horários
```javascript
allowedStartHour: 8,   // 8h da manhã
allowedEndHour: 20,    // 8h da noite
```

---

## 🚀 Como Usar

### 1. Criar Campanha com Personalização

No campo de mensagem, use as variáveis:

```
Olá {{nome}}!

Identificamos que você está interessado em nossos serviços.

Seu número de contato é {{telefone}}.

Podemos conversar?
```

### 2. O Sistema Funciona Automaticamente

Quando você iniciar a campanha:

✅ **Verifica horário comercial**
- Se estiver fora do horário, pausa até próximo horário permitido

✅ **Calcula delay inteligente**
- Cada mensagem tem um delay diferente e aleatório

✅ **Verifica limites**
- Se atingir limite horário/diário, pausa automaticamente

✅ **Aplica pausas preventivas**
- A cada 20 mensagens: 5 min de pausa
- A cada 100 mensagens: 30 min de pausa

✅ **Personaliza mensagem**
- Substitui {{nome}} e {{telefone}} automaticamente

✅ **Registra estatísticas**
- Conta quantas mensagens foram enviadas

---

## 📊 Logs do Sistema

Exemplo de log durante disparo:

```
🚀 Iniciando disparo com sistema anti-bloqueio ativado
📊 Total de contatos: 150

⏱️ Delay inteligente: 45s para 5513981249212
✅ Mensagem enviada com sucesso para 5513981249212 (1/150)

⏱️ Delay inteligente: 32s para 5513987654321
✅ Mensagem enviada com sucesso para 5513987654321 (2/150)

...

⏸️ Pausa preventiva após 20 mensagens. Aguardando 5 minutos...

...

🎉 Campanha 5 finalizada!
📊 Estatísticas:
   ✅ Enviados: 150
   ❌ Erros: 0
   📈 Total de mensagens hoje: 150
   ⏱️ Total de mensagens nesta hora: 45
   🔒 Sistema Anti-Bloqueio: ATIVO ✅
```

---

## ⚠️ Recomendações Importantes

### Para Contas Novas (primeiros 10 dias):
1. **Máximo 20 mensagens/dia**
2. **Use delays maiores** (30-90s)
3. **Aqueça gradualmente:**
   - Dia 1-3: 10 mensagens/dia
   - Dia 4-7: 15 mensagens/dia
   - Dia 8-10: 20 mensagens/dia
   - Após 10 dias: Pode aumentar gradualmente

### Para Contas Aquecidas:
1. **Máximo 500 mensagens/dia** (comece com menos)
2. **Mantenha taxa de resposta alta** (50%+)
3. **Use instâncias WhatsApp Web** (BAILEYS) ao invés de Business API
4. **Evite disparos todos os dias** - faça intervalos

### Para Evitar Bloqueio:
1. ✅ **Sempre use opt-in** - só envie para quem autorizou
2. ✅ **Personalize mensagens** - use {{nome}}
3. ✅ **Envie mensagens úteis** - não spam
4. ✅ **Monitore denúncias** - se muita gente bloquear, pausar
5. ✅ **Use horário comercial** - respeite o horário automático
6. ❌ **Nunca force limites** - respeite as pausas automáticas

---

## 🔧 Configurações Avançadas

Se precisar ajustar as configurações, edite:

**Arquivo:** `backend/src/services/antiBanService.js`

```javascript
this.config = {
  // Seus valores personalizados aqui
  maxMessagesPerDay: 300,  // Exemplo: reduzir para 300/dia
  pauseAfterMessages: 15,  // Exemplo: pausar a cada 15
};
```

---

## 📈 Métricas de Sucesso

**O sistema está funcionando bem se:**
- ✅ Taxa de entrega > 95%
- ✅ Taxa de resposta > 30%
- ✅ Denúncias/bloqueios < 2%
- ✅ Nenhum bloqueio de conta em 30 dias

**Se você tiver problemas:**
- ⚠️ Reduzir número de mensagens/dia
- ⚠️ Aumentar delays entre mensagens
- ⚠️ Melhorar qualidade das mensagens
- ⚠️ Usar mais personalização

---

## 🛠️ Suporte Técnico

**Logs disponíveis em:**
- Console do servidor (terminal onde rodou `node src/app.js`)
- Banco de dados (tabela `disparos`)

**Para debug:**
1. Verificar logs do servidor
2. Ver tabela `disparos` no banco
3. Conferir estatísticas no final do disparo

---

## 🎯 Conclusão

O sistema anti-bloqueio está **100% ativo e funcional**. Todas as proteções são aplicadas automaticamente sem necessidade de configuração manual.

**Apenas crie sua campanha e inicie** - o sistema cuida do resto! 🚀
