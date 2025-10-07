require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Rotas da API
app.use('/api', routes);

// Rota raiz - servir o frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Porta do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Evolution API: ${process.env.EVOLUTION_API_URL || 'https://evolution.manager.capitaoclean.com'}`);
  console.log(`💾 Database: ${process.env.DB_NAME || 'disparo_capitao_clean'}`);
});

module.exports = app;
