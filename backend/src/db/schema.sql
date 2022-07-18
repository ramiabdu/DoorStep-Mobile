CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  cuisine TEXT NOT NULL,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 4.5,
  delivery_time_minutes INTEGER NOT NULL DEFAULT 30,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 299,
  hero_image_url TEXT NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  image_url TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, name)
);

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, menu_item_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  driver_id UUID REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  status TEXT NOT NULL CHECK (
    status IN (
      'placed',
      'confirmed',
      'preparing',
      'ready',
      'assigned',
      'picked_up',
      'delivered',
      'cancelled'
    )
  ) DEFAULT 'placed',
  delivery_address TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  delivery_fee_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents > 0)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

INSERT INTO restaurants (name, cuisine, rating, delivery_time_minutes, delivery_fee_cents, hero_image_url)
VALUES
  (
    'Green Bowl Kitchen',
    'Healthy bowls',
    4.8,
    24,
    299,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Urban Pizza Works',
    'Wood-fired pizza',
    4.7,
    31,
    349,
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Noodle Lab',
    'Asian fusion',
    4.9,
    28,
    399,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80'
  )
ON CONFLICT (restaurant_id, name) DO NOTHING;

INSERT INTO menu_items (restaurant_id, name, description, price_cents, image_url)
SELECT restaurants.id, seed.name, seed.description, seed.price_cents, seed.image_url
FROM restaurants
JOIN (
  VALUES
    (
      'Green Bowl Kitchen',
      'Harvest Protein Bowl',
      'Quinoa, roasted vegetables, herb chicken, avocado, and citrus tahini.',
      1499,
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80'
    ),
    (
      'Green Bowl Kitchen',
      'Salmon Market Bowl',
      'Seared salmon, brown rice, cucumber, edamame, and ginger dressing.',
      1799,
      'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=900&q=80'
    ),
    (
      'Urban Pizza Works',
      'Margherita Classica',
      'San Marzano tomato, mozzarella, basil, and olive oil.',
      1399,
      'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=900&q=80'
    ),
    (
      'Urban Pizza Works',
      'Truffle Mushroom Pie',
      'Wild mushrooms, truffle cream, aged mozzarella, and thyme.',
      1899,
      'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80'
    ),
    (
      'Noodle Lab',
      'Shoyu Ramen',
      'Chicken broth, ramen noodles, egg, nori, scallions, and bamboo shoots.',
      1599,
      'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80'
    ),
    (
      'Noodle Lab',
      'Dan Dan Noodles',
      'Sesame chili sauce, minced chicken, bok choy, and crushed peanuts.',
      1499,
      'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80'
    )
) AS seed(restaurant_name, name, description, price_cents, image_url)
  ON restaurants.name = seed.restaurant_name
ON CONFLICT (name) DO NOTHING;
