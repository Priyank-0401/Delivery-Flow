-- Update legacy role values to match the new UserRole enum constants
UPDATE users SET role = 'ADMIN' WHERE role = 'Delivery Manager';
