# 🚀 Deploy Rápido - Portainer + Traefik

## 📋 Pré-requisitos

✅ VPS com Docker Swarm configurado
✅ Portainer instalado
✅ Traefik instalado com rede `capitao-network`
✅ DNS apontando para a VPS: `disparo.capitaoclean.com`

---

## 🔥 Passo a Passo

### 1️⃣ Subir o código para a VPS

Faça upload do projeto completo para a VPS via Git, FTP ou SCP:

```bash
# Exemplo via Git (recomendado)
cd /opt
git clone seu-repositorio disparo-em-massa
cd disparo-em-massa
```

**OU via SCP do seu computador:**

```bash
scp -r /Users/eniomacedo/Documents/GitHub/disparo-em-massa root@SEU_IP_VPS:/opt/
```

---

### 2️⃣ Executar a Migration do Banco (IMPORTANTE!)

Na VPS, execute a migration da tabela de aquecimento:

```bash
cd /opt/disparo-em-massa/backend
node executar-migration-warmup.js
```

Você deve ver:
```
✅ Tabela number_warmup criada com sucesso!
✅ Índices criados!
🎉 Migration executada com sucesso!
```

---

### 3️⃣ Build da Imagem Docker

Na VPS, na pasta do projeto:

```bash
cd /opt/disparo-em-massa
docker build -t disparo-massa:latest .
```

Aguarde o build finalizar. Você verá:
```
Successfully tagged disparo-massa:latest
```

---

### 4️⃣ Criar Stack no Portainer

1. Acesse o Portainer: `https://portainer.capitaoclean.com` (ou seu domínio)

2. Vá em **Stacks** > **+ Add stack**

3. **Nome da Stack:** `disparo-massa`

4. **Build method:** Selecione "Web editor"

5. Cole o conteúdo do arquivo `docker-compose.yml` (já atualizado):

```yaml
version: "3.7"

services:
  disparo-massa:
    image: disparo-massa:latest
    networks:
      - capitao-network
    environment:
      ## Configurações do Banco de Dados
      - DB_HOST=168.231.98.55
      - DB_PORT=5432
      - DB_NAME=disparo_capitao_clean
      - DB_USER=postgres
      - DB_PASSWORD=123

      ## Configurações da Evolution API
      - EVOLUTION_API_URL=https://evolution.manager.capitaoclean.com
      - EVOLUTION_API_KEY=ed909056dbc40cd452ddb98166f504a9

      ## Configurações do Supabase
      - SUPABASE_URL=https://teycepmxmsajigejnvee.supabase.co
      - SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWNlcG14bXNhamlnZWpudmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY0NTU5MSwiZXhwIjoyMDM0MjIxNTkxfQ.acapiVxOC665khvVZ6vXrXWw6zkaLpVqrSDEwMSneeI

      ## Porta do servidor
      - PORT=3000

      ## Node Environment
      - NODE_ENV=production

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        ## Habilitar Traefik
        - traefik.enable=true

        ## Configuração HTTP
        - traefik.http.routers.disparo-massa.rule=Host(`disparo.capitaoclean.com`)
        - traefik.http.routers.disparo-massa.entrypoints=websecure
        - traefik.http.routers.disparo-massa.tls.certresolver=letsencryptresolver
        - traefik.http.routers.disparo-massa.service=disparo-massa

        ## Configuração do serviço
        - traefik.http.services.disparo-massa.loadbalancer.server.port=3000
        - traefik.http.services.disparo-massa.loadbalancer.passHostHeader=true

      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M

networks:
  capitao-network:
    external: true
    name: capitao-network
```

6. Clique em **Deploy the stack**

---

### 5️⃣ Verificar Deploy

1. No Portainer, vá em **Services**

2. Localize o serviço `disparo-massa_disparo-massa`

3. Verifique que está com status **Running**

4. Clique no serviço e vá em **Logs**

Você deve ver:
```
🚀 Servidor rodando na porta 3000
✅ Conectado ao banco de dados PostgreSQL
📡 Evolution API configurada
📊 Supabase configurado
```

---

### 6️⃣ Testar o Sistema

1. **Acesse pelo navegador:**
   ```
   https://disparo.capitaoclean.com
   ```

2. **Fazer login:**
   - Email: `isaiaslink2@gmail.com`
   - Senha: `Betocarrero666@`

3. **Testar funcionalidades:**
   - ✅ Listar instâncias Evolution
   - ✅ Buscar clientes Supabase
   - ✅ Criar campanha de teste
   - ✅ Iniciar aquecimento de número
   - ✅ Verificar métricas anti-ban

---

## 🔄 Atualizar a Aplicação

Quando fizer alterações no código:

### Na VPS:

```bash
# 1. Atualizar código
cd /opt/disparo-em-massa
git pull  # ou re-upload via SCP

# 2. Rebuild da imagem
docker build -t disparo-massa:latest .

# 3. No Portainer:
# - Ir em Stacks > disparo-massa
# - Clicar em "Update the stack"
# - Marcar "Re-deploy"
# - Clicar em "Update"
```

---

## 📊 Monitorar o Sistema

### Ver logs em tempo real:

```bash
docker service logs -f disparo-massa_disparo-massa
```

### Ver status dos serviços:

```bash
docker service ls
```

### Ver containers rodando:

```bash
docker ps
```

---

## 🐛 Problemas Comuns

### 1. Erro 502 Bad Gateway

**Causa:** Container não está rodando ou não conectou ao banco

**Solução:**
```bash
# Verificar logs
docker service logs disparo-massa_disparo-massa

# Verificar se o banco está acessível
telnet 168.231.98.55 5432
```

### 2. Certificado SSL não gerado

**Causa:** Traefik ainda não gerou o certificado Let's Encrypt

**Solução:**
- Aguarde 2-5 minutos
- Verifique se o DNS está correto
- Verifique logs do Traefik:
  ```bash
  docker service logs traefik_traefik
  ```

### 3. Não lista instâncias Evolution

**Causa:** API Key incorreta ou Evolution API fora do ar

**Solução:**
```bash
# Testar API manualmente
curl https://evolution.manager.capitaoclean.com/instance/fetchInstances \
  -H "apikey: ed909056dbc40cd452ddb98166f504a9"
```

### 4. Erro ao buscar clientes Supabase

**Causa:** Supabase Key incorreta

**Solução:**
- Verificar se a key está correta no docker-compose.yml
- Testar conexão Supabase manualmente

---

## 🎯 Checklist Pós-Deploy

- [ ] Sistema acessível via HTTPS
- [ ] Login funcionando
- [ ] Listagem de instâncias Evolution OK
- [ ] Busca de clientes Supabase OK
- [ ] Criação de campanha OK
- [ ] Disparo de teste enviado com sucesso
- [ ] Aquecimento de número iniciado
- [ ] Métricas anti-ban visíveis
- [ ] Logs sem erros críticos

---

## 🎉 Pronto!

Seu sistema de disparo em massa está rodando em produção com:

✅ SSL automático (HTTPS)
✅ Sistema anti-bloqueio WhatsApp
✅ Aquecimento gradual de números
✅ Integração Evolution API (12 instâncias)
✅ Integração Supabase
✅ Proteção por login
✅ Monitoramento em tempo real

**Acesse:** https://disparo.capitaoclean.com

---

## 📞 Comandos Úteis

```bash
# Ver todos os serviços
docker service ls

# Ver logs de um serviço
docker service logs -f disparo-massa_disparo-massa

# Reiniciar serviço
docker service update --force disparo-massa_disparo-massa

# Ver containers rodando
docker ps

# Entrar no container
docker exec -it $(docker ps -q -f name=disparo-massa) sh

# Ver uso de recursos
docker stats

# Remover imagens antigas
docker image prune -a
```
