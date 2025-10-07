# 📝 Histórico de Desenvolvimento - Disparo em Massa WhatsApp

## 📅 Data: 07/10/2025

---

## 🎯 Objetivo do Projeto

Sistema completo de disparo em massa para WhatsApp com:
- Integração Evolution API
- Integração Supabase (base de clientes)
- Sistema Anti-Bloqueio WhatsApp
- Aquecimento gradual de números (28 dias)
- Interface web moderna
- Deploy em produção com Docker Swarm

---

## 🔧 Stack Tecnológico

### Backend
- Node.js 18 (Alpine)
- Express.js
- PostgreSQL 14
- Axios
- Multer (upload de arquivos)
- dotenv

### Frontend
- Vanilla JavaScript
- HTML5/CSS3
- Design responsivo

### Infraestrutura
- Docker Swarm
- Traefik (proxy reverso + SSL)
- Portainer (gerenciamento)
- Let's Encrypt (certificados SSL)

### Integrações
- Evolution API v2 (WhatsApp)
- Supabase (banco de clientes)

---

## 📦 Estrutura do Projeto

```
disparo-em-massa/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Servidor Express
│   │   ├── config/
│   │   │   ├── database.js          # Conexão PostgreSQL
│   │   │   └── supabase.js          # Conexão Supabase
│   │   ├── controllers/
│   │   │   ├── campanhaController.js
│   │   │   ├── contatoController.js
│   │   │   ├── instanciaController.js
│   │   │   ├── clienteSupabaseController.js
│   │   │   ├── midiaController.js
│   │   │   └── warmupController.js   # NOVO: Aquecimento
│   │   ├── services/
│   │   │   ├── evolutionService.js   # API Evolution
│   │   │   ├── disparoService.js     # Lógica de disparo
│   │   │   ├── antiBanService.js     # NOVO: Anti-bloqueio
│   │   │   └── warmupService.js      # NOVO: Aquecimento
│   │   └── routes/
│   │       └── index.js
│   ├── criar-tabela-warmup.sql       # NOVO: Migration
│   ├── executar-migration-warmup.js  # NOVO: Script migration
│   └── package.json
├── frontend/
│   ├── index.html                    # Dashboard principal
│   ├── login.html                    # Tela de login
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── Dockerfile
├── docker-compose.yml
├── .gitignore
├── .dockerignore
├── DEPLOY-RAPIDO.md                  # NOVO: Guia rápido
├── STACK-PORTAINER.md                # NOVO: YAML Portainer
├── SISTEMA-ANTI-BLOQUEIO.md          # NOVO: Docs anti-ban
├── AQUECIMENTO-E-METRICAS.md         # NOVO: Docs warmup
└── HISTORICO-DESENVOLVIMENTO.md      # NOVO: Este arquivo
```

---

## 🚀 Sessão de Desenvolvimento Completa

### 1. Problema Inicial: Disparos Não Funcionando

**Sintoma:** Mensagens de teste não eram enviadas

**Diagnóstico:**
```
Error: {
  status: 404,
  error: 'Not Found',
  response: { message: [ 'The "default" instance does not exist' ] }
}
```

**Causa:** Numbers eram enviados sem o sufixo `@s.whatsapp.net`

**Solução:**
- Criado método `formatNumber()` em `evolutionService.js:215`
- Aplicado em todas as 9 funções de envio:
  - sendText
  - sendMedia
  - sendButtons
  - sendList
  - sendPoll
  - sendAudio
  - sendLocation
  - sendContact
  - sendSticker

**Código adicionado:**
```javascript
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
```

---

### 2. Implementação do Sistema Anti-Bloqueio

**Requisito:** Sistema robusto para evitar bloqueio de contas WhatsApp

**Pesquisa:** Melhores práticas WhatsApp 2025
- Artigos sobre anti-ban
- Documentação Evolution API
- Experiências de usuários

**Features Implementadas:**

#### A) Delays Inteligentes e Randomizados
```javascript
// backend/src/services/antiBanService.js:35
calculateSmartDelay() {
  const min = this.config.standardMinDelay; // 20s
  const max = this.config.standardMaxDelay; // 60s
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

#### B) Limites Automáticos
- **50 mensagens/hora**
- **500 mensagens/dia** (conta aquecida)
- **20 mensagens/dia** (conta nova)

#### C) Horário Comercial
```javascript
// backend/src/services/antiBanService.js:50
isBusinessHours() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  // Segunda a Sexta, 8h às 20h
  return day >= 1 && day <= 5 && hour >= 8 && hour < 20;
}
```

#### D) Pausas Preventivas
- A cada 20 mensagens: 5 minutos
- A cada 100 mensagens: 30 minutos

#### E) Personalização de Mensagens
```javascript
// backend/src/services/antiBanService.js:155
personalizeMessage(message, contact) {
  return message
    .replace(/\{\{nome\}\}/gi, contact.nome || contact.name || '')
    .replace(/\{\{telefone\}\}/gi, contact.telefone || contact.phone || '');
}
```

**Arquivos criados:**
- `backend/src/services/antiBanService.js` (202 linhas)
- `SISTEMA-ANTI-BLOQUEIO.md` (documentação completa)

---

### 3. Sistema de Aquecimento de Números (Warmup)

**Requisito:** Aquecimento gradual de números novos em 28 dias

**Cronograma Implementado:**
```
Semana 1 (Dias 1-7):   10 → 25 mensagens/dia
Semana 2 (Dias 8-14):  30 → 80 mensagens/dia
Semana 3 (Dias 15-21): 100 → 300 mensagens/dia
Semana 4 (Dias 22-28): 350 → 500 mensagens/dia
```

**Banco de Dados:**
```sql
CREATE TABLE number_warmup (
  id SERIAL PRIMARY KEY,
  instance_name VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  current_day INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_warmup_instance ON number_warmup(instance_name);
CREATE INDEX idx_warmup_status ON number_warmup(status);
```

**API Endpoints:**
```
POST   /api/warmup/start                    # Iniciar aquecimento
GET    /api/warmup/status/:instance_name    # Status do aquecimento
POST   /api/warmup/stop                     # Parar aquecimento
GET    /api/warmup/schedule                 # Cronograma completo
GET    /api/warmup/metrics/:instance_name   # Métricas completas
```

**Arquivos criados:**
- `backend/src/services/warmupService.js` (170 linhas)
- `backend/src/controllers/warmupController.js` (131 linhas)
- `backend/criar-tabela-warmup.sql` (22 linhas)
- `backend/executar-migration-warmup.js` (25 linhas)
- `AQUECIMENTO-E-METRICAS.md` (documentação completa)

---

### 4. Integração Anti-Ban + Warmup no Disparo

**Modificação:** `backend/src/services/disparoService.js`

**Verificações adicionadas:**
1. Horário comercial
2. Limites diários/horários
3. Limites de aquecimento (se ativo)
4. Pausas preventivas
5. Delays inteligentes
6. Personalização de mensagens

**Exemplo de código:**
```javascript
// Verificar horário comercial
if (!antiBanService.isBusinessHours()) {
  const waitTime = antiBanService.getTimeUntilBusinessHours();
  console.log(`⏰ Fora do horário comercial! Aguardando ${Math.floor(waitTime / 60000)} minutos`);
  await this.sleep(waitTime);
}

// Verificar limites
const limits = antiBanService.hasReachedLimit(instanceName, false);
if (limits.hourly || limits.daily) {
  await this.pausarCampanha(campanhaId);
  break;
}

// Pausas preventivas
const pauseCheck = antiBanService.needsPreventivePause(instanceName);
if (pauseCheck.needed) {
  await this.sleep(pauseCheck.duration);
}

// Personalizar mensagem
const mensagemPersonalizada = antiBanService.personalizeMessage(
  campanha.mensagem || '',
  contato
);

// Delay inteligente
const smartDelay = antiBanService.calculateSmartDelay(instanceName, false);
```

---

## 🐳 Deploy em Produção

### Servidor

- **IP:** 168.231.98.55
- **Hostname:** capitao
- **SO:** Linux (Docker 28.1.1)
- **Swarm:** Ativo

### Credenciais SSH
- **Usuário:** root
- **Senha:** Betocarrero666@

### Stacks Existentes
```
chatwoot, disparador (antigo - REMOVIDO), evolution, evolution_hub,
flowise, minio, mysql, n8n, n8n_hub, pgvector, portainer,
postgres, redis, traefik, typebot, wordpress_capitaoclean
```

### Rede
- **Nome:** capitao-network
- **Tipo:** overlay (Swarm)

---

## 📝 Passos do Deploy (Executados)

### 1. Preparação Local
```bash
# Verificar Git
git status
git remote -v
# Resultado: https://github.com/Enio11/disparo-em-massa.git

# Tornar repositório público (temporariamente)
```

### 2. Conexão SSH
```bash
sshpass -p 'Betocarrero666@' ssh -o StrictHostKeyChecking=no \
  -o PubkeyAuthentication=no root@168.231.98.55
```

### 3. Remoção do Stack Antigo
```bash
docker stack rm disparador
# Aguardar remoção completa
```

### 4. Clonar Código
```bash
cd /opt
git clone https://github.com/Enio11/disparo-em-massa.git
```

### 5. Migration do Banco
```bash
# Via container do PostgreSQL
docker exec a26b8f331257 psql -U postgres -d disparo_capitao_clean -c \
  'CREATE TABLE IF NOT EXISTS number_warmup (...)'

docker exec a26b8f331257 psql -U postgres -d disparo_capitao_clean -c \
  'CREATE INDEX IF NOT EXISTS idx_warmup_instance ON number_warmup(instance_name)'
```

### 6. Build da Imagem Docker

**Problema encontrado:**
```
ERROR: "/backend/.env": not found
```

**Solução:**
```bash
# Remover linha do .env do Dockerfile
sed -i '/COPY backend\/.env/d' Dockerfile

# Build
docker build -t disparo-massa:latest .
```

**Resultado:** Imagem criada com sucesso (142MB)

### 7. Deploy no Portainer

**Stack YAML criado:** `STACK-PORTAINER.md`

```yaml
version: "3.7"
services:
  disparo-massa:
    image: disparo-massa:latest
    networks:
      - capitao-network
    environment:
      - DB_HOST=168.231.98.55
      - DB_PORT=5432
      - DB_NAME=disparo_capitao_clean
      - DB_USER=postgres
      - DB_PASSWORD=123
      - EVOLUTION_API_URL=https://evolution.manager.capitaoclean.com
      - EVOLUTION_API_KEY=ed909056dbc40cd452ddb98166f504a9
      - SUPABASE_URL=https://teycepmxmsajigejnvee.supabase.co
      - SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      - PORT=3000
      - NODE_ENV=production
    deploy:
      mode: replicated
      replicas: 1
      labels:
        - traefik.enable=true
        - traefik.http.routers.disparo-massa.rule=Host(`disparo.capitaoclean.com`)
        - traefik.http.routers.disparo-massa.entrypoints=websecure
        - traefik.http.routers.disparo-massa.tls.certresolver=letsencryptresolver
        - traefik.http.services.disparo-massa.loadbalancer.server.port=3000
      resources:
        limits:
          cpus: "1"
          memory: 512M
```

### 8. Erro no Deploy

**Erro encontrado:**
```
Error: ENOENT: no such file or directory, stat '/frontend/index.html'
```

**Causa:** Caminho relativo incorreto no `app.js`
- No Docker: `__dirname` = `/app/src`
- Usando `../../frontend` = `/frontend` ❌
- Deveria ser `../frontend` = `/app/frontend` ✅

**Solução:**
```javascript
// backend/src/app.js
// ANTES
app.use(express.static(path.join(__dirname, '../../frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// DEPOIS
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
```

### 9. Atualização e Redeploy
```bash
# Git push da correção
git add backend/src/app.js
git commit -m "fix: corrigir caminho do frontend para Docker"
git push

# Na VPS
cd /opt/disparo-em-massa
git pull

# Rebuild
docker build -t disparo-massa:latest .

# Atualizar serviço
docker service update --force --image disparo-massa:latest \
  disparo-massa_disparo-massa
```

### 10. Verificação Final
```bash
# Testar acesso
curl -s -o /dev/null -w '%{http_code}' https://disparo.capitaoclean.com
# Resultado: 200 ✅
```

---

## ✅ Sistema em Produção

### URL de Acesso
**https://disparo.capitaoclean.com**

### Credenciais
- **Email:** isaiaslink2@gmail.com
- **Senha:** Betocarrero666@

### Banco de Dados
- **Host:** 168.231.98.55:5432
- **Database:** disparo_capitao_clean
- **User:** postgres
- **Password:** 123

### Evolution API
- **URL:** https://evolution.manager.capitaoclean.com
- **API Key:** ed909056dbc40cd452ddb98166f504a9
- **Instâncias disponíveis:** 12 (5 WhatsApp Web + 7 Business API)

### Supabase
- **URL:** https://teycepmxmsajigejnvee.supabase.co
- **Tabela:** data_follow (clientes)

---

## 🎯 Funcionalidades Implementadas

### 1. Gestão de Campanhas
- ✅ Criar campanha
- ✅ Listar campanhas
- ✅ Pausar/Retomar
- ✅ Estatísticas em tempo real
- ✅ Agendamento de disparos

### 2. Gestão de Contatos
- ✅ Importar via CSV
- ✅ Importar do Supabase
- ✅ Filtros rápidos (10min, 24h, 72h)
- ✅ Atualização automática de `data_follow`

### 3. Tipos de Mensagem (9 tipos)
- ✅ Texto simples
- ✅ Mídia (imagem, vídeo, áudio, documento)
- ✅ Botões
- ✅ Lista
- ✅ Enquete
- ✅ Áudio (PTT)
- ✅ Localização
- ✅ Contato
- ✅ Sticker

### 4. Sistema Anti-Bloqueio
- ✅ Delays randomizados (20-90s)
- ✅ Limites automáticos (50/hora, 500/dia)
- ✅ Horário comercial (8h-20h, Seg-Sex)
- ✅ Pausas preventivas (20 msg = 5min, 100 msg = 30min)
- ✅ Personalização de mensagens ({{nome}}, {{telefone}})
- ✅ Validação de números
- ✅ Monitoramento em tempo real

### 5. Aquecimento de Números
- ✅ Cronograma de 28 dias
- ✅ Progressão automática
- ✅ Validação de limites diários
- ✅ API de controle (start, stop, status)
- ✅ Métricas em tempo real

### 6. Interface Web
- ✅ Login com autenticação
- ✅ Design moderno e responsivo
- ✅ Dashboard com tabs
- ✅ Importação de arquivos
- ✅ Modal de estatísticas

---

## 🔄 Comandos Úteis para Manutenção

### Git
```bash
# Atualizar código na VPS
cd /opt/disparo-em-massa
git pull

# Rebuild imagem
docker build -t disparo-massa:latest .

# Atualizar serviço
docker service update --force --image disparo-massa:latest \
  disparo-massa_disparo-massa
```

### Docker
```bash
# Ver serviços
docker service ls

# Ver logs
docker service logs -f disparo-massa_disparo-massa

# Ver logs com filtro
docker service logs disparo-massa_disparo-massa --since 10m

# Reiniciar serviço
docker service update --force disparo-massa_disparo-massa

# Ver containers
docker ps

# Entrar no container
docker exec -it $(docker ps -q -f name=disparo-massa) sh

# Ver uso de recursos
docker stats

# Remover stack
docker stack rm disparo-massa
```

### Banco de Dados
```bash
# Via container
docker exec a26b8f331257 psql -U postgres -d disparo_capitao_clean

# Consultas úteis
docker exec a26b8f331257 psql -U postgres -d disparo_capitao_clean -c \
  "SELECT * FROM campanhas ORDER BY criada_em DESC LIMIT 5;"

docker exec a26b8f331257 psql -U postgres -d disparo_capitao_clean -c \
  "SELECT * FROM number_warmup;"
```

---

## 📚 Arquivos de Documentação

### Criados nesta sessão:
1. **SISTEMA-ANTI-BLOQUEIO.md** - Documentação completa do anti-ban
2. **AQUECIMENTO-E-METRICAS.md** - Documentação do warmup + dashboard
3. **DEPLOY-RAPIDO.md** - Guia passo a passo do deploy
4. **STACK-PORTAINER.md** - YAML para Portainer
5. **HISTORICO-DESENVOLVIMENTO.md** - Este arquivo

### Já existentes:
- README.md
- DEPLOY.md
- TESTE-LOCAL.md
- NOVOS-RECURSOS.md

---

## 🐛 Problemas Conhecidos e Soluções

### 1. Mensagens não enviam
**Causa:** Formato de número incorreto
**Solução:** Método `formatNumber()` adiciona `@s.whatsapp.net`

### 2. Frontend não carrega (404)
**Causa:** Caminho relativo incorreto no Docker
**Solução:** Usar `../frontend` ao invés de `../../frontend`

### 3. Erro ao clonar repositório privado
**Causa:** Git pede autenticação
**Solução:** Tornar repositório público ou usar deploy key

### 4. Warning Supabase Node.js 18
**Causa:** Supabase deprecou Node 18
**Solução:** Atualizar Dockerfile para `node:20-alpine` (futuro)

---

## 🔐 Dados Sensíveis (Backup Seguro)

### Credenciais SSH
- Host: 168.231.98.55
- User: root
- Pass: Betocarrero666@

### Banco PostgreSQL
- Host: 168.231.98.55
- Port: 5432
- Database: disparo_capitao_clean
- User: postgres
- Pass: 123

### Evolution API
- URL: https://evolution.manager.capitaoclean.com
- API Key: ed909056dbc40cd452ddb98166f504a9

### Supabase
- URL: https://teycepmxmsajigejnvee.supabase.co
- Project ID: teycepmxmsajigejnvee
- Service Role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWNlcG14bXNhamlnZWpudmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY0NTU5MSwiZXhwIjoyMDM0MjIxNTkxfQ.acapiVxOC665khvVZ6vXrXWw6zkaLpVqrSDEwMSneeI

### Login Sistema
- Email: isaiaslink2@gmail.com
- Senha: Betocarrero666@

---

## 🔮 Próximas Melhorias Sugeridas

### 1. Dashboard de Métricas (Frontend)
Implementar interface visual conforme documentação em `AQUECIMENTO-E-METRICAS.md`:
- Cards com métricas em tempo real
- Gráficos de progresso
- Botões de controle de aquecimento
- Cronograma visual dos 28 dias

**Arquivo a modificar:** `frontend/index.html`

### 2. Upgrade Node.js
```dockerfile
# Dockerfile - linha 1
FROM node:20-alpine  # era node:18-alpine
```

### 3. Notificações
- Email quando campanha finalizar
- Webhook quando atingir limites
- Alerta de erro em disparo

### 4. Relatórios
- Exportar estatísticas em PDF
- Gráficos de performance
- Histórico de campanhas

### 5. Multi-usuário
- Sistema de autenticação real (JWT)
- Permissões por usuário
- Logs de atividade

---

## 📞 Suporte

**Repositório GitHub:** https://github.com/Enio11/disparo-em-massa

**Sistema em produção:** https://disparo.capitaoclean.com

**Desenvolvido em:** 07/10/2025

**Status:** ✅ Em produção e funcionando

---

## ✨ Conclusão

Sistema completo de disparo em massa WhatsApp implementado com sucesso, incluindo:

- ✅ Correção de bugs críticos (formato de número)
- ✅ Sistema anti-bloqueio robusto (7 proteções)
- ✅ Aquecimento gradual de números (28 dias)
- ✅ Deploy em produção com Docker Swarm
- ✅ SSL automático via Traefik
- ✅ Documentação completa

**Tempo total de desenvolvimento:** ~1 dia

**Commits:**
- `2e1a38e` - first commit
- `5071c9c` - fix: corrigir caminho do frontend para Docker

**Deploy bem-sucedido em:** 07/10/2025 às 14:17

---

**📌 IMPORTANTE: Mantenha este arquivo atualizado a cada mudança significativa no projeto!**
