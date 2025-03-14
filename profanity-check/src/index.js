import { Hono } from 'hono';

const CSV_URL = "https://raw.githubusercontent.com/basil-vazhathottathil/profanityChecker/main/theri.csv";

// Function to escape regex special characters
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Initialize Hono app and regex
const app = new Hono();
let bannedRegex;

// Load banned words from CSV file
async function loadBannedWords() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    const fileContent = await response.text();
    const lines = fileContent.split("\n");
    const words = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(",");
      const phrase = values[0]?.replace(/^"|"$/g, "").trim();
      if (phrase) words.push(escapeRegex(phrase));
    }
    return words;
  } catch (error) {
    console.error("Error loading banned words:", error);
    return [];
  }
}

// Initialize the regex pattern
async function initRegex() {
  const words = await loadBannedWords();
  bannedRegex = words.length > 0 
    ? new RegExp(`\\b(${words.join("|")})\\b`, "gi") 
    : new RegExp(`$^`, "gi");
}

app.get("/", (c) => c.json({ message: "⚡️ Profanity Checker Active!" }));

app.get("/check", async (c) => {
  // Initialize regex if not already done
  if (!bannedRegex) {
    await initRegex();
  }

  const text = c.req.query("text") || "";
  const matches = text.match(bannedRegex);

  return c.json({
    text,
    containsProfanity: matches !== null,
    matchedWords: matches || [],
  });
});

// Export the app for Cloudflare Workers
export default {
  fetch: app.fetch,
};
