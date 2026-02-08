-- App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key TEXT UNIQUE NOT NULL,
  value BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO app_settings (key, value, description) VALUES
  ('registration_enabled', true, 'Allow new user registration'),
  ('maintenance_mode', false, 'Enable maintenance mode (disable app access)')
ON CONFLICT (key) DO NOTHING;

-- Row Level Security
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read app_settings
CREATE POLICY "Allow public read" ON app_settings
  FOR SELECT USING (true);

-- Only authenticated users with admin role can update
CREATE POLICY "Allow admin update" ON app_settings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Allow only admins to update app_settings
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read admin_users" ON admin_users
  FOR SELECT USING (true);
