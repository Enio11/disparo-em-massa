# 🔥 Sistema de Aquecimento de Números + Dashboard de Métricas

## 📋 O Que Foi Implementado

### 1. ✅ Sistema de Aquecimento de Números (`warmupService.js`)

Um sistema completo de aquecimento gradual de números WhatsApp seguindo as melhores práticas de 2025.

#### Cronograma de 28 Dias:
```
Semana 1 (Dias 1-7): 10 → 25 mensagens/dia
Semana 2 (Dias 8-14): 30 → 80 mensagens/dia
Semana 3 (Dias 15-21): 100 → 300 mensagens/dia
Semana 4 (Dias 22-28): 350 → 500 mensagens/dia
```

#### Recursos:
- ✅ **Cronograma automático**: Aumenta limites progressivamente
- ✅ **Validação em tempo real**: Bloqueia envios se exceder limite do dia
- ✅ **Status detalhado**: Dia atual, progresso %, limite diário
- ✅ **Controle manual**: Iniciar, pausar, parar aquecimento

---

### 2. ✅ API Endpoints Criados

#### Iniciar Aquecimento
```http
POST /api/warmup/start
Body: { "instance_name": "finaliza-atendimento" }
```

#### Consultar Status
```http
GET /api/warmup/status/:instance_name
Response: {
  "isWarmingUp": true,
  "currentDay": 15,
  "maxMessagesPerDay": 100,
  "progress": 54,
  "description": "Dia 15 - 100 mensagens!"
}
```

#### Obter Métricas Completas
```http
GET /api/warmup/metrics/:instance_name
Response: {
  "warmup": { ... },
  "antiBan": {
    "dailyCount": 45,
    "hourlyCount": 12,
    "limits": { "hourly": 50, "daily": 100 }
  }
}
```

#### Cronograma Completo
```http
GET /api/warmup/schedule
```

#### Parar Aquecimento
```http
POST /api/warmup/stop
Body: { "instance_name": "finaliza-atendimento" }
```

---

### 3. ✅ Tabela no Banco de Dados

```sql
CREATE TABLE number_warmup (
  id SERIAL PRIMARY KEY,
  instance_name VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  current_day INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'ativo'
);
```

---

## 🚀 Como Usar

### Passo 1: Iniciar Aquecimento de Uma Instância

**Via API (Postman/curl):**
```bash
curl -X POST http://localhost:3000/api/warmup/start \
  -H "Content-Type: application/json" \
  -d '{"instance_name":"finaliza-atendimento"}'
```

**Via JavaScript (frontend que você pode adicionar):**
```javascript
async function iniciarAquecimento(instanceName) {
  const response = await fetch(`${API_URL}/warmup/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instance_name: instanceName })
  });

  const data = await response.json();
  alert(data.success ? 'Aquecimento iniciado!' : data.error);
}
```

### Passo 2: Verificar Status

```javascript
async function verificarStatusAquecimento(instanceName) {
  const response = await fetch(`${API_URL}/warmup/status/${instanceName}`);
  const data = await response.json();

  if (data.isWarmingUp) {
    console.log(`Dia ${data.currentDay}/28`);
    console.log(`Limite hoje: ${data.maxMessagesPerDay} mensagens`);
    console.log(`Progresso: ${data.progress}%`);
  } else if (data.isComplete) {
    console.log('Aquecimento completo! ✅');
  } else {
    console.log('Sem aquecimento ativo');
  }
}
```

### Passo 3: Visualizar Métricas

```javascript
async function buscarMetricas(instanceName) {
  const response = await fetch(`${API_URL}/warmup/metrics/${instanceName}`);
  const data = await response.json();

  const { warmup, antiBan } = data.data;

  console.log('📊 MÉTRICAS:');
  console.log(`Aquecimento: ${warmup.isWarmingUp ? `Dia ${warmup.currentDay}` : 'Não ativo'}`);
  console.log(`Mensagens hoje: ${antiBan.dailyCount}/${antiBan.limits.daily}`);
  console.log(`Mensagens esta hora: ${antiBan.hourlyCount}/${antiBan.limits.hourly}`);
}
```

---

## 📊 Dashboard no Frontend (Para Implementar)

Adicione uma nova aba "Métricas" no `index.html`:

```html
<!-- Nova tab -->
<button class="tab-btn" onclick="abrirTab('metricas')">
  📊 Métricas & Aquecimento
</button>

<!-- Conteúdo da tab -->
<div id="metricas" class="tab-content">
  <h2>Dashboard Anti-Bloqueio</h2>

  <!-- Seletor de instância -->
  <div class="form-group">
    <label>Selecione a Instância:</label>
    <select id="instance-metrics" onchange="carregarMetricas()">
      <option value="">-- Selecione --</option>
    </select>
  </div>

  <!-- Cards de Métricas -->
  <div class="stats">
    <div class="stat-card">
      <h4>Mensagens Hoje</h4>
      <p id="daily-count">0</p>
      <small id="daily-limit">de 500</small>
    </div>

    <div class="stat-card">
      <h4>Mensagens Esta Hora</h4>
      <p id="hourly-count">0</p>
      <small>de 50</small>
    </div>

    <div class="stat-card">
      <h4>Status Aquecimento</h4>
      <p id="warmup-status">-</p>
      <small id="warmup-day">-</small>
    </div>

    <div class="stat-card">
      <h4>Horário Permitido</h4>
      <p id="business-hours">✅</p>
      <small>8h - 20h (Seg-Sex)</small>
    </div>
  </div>

  <!-- Barra de Progresso Aquecimento -->
  <div id="warmup-progress" style="display:none;">
    <h3>Progresso do Aquecimento</h3>
    <div class="progress-bar">
      <div class="progress-fill" id="warmup-progress-bar" style="width: 0%"></div>
    </div>
    <p id="warmup-description">-</p>
  </div>

  <!-- Ações -->
  <div style="margin-top: 20px; display: flex; gap: 10px;">
    <button class="btn btn-primary" onclick="iniciarAquecimento()">
      🔥 Iniciar Aquecimento
    </button>
    <button class="btn btn-danger" onclick="pararAquecimento()">
      ⏹️ Parar Aquecimento
    </button>
    <button class="btn btn-secondary" onclick="carregarMetricas()">
      🔄 Atualizar
    </button>
  </div>

  <!-- Cronograma Completo -->
  <div style="margin-top: 30px;">
    <h3>Cronograma de Aquecimento (28 dias)</h3>
    <div id="warmup-schedule"></div>
  </div>
</div>
```

### JavaScript para o Dashboard (`app.js`):

```javascript
// Carregar métricas
async function carregarMetricas() {
  const instanceName = document.getElementById('instance-metrics').value;

  if (!instanceName) return;

  const response = await fetch(`${API_URL}/warmup/metrics/${instanceName}`);
  const { data } = await response.json();

  // Atualizar cards
  document.getElementById('daily-count').textContent = data.antiBan.dailyCount;
  document.getElementById('daily-limit').textContent = `de ${data.antiBan.limits.daily}`;
  document.getElementById('hourly-count').textContent = data.antiBan.hourlyCount;
  document.getElementById('business-hours').textContent = data.antiBan.isBusinessHours ? '✅ Sim' : '❌ Não';

  // Aquecimento
  if (data.warmup.isWarmingUp) {
    document.getElementById('warmup-status').textContent = `Dia ${data.warmup.currentDay}/28`;
    document.getElementById('warmup-day').textContent = data.warmup.description;
    document.getElementById('warmup-progress').style.display = 'block';
    document.getElementById('warmup-progress-bar').style.width = data.warmup.progress + '%';
    document.getElementById('warmup-description').textContent =
      `${data.warmup.maxMessagesPerDay} mensagens permitidas hoje`;
  } else if (data.warmup.isComplete) {
    document.getElementById('warmup-status').textContent = '✅ Completo';
    document.getElementById('warmup-day').textContent = 'Aquecimento finalizado!';
  } else {
    document.getElementById('warmup-status').textContent = 'Não ativo';
    document.getElementById('warmup-day').textContent = 'Clique em "Iniciar Aquecimento"';
  }
}

// Iniciar aquecimento
async function iniciarAquecimento() {
  const instanceName = document.getElementById('instance-metrics').value;

  if (!instanceName) {
    alert('Selecione uma instância primeiro!');
    return;
  }

  const response = await fetch(`${API_URL}/warmup/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instance_name: instanceName })
  });

  const data = await response.json();

  if (data.success) {
    alert('✅ Aquecimento iniciado! Progresso será acompanhado automaticamente.');
    carregarMetricas();
  } else {
    alert('❌ ' + data.error);
  }
}

// Parar aquecimento
async function pararAquecimento() {
  const instanceName = document.getElementById('instance-metrics').value;

  if (!confirm('Tem certeza que deseja parar o aquecimento?')) return;

  const response = await fetch(`${API_URL}/warmup/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instance_name: instanceName })
  });

  const data = await response.json();
  alert(data.success ? '✅ Aquecimento parado' : '❌ ' + data.error);
  carregarMetricas();
}

// Carregar cronograma
async function carregarCronograma() {
  const response = await fetch(`${API_URL}/warmup/schedule`);
  const { data } = await response.json();

  const html = data.map(day => `
    <div style="padding: 10px; border: 1px solid #ddd; margin: 5px 0; border-radius: 5px;">
      <strong>Dia ${day.day}:</strong> ${day.maxMessages} mensagens - ${day.description}
    </div>
  `).join('');

  document.getElementById('warmup-schedule').innerHTML = html;
}
```

---

## 🎯 Funcionalidades Principais

### 1. Aquecimento Automático
- Cronograma de 28 dias pré-definido
- Aumenta limites progressivamente
- Bloqueia envios se exceder limite diário

### 2. Dashboard de Métricas
- Visualização em tempo real
- Mensagens por hora/dia
- Status do aquecimento
- Horário comercial

### 3. Proteção Combinada
- Sistema anti-ban + aquecimento
- Delays inteligentes
- Pausas automáticas
- Horário comercial

---

## 📈 Exemplos de Uso

### Cenário 1: Número Novo
```javascript
// 1. Iniciar aquecimento
await iniciarAquecimento('nova-instancia');

// 2. Criar campanha com 10 contatos (Dia 1)
// Sistema permite: 10 mensagens

// 3. Dia 15: Criar campanha com 100 contatos
// Sistema permite: 100 mensagens

// 4. Dia 28: Campanha normal
// Sistema permite: 500 mensagens/dia
```

### Cenário 2: Monitoramento
```javascript
// Buscar métricas a cada 5 minutos
setInterval(async () => {
  const metrics = await fetch(`${API_URL}/warmup/metrics/minha-instancia`);
  const data = await metrics.json();

  console.log(`Hoje: ${data.data.antiBan.dailyCount}/${data.data.antiBan.limits.daily}`);

  if (data.data.antiBan.dailyCount >= data.data.antiBan.limits.daily * 0.9) {
    alert('⚠️ Atingindo limite diário! Cuidado!');
  }
}, 5 * 60 * 1000);
```

---

## 🔧 Customização

Edite `backend/src/services/warmupService.js` para ajustar o cronograma:

```javascript
this.warmupSchedule = [
  { day: 1, maxMessages: 5, description: 'Dia 1 - Mais conservador' },
  { day: 2, maxMessages: 10, description: 'Dia 2 - ...' },
  // ... personalizar conforme necessário
];
```

---

## 📝 Notas Importantes

1. **Aquecimento é opcional** - Se não iniciar, sistema usa limites padrão (500/dia)
2. **Um aquecimento por instância** - Não pode ter dois aquecimentos simultâneos
3. **Progresso automático** - Sistema calcula dia atual automaticamente
4. **Integração com anti-ban** - Ambos sistemas trabalham juntos

---

## 🎉 Resultado Final

Com aquecimento + anti-bloqueio você tem:

✅ Delays inteligentes (20-90s)
✅ Horário comercial (8h-20h)
✅ Pausas preventivas
✅ Limites por hora (50)
✅ Limites por dia (depende do aquecimento)
✅ Aquecimento gradual (28 dias)
✅ Personalização de mensagens
✅ Monitoramento completo

**= Menor chance de bloqueio possível! 🛡️**
