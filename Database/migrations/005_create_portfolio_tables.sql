-- Migration: 005_create_portfolio_tables.sql

-- Create Portfolio Investments Table
CREATE TABLE IF NOT EXISTS public.portfolio_investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    stage TEXT NOT NULL,
    implied_share_price NUMERIC NOT NULL,
    share_price_30d_change NUMERIC NOT NULL, -- percentage change
    run_rate_revenue NUMERIC NOT NULL,
    sentiment TEXT NOT NULL,
    valuation NUMERIC NOT NULL,
    ownership_percentage NUMERIC NOT NULL,
    investment_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Valuation History for Line Chart
CREATE TABLE IF NOT EXISTS public.valuation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_id UUID NOT NULL REFERENCES public.portfolio_investments(id) ON DELETE CASCADE,
    round_name TEXT NOT NULL,
    round_date DATE NOT NULL,
    valuation NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS policies
ALTER TABLE public.portfolio_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valuation_history ENABLE ROW LEVEL SECURITY;

-- Allow investors to read their own portfolio data
CREATE POLICY "Users can view their own investments"
    ON public.portfolio_investments FOR SELECT
    USING (auth.uid() = investor_profile_id);

CREATE POLICY "Users can view their own investment history"
    ON public.valuation_history FOR SELECT
    USING (
        investment_id IN (
            SELECT id FROM public.portfolio_investments WHERE investor_profile_id = auth.uid()
        )
    );

-- Add service role override for seed scripts
CREATE POLICY "Service role full access investments"
    ON public.portfolio_investments FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access history"
    ON public.valuation_history FOR ALL
    USING (true)
    WITH CHECK (true);
