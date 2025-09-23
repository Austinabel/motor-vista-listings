-- Create admin role for testing - assign to a recent user
-- Let's add admin role to one of the existing users for testing

-- First, let's get a user ID and assign admin role
-- We'll use the most recently created user from the auth logs
INSERT INTO user_roles (user_id, role) 
VALUES ('ba6cf092-5404-4ede-af30-c79d32bdf329', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;