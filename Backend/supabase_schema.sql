-- ============================================================
--  VxM — Supabase Database Migration
--  Run this in the Supabase SQL Editor (or via Supabase CLI)
-- ============================================================

-- ── A. USERS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  status    TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-create profile on new auth.users entry (Google OAuth or email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('super_admin','admin','assistant','ai_agent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id)
);

-- ── B. LIBRARY ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contexts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  system_prompt TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  version       INT DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS context_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id    UUID REFERENCES contexts(id) ON DELETE CASCADE,
  system_prompt TEXT NOT NULL,
  version       INT NOT NULL,
  modified_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS archetypes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  system_prompt TEXT NOT NULL,
  tone          TEXT,
  is_active     BOOLEAN DEFAULT true,
  version       INT DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS archetype_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_id  UUID REFERENCES archetypes(id) ON DELETE CASCADE,
  system_prompt TEXT NOT NULL,
  version       INT NOT NULL,
  modified_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS safety_prompts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  content    TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT true,
  version    INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS safety_prompt_history (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES safety_prompts(id) ON DELETE CASCADE,
  content   TEXT NOT NULL,
  version   INT NOT NULL,
  modified_at TIMESTAMPTZ DEFAULT now()
);

-- ── C. AGENTS & SESSIONS ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS agents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  context_id    UUID REFERENCES contexts(id),
  archetype_id  UUID REFERENCES archetypes(id),
  custom_name   TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, context_id, archetype_id)
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id   UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id),
  platform   TEXT CHECK (platform IN ('whatsapp','telegram')) DEFAULT 'whatsapp',
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        TEXT CHECK (role IN ('user','model')) NOT NULL,
  content     TEXT,
  image_url   TEXT,
  tokens_used INT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── D. DATALAB (anonymous) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS analytics_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name   TEXT NOT NULL,
  context_id   UUID,
  archetype_id UUID,
  platform     TEXT,
  properties   JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Helper RPCs for DataLab dashboard ───────────────────────

CREATE OR REPLACE FUNCTION datalab_events_by_name()
RETURNS TABLE(event_name TEXT, total BIGINT) AS $$
  SELECT event_name, COUNT(*) AS total
  FROM analytics_events
  GROUP BY event_name
  ORDER BY total DESC;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION datalab_events_by_context()
RETURNS TABLE(context_name TEXT, total BIGINT) AS $$
  SELECT c.name AS context_name, COUNT(*) AS total
  FROM analytics_events ae
  LEFT JOIN contexts c ON ae.context_id = c.id
  GROUP BY c.name
  ORDER BY total DESC;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION datalab_events_by_platform()
RETURNS TABLE(platform TEXT, total BIGINT) AS $$
  SELECT platform, COUNT(*) AS total
  FROM analytics_events
  GROUP BY platform;
$$ LANGUAGE SQL;

-- ── SEED DATA ────────────────────────────────────────────────

INSERT INTO contexts (name, description, system_prompt) VALUES
  ('Jedi Samurai',        'Disciplina, estoicismo y dominio mental',
   'Eres un maestro de la disciplina. Enfócate en la paciencia, fuerza, determinación y dominio propio. Tu objetivo es sacar la mejor versión del usuario mediante estoicismo y disciplina mental.'),
  ('Influencer Exitoso',  'Redes sociales, comunicación y creación de contenido',
   'Eres un experto en redes sociales. Enseña a comunicar, improvisar, estética, tendencias y analíticas. Pide evidencias de contenido creado.'),
  ('Giro Profesional',    'Estrategia de carrera y emprendedurismo',
   'Eres un estratega de carrera. Enfócate en planificación realista, aprendizaje teórico, proyectos prácticos y emprendedurismo.'),
  ('Vida Saludable',      'Alimentación, ejercicio y bienestar holístico',
   'Eres un experto en salud holística. Consejos de alimentación, rutinas de ejercicio y hábitos saludables. Sé estricto con el bienestar.'),
  ('Artista',             'Desarrollo artístico y promoción de obra',
   'Eres una musa y un crítico de arte. Ayuda a desarrollar la voz artística del usuario y a promover su obra sin vender su alma.'),
  ('Crianza Ejemplar',    'Crianza, psicología infantil y familia',
   'Eres un experto en crianza y psicología infantil. Da tips para padres, gestión de emociones y resolución de conflictos familiares.')
ON CONFLICT DO NOTHING;

INSERT INTO archetypes (name, description, system_prompt, tone) VALUES
  ('Asistente para tu Biopic', 'Narra tus logros como hitos de una película biográfica',
   'Actúa como si estuvieras documentando la vida del usuario para una película biográfica. Narra sus logros como hitos de una película.', 'Narrativo, épico, observador'),
  ('Coach Ontológico',         'Preguntas poderosas para reflexión profunda',
   'Usa preguntas poderosas. No des respuestas directas, haz que el usuario reflexione sobre su ser y sus acciones.', 'Reflexivo, profundo, paciente'),
  ('Tu Propio Jefe',           'Exigencia, resultados y rendición de cuentas',
   'Eres el jefe exigente pero justo. Pide resultados, establece deadlines y no aceptes excusas baratas.', 'Directo, autoritario, formal'),
  ('Gurú Inspirador',          'Sabiduría ancestral, metáforas y espiritualidad',
   'Habla con metáforas, sabiduría ancestral y conexión espiritual. Inspira al usuario a trascender.', 'Místico, calmado, poético'),
  ('Competidor Amistoso',      'Retos amistosos y motivación por competencia',
   'Eres un amigo que también compite. Lanza retos amistosos como "Yo ya hice mis 100 flexiones, ¿tú qué tal?".', 'Energético, juguetón, desafiante'),
  ('Competidor Provocador',    'Provocación intensa para que el usuario se supere',
   'Eres el villano de la historia. Provoca al usuario, duda de sus capacidades para que te demuestre lo contrario. Usa sarcasmo e intensidad.', 'Sarcástico, intenso, agresivo')
ON CONFLICT DO NOTHING;

INSERT INTO safety_prompts (name, content) VALUES
  ('Privacidad', 'Nunca solicites datos personales sensibles como número de tarjeta, contraseñas o documentos de identidad.'),
  ('Ética',      'No generes contenido violento, discriminatorio, o que promueva conductas ilegales.'),
  ('Seguridad',  'Si el usuario expresa pensamientos de autolesión, responde con empatía y sugiere buscar ayuda profesional.')
ON CONFLICT DO NOTHING;

-- ── E. UI ICONS & COLORS (Phase 6) ───────────────────────────

ALTER TABLE contexts ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE contexts ADD COLUMN IF NOT EXISTS color TEXT;

ALTER TABLE archetypes ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE archetypes ADD COLUMN IF NOT EXISTS color TEXT;

UPDATE contexts SET icon = 'fa-khanda', color = 'text-blue-400' WHERE name = 'Jedi Samurai';
UPDATE contexts SET icon = 'fa-hashtag', color = 'text-pink-500' WHERE name = 'Influencer Exitoso';
UPDATE contexts SET icon = 'fa-briefcase', color = 'text-emerald-400' WHERE name = 'Giro Profesional';
UPDATE contexts SET icon = 'fa-heart-pulse', color = 'text-red-500' WHERE name = 'Vida Saludable';
UPDATE contexts SET icon = 'fa-palette', color = 'text-purple-400' WHERE name = 'Artista';
UPDATE contexts SET icon = 'fa-baby-carriage', color = 'text-yellow-400' WHERE name = 'Crianza Ejemplar';

UPDATE archetypes SET icon = 'fa-film' WHERE name = 'Asistente para tu Biopic';
UPDATE archetypes SET icon = 'fa-brain' WHERE name = 'Coach Ontológico';
UPDATE archetypes SET icon = 'fa-user-tie' WHERE name = 'Tu Propio Jefe';
UPDATE archetypes SET icon = 'fa-om' WHERE name = 'Gurú Inspirador';
UPDATE archetypes SET icon = 'fa-medal' WHERE name = 'Competidor Amistoso';
UPDATE archetypes SET icon = 'fa-skull' WHERE name = 'Competidor Provocador';

-- ── F. UI SORTING ORDER (Phase 6b) ──────────────────────────

ALTER TABLE contexts ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE archetypes ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

UPDATE contexts SET display_order = 1 WHERE name = 'Jedi Samurai';
UPDATE contexts SET display_order = 2 WHERE name = 'Vida Saludable';
UPDATE contexts SET display_order = 3 WHERE name = 'Giro Profesional';
UPDATE contexts SET display_order = 4 WHERE name = 'Influencer Exitoso';
UPDATE contexts SET display_order = 5 WHERE name = 'Artista';
UPDATE contexts SET display_order = 6 WHERE name = 'Crianza Ejemplar';

UPDATE archetypes SET display_order = 1 WHERE name = 'Asistente para tu Biopic';
UPDATE archetypes SET display_order = 2 WHERE name = 'Tu Propio Jefe';
UPDATE archetypes SET display_order = 3 WHERE name = 'Gurú Inspirador';
UPDATE archetypes SET display_order = 4 WHERE name = 'Competidor Amistoso';
UPDATE archetypes SET display_order = 5 WHERE name = 'Competidor Provocador';
UPDATE archetypes SET display_order = 6 WHERE name = 'Coach Ontológico';

-- ── G. HISTORY SESSIONS (Phase 7) ───────────────────────────

ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
