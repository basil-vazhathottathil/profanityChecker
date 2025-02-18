// Import h3 as npm dependency
import { createApp, createRouter, defineEventHandler, eventHandler } from "h3";
import { getQuery } from "ufo";
import { createServer } from "http";
import { readFileSync } from "fs";
import path from "path";

// Function to escape special characters in regex patterns
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape regex special characters
}

// Load CSV and process banned words
function loadBannedWords() {
  const fileContent = readFileSync(path.join("D:/profanityCheck/theri.csv"), "utf-8");

  return fileContent
    .split("\n")
    .map((line) => line.split(",")[0]?.trim()) // Extract the first column and remove spaces
    .filter((word) => word.length > 0) // Remove empty words
    .map(escapeRegex); // Escape special characters for regex safety
}

// Initial words and regex
const words = loadBannedWords();

// Ensure regex is valid
const bannedRegex = words.length > 0  
  ? new RegExp(`(${words.join("|")})`, "gi")  
  : new RegExp(`$^`, "gi"); // Safe fallback regex (never matches)

// Create an app instance
export const app = createApp();

// Create a new router and register it in app
const router = createRouter();
app.use(router);

// Add a new route that matches GET requests to / path
router.get(
  "/",
  defineEventHandler((event) => {
    return { message: "⚡️ Tadaa!" };
  })
);

// Add a new route for checking text
router.get(
  "/check",
  defineEventHandler((event) => {
    const query = getQuery(event.node.req.url); // Get query parameters
    const text = query.text ?? "";

    const matches = text.match(bannedRegex); // Check for banned words

    return {
      text,
      containsProfanity: matches !== null, // True if any matches are found
      matchedWords: matches || [],
    };
  })
);

// Start the server
createServer(app).listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

// export default app
