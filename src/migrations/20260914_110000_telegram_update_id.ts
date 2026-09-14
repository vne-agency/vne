import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "telegram_update_id" numeric;
    CREATE UNIQUE INDEX IF NOT EXISTS "leads_telegram_update_id_idx"
      ON "leads" USING btree ("telegram_update_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "leads_telegram_update_id_idx";
    ALTER TABLE "leads" DROP COLUMN IF EXISTS "telegram_update_id";
  `)
}
