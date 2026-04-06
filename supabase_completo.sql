-- ============================================================
-- ESQUEMA COMPLETO BEV-PYMES  v2.0
-- Borra todo y recrea desde cero con las 40 empresas
-- Ejecuta todo de una vez en el SQL Editor de Supabase
-- ============================================================

-- 1. BORRAR TABLAS EXISTENTES
DROP TABLE IF EXISTS respuestas_eo;
DROP TABLE IF EXISTS respuestas_mi;
DROP TABLE IF EXISTS respuestas_dir;
DROP TABLE IF EXISTS empresas;

-- 2. CREAR TABLA DE EMPRESAS
-- Estrato: A=Microempresa(2-9), B1=Pequeña sin MI, B2=Pequeña con MI, C=Mediana
CREATE TABLE empresas (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo             TEXT UNIQUE NOT NULL,
  nombre             TEXT,
  estrato            TEXT CHECK (estrato IN ('A','B1','B2','C')),
  sector             TEXT,
  empleados          TEXT,
  antiguedad_empresa TEXT,
  empresa_familiar   TEXT,
  creada_en          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREAR TABLA RESPUESTAS DIRECCIÓN
CREATE TABLE respuestas_dir (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_codigo            TEXT NOT NULL REFERENCES empresas(codigo),
  -- D1 Calidad
  d1_1 INT, d1_2 INT, d1_3 INT, d1_4 INT, d1_5 INT, d1_6 INT,
  -- D2 Coste
  d2_1 INT, d2_2 INT, d2_3 INT, d2_4 INT, d2_5 INT, d2_6 INT,
  -- D3 Entrega
  d3_1 INT, d3_2 INT, d3_3 INT, d3_4 INT, d3_5 INT, d3_6 INT,
  -- D4 Flexibilidad
  d4_1 INT, d4_2 INT, d4_3 INT, d4_4 INT, d4_5 INT, d4_6 INT,
  -- D5 Innovación
  d5_1 INT, d5_2 INT, d5_3 INT, d5_4 INT, d5_5 INT, d5_6 INT,
  -- D6 Digitalización y tecnología
  d6_1 INT, d6_2 INT, d6_3 INT, d6_4 INT, d6_5 INT, d6_6 INT,
  -- D7 Orientación al cliente
  d7_1 INT, d7_2 INT, d7_3 INT, d7_4 INT, d7_5 INT, d7_6 INT,
  -- D8 Sostenibilidad y responsabilidad social
  d8_1 INT, d8_2 INT, d8_3 INT, d8_4 INT, d8_5 INT, d8_6 INT,
  -- D9 Internacionalización (nota contextual, sin filtro)
  d9_1 INT, d9_2 INT, d9_3 INT, d9_4 INT, d9_5 INT, d9_6 INT,
  -- D10 Comunicación estratégica interna (moderadora)
  d10_1 INT, d10_2 INT, d10_3 INT, d10_4 INT, d10_5 INT, d10_6 INT,
  -- Datos clasificación empresa (solo primer directivo)
  sector             TEXT,
  empleados          TEXT,
  antiguedad_empresa TEXT,
  empresa_familiar   TEXT,
  -- Datos individuales
  antiguedad_respondente    TEXT,
  disponibilidad_ampliacion TEXT,
  email_contacto            TEXT,
  enviado_en                TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREAR TABLA RESPUESTAS MANDOS INTERMEDIOS
CREATE TABLE respuestas_mi (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_codigo            TEXT NOT NULL REFERENCES empresas(codigo),
  d1_1 INT, d1_2 INT, d1_3 INT, d1_4 INT, d1_5 INT, d1_6 INT,
  d2_1 INT, d2_2 INT, d2_3 INT, d2_4 INT, d2_5 INT, d2_6 INT,
  d3_1 INT, d3_2 INT, d3_3 INT, d3_4 INT, d3_5 INT, d3_6 INT,
  d4_1 INT, d4_2 INT, d4_3 INT, d4_4 INT, d4_5 INT, d4_6 INT,
  d5_1 INT, d5_2 INT, d5_3 INT, d5_4 INT, d5_5 INT, d5_6 INT,
  d6_1 INT, d6_2 INT, d6_3 INT, d6_4 INT, d6_5 INT, d6_6 INT,
  d7_1 INT, d7_2 INT, d7_3 INT, d7_4 INT, d7_5 INT, d7_6 INT,
  d8_1 INT, d8_2 INT, d8_3 INT, d8_4 INT, d8_5 INT, d8_6 INT,
  d9_1 INT, d9_2 INT, d9_3 INT, d9_4 INT, d9_5 INT, d9_6 INT,
  d10_1 INT, d10_2 INT, d10_3 INT, d10_4 INT, d10_5 INT, d10_6 INT,
  antiguedad_respondente    TEXT,
  area_funcional            TEXT,
  tipo_contrato             TEXT,
  personas_cargo            TEXT,
  disponibilidad_ampliacion TEXT,
  email_contacto            TEXT,
  enviado_en                TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREAR TABLA RESPUESTAS EMPLEADOS OPERATIVOS
CREATE TABLE respuestas_eo (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_codigo            TEXT NOT NULL REFERENCES empresas(codigo),
  d1_1 INT, d1_2 INT, d1_3 INT, d1_4 INT, d1_5 INT, d1_6 INT,
  d2_1 INT, d2_2 INT, d2_3 INT, d2_4 INT, d2_5 INT, d2_6 INT,
  d3_1 INT, d3_2 INT, d3_3 INT, d3_4 INT, d3_5 INT, d3_6 INT,
  d4_1 INT, d4_2 INT, d4_3 INT, d4_4 INT, d4_5 INT, d4_6 INT,
  d5_1 INT, d5_2 INT, d5_3 INT, d5_4 INT, d5_5 INT, d5_6 INT,
  d6_1 INT, d6_2 INT, d6_3 INT, d6_4 INT, d6_5 INT, d6_6 INT,
  d7_1 INT, d7_2 INT, d7_3 INT, d7_4 INT, d7_5 INT, d7_6 INT,
  d8_1 INT, d8_2 INT, d8_3 INT, d8_4 INT, d8_5 INT, d8_6 INT,
  d9_1 INT, d9_2 INT, d9_3 INT, d9_4 INT, d9_5 INT, d9_6 INT,
  d10_1 INT, d10_2 INT, d10_3 INT, d10_4 INT, d10_5 INT, d10_6 INT,
  antiguedad_respondente    TEXT,
  area_funcional            TEXT,
  tipo_contrato             TEXT,
  jornada                   TEXT,
  disponibilidad_ampliacion TEXT,
  email_contacto            TEXT,
  enviado_en                TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POLÍTICAS RLS
ALTER TABLE empresas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_dir ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_mi  ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_eo  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leer empresas publico"   ON empresas      FOR SELECT USING (true);
CREATE POLICY "insertar empresas"       ON empresas      FOR INSERT WITH CHECK (true);
CREATE POLICY "actualizar empresas"     ON empresas      FOR UPDATE USING (true);
CREATE POLICY "insertar respuestas dir" ON respuestas_dir FOR INSERT WITH CHECK (true);
CREATE POLICY "insertar respuestas mi"  ON respuestas_mi  FOR INSERT WITH CHECK (true);
CREATE POLICY "insertar respuestas eo"  ON respuestas_eo  FOR INSERT WITH CHECK (true);
CREATE POLICY "leer respuestas dir"     ON respuestas_dir FOR SELECT USING (true);
CREATE POLICY "leer respuestas mi"      ON respuestas_mi  FOR SELECT USING (true);
CREATE POLICY "leer respuestas eo"      ON respuestas_eo  FOR SELECT USING (true);

-- 7. INSERTAR 40 EMPRESAS (código único, sin estrato predefinido)
-- El estrato se asignará manualmente en el panel admin tras clasificar cada empresa
INSERT INTO empresas (codigo) VALUES
  ('AUO394'), ('BEJ708'), ('CBA571'), ('ERT291'), ('ESZ969'),
  ('FPZ491'), ('HVP834'), ('HVX945'), ('IUY991'), ('JIG555'),
  ('JXP522'), ('JZI311'), ('OBK079'), ('OQM109'), ('PEH335'),
  ('PGA449'), ('PTW835'), ('QSF583'), ('QTD927'), ('RAQ360'),
  ('RFF145'), ('RHH613'), ('RPF035'), ('RVG451'), ('RZH608'),
  ('SHG394'), ('SMD868'), ('SNJ420'), ('SQV555'), ('TGA511'),
  ('UCN247'), ('ULR756'), ('URP283'), ('VKJ008'), ('VOL332'),
  ('WIT415'), ('XGI370'), ('XZB058'), ('YDR532'), ('YHN664');

-- ============================================================
-- NOTA: Si ya tienes tablas creadas en producción y solo
-- necesitas actualizar el CHECK de estrato, ejecuta SOLO esto:
--
-- ALTER TABLE empresas DROP CONSTRAINT IF EXISTS empresas_estrato_check;
-- ALTER TABLE empresas ADD CONSTRAINT empresas_estrato_check
--   CHECK (estrato IN ('A','B1','B2','C'));
-- ============================================================
