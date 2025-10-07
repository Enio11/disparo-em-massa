-- Tabela para armazenar aquecimento de números
CREATE TABLE IF NOT EXISTS number_warmup (
  id SERIAL PRIMARY KEY,
  instance_name VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  current_day INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'ativo', -- ativo, pausado, completo
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_warmup_instance ON number_warmup(instance_name);
CREATE INDEX IF NOT EXISTS idx_warmup_status ON number_warmup(status);

-- Comentários
COMMENT ON TABLE number_warmup IS 'Controle de aquecimento de números WhatsApp';
COMMENT ON COLUMN number_warmup.instance_name IS 'Nome da instância Evolution API';
COMMENT ON COLUMN number_warmup.start_date IS 'Data de início do aquecimento';
COMMENT ON COLUMN number_warmup.current_day IS 'Dia atual do aquecimento (1-28)';
COMMENT ON COLUMN number_warmup.status IS 'Status: ativo, pausado ou completo';
