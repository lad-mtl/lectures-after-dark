import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`payload_mcp_api_keys\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`label\` text,
  	\`description\` text,
  	\`speakers_find\` integer DEFAULT true,
  	\`speakers_create\` integer DEFAULT true,
  	\`speakers_update\` integer DEFAULT true,
  	\`speakers_delete\` integer DEFAULT true,
  	\`venues_find\` integer DEFAULT true,
  	\`venues_create\` integer DEFAULT true,
  	\`venues_update\` integer DEFAULT true,
  	\`venues_delete\` integer DEFAULT true,
  	\`team_members_find\` integer DEFAULT true,
  	\`team_members_create\` integer DEFAULT true,
  	\`team_members_update\` integer DEFAULT true,
  	\`team_members_delete\` integer DEFAULT true,
  	\`events_find\` integer DEFAULT true,
  	\`events_create\` integer DEFAULT true,
  	\`events_update\` integer DEFAULT true,
  	\`events_delete\` integer DEFAULT true,
  	\`instagram_posts_find\` integer DEFAULT true,
  	\`instagram_posts_create\` integer DEFAULT true,
  	\`instagram_posts_update\` integer DEFAULT true,
  	\`instagram_posts_delete\` integer DEFAULT true,
  	\`media_find\` integer DEFAULT true,
  	\`media_update\` integer DEFAULT true,
  	\`media_delete\` integer DEFAULT true,
  	\`faq_find\` integer DEFAULT true,
  	\`faq_update\` integer DEFAULT true,
  	\`speaker_page_find\` integer DEFAULT true,
  	\`speaker_page_update\` integer DEFAULT true,
  	\`venue_page_find\` integer DEFAULT true,
  	\`venue_page_update\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`enable_a_p_i_key\` integer,
  	\`api_key\` text,
  	\`api_key_index\` text,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_user_idx\` ON \`payload_mcp_api_keys\` (\`user_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_updated_at_idx\` ON \`payload_mcp_api_keys\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_mcp_api_keys_created_at_idx\` ON \`payload_mcp_api_keys\` (\`created_at\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`payload_mcp_api_keys_id\` integer REFERENCES payload_mcp_api_keys(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_payload_mcp_api_keys_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_mcp_api_keys_id\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_preferences_rels\` ADD \`payload_mcp_api_keys_id\` integer REFERENCES payload_mcp_api_keys(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_payload_mcp_api_keys_id_idx\` ON \`payload_preferences_rels\` (\`payload_mcp_api_keys_id\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`payload_mcp_api_keys\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`speakers_id\` integer,
  	\`venues_id\` integer,
  	\`team_members_id\` integer,
  	\`events_id\` integer,
  	\`instagram_posts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`speakers_id\`) REFERENCES \`speakers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`venues_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`team_members_id\`) REFERENCES \`team_members\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`events_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`instagram_posts_id\`) REFERENCES \`instagram_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "speakers_id", "venues_id", "team_members_id", "events_id", "instagram_posts_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "speakers_id", "venues_id", "team_members_id", "events_id", "instagram_posts_id" FROM \`payload_locked_documents_rels\`;`,
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
  await db.run(sql`CREATE TABLE \`__new_payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_preferences_rels\`("id", "order", "parent_id", "path", "users_id") SELECT "id", "order", "parent_id", "path", "users_id" FROM \`payload_preferences_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_preferences_rels\` RENAME TO \`payload_preferences_rels\`;`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`,
  )
}
