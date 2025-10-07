FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY backend/package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar código do backend
COPY backend/src ./src
COPY backend/.env ./

# Copiar frontend
COPY frontend ./frontend

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["node", "src/app.js"]
