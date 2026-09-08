import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`name\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`cloudflare_access_subject\` text NOT NULL;`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`users_cloudflare_access_subject_idx\` ON \`users\` (\`cloudflare_access_subject\`);`,
  )
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_token\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_expiration\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`salt\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`hash\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`login_attempts\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`lock_until\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(
    sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`,
  )
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP INDEX \`users_cloudflare_access_subject_idx\`;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`reset_password_token\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`reset_password_expiration\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`salt\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`hash\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`login_attempts\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`lock_until\` text;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`name\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`cloudflare_access_subject\`;`)
}
