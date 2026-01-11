-- Add cpf_cnpj column to profiles table
ALTER TABLE public.profiles ADD COLUMN cpf_cnpj TEXT;

-- Create index for faster lookups if needed (optional, but good practice)
-- CREATE INDEX idx_profiles_cpf_cnpj ON public.profiles(cpf_cnpj);
