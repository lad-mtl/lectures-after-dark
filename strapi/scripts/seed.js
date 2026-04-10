const fs = require("node:fs");
const path = require("node:path");
const { createStrapi, compileStrapi } = require("@strapi/strapi");

const appDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appDir, "..");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function loadApp() {
  const dirs = await compileStrapi({ appDir });
  const app = createStrapi(dirs);

  await app.load();

  return app;
}

async function seedSpeakers(strapi) {
  const speakersDir = path.join(repoRoot, "content", "speakers");
  const files = fs
    .readdirSync(speakersDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  await strapi.db.query("api::speaker.speaker").deleteMany({ where: {} });

  for (const file of files) {
    await strapi.db.query("api::speaker.speaker").create({
      data: readJson(path.join(speakersDir, file)),
    });
  }

  return files.length;
}

async function seedVenues(strapi) {
  const venuesDir = path.join(repoRoot, "content", "venues");
  const files = fs
    .readdirSync(venuesDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  await strapi.db.query("api::venue.venue").deleteMany({ where: {} });

  for (const file of files) {
    await strapi.db.query("api::venue.venue").create({
      data: readJson(path.join(venuesDir, file)),
    });
  }

  return files.length;
}

async function seedFaq(strapi) {
  const faqPath = path.join(repoRoot, "content", "faq", "faq.json");
  const data = readJson(faqPath);
  const existing = await strapi.db.query("api::faq.faq").findOne({ where: {} });

  if (existing) {
    await strapi.entityService.update("api::faq.faq", existing.id, {
      data,
    });

    return "updated";
  }

  await strapi.entityService.create("api::faq.faq", {
    data,
  });
  return "created";
}

async function seedSpeakerPage(strapi) {
  const speakerPagePath = path.join(repoRoot, "content", "speaker-page", "speaker-page.json");
  const data = readJson(speakerPagePath);
  const existing = await strapi.db
    .query("api::speaker-page.speaker-page")
    .findOne({ where: {} });

  if (existing) {
    await strapi.entityService.update("api::speaker-page.speaker-page", existing.id, {
      data,
    });

    return "updated";
  }

  await strapi.entityService.create("api::speaker-page.speaker-page", {
    data,
  });
  return "created";
}

async function seedVenuePage(strapi) {
  const venuePagePath = path.join(repoRoot, "content", "venue-page", "venue-page.json");
  const data = readJson(venuePagePath);
  const existing = await strapi.db
    .query("api::venue-page.venue-page")
    .findOne({ where: {} });

  if (existing) {
    await strapi.entityService.update("api::venue-page.venue-page", existing.id, {
      data,
    });

    return "updated";
  }

  await strapi.entityService.create("api::venue-page.venue-page", {
    data,
  });
  return "created";
}

async function seedTeamMembers(strapi) {
  const teamMembersDir = path.join(repoRoot, "content", "team-members");
  const files = fs.existsSync(teamMembersDir)
    ? fs
        .readdirSync(teamMembersDir)
        .filter((file) => file.endsWith(".json"))
        .sort()
    : [];

  await strapi.db.query("api::team-member.team-member").deleteMany({ where: {} });

  for (const file of files) {
    await strapi.db.query("api::team-member.team-member").create({
      data: readJson(path.join(teamMembersDir, file)),
    });
  }

  return files.length;
}

async function main() {
  const strapi = await loadApp();

  try {
    const speakers = await seedSpeakers(strapi);
    const venues = await seedVenues(strapi);
    const faq = await seedFaq(strapi);
    const speakerPage = await seedSpeakerPage(strapi);
    const venuePage = await seedVenuePage(strapi);
    const teamMembers = await seedTeamMembers(strapi);

    console.log(
      JSON.stringify(
        {
          speakers,
          venues,
          faq,
          speakerPage,
          venuePage,
          teamMembers,
        },
        null,
        2,
      ),
    );
  } finally {
    await strapi.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
