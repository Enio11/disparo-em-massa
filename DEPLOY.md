# 🚀 Guia de Deploy - Docker Swarm + Portainer + Traefik

## 📋 Informações do Sistema

### Credenciais de Login
- **E-mail:** `isaiaslink2@gmail.com`
- **Senha:** `Betocarrero666@`

### Banco de Dados PostgreSQL
- **Host:** `168.231.98.55`
- **Port:** `5432`
- **Database:** `disparo_capitao_clean`
- **User:** `postgres`
- **Password:** `123`

### Evolution API
- **URL:** `https://evolution.manager.capitaoclean.com`
- **API Key:** `ed909056dbc40cd452ddb98166f504a9`

### Supabase
- **URL:** `https://teycepmxmsajigejnvee.supabase.co`
- **Project ID:** `teycepmxmsajigejnvee`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWNlcG14bXNhamlnZWpudmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY0NTU5MSwiZXhwIjoyMDM0MjIxNTkxfQ.acapiVxOC665khvVZ6vXrXWw6zkaLpVqrSDEwMSneeI`

---

## 🔧 Passo 1: Preparar Arquivos

### 1.1 - Criar Dockerfile

Crie o arquivo `Dockerfile` na raiz do projeto:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY backend/package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar código backend
COPY backend/src ./src
COPY backend/.env .env

# Copiar frontend
COPY frontend ./frontend

EXPOSE 3000

CMD ["node", "src/app.js"]
```

### 1.2 - Criar .dockerignore

```
node_modules
.git
.env.local
*.log
.DS_Store
```

### 1.3 - Atualizar .env

Crie/edite o arquivo `backend/.env`:

```env
# Database
DB_HOST=168.231.98.55
DB_PORT=5432
DB_NAME=disparo_capitao_clean
DB_USER=postgres
DB_PASSWORD=123

# Evolution API
EVOLUTION_API_URL=https://evolution.manager.capitaoclean.com
EVOLUTION_API_KEY=ed909056dbc40cd452ddb98166f504a9

# Supabase
SUPABASE_URL=https://teycepmxmsajigejnvee.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWNlcG14bXNhamlnZWpudmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY0NTU5MSwiZXhwIjoyMDM0MjIxNTkxfQ.acapiVxOC665khvVZ6vXrXWw6zkaLpVqrSDEwMSneeI

# App
PORT=3000
NODE_ENV=production
```

---

## 🐳 Passo 2: Build da Imagem Docker

```bash
# Na raiz do projeto, executar:
docker build -t disparo-massa:latest .
```

---

## 📦 Passo 3: Criar Stack no Portainer

### 3.1 - Acessar Portainer

1. Acesse seu Portainer na VPS
2. Vá em **Stacks** > **Add stack**
3. Nome: `disparo-massa`

### 3.2 - Docker Compose Stack

Cole este conteúdo no editor:

```yaml
version: '3.8'

services:
  disparo-massa:
    image: disparo-massa:latest
    networks:
      - traefik-public
    deploy:
      labels:
        - traefik.enable=true
        - traefik.docker.network=traefik-public
        - traefik.constraint-label=traefik-public

        # HTTP
        - traefik.http.routers.disparo-massa.rule=Host(`disparo.capitaoclean.com`)
        - traefik.http.routers.disparo-massa.entrypoints=http
        - traefik.http.routers.disparo-massa.middlewares=https-redirect

        # HTTPS
        - traefik.http.routers.disparo-massa-secure.rule=Host(`disparo.capitaoclean.com`)
        - traefik.http.routers.disparo-massa-secure.entrypoints=https
        - traefik.http.routers.disparo-massa-secure.tls=true
        - traefik.http.routers.disparo-massa-secure.tls.certresolver=le

        # Service
        - traefik.http.services.disparo-massa.loadbalancer.server.port=3000

        # Middleware redirect HTTP -> HTTPS
        - traefik.http.middlewares.https-redirect.redirectscheme.scheme=https
        - traefik.http.middlewares.https-redirect.redirectscheme.permanent=true

      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

networks:
  traefik-public:
    external: true
```

### 3.3 - Variables de Ambiente (opcional)

No Portainer, você pode adicionar as variáveis de ambiente direto na stack se preferir não usar o arquivo `.env` na imagem.

Clique em **Advanced mode** e adicione:

```env
DB_HOST=168.231.98.55
DB_PORT=5432
DB_NAME=disparo_capitao_clean
DB_USER=postgres
DB_PASSWORD=123
EVOLUTION_API_URL=https://evolution.manager.capitaoclean.com
EVOLUTION_API_KEY=ed909056dbc40cd452ddb98166f504a9
SUPABASE_URL=https://teycepmxmsajigejnvee.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWNlcG14bXNhamlnZWpudmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY0NTU5MSwiZXhwIjoyMDM0MjIxNTkxfQ.acapiVxOC665khvVZ6vXrXWw6zkaLpVqrSDEwMSneeI
PORT=3000
NODE_ENV=production
```

---

## 🌐 Passo 4: Configurar DNS

No seu provedor de DNS (Cloudflare, etc.), adicione um registro **A** ou **CNAME**:

```
Tipo: A
Nome: disparo (ou o subdomínio que quiser)
Valor: IP_DA_SUA_VPS
TTL: Auto
Proxy: Desligado (se Cloudflare)
```

Exemplo:
- `disparo.capitaoclean.com` → `SEU_IP_VPS`

---

## 🚀 Passo 5: Deploy

1. No Portainer, clique em **Deploy the stack**
2. Aguarde o deploy finalizar
3. Verifique os logs em **Containers** > `disparo-massa` > **Logs**

---

## ✅ Passo 6: Verificar Funcionamento

### 6.1 - Testar HTTPS

Acesse: `https://disparo.capitaoclean.com`

Você deve ver a tela de login.

### 6.2 - Fazer Login

- **E-mail:** `isaiaslink2@gmail.com`
- **Senha:** `Betocarrero666@`

### 6.3 - Testar Funcionalidades

1. ✅ Login funciona
2. ✅ Listar instâncias Evolution API
3. ✅ Buscar clientes do Supabase
4. ✅ Criar campanha
5. ✅ Iniciar disparo
6. ✅ Ver estatísticas

---

## 🔄 Passo 7: Atualizar Aplicação

### Upload da Imagem para Registry (opcional)

Se quiser usar Docker Hub:

```bash
# Tag a imagem
docker tag disparo-massa:latest SEU_USUARIO/disparo-massa:latest

# Push para Docker Hub
docker push SEU_USUARIO/disparo-massa:latest

# Atualizar no Portainer
# Mudar a imagem na stack para: SEU_USUARIO/disparo-massa:latest
```

### Atualização Local (sem registry)

1. Fazer build da nova imagem na VPS:
```bash
docker build -t disparo-massa:latest .
```

2. No Portainer:
   - Ir em **Stacks** > **disparo-massa**
   - Clicar em **Update the stack**
   - Marcar **Re-pull image**
   - Clicar em **Update**

---

## 🐛 Troubleshooting

### Erro 502 Bad Gateway
- Verificar se o container está rodando: `docker ps`
- Ver logs: `docker logs <container_id>`
- Verificar porta 3000 exposta

### Certificado SSL não funciona
- Aguardar 2-5 minutos para Let's Encrypt gerar
- Verificar se o Traefik está rodando
- Verificar DNS apontando corretamente

### Banco de dados não conecta
- Verificar se o IP `168.231.98.55` está acessível
- Testar: `telnet 168.231.98.55 5432`
- Verificar credenciais no `.env`

### Evolution API não responde
- Testar: `curl https://evolution.manager.capitaoclean.com/instance/fetchInstances -H "apikey: ed909056dbc40cd452ddb98166f504a9"`
- Verificar se a API Key está correta

---

## 📊 Monitoramento

### Ver Logs em Tempo Real

```bash
docker service logs -f disparo-massa_disparo-massa
```

### Status do Serviço

```bash
docker service ls
docker service ps disparo-massa_disparo-massa
```

### Estatísticas de Recursos

```bash
docker stats
```

---

## 🔒 Segurança

### Alterar Senha de Login

Edite o arquivo `frontend/login.html`:

```javascript
const VALID_EMAIL = 'seu@email.com';
const VALID_PASSWORD = 'SuaNovaSenha123!';
```

Depois faça rebuild e redeploy.

### Firewall

Certifique-se de que apenas as portas necessárias estão abertas:
- 80 (HTTP) - Redirect para HTTPS
- 443 (HTTPS)
- 2377 (Swarm)

---

## ✨ Features Implementadas

- ✅ Login com autenticação
- ✅ Integração completa Evolution API (9 tipos de mensagem)
- ✅ Integração Supabase (busca de clientes)
- ✅ Filtros rápidos (10min, 24h, 72h)
- ✅ Atualização automática de `data_follow` no Supabase
- ✅ 12 instâncias Evolution detectadas automaticamente
- ✅ Interface moderna e responsiva
- ✅ Deploy Docker Swarm + Traefik
- ✅ SSL automático (Let's Encrypt)
- ✅ **Sistema Anti-Bloqueio WhatsApp (2025)**
  - Delays inteligentes e randomizados (20-90s)
  - Limites automáticos (50/hora, 500/dia)
  - Horário comercial (8h-20h, Seg-Sex)
  - Pausas preventivas automáticas
  - Personalização de mensagens ({{nome}}, {{telefone}})
  - Validação de números
  - Monitoramento em tempo real

---

## 📞 Suporte

Se tiver problemas:
1. Verificar logs do container
2. Testar conectividade com banco/APIs
3. Verificar configuração do Traefik
4. Revisar este guia passo a passo

**Desenvolvido com ❤️ para Capitão Clean**
