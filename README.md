# 🚀 Super-App Database Schema (PostgreSQL + PostGIS)

A flexible and scalable PostgreSQL schema for a "Super-App" that combines both **Uber-style (services)** and **Instamart-style (product delivery)** functionalities.

This schema is designed for extensibility, efficiency, and real-world practicality — allowing a single user to be both a **consumer** and a **worker**, with seamless order handling for rides, deliveries, or future services.

---

## 🧠 Key Design Principles

1. **Single Source of Truth for Users**  
   Every person (admin, consumer, or worker) is in one unified `users` table with multiple possible roles.

2. **Flexible Order System**  
   A single `orders` table handles both rides and deliveries using `service_type` and optional fields for each use case.

3. **PostGIS-Powered Location Queries**  
   Store geographic coordinates using the `GEOGRAPHY(Point, 4326)` type for high-performance queries like:  
   ```sql
   SELECT * FROM worker_profiles
   WHERE ST_DWithin(current_location, ST_MakePoint(:lng, :lat)::geography, 5000);
   ```

4. **ENUM-Based Data Integrity**  
   PostgreSQL ENUMs enforce consistency for roles, service types, and statuses.

---

## 🧩 Schema Overview

### 1. Core Tables

```sql
CREATE TYPE user_role AS ENUM ('admin', 'consumer', 'worker');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    roles user_role[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE worker_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    full_name VARCHAR(100),
    driving_license TEXT,
    vehicle_number VARCHAR(20),
    vehicle_rc TEXT,
    current_location GEOGRAPHY(Point, 4326)
);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    address_label VARCHAR(50),
    full_address TEXT,
    location_point GEOGRAPHY(Point, 4326)
);
```

---

### 2. Services: Shops & Items

```sql
CREATE TYPE shop_type AS ENUM ('restaurant', 'stationary', 'grocery');

CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    location GEOGRAPHY(Point, 4326),
    type shop_type NOT NULL
);

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL
);
```

---

### 3. Orders (Central Table)

```sql
CREATE TYPE service_type AS ENUM ('RIDE', 'DELIVERY');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type service_type NOT NULL,
    consumer_id UUID NOT NULL REFERENCES users(id),
    worker_id UUID REFERENCES users(id),
    status order_status NOT NULL DEFAULT 'pending',
    shop_id UUID REFERENCES shops(id),
    start_location GEOGRAPHY(Point, 4326),
    end_location GEOGRAPHY(Point, 4326),
    otp VARCHAR(6) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    item_id UUID NOT NULL REFERENCES items(id),
    quantity INT NOT NULL CHECK (quantity > 0)
);
```

---

## ⚙️ PostgreSQL Setup

Make sure you have **PostGIS** enabled for location queries:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## 🌐 Why This Schema Rocks

- ✅ **Unified User Management:** One account can be both a driver and a buyer.
- 🚀 **Service Flexibility:** Add new service types (e.g., `LAUNDRY`, `PET_WALK`) easily by extending `service_type`.
- 📦 **Realistic Data Modeling:** Handles both rides (point-to-point) and deliveries (multi-item).
- 📍 **Spatial Query Power:** Efficiently find nearby workers or shops with PostGIS.

---

## 📘 License

MIT License © 2025