const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class StorageService {
  constructor() {
    this.bucketName = 'disparo-midias';
  }

  // Criar bucket se não existir
  async inicializarBucket() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();

      const bucketExists = buckets.some(b => b.name === this.bucketName);

      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          fileSizeLimit: 52428800 // 50MB
        });

        if (error) throw error;
        console.log(`✅ Bucket ${this.bucketName} criado`);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao inicializar bucket:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload de arquivo
  async uploadFile(file, tipo = 'imagem') {
    try {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${tipo}/${uuidv4()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      // Gerar URL pública
      const { data: publicUrl } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return {
        success: true,
        path: data.path,
        url: publicUrl.publicUrl,
        fullPath: data.fullPath
      };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload de base64
  async uploadBase64(base64String, mimetype, tipo = 'imagem') {
    try {
      // Remover prefixo data:image/png;base64,
      const base64Data = base64String.replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const fileExt = mimetype.split('/')[1];
      const fileName = `${tipo}/${uuidv4()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, buffer, {
          contentType: mimetype,
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return {
        success: true,
        path: data.path,
        url: publicUrl.publicUrl
      };
    } catch (error) {
      console.error('Erro ao fazer upload base64:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listar arquivos
  async listarArquivos(tipo = null) {
    try {
      const path = tipo ? tipo : '';

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(path, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      // Adicionar URLs públicas
      const filesWithUrls = data.map(file => {
        const { data: publicUrl } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(`${path}/${file.name}`);

        return {
          ...file,
          url: publicUrl.publicUrl
        };
      });

      return {
        success: true,
        data: filesWithUrls
      };
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Deletar arquivo
  async deletarArquivo(path) {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) throw error;

      return {
        success: true,
        message: 'Arquivo deletado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar URL assinada (temporária)
  async getSignedUrl(path, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;

      return {
        success: true,
        url: data.signedUrl
      };
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new StorageService();
