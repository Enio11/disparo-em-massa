# Stack Portainer - Disparo em Massa

## Informações

- **Nome da Stack:** `disparo-massa`
- **Rede:** `capitao-network` (já existe)
- **Domínio:** `disparo.capitaoclean.com`

---

## Stack YAML

Copie o conteúdo abaixo e cole no Portainer:

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
      - DB_PASSWORD=04c24e071db756199fe467dc9d341c3c
      - EVOLUTION_API_URL=https://evolution.manager.capitaoclean.com
      - EVOLUTION_API_KEY=ed909056dbc40cd452ddb98166f504a9
      - SUPABASE_URL=https://teycepmxmsajigejnvee.supabase.co
      - SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWNlcG14bXNhamlnZWpudmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY0NTU5MSwiZXhwIjoyMDM0MjIxNTkxfQ.acapiVxOC665khvVZ6vXrXWw6zkaLpVqrSDEwMSneeI
      - PORT=3000
      - NODE_ENV=production
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.disparo-massa.rule=Host(`disparo.capitaoclean.com`)
        - traefik.http.routers.disparo-massa.entrypoints=websecure
        - traefik.http.routers.disparo-massa.tls.certresolver=letsencryptresolver
        - traefik.http.routers.disparo-massa.service=disparo-massa
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

---

## Como aplicar no Portainer

1. Acesse seu **Portainer**: `https://portainer.capitaoclean.com` (ou seu domínio)
2. Vá em **Stacks** → **+ Add stack**
3. **Nome:** `disparo-massa`
4. **Build method:** Web editor
5. Cole o YAML acima
6. Clique em **Deploy the stack**
7. Aguarde 10-20 segundos para deploy finalizar

---

## Verificar Deploy

Após o deploy, verifique:

1. **Status do serviço:**
   ```bash
   docker service ls | grep disparo-massa
   ```

2. **Logs:**
   ```bash
   docker service logs -f disparo-massa_disparo-massa
   ```

3. **Acessar o sistema:**
   - URL: `https://disparo.capitaoclean.com`
   - Email: `isaiaslink2@gmail.com`
   - Senha: `Betocarrero666@`

---

## Troubleshooting

### Se o serviço não subir:

```bash
# Ver status
docker service ps disparo-massa_disparo-massa

# Ver logs
docker service logs disparo-massa_disparo-massa --tail 50
```

### Se aparecer erro 502:

- Aguarde 30 segundos (aplicação está iniciando)
- Verifique se o serviço está rodando: `docker service ls`

### Se o certificado SSL não gerar:

- Aguarde 2-5 minutos
- Verifique DNS: `nslookup disparo.capitaoclean.com`
- Verifique logs do Traefik: `docker service logs traefik_traefik`

---

## Comandos Úteis

```bash
# Ver todos os serviços
docker service ls

# Ver logs em tempo real
docker service logs -f disparo-massa_disparo-massa

# Reiniciar serviço
docker service update --force disparo-massa_disparo-massa

# Remover stack
docker stack rm disparo-massa

# Ver uso de recursos
docker stats
```
