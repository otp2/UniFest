# UniFest 2024 - Event Ticketing System

A Next.js application for managing fraternity and sorority event tickets with Stripe payments and QR code generation.

## Features

- 🏠 House selection (fraternities and sororities)
- 🔐 Access code validation for each house
- 💳 Stripe payment integration
- 🎫 QR code ticket generation
- 📊 Admin dashboard
- 🚌 Bus route management
- 💰 Early bird pricing

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **QR Codes**: qrcode library

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Application URL
NEXT_PUBLIC_URL=http://localhost:3000
```

### 2. Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Houses table
CREATE TABLE houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                    -- "SAE", "Alpha Phi", etc.
  display_name TEXT NOT NULL,            -- "Sigma Alpha Epsilon"
  house_type TEXT NOT NULL,              -- "fraternity" or "sorority"
  access_code TEXT NOT NULL UNIQUE,      -- Code they enter
  promo_code TEXT NOT NULL UNIQUE,       -- For Stripe tracking
  ticket_cap INTEGER NOT NULL DEFAULT 50,
  tickets_sold INTEGER NOT NULL DEFAULT 0,
  bus_route TEXT NOT NULL,               -- "A" or "B"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID REFERENCES houses(id),
  buyer_email TEXT NOT NULL,
  price_paid INTEGER NOT NULL,           -- cents
  qr_code TEXT NOT NULL,
  stripe_session_id TEXT,
  purchase_date TIMESTAMP DEFAULT NOW(),
  is_used BOOLEAN DEFAULT false
);

-- Settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Function to increment tickets sold
CREATE OR REPLACE FUNCTION increment_tickets_sold(house_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE houses 
  SET tickets_sold = tickets_sold + 1 
  WHERE id = house_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Houses are viewable by everyone" ON houses FOR SELECT USING (true);
CREATE POLICY "Users can insert tickets" ON tickets FOR INSERT WITH CHECK (true);
```

### 3. Sample Data

Insert sample houses and pricing:

```sql
-- Insert houses
INSERT INTO houses (name, display_name, house_type, access_code, promo_code, ticket_cap, bus_route) VALUES
('SAE', 'Sigma Alpha Epsilon', 'fraternity', 'SAE123', 'SAEPROMO', 75, 'A'),
('AEPHI', 'Alpha Epsilon Phi', 'sorority', 'AEPHI456', 'AEPHIPROMO', 60, 'B'),
('SIGEP', 'Sigma Phi Epsilon', 'fraternity', 'SIGEP789', 'SIGEPPROMO', 80, 'A'),
('PIKAPP', 'Pi Kappa Alpha', 'fraternity', 'PIKAPP101', 'PIKAPPPROMO', 70, 'B'),
('DG', 'Delta Gamma', 'sorority', 'DG202', 'DGPROMO', 65, 'A'),
('KD', 'Kappa Delta', 'sorority', 'KD303', 'KDPROMO', 55, 'B'),
('DELTACHI', 'Delta Chi', 'fraternity', 'DELTACHI404', 'DELTACHIPROMO', 75, 'A'),
('CHIO', 'Chi Omega', 'sorority', 'CHIO505', 'CHIOPROMO', 60, 'B');

-- Insert pricing configuration
INSERT INTO settings (key, value) VALUES
('pricing_config', '{
  "early_bird_deadline": "2024-08-15T23:59:59Z",
  "prices": {
    "fraternity_early": 12000,
    "fraternity_late": 14000,
    "sorority_early": 7500,
    "sorority_late": 10000
  }
}');
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## Application Flow

1. **Home Page** (`/`) - Users select their house type and specific house
2. **Code Entry** (`/[house]`) - Users enter their house-specific access code
3. **Welcome Page** (`/[house]/welcome`) - Shows house details and ticket purchase button
4. **Ticket Purchase** (`/tickets/[promo_code]`) - Users enter email and pay via Stripe
5. **Success Page** (`/success`) - Confirmation of successful purchase
6. **Admin Dashboard** (`/admin`) - View statistics and manage houses

## API Routes

- `POST /api/validate-code` - Validates house access codes
- `POST /api/create-checkout` - Creates Stripe checkout sessions
- `POST /api/webhooks/stripe` - Handles Stripe payment confirmations

## Stripe Webhook Setup

1. In your Stripe dashboard, create a webhook endpoint pointing to: `https://yourdomain.com/api/webhooks/stripe`
2. Select the `checkout.session.completed` event
3. Copy the webhook secret to your `.env` file

## Deployment

1. Deploy to Vercel, Netlify, or your preferred platform
2. Update the `NEXT_PUBLIC_URL` environment variable
3. Configure your Stripe webhook URL
4. Ensure all environment variables are set in production

## Security Notes

- Access codes should be distributed securely to house members
- The admin dashboard has no authentication - add auth for production use
- Stripe webhook signatures are verified for security
- Row Level Security is enabled on Supabase tables

## Customization

- Update house lists in `src/components/HouseSelector.tsx`
- Modify pricing in the Supabase settings table
- Customize styling with Tailwind CSS classes
- Add email notifications in the Stripe webhook handler
