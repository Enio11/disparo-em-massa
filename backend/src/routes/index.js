const express = require('express');
const router = express.Router();

const campanhaController = require('../controllers/campanhaController');
const contatoController = require('../controllers/contatoController');
const instanciaController = require('../controllers/instanciaController');
const clienteSupabaseController = require('../controllers/clienteSupabaseController');
const midiaController = require('../controllers/midiaController');
const warmupController = require('../controllers/warmupController');

// Rotas de Campanhas
router.get('/campanhas', campanhaController.listar);
router.get('/campanhas/:id', campanhaController.buscar);
router.post('/campanhas', campanhaController.criar);
router.put('/campanhas/:id', campanhaController.atualizar);
router.delete('/campanhas/:id', campanhaController.deletar);
router.post('/campanhas/:id/iniciar', campanhaController.iniciar);
router.post('/campanhas/:id/pausar', campanhaController.pausar);
router.post('/campanhas/:id/retomar', campanhaController.retomar);
router.get('/campanhas/:id/estatisticas', campanhaController.estatisticas);

// Rotas de Contatos
router.get('/contatos', contatoController.listar);
router.post('/contatos', contatoController.criar);
router.post('/contatos/importar', contatoController.importarLote);
router.delete('/contatos/:id', contatoController.deletar);
router.delete('/contatos/campanha/:campanha_id', contatoController.deletarPorCampanha);

// Rotas de Instâncias
router.get('/instancias', instanciaController.listar);
router.get('/instancias/evolution/listar', instanciaController.listarEvolution);
router.post('/instancias', instanciaController.criar);
router.get('/instancias/:id/verificar', instanciaController.verificarConexao);
router.delete('/instancias/:id', instanciaController.deletar);

// Rotas de Gerenciamento Evolution API
router.post('/instancias/evolution/criar', instanciaController.criarEvolution);
router.delete('/instancias/evolution/:instanceName', instanciaController.deletarEvolution);
router.post('/instancias/evolution/:instanceName/reiniciar', instanciaController.reiniciarEvolution);
router.get('/instancias/evolution/:instanceName/conectar', instanciaController.conectarEvolution);
router.delete('/instancias/evolution/:instanceName/logout', instanciaController.logoutEvolution);
router.get('/instancias/evolution/:instanceName/qrcode', instanciaController.obterQRCode);
router.get('/instancias/evolution/:instanceName/status', instanciaController.statusConexao);

// Rotas de Clientes Supabase
router.get('/clientes-supabase', clienteSupabaseController.listar);
router.get('/clientes-supabase/:id', clienteSupabaseController.buscar);
router.post('/clientes-supabase/filtrar', clienteSupabaseController.filtrar);
router.post('/clientes-supabase/importar', clienteSupabaseController.importarParaCampanha);
router.get('/clientes-supabase/contar', clienteSupabaseController.contar);

// Rotas de Mídias
router.get('/midias', midiaController.listar);
router.get('/midias/:id', midiaController.buscar);
router.post('/midias/upload', midiaController.getUploadMiddleware(), midiaController.upload);
router.post('/midias/upload-base64', midiaController.uploadBase64);
router.delete('/midias/:id', midiaController.deletar);
router.post('/midias/inicializar-storage', midiaController.inicializarStorage);

// Rotas de Aquecimento (Warmup)
router.post('/warmup/start', warmupController.start);
router.get('/warmup/status/:instance_name', warmupController.status);
router.post('/warmup/stop', warmupController.stop);
router.get('/warmup/schedule', warmupController.schedule);
router.get('/warmup/metrics/:instance_name', warmupController.metrics);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
