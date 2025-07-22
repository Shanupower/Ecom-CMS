"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const user_account = require("../routes/user-account");
const { sanitizeEntity } = require("@strapi/utils");
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::user-account.user-account",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const { name, email, phone, password, age } = ctx.request.body;

        if (!email || email.trim() === "") {
          return ctx.badRequest("Email is required");
        }

        if (!password || password.trim() === "") {
          return ctx.badRequest("Password is required");
        }

        // ✅ Check if email already exists
        const existingUser = await strapi.entityService.findMany(
          "api::user-account.user-account",
          {
            filters: { email },
            limit: 1, // Only fetch one user
          }
        );

        if (existingUser.length > 0) {
          return ctx.badRequest("Email already exists");
        }

        // ✅ Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Save user with hashed password
        const user = await strapi.entityService.create(
          "api::user-account.user-account",
          {
            data: {
              name,
              email,
              phone,
              password: hashedPassword,
              age,
            },
          }
        );

        return ctx.send({ message: "User created successfully", user });
      } catch (error) {
        return ctx.badRequest(error.message || "Something went wrong");
      }
    },

    async login(ctx) {
      try {
        const { email, password } = ctx.request.body;

        // Find user
        const user = await strapi
          .query("api::user-account.user-account")
          .findOne({ where: { email } });
        if (!user) {
          return ctx.badRequest("Invalid email or password");
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return ctx.badRequest("Invalid email or password");
        }

        // Check if email is verified
        if (!user.verified) {
          return ctx.badRequest(
            "Email not verified. Please verify your email before logging in."
          );
        }

        // Generate JWT Token
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

        return ctx.send({ message: "Login successful", user, token });
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
   async updatePassword(ctx) {
  try {
    const { documentId, password } = ctx.request.body;

    // Validate inputs
    if (!documentId) {
      return ctx.badRequest("Document id is required");
    }
    if (!password || password.trim() === "") {
      return ctx.badRequest("Password is required");
    }

    // Find user using the documentId field
    const users = await strapi.entityService.findMany(
      "api::user-account.user-account",
      {
        filters: { documentId },
        limit: 1, // we expect a single user
      }
    );

    if (!users || users.length === 0) {
      return ctx.notFound("User not found");
    }

    const user = users[0];

    // Encrypt the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password using the primary key (user.id)
    const updatedUser = await strapi.entityService.update(
      "api::user-account.user-account",
      user.id,
      {
        data: { password: hashedPassword },
      }
    );

    return ctx.send({
      message: "Password updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return ctx.badRequest(error.message || "Something went wrong");
  }
},
})
);
