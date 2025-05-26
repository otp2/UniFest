# UniFest Setup Guide

## Environment Variables

Your `.env` file is already configured with most values. You need to update the Stripe webhook secret:

```env
NEXT_PUBLIC_SUPABASE_URL=https://verbdhevzrtblphzbosr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcmJkaGV2enJ0YmxwaHpib3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMDk1ODksImV4cCI6MjA2Mzc4NTU4OX0.JV7CXCMWNBYRKfARk3yoodHad5a5QTKi1lu_xCwNNHQ
STRIPE_SECRET_KEY=sk_test_51RSljjFvVngTyRwMbg5ytu0JSRFP4cvD87A5AaBe4SvdYoyeLPBObq9P5lW6YFk5Nu4v0BjAzwQ5GxyE5SHNEZ0l00wS6GAWF8
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RSljjFvVngTyRwM5G1yCkybpS6DlG8G6oQBzQAHz7fK0DP3qLamodXtRKBYQ0Q4HlVbnzqaiupMEah8oU3lpz4m00tAc0pijJ
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
NEXT_PUBLIC_URL=http://localhost:3000
```

## Stripe Webhook Configuration

### 1. Get Your Webhook Secret

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint: `https://verbdhevzrtblphzbosr.supabase.co/functions/v1/stripe-webhook`
3. In the "Signing secret" section, click "Reveal" to get your webhook secret
4. Copy the secret (it starts with `whsec_`)
5. Replace `whsec_your_actual_webhook_secret_here` in your `.env` file with the actual secret

### 2. Webhook Events

Make sure your webhook is listening to these events:
- `checkout.session.completed`

### 3. For Local Development

If you want to test webhooks locally:

1. Install Stripe CLI: `npm install -g stripe-cli`
2. Login to Stripe: `stripe login`
3. Forward events to your local server: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Use the webhook secret provided by the CLI for local testing

## Database Setup

Make sure your Supabase database has these tables:

### Houses Table
```sql
CREATE TABLE houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  house_type TEXT NOT NULL CHECK (house_type IN ('fraternity', 'sorority')),
  access_code TEXT NOT NULL,
  promo_code TEXT UNIQUE NOT NULL,
  ticket_cap INTEGER NOT NULL DEFAULT 100,
  tickets_sold INTEGER NOT NULL DEFAULT 0,
  bus_route TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tickets Table
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID REFERENCES houses(id),
  buyer_email TEXT NOT NULL,
  price_paid INTEGER NOT NULL,
  qr_code TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Function
```sql
CREATE OR REPLACE FUNCTION increment_tickets_sold(house_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE houses 
  SET tickets_sold = tickets_sold + 1 
  WHERE id = house_id;
END;
$$ LANGUAGE plpgsql;
```

## Sample Data

Insert some sample houses:

```sql
INSERT INTO houses (name, display_name, house_type, access_code, promo_code, ticket_cap, bus_route) VALUES
('SAE', 'Sigma Alpha Epsilon', 'fraternity', 'SAE2024', 'SAEFEST', 150, 'Route A'),
('SIGEP', 'Sigma Phi Epsilon', 'fraternity', 'SIGEP24', 'SIGEPFEST', 150, 'Route A'),
('PIKAPP', 'Pi Kappa Alpha', 'fraternity', 'PIKE24', 'PIKEFEST', 150, 'Route B'),
('DELTACHI', 'Delta Chi', 'fraternity', 'DX2024', 'DXFEST', 150, 'Route B'),
('AEPHI', 'Alpha Epsilon Phi', 'sorority', 'AEPHI24', 'AEPHIFEST', 100, 'Route C'),
('DG', 'Delta Gamma', 'sorority', 'DG2024', 'DGFEST', 100, 'Route C'),
('KD', 'Kappa Delta', 'sorority', 'KD2024', 'KDFEST', 100, 'Route D'),
('CHIO', 'Chi Omega', 'sorority', 'CHIO24', 'CHIOFEST', 100, 'Route D');
```

Insert pricing configuration:

```sql
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

## Running the Application

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Visit `http://localhost:3000`

## Testing the Flow

1. Go to the home page and select a house
2. Enter the access code (e.g., `SAE2024` for SAE)
3. Click "Purchase Tickets" 
4. Enter an email and complete the Stripe checkout
5. Check the admin panel at `/admin` to see ticket sales

## Production Deployment

For production, update:
- `NEXT_PUBLIC_URL` to your production domain
- Use production Stripe keys
- Configure production webhook endpoint 