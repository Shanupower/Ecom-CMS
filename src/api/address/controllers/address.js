"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::address.address", ({ strapi }) => ({
  // Override the find method to populate the user_account relation
  async find(ctx) {
    // Extend the query to include the user_account relation
    ctx.query = {
      ...ctx.query,
      populate: ["user_account"],
    };

    // Call the default core action
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  // Override the findOne method to populate the user_account relation
  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: ["user_account"],
    };

    const { data, meta } = await super.findOne(ctx);
    return { data, meta };
  },
}));
