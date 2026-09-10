-- 1. Create Custom Types
CREATE TYPE public.breakfast_type AS ENUM (
    '1-complementary',
    '2-complementary',
    'N/A'
);

-- 2. Create Independent Tables (No Foreign Keys Yet)
CREATE TABLE public.guests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.staff (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    hire_date DATE DEFAULT CURRENT_DATE,
    salary NUMERIC(10,2),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(50),
    price NUMERIC(10,2),
    is_active VARCHAR(20) DEFAULT 'available',
    description TEXT,
    image_url TEXT,
    room_capacity INTEGER DEFAULT 1 NOT NULL,
    breakfast_complementary public.breakfast_type DEFAULT 'N/A'
);

CREATE TABLE public.services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    is_active VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE public.breakfasts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Dependent Tables (With Standard Foreign Keys)
CREATE TABLE public.bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES public.rooms(id),
    guest_id INTEGER REFERENCES public.guests(id),
    created_by INTEGER REFERENCES public.staff(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES public.staff(id) ON DELETE SET NULL,
    invoice_id INTEGER, -- FK added later to avoid circular dependency
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending',
    total_pax INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.invoices (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES public.bookings(id) ON DELETE CASCADE,
    guest_id INTEGER REFERENCES public.guests(id),
    breakfast_id INTEGER REFERENCES public.breakfasts(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    tax NUMERIC(10,2) DEFAULT 0,
    grandtotal NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) DEFAULT 0,
    balance_due NUMERIC(10,2) GENERATED ALWAYS AS (grandtotal - amount_paid) STORED,
    invoice_status VARCHAR(20) DEFAULT 'unpaid' CHECK (invoice_status IN ('unpaid', 'partial', 'paid')),
    room_charge NUMERIC(10,2),
    custom_charge_name VARCHAR(255),
    custom_charge NUMERIC(10,2) DEFAULT 0 NOT NULL,
    additional_pax INTEGER DEFAULT 0 NOT NULL,
    additional_pax_charge NUMERIC(10,2) DEFAULT 0 NOT NULL,
    services_charge NUMERIC(10,2) DEFAULT 0 NOT NULL,
    breakfast_package VARCHAR(100),
    breakfast_price NUMERIC(10,2) DEFAULT 0,
    early_checkin_fee NUMERIC(10,2) DEFAULT 0,
    extended_date DATE,
    extended_hours INTEGER DEFAULT 0,
    extended_hour_price NUMERIC(10,2) DEFAULT 0,
    is_void BOOLEAN DEFAULT false,
    void_reason VARCHAR(255),
    voided_at TIMESTAMP,
    issued_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES public.bookings(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES public.staff(id), -- Fixed from referenced bookings(id)
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_type VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    reference_number VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.booking_services (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES public.services(id),
    booking_service_name VARCHAR(255),
    booking_service_price NUMERIC(10,2) -- Fixed missing precision
);

-- 4. Resolve Circular Dependencies & Add Indexes
ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_invoice_id_fkey 
    FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);

CREATE INDEX idx_bookings_created_by ON public.bookings(created_by);
CREATE INDEX idx_bookings_updated_by ON public.bookings(updated_by);
CREATE INDEX idx_staff_email ON public.staff(email);
CREATE INDEX idx_staff_id ON public.staff(staff_id);
CREATE INDEX idx_staff_status ON public.staff(status);