-- ============================================
-- HR Module Enhancement Migration
-- Run this as PostgreSQL superuser or database owner
-- ============================================

-- Add new columns to Candidate table
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'Direct';
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "rating" INTEGER DEFAULT 0;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "interviewDate" TIMESTAMP;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "interviewers" TEXT[] DEFAULT '{}';

-- Add new columns to JobPosting table  
ALTER TABLE "JobPosting" ADD COLUMN IF NOT EXISTS "salary" TEXT DEFAULT 'Competitive';
ALTER TABLE "JobPosting" ADD COLUMN IF NOT EXISTS "experience" TEXT DEFAULT '2-5 years';
ALTER TABLE "JobPosting" ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT '{}';
ALTER TABLE "JobPosting" ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Candidate_source_idx" ON "Candidate"("source");
CREATE INDEX IF NOT EXISTS "Candidate_rating_idx" ON "Candidate"("rating");
CREATE INDEX IF NOT EXISTS "JobPosting_views_idx" ON "JobPosting"("views");

-- Update existing candidates with sample data
UPDATE "Candidate" SET 
  "source" = CASE 
    WHEN id % 4 = 0 THEN 'LinkedIn'
    WHEN id % 4 = 1 THEN 'Indeed'
    WHEN id % 4 = 2 THEN 'Referral'
    ELSE 'Website'
  END,
  "rating" = CASE 
    WHEN stage = 'hired' THEN 5
    WHEN stage = 'offer' THEN 4
    WHEN stage = 'interview' THEN 3
    WHEN stage = 'screening' THEN 2
    ELSE 1
  END,
  "phone" = '+1-555-' || LPAD((1000 + id)::TEXT, 4, '0')
WHERE "deletedAt" IS NULL;

-- Update existing job postings with sample data
UPDATE "JobPosting" SET 
  "salary" = CASE 
    WHEN title LIKE '%Senior%' THEN '$120K - $150K'
    WHEN title LIKE '%Manager%' THEN '$100K - $130K'
    ELSE '$70K - $90K'
  END,
  "experience" = CASE 
    WHEN title LIKE '%Senior%' THEN '5+ years'
    WHEN title LIKE '%Manager%' THEN '3-5 years'
    ELSE '2-4 years'
  END,
  "skills" = CASE 
    WHEN department = 'Engineering' THEN ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript']
    WHEN department = 'Product' THEN ARRAY['Product Strategy', 'Roadmapping', 'Agile']
    WHEN department = 'Design' THEN ARRAY['Figma', 'UI/UX', 'Prototyping']
    WHEN department = 'Sales' THEN ARRAY['CRM', 'Lead Generation', 'Communication']
    ELSE ARRAY['Communication', 'Teamwork']
  END,
  "views" = (RANDOM() * 500)::INTEGER
WHERE "deletedAt" IS NULL;

-- Verify changes
SELECT 'Candidate columns added' AS status, COUNT(*) AS total_candidates FROM "Candidate";
SELECT 'JobPosting columns added' AS status, COUNT(*) AS total_jobs FROM "JobPosting";

COMMIT;
