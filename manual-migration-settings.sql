-- Manual Migration: Add Settings Table
-- Run this SQL directly in your Supabase SQL editor

-- Create Settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- Create unique index on key
CREATE UNIQUE INDEX IF NOT EXISTS "Settings_key_key" ON "Settings"("key");

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "Settings_key_idx" ON "Settings"("key");

-- Add update trigger for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_settings_updated_at') THEN
        CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON "Settings"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Insert default donation methods (optional - you can skip this if you prefer to set via admin)
INSERT INTO "Settings" ("id", "key", "value")
VALUES (
    gen_random_uuid()::text,
    'donation_methods',
    '[
        {
            "id": "buymeacoffee",
            "name": "Buy Me a Coffee",
            "url": "https://buymeacoffee.com/thewordsrecord",
            "icon": "☕",
            "description": "Quick and easy one-time support",
            "isActive": true,
            "displayOrder": 1
        },
        {
            "id": "stripe",
            "name": "Stripe",
            "url": "#stripe",
            "icon": "💳",
            "description": "Secure recurring or one-time donations",
            "isActive": false,
            "displayOrder": 2
        },
        {
            "id": "paypal",
            "name": "PayPal",
            "url": "#paypal",
            "icon": "💰",
            "description": "Trusted worldwide payment platform",
            "isActive": false,
            "displayOrder": 3
        }
    ]'::jsonb
)
ON CONFLICT ("key") DO NOTHING;

-- Verify the table was created
SELECT 'Settings table created successfully' AS status;