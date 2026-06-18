-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    customer_phone VARCHAR NOT NULL,
    message_count INTEGER DEFAULT 1,
    last_contacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(shop_id, customer_phone)
);

-- Set up Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can read their own leads
CREATE POLICY "Owners can view their own leads"
    ON public.leads FOR SELECT
    USING (
        shop_id IN (
            SELECT id FROM public.shops 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy: Owners can delete their own leads
CREATE POLICY "Owners can delete their own leads"
    ON public.leads FOR DELETE
    USING (
        shop_id IN (
            SELECT id FROM public.shops 
            WHERE owner_id = auth.uid()
        )
    );
