-- Add subscription and usage tracking to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS analyses_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analyses_reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Create usage tracking table for detailed history
CREATE TABLE IF NOT EXISTS analyses_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  tokens_used INTEGER,
  cost_cents INTEGER
);

-- Enable RLS on analyses_log
ALTER TABLE analyses_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for analyses_log
CREATE POLICY "Users can view their own analysis logs"
  ON analyses_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert analysis logs"
  ON analyses_log FOR INSERT
  WITH CHECK (true);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_analyses_log_user ON analyses_log(user_id, created_at DESC);

-- Function to reset monthly analysis count
CREATE OR REPLACE FUNCTION reset_analyses_count()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET analyses_count = 0,
      analyses_reset_at = NOW() + INTERVAL '1 month'
  WHERE analyses_reset_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a cron job to run monthly reset (requires pg_cron extension)
-- SELECT cron.schedule('reset-analyses-monthly', '0 0 1 * *', 'SELECT reset_analyses_count()');

COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription tier: free (10/month) or pro (unlimited)';
COMMENT ON COLUMN profiles.subscription_status IS 'Stripe subscription status';
COMMENT ON COLUMN profiles.analyses_count IS 'Number of analyses used this period';
COMMENT ON COLUMN profiles.analyses_reset_at IS 'When the analyses count resets (monthly)';
