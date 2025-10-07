# Disparo em Massa - WhatsApp

Sistema completo de disparo em massa para WhatsApp integrado com Evolution API v2.

## Funcionalidades

- ✅ Interface web visual e intuitiva
- ✅ Disparo de mensagens de texto
- ✅ Disparo de imagens
- ✅ Disparo de vídeos
- ✅ Gerenciamento de campanhas
- ✅ Importação de contatos em lote
- ✅ Delay configurável entre envios
- ✅ Acompanhamento em tempo real
- ✅ Histórico de disparos
- ✅ Controle de pausar/retomar campanhas
- ✅ Múltiplas instâncias Evolution API
- ✅ Estatísticas detalhadas

## Arquitetura

- **Backend**: Node.js + Express
- **Frontend**: HTML/CSS/JavaScript (Vanilla)
- **Banco de Dados**: PostgreSQL
- **Integração**: Evolution API v2
- **Deploy**: Docker Swarm + Traefik

## Pré-requisitos

- Docker Swarm configurado
- Traefik rodando
- PostgreSQL rodando (conforme sua stack)
- Evolution API configurada
- Rede `capitao-network` criada

## 🧪 Testar Localmente Primeiro

**RECOMENDADO**: Teste a aplicação localmente antes de fazer deploy no servidor!

Veja o guia completo em: **[TESTE-LOCAL.md](TESTE-LOCAL.md)**

Opção rápida:
```bash
# 1. Edite o arquivo .env com suas configurações
# 2. Execute:
./start-local.sh

# 3. Acesse: http://localhost:3000
```

## Instalação

### 1. Criar o banco de dados

Primeiro, execute o script SQL para criar as tabelas necessárias:

```bash
# Conecte ao PostgreSQL
docker exec -it <container_postgres> psql -U postgres

# Execute o script
\i /caminho/para/database/init.sql
```

Ou copie o conteúdo do arquivo `database/init.sql` e execute manualmente no PostgreSQL.

### 2. Ajustar configurações

Edite o arquivo `docker-compose.yml` e ajuste:

- **Domínio**: Altere `disparo.capitaoclean.com` para seu domínio
- **Evolution API**: Verifique se as credenciais estão corretas
- **Banco de dados**: Confirme a senha do PostgreSQL

### 3. Construir a imagem Docker

```bash
# Na raiz do projeto
docker build -t disparo-massa:latest .
```

### 4. Deploy no Docker Swarm via Portainer

1. Acesse seu Portainer
2. Vá em **Stacks** → **Add Stack**
3. Cole o conteúdo do `docker-compose.yml`
4. Clique em **Deploy the stack**

Ou via linha de comando:

```bash
docker stack deploy -c docker-compose.yml disparo-massa
```

### 5. Verificar o deploy

```bash
# Verificar se o serviço está rodando
docker service ls | grep disparo

# Ver logs
docker service logs -f disparo-massa_disparo-massa
```

## Acesso

Após o deploy, acesse a aplicação pelo domínio configurado:

```
https://disparo.capitaoclean.com
```

(ou o domínio que você configurou no docker-compose.yml)

## Uso

### 1. Configurar Instância

1. Acesse a aba **Instâncias**
2. Adicione sua instância do Evolution API
3. Clique em **Verificar** para testar a conexão

### 2. Criar Campanha

1. Acesse a aba **Nova Campanha**
2. Preencha os dados:
   - Nome da campanha
   - Selecione a instância
   - Escolha o tipo (Texto, Imagem ou Vídeo)
   - Digite a mensagem
   - Se for mídia, informe a URL e tipo
   - Configure o delay entre envios
   - Cole a lista de números (um por linha)
3. Clique em **Criar Campanha**

### 3. Gerenciar Campanhas

Na aba **Campanhas** você pode:

- Ver todas as campanhas criadas
- Iniciar uma campanha
- Pausar uma campanha em andamento
- Retomar uma campanha pausada
- Ver detalhes e estatísticas
- Deletar campanhas

### Formato dos números

Os números devem estar no formato internacional, com código do país e DDD:

```
5531999999999
5531988888888
5511977777777
```

## Estrutura do Projeto

```
disparo-em-massa/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Configuração PostgreSQL
│   │   ├── controllers/
│   │   │   ├── campanhaController.js # Gerencia campanhas
│   │   │   ├── contatoController.js  # Gerencia contatos
│   │   │   └── instanciaController.js# Gerencia instâncias
│   │   ├── routes/
│   │   │   └── index.js              # Rotas da API
│   │   ├── services/
│   │   │   ├── evolutionService.js   # Integração Evolution API
│   │   │   └── disparoService.js     # Lógica de disparo
│   │   └── app.js                    # Servidor Express
│   └── package.json
├── frontend/
│   ├── index.html                     # Interface principal
│   ├── css/
│   │   └── style.css                  # Estilos
│   └── js/
│       └── app.js                     # Lógica do frontend
├── database/
│   └── init.sql                       # Schema do banco
├── Dockerfile                         # Imagem Docker
├── docker-compose.yml                 # Stack para Swarm
└── README.md
```

## API Endpoints

### Campanhas

- `GET /api/campanhas` - Listar todas as campanhas
- `GET /api/campanhas/:id` - Buscar uma campanha
- `POST /api/campanhas` - Criar campanha
- `PUT /api/campanhas/:id` - Atualizar campanha
- `DELETE /api/campanhas/:id` - Deletar campanha
- `POST /api/campanhas/:id/iniciar` - Iniciar campanha
- `POST /api/campanhas/:id/pausar` - Pausar campanha
- `POST /api/campanhas/:id/retomar` - Retomar campanha
- `GET /api/campanhas/:id/estatisticas` - Ver estatísticas

### Contatos

- `GET /api/contatos` - Listar contatos
- `POST /api/contatos` - Criar contato
- `POST /api/contatos/importar` - Importar lote de contatos
- `DELETE /api/contatos/:id` - Deletar contato

### Instâncias

- `GET /api/instancias` - Listar instâncias
- `POST /api/instancias` - Criar instância
- `GET /api/instancias/:id/verificar` - Verificar conexão
- `DELETE /api/instancias/:id` - Deletar instância

## Banco de Dados

### Tabelas

- **instancias** - Instâncias do Evolution API
- **campanhas** - Campanhas de disparo
- **contatos** - Lista de contatos
- **disparos** - Log de envios

## Variáveis de Ambiente

As seguintes variáveis podem ser configuradas:

```env
# Banco de Dados
DB_HOST=postgres
DB_PORT=5432
DB_NAME=disparo_capitao_clean
DB_USER=postgres
DB_PASSWORD=sua_senha

# Evolution API
EVOLUTION_API_URL=https://evolution.manager.capitaoclean.com
EVOLUTION_API_KEY=sua_api_key

# Servidor
PORT=3000
NODE_ENV=production
```

## Troubleshooting

### Erro de conexão com o banco

Verifique se:
- O PostgreSQL está rodando
- O banco `disparo_capitao_clean` foi criado
- A senha está correta
- A rede `capitao-network` está compartilhada

### Erro ao enviar mensagens

Verifique se:
- A Evolution API está online
- A API Key está correta
- A instância está conectada ao WhatsApp
- O número está no formato correto (com código do país)

### Aplicação não acessível

Verifique se:
- O Traefik está rodando
- O domínio está apontando para o servidor
- Os labels do Traefik estão corretos
- O serviço está rodando (`docker service ls`)

## Desenvolvimento Local

Para testar localmente sem Docker:

```bash
# Instalar dependências
cd backend
npm install

# Configurar variáveis de ambiente
cp ../.env.example .env
# Edite o .env com suas configurações

# Executar em modo de desenvolvimento
npm run dev

# Acessar
http://localhost:3000
```

## Contribuindo

Sinta-se à vontade para contribuir com melhorias!

## Licença

MIT

## Suporte

Para dúvidas sobre:
- **Evolution API**: https://doc.evolution-api.com
- **Traefik**: https://doc.traefik.io
- **Docker Swarm**: https://docs.docker.com/engine/swarm/

---

Desenvolvido com ❤️ para facilitar o disparo em massa no WhatsApp
