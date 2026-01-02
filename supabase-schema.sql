-- BuildDoctor Database Schema for Supabase

-- profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  azure_devops_org TEXT,
  azure_devops_pat TEXT, -- encrypted
  slack_webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- pipelines
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  azure_project_id TEXT NOT NULL,
  azure_project_name TEXT NOT NULL,
  azure_pipeline_id TEXT NOT NULL,
  azure_pipeline_name TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- builds
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES pipelines(id),
  azure_build_id TEXT NOT NULL,
  azure_build_number TEXT,
  status TEXT CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  result TEXT CHECK (result IN ('succeeded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- diagnoses
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id),
  error_category TEXT,
  root_cause TEXT,
  explanation TEXT,
  suggested_fix TEXT,
  relevant_logs TEXT,
  confidence FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only see their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users see own pipelines" ON pipelines FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own builds" ON builds FOR ALL USING (
  pipeline_id IN (SELECT id FROM pipelines WHERE user_id = auth.uid())
);
CREATE POLICY "Users see own diagnoses" ON diagnoses FOR ALL USING (
  build_id IN (SELECT id FROM builds WHERE pipeline_id IN (SELECT id FROM pipelines WHERE user_id = auth.uid()))
);

-- Trigger per creare profile automaticamente quando un utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

