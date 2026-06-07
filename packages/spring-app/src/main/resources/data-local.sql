-- Seed data for local PostgreSQL
INSERT INTO products (id, name, description, price, stock, status, category, supplier_id, supplier_name, thumbnail_url, created_at, updated_at) VALUES
('a1b2c3d4-0001-4000-8000-000000000001', 'Wireless Bluetooth Headphones', 'High-quality noise-canceling Bluetooth headphones with 30-hour battery life.', 89000, 50, 'active', 'Electronics', 'e1f2a3b4-0001-4000-8000-000000000001', 'TechSupplier Inc.', NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    status = EXCLUDED.status,
    category = EXCLUDED.category,
    supplier_id = EXCLUDED.supplier_id,
    supplier_name = EXCLUDED.supplier_name,
    thumbnail_url = EXCLUDED.thumbnail_url,
    updated_at = NOW();

INSERT INTO products (id, name, description, price, stock, status, category, supplier_id, supplier_name, thumbnail_url, created_at, updated_at) VALUES
('a1b2c3d4-0001-4000-8000-000000000002', 'Ergonomic Office Chair', 'Comfortable mesh back office chair with lumbar support.', 245000, 20, 'active', 'Furniture', 'e1f2a3b4-0001-4000-8000-000000000001', 'TechSupplier Inc.', NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    status = EXCLUDED.status,
    category = EXCLUDED.category,
    supplier_id = EXCLUDED.supplier_id,
    supplier_name = EXCLUDED.supplier_name,
    thumbnail_url = EXCLUDED.thumbnail_url,
    updated_at = NOW();

INSERT INTO products (id, name, description, price, stock, status, category, supplier_id, supplier_name, thumbnail_url, created_at, updated_at) VALUES
('a1b2c3d4-0001-4000-8000-000000000003', 'Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX Blue switches.', 125000, 100, 'active', 'Electronics', 'e1f2a3b4-0002-4000-8000-000000000001', 'KeyCraft Co.', NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    status = EXCLUDED.status,
    category = EXCLUDED.category,
    supplier_id = EXCLUDED.supplier_id,
    supplier_name = EXCLUDED.supplier_name,
    thumbnail_url = EXCLUDED.thumbnail_url,
    updated_at = NOW();

INSERT INTO products (id, name, description, price, stock, status, category, supplier_id, supplier_name, thumbnail_url, created_at, updated_at) VALUES
('a1b2c3d4-0001-4000-8000-000000000004', 'Smartphone Stand', 'Adjustable aluminum smartphone stand compatible with all phones.', 18000, 200, 'active', 'Accessories', 'e1f2a3b4-0002-4000-8000-000000000001', 'KeyCraft Co.', NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    status = EXCLUDED.status,
    category = EXCLUDED.category,
    supplier_id = EXCLUDED.supplier_id,
    supplier_name = EXCLUDED.supplier_name,
    thumbnail_url = EXCLUDED.thumbnail_url,
    updated_at = NOW();

INSERT INTO products (id, name, description, price, stock, status, category, supplier_id, supplier_name, thumbnail_url, created_at, updated_at) VALUES
('a1b2c3d4-0001-4000-8000-000000000005', 'Portable SSD 1TB', 'USB-C portable SSD, read speed up to 1050MB/s.', 159000, 30, 'active', 'Electronics', 'e1f2a3b4-0001-4000-8000-000000000001', 'TechSupplier Inc.', NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    status = EXCLUDED.status,
    category = EXCLUDED.category,
    supplier_id = EXCLUDED.supplier_id,
    supplier_name = EXCLUDED.supplier_name,
    thumbnail_url = EXCLUDED.thumbnail_url,
    updated_at = NOW();

INSERT INTO products (id, name, description, price, stock, status, category, supplier_id, supplier_name, thumbnail_url, created_at, updated_at) VALUES
('a1b2c3d4-0001-4000-8000-000000000006', 'Draft Product', 'This product is still in draft.', 0, 0, 'draft', 'Other', 'e1f2a3b4-0001-4000-8000-000000000001', 'TechSupplier Inc.', NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    status = EXCLUDED.status,
    category = EXCLUDED.category,
    supplier_id = EXCLUDED.supplier_id,
    supplier_name = EXCLUDED.supplier_name,
    thumbnail_url = EXCLUDED.thumbnail_url,
    updated_at = NOW();

-- Seed cart items
INSERT INTO cart_items (id, buyer_id, product_id, product_name, supplier_id, unit_price, thumbnail_url, quantity, created_at) VALUES
('c1d2e3f4-0001-4000-8000-000000000001', 'f1a2b3c4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Wireless Bluetooth Headphones', 'e1f2a3b4-0001-4000-8000-000000000001', 89000, NULL, 2, NOW())
ON CONFLICT (id) DO UPDATE SET
    buyer_id = EXCLUDED.buyer_id,
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    supplier_id = EXCLUDED.supplier_id,
    unit_price = EXCLUDED.unit_price,
    thumbnail_url = EXCLUDED.thumbnail_url,
    quantity = EXCLUDED.quantity;

INSERT INTO cart_items (id, buyer_id, product_id, product_name, supplier_id, unit_price, thumbnail_url, quantity, created_at) VALUES
('c1d2e3f4-0001-4000-8000-000000000002', 'f1a2b3c4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000004', 'Smartphone Stand', 'e1f2a3b4-0002-4000-8000-000000000001', 18000, NULL, 1, NOW())
ON CONFLICT (id) DO UPDATE SET
    buyer_id = EXCLUDED.buyer_id,
    product_id = EXCLUDED.product_id,
    product_name = EXCLUDED.product_name,
    supplier_id = EXCLUDED.supplier_id,
    unit_price = EXCLUDED.unit_price,
    thumbnail_url = EXCLUDED.thumbnail_url,
    quantity = EXCLUDED.quantity;

-- Seed users
INSERT INTO users (id, username, password, role, email, created_at) VALUES
('e1f2a3b4-0001-4000-8000-000000000001', 'techsupplier', '$2b$10$F0tjZzYikIMKoH0OFExQE.j/t//aWO8QdC5p.rToJQawPmPcz546q', 'SUPPLIER', 'admin@techsupplier.com', NOW())
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    email = EXCLUDED.email;

INSERT INTO users (id, username, password, role, email, created_at) VALUES
('e1f2a3b4-0002-4000-8000-000000000001', 'keycraft', '$2b$10$F0tjZzYikIMKoH0OFExQE.j/t//aWO8QdC5p.rToJQawPmPcz546q', 'SUPPLIER', 'admin@keycraft.com', NOW())
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    email = EXCLUDED.email;

INSERT INTO users (id, username, password, role, email, created_at) VALUES
('f1a2b3c4-0001-4000-8000-000000000001', 'buyer1', '$2b$10$F0tjZzYikIMKoH0OFExQE.j/t//aWO8QdC5p.rToJQawPmPcz546q', 'BUYER', 'buyer1@test.com', NOW())
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    email = EXCLUDED.email;

INSERT INTO users (id, username, password, role, email, created_at) VALUES
('f1a2b3c4-0002-4000-8000-000000000001', 'buyer2', '$2b$10$F0tjZzYikIMKoH0OFExQE.j/t//aWO8QdC5p.rToJQawPmPcz546q', 'BUYER', 'buyer2@test.com', NOW())
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    email = EXCLUDED.email;

-- Seed orders
INSERT INTO orders (id, buyer_id, product_id, product_name, supplier_id, quantity, unit_price, total_amount, status, created_at) VALUES
('b1c2d3e4-0001-4000-8000-000000000001', 'f1a2b3c4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Wireless Bluetooth Headphones', 'e1f2a3b4-0001-4000-8000-000000000001', 2, 89000, 178000, 'completed', NOW())
ON CONFLICT (id) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    quantity = EXCLUDED.quantity,
    unit_price = EXCLUDED.unit_price,
    total_amount = EXCLUDED.total_amount,
    status = EXCLUDED.status;

INSERT INTO orders (id, buyer_id, product_id, product_name, supplier_id, quantity, unit_price, total_amount, status, created_at) VALUES
('b1c2d3e4-0001-4000-8000-000000000002', 'f1a2b3c4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000003', 'Mechanical Keyboard', 'e1f2a3b4-0002-4000-8000-000000000001', 1, 125000, 125000, 'shipped', NOW())
ON CONFLICT (id) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    quantity = EXCLUDED.quantity,
    unit_price = EXCLUDED.unit_price,
    total_amount = EXCLUDED.total_amount,
    status = EXCLUDED.status;

INSERT INTO orders (id, buyer_id, product_id, product_name, supplier_id, quantity, unit_price, total_amount, status, created_at) VALUES
('b1c2d3e4-0001-4000-8000-000000000003', 'f1a2b3c4-0002-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000005', 'Portable SSD 1TB', 'e1f2a3b4-0001-4000-8000-000000000001', 1, 159000, 159000, 'pending', NOW())
ON CONFLICT (id) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    quantity = EXCLUDED.quantity,
    unit_price = EXCLUDED.unit_price,
    total_amount = EXCLUDED.total_amount,
    status = EXCLUDED.status;
