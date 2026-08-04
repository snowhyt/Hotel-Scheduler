-- 1. Seed Users (Staff & Admins)
-- Password for all users is: password123
INSERT INTO users (username, email, password_hash, role) 
VALUES 
    ('admin_sarah', 'sarah.admin@hotelapp.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQ68YlsS', 'admin'),
    ('frontdesk_mark', 'mark.desk@hotelapp.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQ68YlsS', 'staff'),
    ('manager_chen', 'chen.m@hotelapp.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQ68YlsS', 'manager');

-- 2. Seed Rooms (Inventory)
-- Providing a realistic mix of room types, prices, and cleaning statuses
INSERT INTO rooms (room_number, room_type, base_price, is_clean)
VALUES 
    ('101', 'Standard Single', 120.00, true),
    ('102', 'Standard Single', 120.00, true),
    ('103', 'Standard Double', 150.00, false),
    ('201', 'Oceanview Suite', 299.00, true),
    ('202', 'Oceanview Suite', 299.00, true),
    ('301', 'Presidential Penthouse', 850.00, false);

-- 3. Seed Guests (Identity & Profiles)
INSERT INTO guests (first_name, last_name, email, phone, id_type, id_number)
VALUES 
    ('Elena', 'Rodriguez', 'erodriguez.design@email.com', '+1-555-0198', 'Passport', 'P987654321'),
    ('Marcus', 'Johnson', 'mjohnson_tech@email.com', '+1-555-0245', 'Driver License', 'DL-CA-456789'),
    ('Aisha', 'Patel', 'apatel.consulting@email.com', '+44-7700-900123', 'Passport', 'P112233445');