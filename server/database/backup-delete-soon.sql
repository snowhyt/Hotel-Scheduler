--
-- PostgreSQL database dump
--

\restrict UnHI7eNXBc2wr1Imke3hBN4yVZtrK8As4BRIYA49KYgUiNTmJ1iMbqwBOPbHzMj

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.1

-- Started on 2026-06-30 23:07:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 888 (class 1247 OID 41336)
-- Name: breakfast_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.breakfast_type AS ENUM (
    '1-complementary',
    '2-complementary',
    'N/A'
);


ALTER TYPE public.breakfast_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 234 (class 1259 OID 41345)
-- Name: booking_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_services (
    id integer NOT NULL,
    booking_id integer,
    service_id integer,
    booking_service_name character varying(255),
    booking_service_price numeric
);


ALTER TABLE public.booking_services OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 41344)
-- Name: booking_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_services_id_seq OWNER TO postgres;

--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 233
-- Name: booking_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_services_id_seq OWNED BY public.booking_services.id;


--
-- TOC entry 222 (class 1259 OID 16485)
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    room_id integer,
    check_in timestamp without time zone NOT NULL,
    check_out timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    booking_status character varying(20) DEFAULT 'pending'::character varying,
    guest_id integer,
    created_by integer,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_pax integer DEFAULT 1 CONSTRAINT bookings_totalpax_not_null NOT NULL,
    invoice_id integer
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16484)
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 221
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- TOC entry 228 (class 1259 OID 32968)
-- Name: guests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guests (
    id integer CONSTRAINT guest_id_not_null NOT NULL,
    name character varying(100) CONSTRAINT guest_name_not_null NOT NULL,
    email character varying(100),
    phone character varying(20) CONSTRAINT guest_phone_not_null NOT NULL,
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.guests OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 32967)
-- Name: guest_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guest_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_id_seq OWNER TO postgres;

--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 227
-- Name: guest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guest_id_seq OWNED BY public.guests.id;


--
-- TOC entry 226 (class 1259 OID 32941)
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    booking_id integer,
    invoice_number character varying(50) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    tax numeric(10,2) DEFAULT 0,
    grandtotal numeric(10,2) CONSTRAINT invoices_total_amount_not_null NOT NULL,
    amount_paid numeric(10,2) DEFAULT 0,
    issued_date date DEFAULT CURRENT_DATE,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    guest_id integer,
    balance_due numeric(10,2) GENERATED ALWAYS AS ((grandtotal - amount_paid)) STORED,
    invoice_status character varying(20) DEFAULT 'unpaid'::character varying,
    room_charge numeric(10,2),
    custom_charge_name character varying(255),
    custom_charge numeric(10,2) DEFAULT 0 NOT NULL,
    additional_pax integer DEFAULT 0 NOT NULL,
    additional_pax_charge numeric(10,2) DEFAULT 0 NOT NULL,
    services_charge numeric(10,2) DEFAULT 0 NOT NULL,
    breakfast_package character varying(100),
    is_void boolean DEFAULT false,
    void_reason character varying(255),
    voided_at timestamp without time zone,
    early_checkin_fee numeric DEFAULT 0,
    CONSTRAINT invoices_invoice_status_check CHECK (((invoice_status)::text = ANY ((ARRAY['unpaid'::character varying, 'partial'::character varying, 'paid'::character varying])::text[])))
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 32940)
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO postgres;

--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 225
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- TOC entry 224 (class 1259 OID 32916)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    booking_id integer,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50),
    payment_status character varying(50) DEFAULT 'penging'::character varying,
    reference_number character varying(100),
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_type character varying(50)
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 32915)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 223
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- TOC entry 220 (class 1259 OID 16473)
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    id integer NOT NULL,
    room_number character varying(10) NOT NULL,
    room_type character varying(50),
    price numeric(10,2),
    is_active character varying(20) DEFAULT 'available'::character varying,
    description text,
    image_url text,
    room_capacity integer DEFAULT 1 NOT NULL,
    breakfast_complementary public.breakfast_type DEFAULT 'N/A'::public.breakfast_type
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16472)
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rooms_id_seq OWNER TO postgres;

--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 219
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- TOC entry 232 (class 1259 OID 41253)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 41252)
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 231
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- TOC entry 230 (class 1259 OID 32987)
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    staff_id character varying(50) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    "position" character varying(100) NOT NULL,
    department character varying(100),
    hire_date date DEFAULT CURRENT_DATE,
    salary numeric(10,2),
    address text,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 32986)
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_id_seq OWNER TO postgres;

--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 229
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- TOC entry 4929 (class 2604 OID 41348)
-- Name: booking_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services ALTER COLUMN id SET DEFAULT nextval('public.booking_services_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 16488)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 32971)
-- Name: guests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests ALTER COLUMN id SET DEFAULT nextval('public.guest_id_seq'::regclass);


--
-- TOC entry 4907 (class 2604 OID 32944)
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- TOC entry 4903 (class 2604 OID 32919)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 16476)
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- TOC entry 4928 (class 2604 OID 41256)
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 32990)
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- TOC entry 4959 (class 2606 OID 41353)
-- Name: booking_services booking_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 16494)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 32980)
-- Name: guests guest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guest_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 32961)
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- TOC entry 4944 (class 2606 OID 32959)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 32929)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 16481)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 16483)
-- Name: rooms rooms_room_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_number_key UNIQUE (room_number);


--
-- TOC entry 4957 (class 2606 OID 41261)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 33009)
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- TOC entry 4953 (class 2606 OID 33005)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 33007)
-- Name: staff staff_staff_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_staff_id_key UNIQUE (staff_id);


--
-- TOC entry 4937 (class 1259 OID 33024)
-- Name: idx_bookings_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_created_by ON public.bookings USING btree (created_by);


--
-- TOC entry 4938 (class 1259 OID 33025)
-- Name: idx_bookings_updated_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_updated_by ON public.bookings USING btree (updated_by);


--
-- TOC entry 4947 (class 1259 OID 33010)
-- Name: idx_staff_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_email ON public.staff USING btree (email);


--
-- TOC entry 4948 (class 1259 OID 33011)
-- Name: idx_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_id ON public.staff USING btree (staff_id);


--
-- TOC entry 4949 (class 1259 OID 33012)
-- Name: idx_staff_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_status ON public.staff USING btree (status);


--
-- TOC entry 4969 (class 2606 OID 41354)
-- Name: booking_services booking_services_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 4970 (class 2606 OID 41359)
-- Name: booking_services booking_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 4960 (class 2606 OID 33014)
-- Name: bookings bookings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- TOC entry 4961 (class 2606 OID 32981)
-- Name: bookings bookings_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id);


--
-- TOC entry 4962 (class 2606 OID 41329)
-- Name: bookings bookings_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- TOC entry 4963 (class 2606 OID 16495)
-- Name: bookings bookings_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- TOC entry 4964 (class 2606 OID 33019)
-- Name: bookings bookings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- TOC entry 4967 (class 2606 OID 32962)
-- Name: invoices invoices_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--



--
-- TOC entry 4968 (class 2606 OID 41247)
-- Name: invoices invoices_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id);


--
-- TOC entry 4965 (class 2606 OID 32930)
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 4966 (class 2606 OID 32935)
-- Name: payments payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.bookings(id);


-- Completed on 2026-06-30 23:07:43

--
-- PostgreSQL database dump complete
--

\unrestrict UnHI7eNXBc2wr1Imke3hBN4yVZtrK8As4BRIYA49KYgUiNTmJ1iMbqwBOPbHzMj

CREATE TABLE public.breakfasts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2)NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.invoices
    ADD COLUMN breakfast_id INTEGER REFERENCES public.breakfasts(id) ON DELETE SET NULL,
    ADD COLUMN breakfast_price NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN extended_date DATE,
    ADD COLUMN extended_hours INTEGER DEFAULT 0,
    ADD COLUMN extended_hour_price NUMERIC(10,2) DEFAULT 0;