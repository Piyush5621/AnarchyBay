CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT[] NULL,
    image_url TEXT[] NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);