-- Update plan for 'BMP informática' to 'business'
-- Using ILIKE to be case-insensitive
UPDATE public.profiles
SET plan = 'business'
WHERE name ILIKE 'BMP informática';
