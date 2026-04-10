import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::speaker-page.speaker-page", {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
