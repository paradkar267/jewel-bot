-- Add meta_phone_number_id to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS meta_phone_number_id VARCHAR;

-- Add a comment to explain what it is
COMMENT ON COLUMN shops.meta_phone_number_id IS 'The specific Meta WhatsApp Phone Number ID assigned to this shop owner';
