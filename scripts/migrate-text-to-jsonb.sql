-- ═══════════════════════════════════════════════════════════
--  MIGRATION: Convert TEXT columns to JSONB for TipTap content
-- ═══════════════════════════════════════════════════════════
--
--  The Prisma schema was updated to store rich-text content as
--  JSONB (TipTap docs) instead of TEXT. This migration:
--  1. Converts existing TEXT values to TipTap JSON doc format
--  2. Changes the column type from TEXT to JSONB
--
--  Run this in your Neon SQL Editor AFTER deploying the new code.
--  Safe to run multiple times (uses IF EXISTS checks).
-- ═══════════════════════════════════════════════════════════

-- Helper: wrap a plain-text string in a TipTap JSON doc
-- Returns: {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"..."}]}]}
CREATE OR REPLACE FUNCTION text_to_tiptap_doc(text_val TEXT)
RETURNS JSONB AS $$
BEGIN
    IF text_val IS NULL OR text_val = '' THEN
        RETURN '{"type":"doc","content":[]}'::jsonb;
    END IF;
    -- Escape single quotes and backslashes for JSON
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

-- ─── Category.description ───
ALTER TABLE "Category" ALTER COLUMN "description" DROP NOT NULL;
ALTER TABLE "Category" ALTER COLUMN "description" TYPE JSONB USING text_to_tiptap_doc("description"::text);
ALTER TABLE "Category" ALTER COLUMN "description" SET DEFAULT '{}'::jsonb;
ALTER TABLE "Category" ALTER COLUMN "description" SET NOT NULL;

-- ─── Project.description ───
ALTER TABLE "Project" ALTER COLUMN "description" DROP NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "description" TYPE JSONB USING text_to_tiptap_doc("description"::text);
ALTER TABLE "Project" ALTER COLUMN "description" SET DEFAULT '{}'::jsonb;
ALTER TABLE "Project" ALTER COLUMN "description" SET NOT NULL;

-- ─── Industry.summary ───
ALTER TABLE "Industry" ALTER COLUMN "summary" DROP NOT NULL;
ALTER TABLE "Industry" ALTER COLUMN "summary" TYPE JSONB USING text_to_tiptap_doc("summary"::text);
ALTER TABLE "Industry" ALTER COLUMN "summary" SET DEFAULT '{}'::jsonb;
ALTER TABLE "Industry" ALTER COLUMN "summary" SET NOT NULL;

-- ─── Testimonial.quote ───
ALTER TABLE "Testimonial" ALTER COLUMN "quote" DROP NOT NULL;
ALTER TABLE "Testimonial" ALTER COLUMN "quote" TYPE JSONB USING text_to_tiptap_doc("quote"::text);
ALTER TABLE "Testimonial" ALTER COLUMN "quote" SET DEFAULT '{}'::jsonb;
ALTER TABLE "Testimonial" ALTER COLUMN "quote" SET NOT NULL;

-- ─── Faq.answer ───
ALTER TABLE "Faq" ALTER COLUMN "answer" DROP NOT NULL;
ALTER TABLE "Faq" ALTER COLUMN "answer" TYPE JSONB USING text_to_tiptap_doc("answer"::text);
ALTER TABLE "Faq" ALTER COLUMN "answer" SET DEFAULT '{}'::jsonb;
ALTER TABLE "Faq" ALTER COLUMN "answer" SET NOT NULL;

-- ─── Solution.summary ───
ALTER TABLE "Solution" ALTER COLUMN "summary" DROP NOT NULL;
ALTER TABLE "Solution" ALTER COLUMN "summary" TYPE JSONB USING text_to_tiptap_doc("summary"::text);
ALTER TABLE "Solution" ALTER COLUMN "summary" SET DEFAULT '{}'::jsonb;
ALTER TABLE "Solution" ALTER COLUMN "summary" SET NOT NULL;

-- ─── Solution.description ───
ALTER TABLE "Solution" ALTER COLUMN "description" DROP NOT NULL;
ALTER TABLE "Solution" ALTER COLUMN "description" TYPE JSONB USING text_to_tiptap_doc("description"::text);
ALTER TABLE "Solution" ALTER COLUMN "description" SET DEFAULT '{}'::jsonb;
ALTER TABLE "Solution" ALTER COLUMN "description" SET NOT NULL;

-- ─── Service.overview (if still TEXT) ───
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Service' AND column_name = 'overview' AND data_type = 'text'
    ) THEN
        ALTER TABLE "Service" ALTER COLUMN "overview" DROP NOT NULL;
        ALTER TABLE "Service" ALTER COLUMN "overview" TYPE JSONB USING text_to_tiptap_doc("overview"::text);
        ALTER TABLE "Service" ALTER COLUMN "overview" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Service" ALTER COLUMN "overview" SET NOT NULL;
    END IF;
END $$;

-- ─── Service.solution (if still TEXT) ───
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Service' AND column_name = 'solution' AND data_type = 'text'
    ) THEN
        ALTER TABLE "Service" ALTER COLUMN "solution" DROP NOT NULL;
        ALTER TABLE "Service" ALTER COLUMN "solution" TYPE JSONB USING text_to_tiptap_doc("solution"::text);
        ALTER TABLE "Service" ALTER COLUMN "solution" SET DEFAULT '{}'::jsonb;
        ALTER TABLE "Service" ALTER COLUMN "solution" SET NOT NULL;
    END IF;
END $$;

-- ─── Media table: add new Cloudinary columns (if not exists) ───
DO $$
BEGIN
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

-- Create unique index on publicId if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "Media_publicId_key" ON "Media"("publicId");
CREATE INDEX IF NOT EXISTS "Media_publicId_idx" ON "Media"("publicId");
CREATE INDEX IF NOT EXISTS "Media_folder_idx" ON "Media"("folder");

-- Cleanup helper function
DROP FUNCTION IF EXISTS text_to_tiptap_doc(TEXT);

-- Done
SELECT 'Migration complete — all TEXT columns converted to JSONB with TipTap doc format' AS result;
