-- ==========================================================
-- SQL MIGRATION FOR VISITOR ANALYTICS & AI PORTFOLIO ASSISTANT
-- ==========================================================

-- Enable pgcrypto extension for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- 1. VISITORS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    page TEXT NOT NULL,
    country TEXT,
    city TEXT,
    device TEXT,
    browser TEXT,
    operating_system TEXT,
    screen_resolution TEXT,
    language TEXT,
    timezone TEXT,
    referrer TEXT,
    is_returning BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON public.visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON public.visitors(visited_at);
CREATE INDEX IF NOT EXISTS idx_visitors_page ON public.visitors(page);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON public.visitors(country);

-- Enable RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone (public/anon) to insert visitor logs
CREATE POLICY "Allow public insert to visitors" ON public.visitors
    FOR INSERT TO public, anon, authenticated
    WITH CHECK (true);

-- Allow admins (or authenticated users/service role) to read visitor logs
CREATE POLICY "Allow admin read access to visitors" ON public.visitors
    FOR SELECT TO public, anon, authenticated
    USING (true);

-- Allow admins to delete visitor logs if needed
CREATE POLICY "Allow admin delete access to visitors" ON public.visitors
    FOR DELETE TO public, anon, authenticated
    USING (true);


-- ==========================================================
-- 2. AI SETTINGS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Enforces single row
    enabled BOOLEAN NOT NULL DEFAULT true,
    welcome_message TEXT NOT NULL DEFAULT 'Hi, I''m Abinash''s AI Assistant. How can I help you today?',
    suggested_questions TEXT[] NOT NULL DEFAULT ARRAY[
        'Tell me about Abinash',
        'What projects has he built?',
        'Show my best projects',
        'What technologies does he know?',
        'Is he available for freelance?',
        'How can I contact him?',
        'Show certifications',
        'Tell me about his experience'
    ],
    availability_status TEXT NOT NULL DEFAULT 'Available for freelance work',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access to settings
CREATE POLICY "Allow public read access to ai_settings" ON public.ai_settings
    FOR SELECT TO public, anon, authenticated
    USING (true);

-- Allow admin full write access to settings
CREATE POLICY "Allow admin write access to ai_settings" ON public.ai_settings
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert default row if it doesn't exist
INSERT INTO public.ai_settings (id, enabled, welcome_message, suggested_questions, availability_status)
VALUES (
    1,
    true,
    'Hi, I''m Abinash''s AI Assistant. How can I help you today?',
    ARRAY[
        'Tell me about Abinash',
        'What projects has he built?',
        'Show my best projects',
        'What technologies does he know?',
        'Is he available for freelance?',
        'How can I contact him?',
        'Show certifications',
        'Tell me about his experience'
    ],
    'Available for freelance work'
)
ON CONFLICT (id) DO NOTHING;


-- ==========================================================
-- 3. AI FAQS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.ai_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL UNIQUE,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access to FAQs
CREATE POLICY "Allow public read access to ai_faqs" ON public.ai_faqs
    FOR SELECT TO public, anon, authenticated
    USING (true);

-- Allow admin full write access to FAQs
CREATE POLICY "Allow admin write access to ai_faqs" ON public.ai_faqs
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);


-- ==========================================================
-- 4. EXPERIENCES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access to experiences" ON public.experiences;
CREATE POLICY "Allow public read access to experiences" ON public.experiences
    FOR SELECT TO public, anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin write access to experiences" ON public.experiences;
CREATE POLICY "Allow admin write access to experiences" ON public.experiences
    FOR ALL TO public, anon, authenticated
    USING (true)
    WITH CHECK (true);


-- ==========================================================
-- 5. CERTIFICATIONS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    issue_date TEXT NOT NULL DEFAULT '2026',
    icon TEXT NOT NULL DEFAULT 'award',
    credential_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access to certifications" ON public.certifications;
CREATE POLICY "Allow public read access to certifications" ON public.certifications
    FOR SELECT TO public, anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin write access to certifications" ON public.certifications;
CREATE POLICY "Allow admin write access to certifications" ON public.certifications
    FOR ALL TO public, anon, authenticated
    USING (true)
    WITH CHECK (true);

