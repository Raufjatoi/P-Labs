-- Create a function to make a user admin by email
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find the user by email and update their profile to admin
  UPDATE public.profiles 
  SET is_admin = true
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = user_email
  );
  
  -- Return true if any rows were updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;