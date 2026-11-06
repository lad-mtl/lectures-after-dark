import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`speakers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`topic\` text,
  	\`bio\` text,
  	\`image\` text,
  	\`twitter\` text,
  	\`linkedin\` text,
  	\`website\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`speakers_order_idx\` ON \`speakers\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`speakers_updated_at_idx\` ON \`speakers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`speakers_created_at_idx\` ON \`speakers\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`venues\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`neighborhood\` text NOT NULL,
  	\`description\` text,
  	\`image_url\` text,
  	\`maps_link\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_order_idx\` ON \`venues\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`venues_updated_at_idx\` ON \`venues\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`venues_created_at_idx\` ON \`venues\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`team_members\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`image\` text,
  	\`link_url\` text,
  	\`link_text\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`team_members_order_idx\` ON \`team_members\` (\`order\`);`)
  await db.run(
    sql`CREATE INDEX \`team_members_updated_at_idx\` ON \`team_members\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`team_members_created_at_idx\` ON \`team_members\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE TABLE \`events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`starts_at\` text NOT NULL,
  	\`location_label\` text,
  	\`price_label\` text,
  	\`image_url\` text,
  	\`eventbrite_url\` text NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`events_starts_at_idx\` ON \`events\` (\`starts_at\`);`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`events_eventbrite_url_idx\` ON \`events\` (\`eventbrite_url\`);`,
  )
  await db.run(sql`CREATE INDEX \`events_updated_at_idx\` ON \`events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`events_created_at_idx\` ON \`events\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`instagram_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`instagram_id\` text,
  	\`caption\` text,
  	\`image_url\` text NOT NULL,
  	\`media_type\` text,
  	\`permalink\` text NOT NULL,
  	\`timestamp\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`instagram_posts_instagram_id_idx\` ON \`instagram_posts\` (\`instagram_id\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX \`instagram_posts_permalink_idx\` ON \`instagram_posts\` (\`permalink\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`instagram_posts_timestamp_idx\` ON \`instagram_posts\` (\`timestamp\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`instagram_posts_updated_at_idx\` ON \`instagram_posts\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`instagram_posts_created_at_idx\` ON \`instagram_posts\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE TABLE \`faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`faq_items_order_idx\` ON \`faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`faq_items_parent_id_idx\` ON \`faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`faq\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`speaker_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cta_title\` text,
  	\`cta_description\` text,
  	\`cta_button_text\` text,
  	\`cta_button_link\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`venue_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cta_title\` text,
  	\`cta_description\` text,
  	\`cta_button_text\` text,
  	\`cta_button_link\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`speakers_id\` integer REFERENCES speakers(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`venues_id\` integer REFERENCES venues(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`team_members_id\` integer REFERENCES team_members(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`events_id\` integer REFERENCES events(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`instagram_posts_id\` integer REFERENCES instagram_posts(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_speakers_id_idx\` ON \`payload_locked_documents_rels\` (\`speakers_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_venues_id_idx\` ON \`payload_locked_documents_rels\` (\`venues_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_team_members_id_idx\` ON \`payload_locked_documents_rels\` (\`team_members_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_instagram_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`instagram_posts_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`speakers\`;`)
  await db.run(sql`DROP TABLE \`venues\`;`)
  await db.run(sql`DROP TABLE \`team_members\`;`)
  await db.run(sql`DROP TABLE \`events\`;`)
  await db.run(sql`DROP TABLE \`instagram_posts\`;`)
  await db.run(sql`DROP TABLE \`faq_items\`;`)
  await db.run(sql`DROP TABLE \`faq\`;`)
  await db.run(sql`DROP TABLE \`speaker_page\`;`)
  await db.run(sql`DROP TABLE \`venue_page\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
}
