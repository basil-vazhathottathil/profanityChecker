import { Hono } from 'hono';

const CSV_URL = "https://raw.githubusercontent.com/basil-vazhathottathil/profanityChecker/dev/theri.csv";

// Function to escape regex special characters
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Load banned words from CSV file
async function loadBannedWords() {
  try {
    console.log("📥 Fetching CSV file...");
    const response = await fetch(CSV_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const fileContent = await response.text();
    console.log("📄 CSV file content received!");

    const lines = fileContent.split("\n");
    const words = [];

    for (let i = 1; i < lines.length; i++) { // Skip header
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",");
      const phrase = values[0]?.replace(/^"|"$/g, "").trim(); // Remove quotes

      if (phrase) words.push(escapeRegex(phrase));
    }

    console.log("✅ Banned words loaded:", words);
    return words;
  } catch (error) {
    console.error("❌ Error loading banned words:", error);
    return [];
  }
}

// Initialize Hono app
const app = new Hono();
let bannedRegex = new RegExp(`$^`, "gi"); // Default: match nothing

// Ensure `bannedRegex` is ready before handling requests
async function initProfanityFilter() {
  const words = await loadBannedWords();
  if (words.length > 0) {
    bannedRegex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
    console.log("🚀 Profanity filter initialized with regex:", bannedRegex);
  } else {
    console.log("⚠️ No banned words loaded!");
  }
}

app.get("/", (c) => c.json({ message: "⚡️ Tadaa!" }));

// Profanity check route
app.get("/check", async (c) => {  
  if (!bannedRegex || bannedRegex.source === `(?:)`) {
    return c.json({ error: "Profanity filter not initialized yet!" });
  }

  const text = c.req.query("text") || "";
  console.log("🔎 Checking text:", text);

  const matches = text.match(bannedRegex);
  console.log("🔎 Matches found:", matches);

  return c.json({
    text,
    containsProfanity: matches !== null,
    matchedWords: matches || [],
  });
});

// 🚀 Initialize before exporting
await initProfanityFilter();
export default app;
