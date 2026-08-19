-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author TEXT NOT NULL CHECK (author IN ('Anurag', 'Srinibas', 'Ayush')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anyone on comments" ON public.comments
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
