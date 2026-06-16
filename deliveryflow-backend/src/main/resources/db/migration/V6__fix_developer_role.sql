-- Update legacy DEVELOPER role to MEMBER
UPDATE users SET role = 'MEMBER' WHERE role = 'DEVELOPER';
