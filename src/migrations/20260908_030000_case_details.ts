import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "cases"
      ADD COLUMN IF NOT EXISTS "order" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "project_name" varchar,
      ADD COLUMN IF NOT EXISTS "website_url" varchar,
      ADD COLUMN IF NOT EXISTS "allow_embed" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "mockup_id" integer CONSTRAINT "cases_mockup_id_media_id_fk" REFERENCES "media"("id") ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS "service_tags" varchar;
    ALTER TABLE "_cases_v"
      ADD COLUMN IF NOT EXISTS "version_order" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "version_project_name" varchar,
      ADD COLUMN IF NOT EXISTS "version_website_url" varchar,
      ADD COLUMN IF NOT EXISTS "version_allow_embed" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "version_mockup_id" integer CONSTRAINT "_cases_v_version_mockup_id_media_id_fk" REFERENCES "media"("id") ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS "version_service_tags" varchar;
    CREATE INDEX IF NOT EXISTS "cases_mockup_idx" ON "cases" ("mockup_id");
    CREATE INDEX IF NOT EXISTS "_cases_v_version_version_mockup_idx" ON "_cases_v" ("version_mockup_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "cases_mockup_idx";
    DROP INDEX IF EXISTS "_cases_v_version_version_mockup_idx";
    ALTER TABLE "cases"
      DROP COLUMN IF EXISTS "project_name",
      DROP COLUMN IF EXISTS "website_url",
      DROP COLUMN IF EXISTS "allow_embed",
      DROP COLUMN IF EXISTS "mockup_id",
      DROP COLUMN IF EXISTS "service_tags";
    ALTER TABLE "_cases_v"
      DROP COLUMN IF EXISTS "version_project_name",
      DROP COLUMN IF EXISTS "version_website_url",
      DROP COLUMN IF EXISTS "version_allow_embed",
      DROP COLUMN IF EXISTS "version_mockup_id",
      DROP COLUMN IF EXISTS "version_service_tags";
  `)
}
