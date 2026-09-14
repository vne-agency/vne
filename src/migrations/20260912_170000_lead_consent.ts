import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "consent_evidence" jsonb;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "leads" DROP COLUMN IF EXISTS "consent_evidence";`)
}
