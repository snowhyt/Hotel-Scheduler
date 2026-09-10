-- 1. Seed Staff (Replaces the generic 'users' concept for now)
INSERT INTO public.staff (staff_id, first_name, last_name, email, phone, position, department) 
VALUES 
    ('EMP-001', 'Oliver', 'Revilo', 'gloriosooliver44@gmail.com', '09762205242', 'IT Admin Staff', 'IT');


-- 2. Seed Rooms (Inventory)
INSERT INTO public.rooms (room_number, room_type, price, room_capacity, is_active, description, image_url)
VALUES 
    ('201', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('202', 'Superior Room', 4000, 2, 'available', 'Air-conditioned room with television, queen- sized bed, coffee table and chairs, closet with safety deposit box and 24 hour hot and cold water.', 'superior-room.png'),
    ('203', 'Superior Room', 4000, 2, 'available', 'Air-conditioned room with television, queen- sized bed, coffee table and chairs, closet with safety deposit box and 24 hour hot and cold water.', 'superior-room.png'),
    ('205', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('208', 'Superior Room', 4000, 2, 'available', 'Air-conditioned room with television, queen- sized bed, coffee table and chairs, closet with safety deposit box and 24 hour hot and cold water.', 'superior-room.png'),
    ('210', 'Superior Double (PWD)', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('212', 'Superior Room (PWD)', 4000, 2, 'available', 'Air-conditioned room with television, queen- sized bed, coffee table and chairs, closet with safety deposit box and 24 hour hot and cold water.', 'superior-room.png'),
    ('215', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('219', 'Superior Deluxe', 4000, 2, 'available', 'Air-conditioned queen-sized bed room with television, kitchen setup, coffee table and chairs, closet with Safety deposit box and 24 hour hot and cold water.', 'superior-deluxe.png'),
    ('220', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('221', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('223', 'Junior Suites', 5500, 4, 'available', 'One bedroom suite queen-sized bed with 42’inch television, master bedroom with bathtub, living room with television, dining with complete kitchen setup, guest bathroom and 24hrs hot and cold water', 'junior-suites.png'),
    ('227', 'Family Room', 10500, 7, 'available', 'A triple room with master bedroom, king sized bed with television, master bathroom with bathtub, living room with 42’in television, dining area with complete kitchen setup, guest bathroom and 24 hour hot and cold water', 'family-room.png'),
    ('228', 'Superior Deluxe', 4000, 2, 'available', 'Air-conditioned queen-sized bed room with television, kitchen setup, coffee table and chairs, closet with Safety deposit box and 24 hour hot and cold water.', 'superior-deluxe.png'),
    ('229', 'Superior Deluxe', 4000, 2, 'available', 'Air-conditioned queen-sized bed room with television, kitchen setup, coffee table and chairs, closet with Safety deposit box and 24 hour hot and cold water.', 'superior-deluxe.png'),
    ('302', 'Superior Deluxe', 4000, 2, 'available', 'Air-conditioned queen-sized bed room with television, kitchen setup, coffee table and chairs, closet with Safety deposit box and 24 hour hot and cold water.', 'superior-deluxe.png'),
    ('303', 'Dormitory', 3500, 6, 'available', 'Air-conditioned room with television, three double decks bed, coffee table and chairs, and 24 hour hot and cold water.', 'dormitory.png'),
    ('306', 'Dormitory', 3500, 6, 'available', 'Air-conditioned room with television, three double decks bed, coffee table and chairs, and 24 hour hot and cold water.', 'dormitory.png'),
    ('307', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('308', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('309', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('310', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('311', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('312', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('315', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('316', 'Superior Deluxe', 4000, 2, 'available', 'Air-conditioned queen-sized bed room with television, kitchen setup, coffee table and chairs, closet with Safety deposit box and 24 hour hot and cold water.', 'superior-deluxe.png'),
    ('317', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('318', 'Superior Deluxe', 4000, 2, 'available', 'Air-conditioned queen-sized bed room with television, kitchen setup, coffee table and chairs, closet with Safety deposit box and 24 hour hot and cold water.', 'superior-deluxe.png'),
    ('319', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('320', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('321', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('322', 'Junior Suites', 5500, 4, 'available', 'One bedroom suite queen-sized bed with 42’inch television, master bedroom with bathtub, living room with television, dining with complete kitchen setup, guest bathroom and 24hrs hot and cold water', 'junior-suites.png'),
    ('323', 'Junior Suites', 5500, 4, 'available', 'One bedroom suite queen-sized bed with 42’inch television, master bedroom with bathtub, living room with television, dining with complete kitchen setup, guest bathroom and 24hrs hot and cold water', 'junior-suites.png'),
    ('327', 'Family Room', 10500, 7, 'available', 'A triple room with master bedroom, king sized bed with television, master bathroom with bathtub, living room with 42’in television, dining area with complete kitchen setup, guest bathroom and 24 hour hot and cold water', 'family-room.png'),
    ('501', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('502', 'Superior Room', 4000, 2, 'available', 'Air-conditioned room with television, queen- sized bed, coffee table and chairs, closet with safety deposit box and 24 hour hot and cold water.', 'superior-room.png'),
    ('503', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('505', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('506', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('507', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('508', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('509', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('510', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('511', 'Superior Room', 4000, 2, 'available', 'Air-conditioned room with television, queen- sized bed, coffee table and chairs, closet with safety deposit box and 24 hour hot and cold water.', 'superior-room.png'),
    ('512', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('515', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('516', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('517', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('518', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('519', 'Superior Room', 4000, 2, 'available', 'Air-conditioned room with television, queen- sized bed, coffee table and chairs, closet with safety deposit box and 24 hour hot and cold water.', 'superior-room.png'),
    ('520', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('521', 'Superior Double', 3500, 4, 'available', 'Air-conditioned twin bed rooms, with television, coffee table and chairs, closet with safety deposit box and 24hrs hot and cold.', 'superior-double.png'),
    ('522', 'Junior Suites', 5500, 4, 'available', 'One bedroom suite queen-sized bed with 42’inch television, master bedroom with bathtub, living room with television, dining with complete kitchen setup, guest bathroom and 24hrs hot and cold water', 'junior-suites.png'),
    ('523', 'Junior Suites', 5500, 4, 'available', 'One bedroom suite queen-sized bed with 42’inch television, master bedroom with bathtub, living room with television, dining with complete kitchen setup, guest bathroom and 24hrs hot and cold water', 'junior-suites.png'),
    ('525', 'Dormitory', 3500, 6, 'available', 'Air-conditioned room with television, three double decks bed, coffee table and chairs, and 24 hour hot and cold water.', 'dormitory.png'),
    ('526', 'Dormitory', 3500, 6, 'available', 'Air-conditioned room with television, three double decks bed, coffee table and chairs, and 24 hour hot and cold water.', 'dormitory.png'),
    ('527', 'Family Room', 10500, 7, 'available', 'A triple room with master bedroom, king sized bed with television, master bathroom with bathtub, living room with 42’in television, dining area with complete kitchen setup, guest bathroom and 24 hour hot and cold water', 'family-room.png'),
    ('528', 'Dormitory', 3500, 6, 'available', 'Air-conditioned room with television, three double decks bed, coffee table and chairs, and 24 hour hot and cold water.', 'dormitory.png'),
    ('529', 'Dormitory', 3500, 6, 'available', 'Air-conditioned room with television, three double decks bed, coffee table and chairs, and 24 hour hot and cold water.', 'dormitory.png'),
    
    -- Note: Prefixed Domes and Function Halls to avoid Primary Key conflicts
    ('DOME-1', 'Dome(Ground)', 5000, 3, 'available', 'Complimentary Breakfast, Maximum 3 persons with internet connection', 'ground-dome.png'),
    ('DOME-2', 'Dome(Ground)', 5000, 3, 'available', 'Complimentary Breakfast, Maximum 3 persons with internet connection', 'ground-dome.png'),
    ('DOME-3', 'Dome(Ground)', 5000, 3, 'available', 'Complimentary Breakfast, Maximum 3 persons with internet connection', 'ground-dome.png'),
    ('DOME-4', 'Dome(Ground)', 5000, 3, 'available', 'Complimentary Breakfast, Maximum 3 persons with internet connection', 'ground-dome.png'),
    ('DOME-5', 'Dome(Elevated)', 6000, 3, 'available', 'Complimentary Breakfast, Maximum 3 persons with internet connection', 'elevated-dome.png'),
    ('FH-1', 'FunctionHall(beside TutorialRoom)', 10000, 80, 'available', 'Our Rate for our Function Hall is Php10,000.00 for 4 hours, it can accommodate 60 - 80 persons. For every succeeding hour cost Php 2000.00 maximum of 4 hours. Inclusions: Use of 4 AC Units/Use of Multi-media Projector/Basic Sounds System/Photography Allowed/ Use of Videoke, tables and chairs.', 'function-hall.jpg'),
    ('FH-2', 'BlueRoom(beside Kulokoys)', 10000, 80, 'available', 'Our Rate for our Function Hall is Php10,000.00 for 4 hours, it can accommodate 60 - 80 persons. For every succeeding hour cost Php 2000.00 maximum of 4 hours. Inclusions: Use of 4 AC Units/Use of Multi-media Projector/Basic Sounds System/Photography Allowed/ Use of Videoke, tables and chairs.', '');


-- 3. Seed Guests (Identity & Profiles)
INSERT INTO public.guests (name, email, phone)
VALUES 
    ('Elena Rodriguez', 'erodriguez.design@email.com', '09762205243'),
    ('Marcus Johnson', 'mjohnson_tech@email.com', '09762205246'),
    ('Aisha Patel', 'apatel.consulting@email.com', '09762205248');


-- 4. Seed Services
INSERT INTO public.services (name, price, service_type)
VALUES
-- Hotel
    ('Extra Breakfast', 250, 'hotel'),
    ('Fleece Blanket', 75, 'hotel'),
    ('Pillow', 50, 'hotel'),
    ('Bed', 1000, 'hotel'),
    ('Flat Sheet', 75, 'hotel'),
    ('Bath Towel', 50, 'hotel'),
    ('Hand Towel', 40, 'hotel'),
    ('Face Towel', 40, 'hotel'),
    ('Bath Matt', 40, 'hotel'),
    ('Shampoo', 20, 'hotel'),
    ('Bath Gel', 20, 'hotel'),
    ('Lotion', 20, 'hotel'),
    ('Vanity Kit', 20, 'hotel'),
    ('Shaving Kit', 30, 'hotel'),
    ('Dental Kit', 20, 'hotel'),
    ('Bath Soap', 20, 'hotel'),
    ('Coffee Set', 50, 'hotel'),
    ('Creamer', 20, 'hotel'),
    ('White Sugar', 20, 'hotel'),
    ('Brown Sugar', 20, 'hotel'),
    ('Bottled Water', 20, 'hotel'),
    ('Slipper', 40, 'hotel'),
    ('Tissue Roll', 15, 'hotel'),
    ('Facial Tissue', 25, 'hotel'),

-- Laundry (Duplicates removed)
    ('Shirt Short Sleeves', 75, 'laundry'),
    ('Shirt Long Sleeves', 60, 'laundry'),
    ('Sport Shirts', 70, 'laundry'),
    ('T-Shirts', 45, 'laundry'),
    ('Trouser', 55, 'laundry'),
    ('Shorts', 70, 'laundry'),
    ('Underwear', 35, 'laundry'),
    ('Undershirts', 45, 'laundry'),
    ('Underpants', 45, 'laundry'),
    ('Socks (Pair)', 45, 'laundry'),
    ('Handkerchief', 25, 'laundry'),
    ('Panjama Suit', 65, 'laundry'),
    ('Safari Suit', 135, 'laundry'),
    ('Barong Tagalog', 125, 'laundry'),
    ('Jeans', 90, 'laundry'),
    ('Jacket', 85, 'laundry'),
    ('Overall', 135, 'laundry'),
    ('Suit/Tuxedo (2pcs)', 140, 'laundry'),
    ('Jacket/Coat', 60, 'laundry'),
    ('Sweater', 80, 'laundry'),
    ('Vest', 55, 'laundry'),
    ('Necktie', 40, 'laundry'),
    ('Overcoat/Topcoat', 110, 'laundry'),
    ('Dress plain', 110, 'laundry'),
    ('Dress Fancy', 125, 'laundry'),
    ('Sarong', 65, 'laundry'),
    ('Blouse Silk', 90, 'laundry'),
    ('Skirt, Long/Pleated', 90, 'laundry'),
    ('Skirt, ordinary / plain', 75, 'laundry'),
    ('Nightgown', 80, 'laundry'),
    ('Scarf', 35, 'laundry'),
    ('Dress, long', 110, 'laundry');

-- 5. Seed Breakfasts
INSERT INTO public.breakfasts (name, price, description, is_active)
VALUES
-- extra sides
    ('Garlic Rice', 30, 'Extras', 'available' ),
    ('Plain Rice', 30, 'Extras', 'available'),
    ('Toasted Bread', 30, 'Extras', 'available' ),
    ('Boiled Egg', 30, 'Extras', 'available'),
    ('Scrambled Egg', 30, 'Extras', 'available' ),
    ('Sunny Side Up', 30, 'Extras', 'available'),

-- filipino breakfast
    ('Pork Tapa', 250, 'FilipinoBreakfast', 'available'),
    ('Pork Tocino', 250, 'FilipinoBreakfast', 'available'),
    ('Corned Beef', 250, 'FilipinoBreakfast', 'available'),
    ('Longganisang Lucban', 250, 'FilipinoBreakfast', 'available'),
    ('Longganisang Hamonado', 250, 'FilipinoBreakfast', 'available'),
    ('Pork Longganisang', 250, 'FilipinoBreakfast', 'available'),
    ('Pork Skinless Longganisang', 250, 'FilipinoBreakfast', 'available'),
    ('Daing na Bangus', 250, 'FilipinoBreakfast', 'available'),
    ('Hotdog', 250, 'FilipinoBreakfast', 'available'),
    ('Chicken Hotdog', 250, 'FilipinoBreakfast', 'available'),
    ('Meat Loaf', 250, 'FilipinoBreakfast', 'available'),

-- American Breakfast
    ('Bacon', 250, 'AmericanBreakfast', 'available'),
    ('Ham', 250, 'AmericanBreakfast', 'available'),
    ('Hungarian Sausage', 250, 'AmericanBreakfast', 'available'),
    ('Vienna Sausage', 250, 'AmericanBreakfast', 'available'),
    ('Lucheon Meat', 250, 'AmericanBreakfast', 'available');