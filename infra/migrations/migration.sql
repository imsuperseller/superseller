BEGIN TRANSACTION;

-- Rename 'ListingTitle' to 'title'
ALTER TABLE data_table_user_lOkdHmJ3IHnz4cPR RENAME COLUMN ListingTitle TO title;

-- Rename 'ListingDescription' to 'description'
ALTER TABLE data_table_user_lOkdHmJ3IHnz4cPR RENAME COLUMN ListingDescription TO description;

-- Rename 'ListingPrice' to 'price'
ALTER TABLE data_table_user_lOkdHmJ3IHnz4cPR RENAME COLUMN ListingPrice TO price;

-- Rename 'PhoneNumber' to 'phone'
ALTER TABLE data_table_user_lOkdHmJ3IHnz4cPR RENAME COLUMN PhoneNumber TO phone;

-- Rename 'Location' to 'location'
-- Note: 'Location' might be a keyword or existing column in some contexts, so quoting just in case.
ALTER TABLE data_table_user_lOkdHmJ3IHnz4cPR RENAME COLUMN Location TO location;
-- Rename 'Image_URL' to 'image_url' (optional but good for consistency)
ALTER TABLE data_table_user_lOkdHmJ3IHnz4cPR RENAME COLUMN Image_URL TO image_url;

COMMIT;
