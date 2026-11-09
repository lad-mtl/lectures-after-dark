import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

// Source-only additive migration. Applying it requires a separately approved CMS deployment.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE topics (
    id integer PRIMARY KEY NOT NULL,
    title text NOT NULL,
    source_url text NOT NULL,
    category text,
    description text,
    updated_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    created_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE UNIQUE INDEX topics_source_url_idx ON topics (source_url);`)
  await db.run(sql`CREATE INDEX topics_updated_at_idx ON topics (updated_at);`)
  await db.run(sql`CREATE INDEX topics_created_at_idx ON topics (created_at);`)
  await db.run(sql`ALTER TABLE payload_locked_documents_rels ADD topics_id integer REFERENCES topics(id) ON DELETE cascade;`)
  await db.run(sql`CREATE INDEX payload_locked_documents_rels_topics_id_idx ON payload_locked_documents_rels (topics_id);`)
  await db.run(sql`ALTER TABLE speakers ADD image_credit text;`)
  await db.run(sql`ALTER TABLE team_members ADD image_credit text;`)
  await db.run(sql`ALTER TABLE events ADD description text;`)
  await db.run(sql`ALTER TABLE events ADD topic text;`)
  await db.run(sql`ALTER TABLE events ADD recording_url text;`)
  await db.run(sql`ALTER TABLE events ADD resources_url text;`)
  await db.run(sql`ALTER TABLE events ADD speaker_ids text;`)
  await db.run(sql`ALTER TABLE events ADD speaker_names text;`)
  await db.run(sql`ALTER TABLE events ADD gallery text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX payload_locked_documents_rels_topics_id_idx;`)
  await db.run(sql`ALTER TABLE payload_locked_documents_rels DROP COLUMN topics_id;`)
  await db.run(sql`DROP TABLE topics;`)
  await db.run(sql`ALTER TABLE speakers DROP COLUMN image_credit;`)
  await db.run(sql`ALTER TABLE team_members DROP COLUMN image_credit;`)
  await db.run(sql`ALTER TABLE events DROP COLUMN description;`)
  await db.run(sql`ALTER TABLE events DROP COLUMN topic;`)
  await db.run(sql`ALTER TABLE events DROP COLUMN recording_url;`)
  await db.run(sql`ALTER TABLE events DROP COLUMN resources_url;`)
  await db.run(sql`ALTER TABLE events DROP COLUMN speaker_ids;`)
  await db.run(sql`ALTER TABLE events DROP COLUMN speaker_names;`)
  await db.run(sql`ALTER TABLE events DROP COLUMN gallery;`)
}
