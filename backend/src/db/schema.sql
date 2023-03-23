CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('restaurant', 'supermarket', 'convenience', 'all')),
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('restaurant', 'supermarket', 'convenience')),
  cuisine TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 4.5,
  review_count INTEGER NOT NULL DEFAULT 0,
  delivery_time_minutes INTEGER NOT NULL DEFAULT 30,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 299,
  minimum_order_cents INTEGER NOT NULL DEFAULT 1000,
  distance_km NUMERIC(4, 1) NOT NULL DEFAULT 1.5,
  price_level TEXT NOT NULL CHECK (price_level IN ('$', '$$', '$$$')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  original_price_cents INTEGER CHECK (original_price_cents IS NULL OR original_price_cents >= price_cents),
  discount_percent INTEGER CHECK (discount_percent IS NULL OR discount_percent BETWEEN 1 AND 90),
  image_url TEXT NOT NULL,
  calories INTEGER,
  weight TEXT,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 4.5,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, name)
);

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  instructions TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL CHECK (brand IN ('Visa', 'Mastercard', 'Apple Pay', 'PayPal')),
  last4 TEXT NOT NULL,
  label TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  customer_id TEXT NOT NULL REFERENCES users(id),
  driver_id TEXT REFERENCES users(id),
  store_id TEXT NOT NULL REFERENCES stores(id),
  status TEXT NOT NULL CHECK (
    status IN ('placed', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled')
  ) DEFAULT 'placed',
  delivery_address TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  delivery_fee_cents INTEGER NOT NULL,
  service_fee_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  eta_minutes INTEGER NOT NULL DEFAULT 28,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents > 0)
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 90),
  minimum_order_cents INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'offer', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_type ON stores(type);
CREATE INDEX IF NOT EXISTS idx_stores_featured ON stores(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

INSERT INTO users (id, name, email, password_hash, role, phone, avatar_url)
VALUES
  ('user-admin', 'Ava Admin', 'admin@doorstep.dev', crypt('Doorstep123!', gen_salt('bf')), 'admin', NULL, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'),
  ('user-driver', 'Drew Driver', 'driver@doorstep.dev', crypt('Doorstep123!', gen_salt('bf')), 'driver', NULL, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'),
  ('user-customer', 'Casey Customer', 'customer@doorstep.dev', crypt('Doorstep123!', gen_salt('bf')), 'customer', '+49 30 5550 1144', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, slug, icon, color, type, description)
VALUES
  ('cat-burgers', 'Burgers', 'burgers', 'Burger', '#6C47FF', 'restaurant', 'Premium burgers, crispy sides, and fast comfort food.'),
  ('cat-chicken', 'Chicken', 'chicken', 'Drumstick', '#FFB703', 'restaurant', 'Fried chicken, wings, wraps, and family buckets.'),
  ('cat-coffee', 'Coffee', 'coffee', 'Coffee', '#00C897', 'restaurant', 'Coffee, pastries, breakfast, and cold drinks.'),
  ('cat-pizza', 'Pizza', 'pizza', 'Pizza', '#FF6B6B', 'restaurant', 'Fresh pizza, sides, dips, and late-night favorites.'),
  ('cat-groceries', 'Groceries', 'groceries', 'ShoppingBasket', '#2F80ED', 'supermarket', 'Fresh produce, pantry, dairy, and household essentials.'),
  ('cat-organic', 'Organic', 'organic', 'Leaf', '#16A34A', 'supermarket', 'Organic staples, healthy snacks, and fresh market finds.'),
  ('cat-convenience', 'Convenience', 'convenience', 'Zap', '#F97316', 'convenience', 'Snacks, drinks, pharmacy basics, and quick top-ups.'),
  ('cat-deals', 'Flash Deals', 'flash-deals', 'BadgePercent', '#EC4899', 'all', 'Limited-time offers across restaurants and supermarkets.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stores (
  id, slug, name, type, cuisine, category, description, logo_url, hero_image_url, cover_image_url,
  rating, review_count, delivery_time_minutes, delivery_fee_cents, minimum_order_cents, distance_km,
  price_level, tags, is_featured, is_open
)
VALUES
  ('store-mcdonalds', 'mcdonalds', 'McDonald''s', 'restaurant', 'Burgers and fries', 'Burgers', 'Iconic burgers, fries, McCafe drinks, and fast family meals delivered hot.', 'https://logo.clearbit.com/mcdonalds.com', 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1619881590738-a111d176d906?auto=format&fit=crop&w=1600&q=80', 4.6, 18240, 18, 199, 900, 1.2, '$', ARRAY['Fast delivery','Family meals','McCafe'], TRUE, TRUE),
  ('store-kfc', 'kfc', 'KFC', 'restaurant', 'Fried chicken', 'Chicken', 'Crispy chicken buckets, sandwiches, tenders, and signature sides.', 'https://logo.clearbit.com/kfc.com', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1606755962773-d324e2e1a74d?auto=format&fit=crop&w=1600&q=80', 4.5, 12980, 24, 249, 1000, 2.1, '$$', ARRAY['Buckets','Spicy','Late night'], TRUE, TRUE),
  ('store-burger-king', 'burger-king', 'Burger King', 'restaurant', 'Flame-grilled burgers', 'Burgers', 'Flame-grilled burgers, plant-based options, fries, and shakes.', 'https://logo.clearbit.com/bk.com', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1600&q=80', 4.4, 9340, 22, 199, 900, 1.8, '$', ARRAY['Flame grilled','Plant-based','Value'], FALSE, TRUE),
  ('store-starbucks', 'starbucks', 'Starbucks', 'restaurant', 'Coffee and bakery', 'Coffee', 'Handcrafted coffee, matcha, refreshers, breakfast sandwiches, and pastries.', 'https://logo.clearbit.com/starbucks.com', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1600&q=80', 4.8, 21410, 16, 149, 800, 0.9, '$$', ARRAY['Coffee','Breakfast','Rewards'], TRUE, TRUE),
  ('store-pizza-hut', 'pizza-hut', 'Pizza Hut', 'restaurant', 'Pizza and sides', 'Pizza', 'Pan pizzas, melt deals, pasta bakes, wings, and desserts for groups.', 'https://logo.clearbit.com/pizzahut.com', 'https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=1600&q=80', 4.3, 8080, 29, 299, 1200, 2.6, '$$', ARRAY['Group deals','Pizza','Wings'], FALSE, TRUE),
  ('store-subway', 'subway', 'Subway', 'restaurant', 'Subs and salads', 'Sandwiches', 'Custom subs, wraps, salads, cookies, and lighter lunch options.', 'https://logo.clearbit.com/subway.com', 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=1600&q=80', 4.4, 6760, 20, 199, 850, 1.6, '$', ARRAY['Customizable','Lunch','Fresh'], FALSE, TRUE),
  ('store-carrefour', 'carrefour', 'Carrefour', 'supermarket', 'Supermarket', 'Groceries', 'Full-basket grocery delivery with produce, pantry, home care, and baby essentials.', 'https://logo.clearbit.com/carrefour.com', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=80', 4.7, 15420, 35, 349, 1800, 3.1, '$$', ARRAY['Weekly shop','Fresh produce','Household'], TRUE, TRUE),
  ('store-lidl', 'lidl', 'Lidl', 'supermarket', 'Discount grocery', 'Groceries', 'Great-value groceries, bakery favorites, dairy, frozen goods, and fresh produce.', 'https://logo.clearbit.com/lidl.com', 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1600&q=80', 4.5, 11260, 32, 299, 1500, 2.8, '$', ARRAY['Value','Bakery','Weekly essentials'], FALSE, TRUE),
  ('store-aldi', 'aldi', 'Aldi', 'supermarket', 'Everyday grocery', 'Groceries', 'Affordable everyday staples, seasonal specials, produce, and private-label favorites.', 'https://logo.clearbit.com/aldi.com', 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1600&q=80', 4.6, 9840, 34, 299, 1500, 3.4, '$', ARRAY['Budget','Produce','Private label'], FALSE, TRUE),
  ('store-rewe', 'rewe', 'REWE', 'supermarket', 'Fresh supermarket', 'Groceries', 'Premium fresh food, organic ranges, drinks, bakery, and household essentials.', 'https://logo.clearbit.com/rewe.de', 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?auto=format&fit=crop&w=1600&q=80', 4.8, 13730, 30, 249, 1600, 2.4, '$$', ARRAY['Organic','Fresh bakery','Premium'], TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (
  id, store_id, category_id, name, description, price_cents, original_price_cents,
  discount_percent, image_url, calories, weight, rating, is_available, is_popular
)
VALUES
  ('prod-big-mac-menu', 'store-mcdonalds', 'cat-burgers', 'Big Mac Meal', 'Big Mac, medium fries, and a chilled soft drink.', 1099, 1299, 15, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80', 1080, NULL, 4.8, TRUE, TRUE),
  ('prod-mccafe-latte', 'store-mcdonalds', 'cat-coffee', 'McCafe Iced Latte', 'Espresso, milk, and ice with a smooth vanilla finish.', 429, NULL, NULL, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80', 180, NULL, 4.5, TRUE, FALSE),
  ('prod-kfc-bucket', 'store-kfc', 'cat-chicken', 'Original Recipe Bucket', 'Eight pieces of signature chicken with fries and gravy.', 2199, 2499, 12, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=80', 2400, NULL, 4.7, TRUE, TRUE),
  ('prod-whopper-meal', 'store-burger-king', 'cat-burgers', 'Whopper Meal', 'Flame-grilled Whopper with fries and a refillable drink.', 1149, NULL, NULL, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=80', 1110, NULL, 4.6, TRUE, TRUE),
  ('prod-starbucks-caramel-macchiato', 'store-starbucks', 'cat-coffee', 'Caramel Macchiato', 'Steamed milk, espresso, vanilla syrup, and caramel drizzle.', 575, NULL, NULL, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80', 250, NULL, 4.9, TRUE, TRUE),
  ('prod-pizza-hut-margherita', 'store-pizza-hut', 'cat-pizza', 'Margherita Pan Pizza', 'Classic tomato, mozzarella, basil, and signature pan crust.', 1399, NULL, NULL, 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80', 1480, NULL, 4.4, TRUE, TRUE),
  ('prod-subway-italian-bmt', 'store-subway', 'cat-burgers', 'Italian B.M.T.', 'Salami, pepperoni, ham, cheese, crisp vegetables, and house sauce.', 899, NULL, NULL, 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&w=900&q=80', 760, NULL, 4.5, TRUE, FALSE),
  ('prod-carrefour-berries', 'store-carrefour', 'cat-groceries', 'Mixed Berries Pack', 'Strawberries, blueberries, and raspberries washed and ready to serve.', 699, 849, 18, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80', NULL, '450 g', 4.8, TRUE, TRUE),
  ('prod-lidl-bakery-box', 'store-lidl', 'cat-groceries', 'Fresh Bakery Box', 'Croissants, pretzels, seeded rolls, and pain au chocolat.', 799, NULL, NULL, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80', NULL, '8 pcs', 4.6, TRUE, TRUE),
  ('prod-aldi-organic-eggs', 'store-aldi', 'cat-organic', 'Organic Free-Range Eggs', 'Large free-range eggs from certified organic farms.', 529, NULL, NULL, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=900&q=80', NULL, '10 pcs', 4.8, TRUE, TRUE),
  ('prod-rewe-oat-milk', 'store-rewe', 'cat-organic', 'Barista Oat Milk', 'Creamy oat drink for espresso, cereal, smoothies, and baking.', 279, 349, 20, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=80', NULL, '1 L', 4.9, TRUE, TRUE),
  ('prod-rewe-sushi-box', 'store-rewe', 'cat-groceries', 'Fresh Salmon Sushi Box', 'Nigiri and maki selection packed fresh for lunch or dinner.', 1199, NULL, NULL, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80', NULL, '360 g', 4.7, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO coupons (id, code, title, description, discount_percent, minimum_order_cents, expires_at, is_active)
VALUES
  ('coupon-welcome', 'WELCOME25', '25% off your first order', 'Use on restaurants or groceries above EUR 18.', 25, 1800, '2026-12-31T23:59:00.000Z', TRUE),
  ('coupon-grocery', 'FRESH15', 'Fresh grocery run', 'Save 15% on supermarket baskets above EUR 35.', 15, 3500, '2026-09-30T23:59:00.000Z', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO addresses (id, user_id, label, line1, line2, city, postal_code, instructions, is_default)
VALUES
  ('addr-home', 'user-customer', 'Home', 'Ledra Street 42', 'Apt 5B', 'Nicosia', '1011', 'Ring twice, leave at reception if unavailable.', TRUE),
  ('addr-office', 'user-customer', 'Office', 'Makariou Avenue 1', NULL, 'Nicosia', '1065', 'Meet at lobby coffee bar.', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, user_id, brand, last4, label, is_default)
VALUES
  ('pay-visa', 'user-customer', 'Visa', '4242', 'Personal card', TRUE),
  ('pay-apple', 'user-customer', 'Apple Pay', '0000', 'Apple Pay', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (id, user_id, title, body, type, is_read)
VALUES
  ('notif-order', 'user-customer', 'Your Starbucks order is preparing', 'The store accepted your order and your rider will be assigned shortly.', 'order', FALSE),
  ('notif-offer', 'user-customer', 'Flash grocery deals are live', 'Save on fresh berries, oat milk, bakery boxes, and more today.', 'offer', FALSE)
ON CONFLICT (id) DO NOTHING;
