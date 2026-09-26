-- ═══════════════════════════════════════════════════════════
--  FIX: Navigation "Home" link pointing to /home (404)
-- ═══════════════════════════════════════════════════════════
--
--  The seed script stored "href":"home" for the Home nav item
--  instead of "href":"/". This one-line SQL fixes the existing
--  data in your Neon database.
--
--  Run this in your Neon SQL Editor:
-- ═══════════════════════════════════════════════════════════

UPDATE "CompanySettings"
SET "value" = REPLACE("value"::text, '"href":"home"', '"href":"/"')::jsonb
WHERE "key" = 'navigation'
  AND "value"::text LIKE '%"href":"home"%';
