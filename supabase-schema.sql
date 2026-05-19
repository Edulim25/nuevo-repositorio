-- Tabla de Empresas
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    primary_color TEXT NOT NULL,
    logo_url TEXT
);

-- Tabla de Juegos
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'finished')),
    winning_pattern TEXT,
    target_winning_card_id INTEGER,
    target_winning_ball_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Balotas Cantadas
CREATE TABLE IF NOT EXISTS balls (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    number INTEGER NOT NULL,
    drawn_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Cartones
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id),
    player_name TEXT,
    numbers_json TEXT NOT NULL,
    is_winner BOOLEAN DEFAULT FALSE,
    is_programmed_winner BOOLEAN DEFAULT FALSE
);

-- Datos Iniciales (Semilla)
INSERT INTO companies (name, slug, primary_color, logo_url) 
VALUES 
    ('BINGO EL PALENQUEÑITO MILLONARIO', 'palenquenito', '#ff0000', '/logos/palenquenito.png'),
    ('EL GRAN FARAON', 'faraon', '#d4af37', '/logos/faraon.png'),
    ('Empresa 3 (Por Definir)', 'empresa3', '#0000ff', '/logos/empresa3.png')
ON CONFLICT (slug) DO NOTHING;
