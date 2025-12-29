const { defineConfig } = require("prisma/config");

// Load environment variables
if (!process.env.DATABASE_URL) {
  require("dotenv").config({ path: ".env.development.local" });
}

module.exports = defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
