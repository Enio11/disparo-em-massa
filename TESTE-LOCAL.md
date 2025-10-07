# Como Testar Localmente

## Opção 1: Com Node.js (Mais Rápido) ⚡

### Pré-requisitos
- Node.js instalado (versão 16 ou superior)
- Acesso ao seu PostgreSQL (pode ser o da VPS)

### Passo a Passo

**1. Edite o arquivo `.env`**

Abra o arquivo `.env` e configure:

```env
# Se você NÃO tem PostgreSQL local, use o IP da sua VPS:
DB_HOST=SEU_IP_DA_VPS_AQUI
# Exemplo: DB_HOST=192.168.1.100

# Se você TEM PostgreSQL local:
DB_HOST=localhost

# Restante das configurações (já estão preenchidas)
DB_PORT=5432
DB_NAME=disparo_capitao_clean
DB_USER=postgres
DB_PASSWORD=04c24e071db756199fe467dc9d341c3c

EVOLUTION_API_URL=https://evolution.manager.capitaoclean.com
EVOLUTION_API_KEY=ed909056dbc40cd452ddb98166f504a9
```

**2. Execute o script de inicialização**

```bash
# No terminal, dentro da pasta do projeto:
./start-local.sh
```

Ou manualmente:

```bash
# Instalar dependências
cd backend
npm install

# Voltar para a raiz
cd ..

# Iniciar servidor
node backend/src/app.js
```

**3. Acesse a aplicação**

Abra seu navegador em:
```
http://localhost:3000
```

**4. Parar o servidor**

Pressione `CTRL+C` no terminal

---

## Opção 2: Com Docker Compose (Completo) 🐳

Esta opção cria um PostgreSQL local + aplicação completa.

### Pré-requisitos
- Docker e Docker Compose instalados

### Passo a Passo

**1. Construir e iniciar**

```bash
# Construir a imagem
docker build -t disparo-massa:latest .

# Iniciar todos os serviços
docker-compose -f docker-compose.local.yml up
```

**2. Acesse a aplicação**

```
http://localhost:3000
```

**3. Parar os serviços**

```bash
# Pressione CTRL+C no terminal

# Ou em outro terminal:
docker-compose -f docker-compose.local.yml down
```

**4. Limpar tudo (opcional)**

```bash
# Remove containers, volumes e imagens
docker-compose -f docker-compose.local.yml down -v
```

---

## Opção 3: Teste Rápido sem Banco de Dados

Se você só quer ver a interface (sem funcionalidades):

```bash
# Instalar um servidor HTTP simples
npm install -g http-server

# Servir o frontend
cd frontend
http-server -p 3000

# Acesse: http://localhost:3000
```

⚠️ **Nota**: Nesta opção, a aplicação não funcionará completamente pois não há backend/banco.

---

## Testando a Integração com Evolution API

Para testar se a integração está funcionando:

1. Acesse a aba **Instâncias**
2. Adicione uma instância:
   - Nome: "Teste Local"
   - Instance Name: (o nome da sua instância na Evolution API)
3. Clique em **Verificar**
4. Se aparecer "Conexão: Ativa ✅", está funcionando!

## Troubleshooting

### Erro: "Cannot connect to PostgreSQL"

**Solução 1**: Se estiver usando o PostgreSQL da VPS:
```env
# No arquivo .env, use o IP público da VPS
DB_HOST=SEU_IP_PUBLICO
```

**Solução 2**: Certifique-se de que a porta 5432 está aberta:
```bash
# No servidor
sudo ufw allow 5432
```

**Solução 3**: Use o Docker Compose local (Opção 2)

### Erro: "Port 3000 already in use"

Outra aplicação está usando a porta 3000. Mude a porta no `.env`:
```env
PORT=3001
```

### Erro: "Evolution API not responding"

Verifique se:
- A URL da Evolution API está correta
- A API Key está correta
- Sua instância está conectada

### Interface carrega mas não mostra dados

Abra o Console do navegador (F12) e verifique erros. Provavelmente:
- Backend não está rodando
- Erro de conexão com banco de dados

---

## Após Testar com Sucesso

Quando estiver tudo funcionando localmente:

1. **Pare o servidor local** (CTRL+C)

2. **Suba para o servidor**:
   ```bash
   # Construir imagem
   docker build -t disparo-massa:latest .

   # Deploy no Swarm via Portainer
   # (ou docker stack deploy -c docker-compose.yml disparo-massa)
   ```

3. **Ajuste o domínio** no `docker-compose.yml`

4. **Deploy**!

---

## Comandos Úteis

```bash
# Ver logs em tempo real
tail -f backend/logs.txt

# Verificar se o Node está rodando
ps aux | grep node

# Testar conexão com PostgreSQL
psql -h SEU_IP -U postgres -d disparo_capitao_clean

# Listar portas em uso
lsof -i :3000
```
