-- Assign admin role to the most recent user as well
INSERT INTO user_roles (user_id, role) 
VALUES ('83e6c988-97c4-4325-a786-4bc2d0749f7f', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;