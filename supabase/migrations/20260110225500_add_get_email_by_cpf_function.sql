-- Function to get email by CPF/CNPJ
-- Accessed by anon/authenticated users to resolve login identifier
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

-- Grant access to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_email_by_cpf_cnpj(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_cpf_cnpj(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_cpf_cnpj(TEXT) TO service_role;
