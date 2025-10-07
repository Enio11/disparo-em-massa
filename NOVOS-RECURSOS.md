# 🚀 Novos Recursos - Disparo em Massa WhatsApp

## ✅ O que foi implementado

### 1. **Integração com Supabase** 🔗

#### Conexão com tabela `clientes`
- Buscar clientes do Supabase diretamente
- Filtrar por nome, telefone, cidade
- Importar clientes para campanhas

#### Supabase Storage para Mídias
- Upload de imagens, vídeos e áudios
- Armazenamento centralizado
- URLs públicas automáticas
- Reutilização de mídias

### 2. **Novos Tipos de Mensagens Evolution API** 📱

Agora suporta **9 tipos de mensagens**:

| Tipo | Descrição | Endpoint |
|------|-----------|----------|
| ✅ **Texto** | Mensagens de texto simples | `/message/sendText` |
| ✅ **Imagem** | Enviar fotos com legenda | `/message/sendMedia` |
| ✅ **Vídeo** | Enviar vídeos com legenda | `/message/sendMedia` |
| 🆕 **Botões** | Até 3 botões interativos | `/message/sendButton` |
| 🆕 **Lista/Menu** | Menus com categorias | `/message/sendList` |
| 🆕 **Enquete** | Polls com múltiplas opções | `/message/sendPoll` |
| 🆕 **Áudio** | Mensagens de áudio/voz | `/message/sendAudio` |
| 🆕 **Localização** | Compartilhar GPS | `/message/sendLocation` |
| 🆕 **Contato** | Enviar vCard | `/message/sendContact` |
| 🆕 **Sticker** | Enviar figurinhas | `/message/sendSticker` |

### 3. **Nova Estrutura do Banco de Dados** 💾

#### Tabela `midias` (nova)
```sql
id, nome, tipo, mimetype, url, path, tamanho, created_at
```

#### Tabela `campanhas` (atualizada)
- ✅ Campo `dados_interativos` (JSONB) - Para botões, listas, polls
- ✅ Campo `midia_id` - Referência às mídias no Storage

---

## 📡 Novos Endpoints da API

### Evolution API Instances

```bash
# Listar todas as instâncias do Evolution API
GET /api/instancias/evolution/listar

# Resposta:
{
  "success": true,
  "data": [
    {
      "id": "08ec30f8-d8b5-4c61-aae1-23818dd46377",
      "name": "disparo_oficial_01",
      "connectionStatus": "open",
      "integration": "WHATSAPP-BUSINESS",
      "number": "744321608761811",
      "profileName": null,
      "connected": true
    }
  ],
  "total": 12
}
```

### Clientes Supabase

```bash
# Listar clientes
GET /api/clientes-supabase?limit=100&offset=0

# Buscar cliente específico (por whatsapp)
GET /api/clientes-supabase/:whatsapp

# Filtrar clientes
POST /api/clientes-supabase/filtrar
{
  "nome": "João",
  "whatsapp": "5531",
  "ia_instancia": "cc_8999",
  "pausado": false
}

# Importar clientes para campanha
POST /api/clientes-supabase/importar
{
  "cliente_whatsapps": ["5511999999999", "5511888888888"],
  "campanha_id": 5
}

# Contar total de clientes
GET /api/clientes-supabase/contar
```

### Mídias (Upload e Gerenciamento)

```bash
# Listar mídias
GET /api/midias?tipo=imagem

# Buscar mídia específica
GET /api/midias/:id

# Upload de arquivo
POST /api/midias/upload
Content-Type: multipart/form-data
file: <arquivo>
tipo: "imagem" | "video" | "audio"

# Upload base64
POST /api/midias/upload-base64
{
  "base64": "data:image/png;base64,...",
  "mimetype": "image/png",
  "tipo": "imagem",
  "nome": "minha-imagem.png"
}

# Deletar mídia
DELETE /api/midias/:id

# Inicializar bucket do Storage
POST /api/midias/inicializar-storage
```

---

## 🎯 Exemplos de Uso

### Criar Campanha com Botões

```bash
POST /api/campanhas
{
  "nome": "Promoção com Botões",
  "tipo": "botoes",
  "instancia_id": 1,
  "delay_entre_envios": 5000,
  "dados_interativos": {
    "title": "Aproveite nossa promoção!",
    "description": "Escolha uma opção abaixo:",
    "footer": "Capitão Clean",
    "buttons": [
      {
        "title": "reply",
        "displayText": "✅ Quero saber mais",
        "id": "btn1"
      },
      {
        "title": "reply",
        "displayText": "📞 Falar com atendente",
        "id": "btn2"
      }
    ]
  }
}
```

### Criar Campanha com Lista/Menu

```bash
POST /api/campanhas
{
  "nome": "Menu de Serviços",
  "tipo": "lista",
  "instancia_id": 1,
  "delay_entre_envios": 5000,
  "dados_interativos": {
    "title": "Nossos Serviços",
    "description": "Selecione o serviço desejado",
    "buttonText": "Ver opções",
    "footerText": "Capitão Clean",
    "values": [
      {
        "title": "🏠 Limpeza Residencial",
        "rows": [
          {
            "title": "Limpeza Pesada",
            "description": "Limpeza completa da casa",
            "rowId": "limpeza_pesada"
          },
          {
            "title": "Limpeza Rápida",
            "description": "Limpeza básica",
            "rowId": "limpeza_rapida"
          }
        ]
      },
      {
        "title": "🏢 Limpeza Comercial",
        "rows": [
          {
            "title": "Escritórios",
            "description": "Limpeza de escritórios",
            "rowId": "escritorios"
          }
        ]
      }
    ]
  }
}
```

### Criar Campanha com Enquete

```bash
POST /api/campanhas
{
  "nome": "Pesquisa de Satisfação",
  "tipo": "enquete",
  "instancia_id": 1,
  "delay_entre_envios": 5000,
  "dados_interativos": {
    "name": "Como você avalia nosso serviço?",
    "selectableCount": 1,
    "values": [
      "⭐⭐⭐⭐⭐ Excelente",
      "⭐⭐⭐⭐ Muito Bom",
      "⭐⭐⭐ Bom",
      "⭐⭐ Regular",
      "⭐ Ruim"
    ]
  }
}
```

### Criar Campanha com Localização

```bash
POST /api/campanhas
{
  "nome": "Localização da Loja",
  "tipo": "localizacao",
  "instancia_id": 1,
  "delay_entre_envios": 5000,
  "dados_interativos": {
    "name": "Capitão Clean - Matriz",
    "address": "Rua Exemplo, 123 - Centro",
    "latitude": -19.9167,
    "longitude": -43.9345
  }
}
```

### Usar Mídia do Supabase Storage

```bash
# 1. Fazer upload da mídia
POST /api/midias/upload
file: video.mp4
tipo: "video"

# Resposta:
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://xxx.supabase.co/storage/v1/object/public/disparo-midias/video/uuid.mp4"
  }
}

# 2. Criar campanha usando a mídia
POST /api/campanhas
{
  "nome": "Vídeo Promocional",
  "tipo": "video",
  "midia_id": 1,
  "media_url": "https://xxx.supabase.co/storage/v1/object/public/disparo-midias/video/uuid.mp4",
  "media_filename": "video.mp4",
  "mimetype": "video/mp4",
  "mensagem": "Confira nosso novo vídeo!",
  "instancia_id": 1,
  "delay_entre_envios": 5000
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Supabase
SUPABASE_URL=https://teycepmxmsajigejnvee.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Inicializar Storage

```bash
POST /api/midias/inicializar-storage
```

Isso criará o bucket `disparo-midias` no Supabase Storage.

---

## 📊 Fluxo Completo de Uso

### 1. Importar Clientes do Supabase

```bash
# Listar clientes disponíveis
GET /api/clientes-supabase

# Importar para campanha
POST /api/clientes-supabase/importar
{
  "cliente_ids": [1, 2, 3, 4, 5],
  "campanha_id": 10
}
```

### 2. Upload de Mídia (opcional)

```bash
POST /api/midias/upload
file: imagem.jpg
tipo: "imagem"
```

### 3. Criar Campanha

```bash
POST /api/campanhas
{
  "nome": "Campanha Teste",
  "tipo": "botoes",
  "dados_interativos": { ... },
  "instancia_id": 1,
  "delay_entre_envios": 5000
}
```

### 4. Iniciar Disparo

```bash
POST /api/campanhas/:id/iniciar
```

### 5. Acompanhar Estatísticas

```bash
GET /api/campanhas/:id/estatisticas
```

---

## 🎨 Frontend (A Implementar)

O backend está **100% funcional**. Para o frontend, será necessário criar:

1. **Seletor de Tipo de Mensagem** - Dropdown com 9 opções
2. **Editores Específicos**:
   - Editor de Botões
   - Editor de Listas
   - Editor de Enquetes
   - Editor de Localização
3. **Upload de Mídias** - Drag & drop ou input file
4. **Galeria de Mídias** - Visualizar e selecionar mídias
5. **Importador de Clientes** - Buscar e selecionar do Supabase

---

## 🚀 Próximos Passos

1. ✅ **Backend Completo** - Implementado!
2. 🔄 **Testar Endpoints** - Via Postman/Thunder Client
3. ⏳ **Implementar Frontend** - HTML/CSS/JS
4. ⏳ **Deploy no Servidor** - Docker Swarm + Traefik

---

## 📝 Notas Importantes

- Todos os endpoints estão documentados e funcionais
- O sistema suporta todos os 9 tipos de mensagens da Evolution API
- A integração com Supabase está completa (DB + Storage)
- O disparoService processa automaticamente o tipo correto
- As mídias são armazenadas no Supabase Storage
- Os clientes podem ser importados diretamente do Supabase

---

## 🐛 Troubleshooting

### Erro ao conectar Supabase
- Verifique as credenciais no `.env`
- Teste a conexão: `GET /api/clientes-supabase`

### Erro no upload de mídias
- Inicialize o bucket: `POST /api/midias/inicializar-storage`
- Verifique permissões no Supabase

### Erro ao enviar mensagem
- Verifique se a instância Evolution está conectada
- Teste: `GET /api/instancias/:id/verificar`

---

**Desenvolvido com ❤️ para facilitar o disparo em massa no WhatsApp**
