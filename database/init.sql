-- Schema para o banco disparo_capitao_clean
-- Execute este script no PostgreSQL para criar as tabelas necessárias

-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS disparo_capitao_clean;

-- Conectar ao banco
\c disparo_capitao_clean;

-- Tabela de instâncias do Evolution API
CREATE TABLE IF NOT EXISTS instancias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    instance_name VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'ativa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS campanhas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'texto', 'imagem', 'video'
    mensagem TEXT,
    media_url TEXT,
    media_filename VARCHAR(255),
    mimetype VARCHAR(100),
    delay_entre_envios INTEGER DEFAULT 5000, -- delay em milissegundos
    status VARCHAR(50) DEFAULT 'rascunho', -- 'rascunho', 'agendada', 'enviando', 'concluida', 'pausada'
    instancia_id INTEGER REFERENCES instancias(id) ON DELETE SET NULL,
    total_contatos INTEGER DEFAULT 0,
    total_enviados INTEGER DEFAULT 0,
    total_erros INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS contatos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    telefone VARCHAR(20) NOT NULL,
    campanha_id INTEGER REFERENCES campanhas(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de disparos (log de envios)
CREATE TABLE IF NOT EXISTS disparos (
    id SERIAL PRIMARY KEY,
    campanha_id INTEGER REFERENCES campanhas(id) ON DELETE CASCADE,
    contato_id INTEGER REFERENCES contatos(id) ON DELETE CASCADE,
    telefone VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'enviado', 'erro', 'falha'
    mensagem_id VARCHAR(255),
    erro_mensagem TEXT,
    resposta_api JSONB,
    tentativas INTEGER DEFAULT 0,
    enviado_em TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX idx_campanhas_status ON campanhas(status);
CREATE INDEX idx_contatos_campanha ON contatos(campanha_id);
CREATE INDEX idx_disparos_campanha ON disparos(campanha_id);
CREATE INDEX idx_disparos_status ON disparos(status);
CREATE INDEX idx_disparos_contato ON disparos(contato_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campanhas_updated_at BEFORE UPDATE ON campanhas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instancias_updated_at BEFORE UPDATE ON instancias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir instância padrão
INSERT INTO instancias (nome, instance_name, status)
VALUES ('Instância Principal', 'default', 'ativa')
ON CONFLICT (instance_name) DO NOTHING;
