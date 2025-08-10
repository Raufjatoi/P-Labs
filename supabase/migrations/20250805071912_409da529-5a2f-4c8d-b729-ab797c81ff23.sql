-- Create model_generations table to track user's ML models
CREATE TABLE public.model_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  description TEXT,
  code_generated TEXT,
  is_streamlit BOOLEAN DEFAULT false,
  downloaded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.model_generations ENABLE ROW LEVEL SECURITY;

-- Create policies for model_generations
CREATE POLICY "Users can view their own models" 
ON public.model_generations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own models" 
ON public.model_generations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models" 
ON public.model_generations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models" 
ON public.model_generations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create activity_logs table to track user actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_logs
CREATE POLICY "Users can view their own activity" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT NOT NULL,
  api_calls_limit INTEGER NOT NULL,
  features TEXT[] NOT NULL,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.subscription_plans (id, name, price, interval, api_calls_limit, features, stripe_price_id) VALUES
('free', 'Free', 0, 'forever', 50, ARRAY['50 AI model generations per month', 'Basic Python code export', 'CSV dataset upload (up to 1MB)', 'Community support', 'Email support'], NULL),
('basic', 'Basic', 19, 'month', 5000, ARRAY['5,000 AI model generations per month', 'Advanced Python code with explanations', 'CSV upload (up to 10MB)', 'All model types (clustering, neural networks)', 'Priority email support', 'Code optimization suggestions', 'Basic Streamlit app generation (10/month)'], NULL),
('pro', 'Pro', 49, 'month', -1, ARRAY['Unlimited AI model generations', 'Full Streamlit app generation', 'Unlimited CSV upload (up to 100MB)', 'Advanced model types & custom algorithms', 'Priority support + dedicated Slack channel', 'Auto-deployment to Streamlit Cloud', 'Custom model templates', 'Team collaboration features', 'API access', 'White-label options'], NULL);

-- Enable RLS on subscription_plans (publicly readable)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscription plans are publicly readable" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

-- Create subscribers table for Stripe integration
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create trigger for updating timestamps
CREATE TRIGGER update_model_generations_updated_at
BEFORE UPDATE ON public.model_generations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for the admin user if exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@gmail.com' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert sample model generations
        INSERT INTO public.model_generations (user_id, model_name, model_type, description, is_streamlit, downloaded) VALUES
        (admin_user_id, 'House Price Prediction', 'regression', 'ML model to predict house prices based on features', false, true),
        (admin_user_id, 'Customer Churn Analysis', 'classification', 'Predict customer churn using logistic regression', false, true),
        (admin_user_id, 'Iris Classification App', 'classification', 'Streamlit app for iris flower classification', true, false);
        
        -- Insert sample activity logs
        INSERT INTO public.activity_logs (user_id, activity_type, description) VALUES
        (admin_user_id, 'Model Generated', 'House price prediction model'),
        (admin_user_id, 'Streamlit App', 'Iris classification app created'),
        (admin_user_id, 'Model Downloaded', 'Customer churn model.py'),
        (admin_user_id, 'Account Created', 'Welcome to P Labs!');
    END IF;
END $$;