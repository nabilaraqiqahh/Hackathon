-- --------------------------------------------------------
-- RUN THIS IN SUPABASE SQL EDITOR (PostgreSQL)
-- This is the perfectly translated version of your database for Supabase
-- --------------------------------------------------------

-- 1. Users Table
CREATE TABLE public.users (
    user_id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_no TEXT,
    password TEXT DEFAULT '123',
    user_type TEXT DEFAULT 'Driver'
);

-- 2. Car Brands
CREATE TABLE public.car_brands (
    brand_id SERIAL PRIMARY KEY,
    brand_name TEXT UNIQUE NOT NULL
);

-- 3. Car Models
CREATE TABLE public.car_models (
    model_id SERIAL PRIMARY KEY,
    brand_id INT REFERENCES public.car_brands(brand_id) ON DELETE CASCADE,
    model_name TEXT NOT NULL
);

-- 4. Vehicles (NEW for Member 2)
CREATE TABLE public.vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(user_id) ON DELETE CASCADE,
    plat_no TEXT NOT NULL,
    car_model TEXT NOT NULL
);

-- 5. Stations
CREATE TABLE public.stations (
    station_id INT PRIMARY KEY,
    station_name TEXT NOT NULL,
    address TEXT,
    operator_name TEXT DEFAULT 'Unknown Operator',
    charger_type TEXT NOT NULL,
    district TEXT NOT NULL,
    total_bays INT NOT NULL,
    connectors INT DEFAULT 1,
    available_bays INT NOT NULL,
    status TEXT DEFAULT 'Available',
    price_per_kwh DECIMAL(10,2) DEFAULT 1.20,
    idle_fee DECIMAL(10,2) DEFAULT 0.00
);

-- 6. Reservations (UPDATED for Member 2)
CREATE TABLE public.reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(user_id) ON DELETE CASCADE,
    station_id INT REFERENCES public.stations(station_id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration TEXT,
    connector TEXT,
    power TEXT,
    status TEXT DEFAULT 'Confirmed'
);

-- 7. Payments (UPDATED for Member 2)
CREATE TABLE public.payments (
    payment_id SERIAL PRIMARY KEY,
    transaction_id TEXT UNIQUE NOT NULL,
    user_id INT REFERENCES public.users(user_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    energy TEXT,
    receipt_no TEXT,
    payment_date DATE NOT NULL,
    status TEXT DEFAULT 'Success'
);

-- 8. Usage Logs
CREATE TABLE public.usage_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(user_id),
    station_id INT REFERENCES public.stations(station_id),
    session_date DATE NOT NULL,
    energy_consumed FLOAT
);
