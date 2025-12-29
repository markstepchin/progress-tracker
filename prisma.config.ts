import { readFileSync } from "fs";

// Load environment variables from .env.development.local if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  try {
    const envContent = readFileSync(".env.development.local", "utf8");
    const envVars = envContent.split("\n").filter((line) => line.includes("="));
    envVars.forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        process.env[key.trim()] = value.replace(/"/g, "").trim();
      }
    });
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
