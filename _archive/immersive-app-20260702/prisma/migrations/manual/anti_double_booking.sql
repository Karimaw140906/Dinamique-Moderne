CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS date_range daterange
  GENERATED ALWAYS AS (daterange("checkIn"::date, "checkOut"::date, '[)')) STORED;

ALTER TABLE bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    "listingId" WITH =,
    date_range WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED'));
