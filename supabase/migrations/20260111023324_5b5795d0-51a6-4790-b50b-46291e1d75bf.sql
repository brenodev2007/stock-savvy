-- Add cpf_cnpj and plan columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'business'));

-- Create an index for faster CPF/CNPJ lookups
CREATE INDEX IF NOT EXISTS idx_profiles_cpf_cnpj ON public.profiles(cpf_cnpj);

-- Create or replace the function to get email by CPF/CNPJ for login
CREATE OR REPLACE FUNCTION public.get_email_by_cpf_cnpj(p_cpf_cnpj TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email
  FROM public.profiles
  WHERE cpf_cnpj = p_cpf_cnpj
  LIMIT 1;
  
  RETURN v_email;
END;
$$;

-- Update the handle_new_user function to include cpf_cnpj
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, cpf_cnpj, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Usuário'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'cpf_cnpj',
    'starter'
  );
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();