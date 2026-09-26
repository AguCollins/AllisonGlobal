-- ═══════════════════════════════════════════════════════════
--  FIX: Neon "cached plan must not change result type" error
-- ═══════════════════════════════════════════════════════════
--
--  ERROR: PostgresError { code: "0A000", message: "cached plan
--  must not change result type" }
--
--  This happens when:
--  1. The database schema was changed (TEXT → JSONB columns)
--  2. But Neon's connection pooler still has cached query plans
--     from before the schema change
--  3. The cached plans reference the old column types, causing
--     a mismatch error on every query
--
--  This script:
--  1. Runs the TEXT → JSONB migration (if not already done)
--  2. Disposes all cached plans by running DISCARD ALL
--     (Neon's pooler will re-plan queries on next connection)
--
--  Run this in your Neon SQL Editor.
--  Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════

-- ─── Step 1: Convert TEXT columns to JSONB (idempotent) ───

-- Helper: wrap a plain-text string in a TipTap JSON doc
CREATE OR REPLACE FUNCTION text_to_tiptap_doc(text_val TEXT)
RETURNS JSONB AS $$
BEGIN
    IF text_val IS NULL OR text_val = '' THEN
        RETURN '{"type":"doc","content":[]}'::jsonb;
    END IF;
    RETURN jsonb_build_object(
        'type', 'doc',
        'content', jsonb_build_array(
            jsonb_build_object(
                'type', 'paragraph',
                'content', jsonb_build_array(
                    jsonb_build_object(
                        'type', 'text',
                        'text', text_val
                    )
                )
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Category.description
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Category' AND column_name = 'description' AND data_type = 'text') THEN
        ALTER TABLE "Category" ALTER COLUMN "description" DROP NOT NULL;
        ALTER TABLE "Category" ALTER COLUMN "description" TYPE JSONB USING text_to_tiptap_doc("description"::text);
        ALTER TABLE "Category" ALTER COLUMN "description" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Category" ALTER COLUMN "description" SET NOT NULL;
    END IF;
END $$;

-- Project.description
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'description' AND data_type = 'text') THEN
        ALTER TABLE "Project" ALTER COLUMN "description" DROP NOT NULL;
        ALTER TABLE "Project" ALTER COLUMN "description" TYPE JSONB USING text_to_tiptap_doc("description"::text);
        ALTER TABLE "Project" ALTER COLUMN "description" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Project" ALTER COLUMN "description" SET NOT NULL;
    END IF;
END $$;

-- Industry.summary
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Industry' AND column_name = 'summary' AND data_type = 'text') THEN
        ALTER TABLE "Industry" ALTER COLUMN "summary" DROP NOT NULL;
        ALTER TABLE "Industry" ALTER COLUMN "summary" TYPE JSONB USING text_to_tiptap_doc("summary"::text);
        ALTER TABLE "Industry" ALTER COLUMN "summary" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Industry" ALTER COLUMN "summary" SET NOT NULL;
    END IF;
END $$;

-- Testimonial.quote
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Testimonial' AND column_name = 'quote' AND data_type = 'text') THEN
        ALTER TABLE "Testimonial" ALTER COLUMN "quote" DROP NOT NULL;
        ALTER TABLE "Testimonial" ALTER COLUMN "quote" TYPE JSONB USING text_to_tiptap_doc("quote"::text);
        ALTER TABLE "Testimonial" ALTER COLUMN "quote" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Testimonial" ALTER COLUMN "quote" SET NOT NULL;
    END IF;
END $$;

-- Faq.answer
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Faq' AND column_name = 'answer' AND data_type = 'text') THEN
        ALTER TABLE "Faq" ALTER COLUMN "answer" DROP NOT NULL;
        ALTER TABLE "Faq" ALTER COLUMN "answer" TYPE JSONB USING text_to_tiptap_doc("answer"::text);
        ALTER TABLE "Faq" ALTER COLUMN "answer" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Faq" ALTER COLUMN "answer" SET NOT NULL;
    END IF;
END $$;

-- Solution.summary + Solution.description
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Solution' AND column_name = 'summary' AND data_type = 'text') THEN
        ALTER TABLE "Solution" ALTER COLUMN "summary" DROP NOT NULL;
        ALTER TABLE "Solution" ALTER COLUMN "summary" TYPE JSONB USING text_to_tiptap_doc("summary"::text);
        ALTER TABLE "Solution" ALTER COLUMN "summary" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Solution" ALTER COLUMN "summary" SET NOT NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Solution' AND column_name = 'description' AND data_type = 'text') THEN
        ALTER TABLE "Solution" ALTER COLUMN "description" DROP NOT NULL;
        ALTER TABLE "Solution" ALTER COLUMN "description" TYPE JSONB USING text_to_tiptap_doc("description"::text);
        ALTER TABLE "Solution" ALTER COLUMN "description" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Solution" ALTER COLUMN "description" SET NOT NULL;
    END IF;
END $$;

-- Service.overview + Service.solution (if still TEXT)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Service' AND column_name = 'overview' AND data_type = 'text') THEN
        ALTER TABLE "Service" ALTER COLUMN "overview" DROP NOT NULL;
        ALTER TABLE "Service" ALTER COLUMN "overview" TYPE JSONB USING text_to_tiptap_doc("overview"::text);
        ALTER TABLE "Service" ALTER COLUMN "overview" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Service" ALTER COLUMN "overview" SET NOT NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Service' AND column_name = 'solution' AND data_type = 'text') THEN
        ALTER TABLE "Service" ALTER COLUMN "solution" DROP NOT NULL;
        ALTER TABLE "Service" ALTER COLUMN "solution" TYPE JSONB USING text_to_tiptap_doc("solution"::text);
        ALTER TABLE "Service" ALTER COLUMN "solution" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Service" ALTER COLUMN "solution" SET NOT NULL;
    END IF;
END $$;

-- ─── Step 2: Add Cloudinary columns to Media (if missing) ───

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Media' AND column_name = 'publicId') THEN
        ALTER TABLE "Media" ADD COLUMN "publicId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Media' AND column_name = 'originalUrl') THEN
        ALTER TABLE "Media" ADD COLUMN "originalUrl" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Media' AND column_name = 'format') THEN
        ALTER TABLE "Media" ADD COLUMN "format" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Media' AND column_name = 'title') THEN
        ALTER TABLE "Media" ADD COLUMN "title" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Media' AND column_name = 'folder') THEN
        ALTER TABLE "Media" ADD COLUMN "folder" TEXT NOT NULL DEFAULT 'general';
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Media_publicId_key" ON "Media"("publicId");
CREATE INDEX IF NOT EXISTS "Media_publicId_idx" ON "Media"("publicId");
CREATE INDEX IF NOT EXISTS "Media_folder_idx" ON "Media"("folder");

-- ─── Step 3: Fix navigation "home" → "/" ───

UPDATE "CompanySettings"
SET "value" = REPLACE("value"::text, '"href":"home"', '"href":"/"')::jsonb
WHERE "key" = 'navigation'
  AND "value"::text LIKE '%"href":"home"%';

-- ─── Step 4: Clear cached plans ───
-- This forces Neon's pooler to re-plan all queries on the next connection.
-- On Neon's pooled connection, DISCARD ALL is the most effective way.
DISCARD ALL;

-- ─── Step 5: Verify ───

SELECT
    'Category.description' AS column,
    data_type AS type
FROM information_schema.columns WHERE table_name = 'Category' AND column_name = 'description'
UNION ALL
SELECT 'Project.description', data_type FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'description'
UNION ALL
SELECT 'Industry.summary', data_type FROM information_schema.columns WHERE table_name = 'Industry' AND column_name = 'summary'
UNION ALL
SELECT 'Testimonial.quote', data_type FROM information_schema.columns WHERE table_name = 'Testimonial' AND column_name = 'quote'
UNION ALL
SELECT 'Faq.answer', data_type FROM information_schema.columns WHERE table_name = 'Faq' AND column_name = 'answer'
UNION ALL
SELECT 'Solution.summary', data_type FROM information_schema.columns WHERE table_name = 'Solution' AND column_name = 'summary'
UNION ALL
SELECT 'Solution.description', data_type FROM information_schema.columns WHERE table_name = 'Solution' AND column_name = 'description'
UNION ALL
SELECT 'Service.overview', data_type FROM information_schema.columns WHERE table_name = 'Service' AND column_name = 'overview'
UNION ALL
SELECT 'Service.solution', data_type FROM information_schema.columns WHERE table_name = 'Service' AND column_name = 'solution';

-- Cleanup helper
DROP FUNCTION IF EXISTS text_to_tiptap_doc(TEXT);

-- Done
SELECT 'Migration + cache clear complete' AS result;
