const storageService = require('../services/storageService');
const db = require('../config/database');
const multer = require('multer');

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

class MidiaController {
  // Middleware do multer
  getUploadMiddleware() {
    return upload.single('file');
  }

  async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado'
        });
      }

      const { tipo = 'imagem' } = req.body;

      // Fazer upload no Supabase Storage
      const resultado = await storageService.uploadFile(req.file, tipo);

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          error: resultado.error
        });
      }

      // Salvar no banco de dados
      const midiaResult = await db.query(
        `INSERT INTO midias (nome, tipo, mimetype, url, path, tamanho)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          req.file.originalname,
          tipo,
          req.file.mimetype,
          resultado.url,
          resultado.path,
          req.file.size
        ]
      );

      res.status(201).json({
        success: true,
        data: midiaResult.rows[0]
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer upload'
      });
    }
  }

  async uploadBase64(req, res) {
    try {
      const { base64, mimetype, tipo = 'imagem', nome } = req.body;

      if (!base64 || !mimetype) {
        return res.status(400).json({
          success: false,
          error: 'Base64 e mimetype são obrigatórios'
        });
      }

      // Fazer upload no Supabase Storage
      const resultado = await storageService.uploadBase64(base64, mimetype, tipo);

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          error: resultado.error
        });
      }

      // Salvar no banco de dados
      const midiaResult = await db.query(
        `INSERT INTO midias (nome, tipo, mimetype, url, path)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          nome || 'upload_base64',
          tipo,
          mimetype,
          resultado.url,
          resultado.path
        ]
      );

      res.status(201).json({
        success: true,
        data: midiaResult.rows[0]
      });
    } catch (error) {
      console.error('Erro ao fazer upload base64:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer upload'
      });
    }
  }

  async listar(req, res) {
    try {
      const { tipo } = req.query;

      let query = 'SELECT * FROM midias';
      const params = [];

      if (tipo) {
        query += ' WHERE tipo = $1';
        params.push(tipo);
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Erro ao listar mídias:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar mídias'
      });
    }
  }

  async buscar(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query('SELECT * FROM midias WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Mídia não encontrada'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao buscar mídia:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar mídia'
      });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;

      // Buscar mídia no banco
      const midiaResult = await db.query('SELECT * FROM midias WHERE id = $1', [id]);

      if (midiaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Mídia não encontrada'
        });
      }

      const midia = midiaResult.rows[0];

      // Deletar do Supabase Storage
      await storageService.deletarArquivo(midia.path);

      // Deletar do banco
      await db.query('DELETE FROM midias WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Mídia deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar mídia:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar mídia'
      });
    }
  }

  async inicializarStorage(req, res) {
    try {
      const resultado = await storageService.inicializarBucket();

      if (resultado.success) {
        res.json({
          success: true,
          message: 'Storage inicializado com sucesso'
        });
      } else {
        res.status(500).json({
          success: false,
          error: resultado.error
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar storage:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao inicializar storage'
      });
    }
  }
}

module.exports = new MidiaController();
