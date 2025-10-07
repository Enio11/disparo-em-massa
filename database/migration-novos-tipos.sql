-- Migração para adicionar novos tipos de mensagens e mídias
-- Execute este script no banco disparo_capitao_clean

-- Tabela de mídias
CREATE TABLE IF NOT EXISTS midias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'imagem', 'video', 'audio', 'documento'
    mimetype VARCHAR(100),
    url TEXT NOT NULL,
    path TEXT NOT NULL,
    tamanho INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar novos campos na tabela campanhas (se não existirem)
DO $$
BEGIN
    -- Adicionar campo para dados interativos (botões, listas, polls)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='campanhas' AND column_name='dados_interativos') THEN
        ALTER TABLE campanhas ADD COLUMN dados_interativos JSONB;
    END IF;

    -- Adicionar campo para URL da mídia no Supabase
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='campanhas' AND column_name='midia_id') THEN
        ALTER TABLE campanhas ADD COLUMN midia_id INTEGER REFERENCES midias(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_midias_tipo ON midias(tipo);
CREATE INDEX IF NOT EXISTS idx_campanhas_midia ON campanhas(midia_id);

-- Trigger para atualizar updated_at nas mídias
CREATE OR REPLACE FUNCTION update_midias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_midias_updated_at_trigger ON midias;
CREATE TRIGGER update_midias_updated_at_trigger
    BEFORE UPDATE ON midias
    FOR EACH ROW EXECUTE FUNCTION update_midias_updated_at();

-- Comentários nas tabelas
COMMENT ON TABLE midias IS 'Armazena mídias enviadas para o Supabase Storage';
COMMENT ON COLUMN campanhas.dados_interativos IS 'JSON com dados de botões, listas, polls, etc';
COMMENT ON COLUMN campanhas.midia_id IS 'Referência à mídia no Supabase Storage';
