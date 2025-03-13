import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import fetch from 'node-fetch'; // Import node-fetch

const CSV_URL = "https://raw.githubusercontent.com/basil-vazhathottathil/profanityChecker/refs/heads/main/cleaned_theri.csv";

// Function to escape regex special characters
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Load banned words from CSV file
async function loadBannedWords() {
  try {
    const response = await fetch(CSV_URL);
    const fileContent = await response.text();

    const lines = fileContent.split("\n");
    const words = [];

    for (let i = 1; i < lines.length; i++) { // Skip header
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",");
      const phrase = values[0]?.replace(/^"|"$/g, "").trim(); // Remove quotes

      if (phrase) words.push(escapeRegex(phrase));
    }

    return words;

  } catch (error) {
    console.error("Error loading banned words:", error);
    return [];
  }
}

// Initialize Hono app
const app = new Hono();
let bannedRegex;

// Load words and set up regex before starting the server
async function initProfanityFilter() {
  const words = await loadBannedWords();
  bannedRegex = words.length > 0 ? new RegExp(`\\b(${words.join("|")})\\b`, "gi") : new RegExp(`$^`, "gi");
}

// Root route
app.get("/", (c) => c.json({ message: "⚡️ Tadaa!" }));

// Profanity check route
app.get("/check", async (c) => {
  const text = c.req.query("text") || "";
  const matches = text.match(bannedRegex);

  return c.json({
    text,
    containsProfanity: matches !== null,
    matchedWords: matches || [],
  });
});

// Start server after loading profanity words
initProfanityFilter().then(() => {
  serve({
    fetch: app.fetch,
    port: 3000,
  });
  console.log("Server running at http://localhost:3000");
});