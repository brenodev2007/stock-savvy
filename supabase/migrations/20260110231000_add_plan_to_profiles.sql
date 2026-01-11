-- Add 'plan' column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN plan TEXT NOT NULL DEFAULT 'starter' 
CHECK (plan IN ('starter', 'pro', 'business'));

-- Update existing profiles to have 'starter' if they are null (though default handles new rows)
UPDATE public.profiles SET plan = 'starter' WHERE plan IS NULL;

-- Update handle_new_user trigger to explicitly set plan (optional as default is set, but good for clarity)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    'starter'
  );
  -- Assign default operator role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'operator');
  RETURN NEW;
END;
$$;
