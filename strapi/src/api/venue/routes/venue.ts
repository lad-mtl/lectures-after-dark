import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::venue.venue", {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
