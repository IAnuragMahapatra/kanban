-- Supabase Migration: Create tasks table

-- Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('TRIAGE', 'TODO', 'SCHEDULED', 'READY', 'RUNNING', 'BLOCKED', 'DONE', 'ARCHIVED')),
    author TEXT NOT NULL CHECK (author IN ('Anurag', 'Srinibas', 'Ayush')),
    assignee TEXT CHECK (assignee IN ('Anurag', 'Srinibas', 'Ayush') OR assignee IS NULL),
    blocker_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Blocker reason must be present if status is BLOCKED
    CONSTRAINT check_blocker_reason CHECK (
        (status != 'BLOCKED') OR (blocker_reason IS NOT NULL AND trim(blocker_reason) != '')
    )
);

-- Set up Row Level Security (RLS)
-- Since the app is gated by Vercel Basic Auth and Supabase Auth isn't used,
-- we allow all access (anon/authenticated) to this specific table.
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anyone" ON public.tasks
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Enable realtime for the tasks table
-- This requires altering the publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
