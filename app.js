import { createApp, createRouter, defineEventHandler } from "h3";
import { getQuery } from "ufo";
import { createServer } from "http";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to escape special characters in regex patterns
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Load CSV and process banned words
async function loadBannedWords() {
    try {
        const filePath = path.join(__dirname, "theri.csv");
        const fileContent = await readFile(filePath, "utf-8");

        const lines = fileContent.split('\n');
        const words = [];

        // Skip the header line
        for (let i = 1; i < lines.length; i++) {  // Start from index 1
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines

            // Split each line by comma, but handle quoted commas
            const values = line.split(',');
            const phrase = values[0]?.replace(/^"|"$/g, '').trim(); // Remove quotes and trim

            if (phrase) {
                words.push(phrase);
            }
        }

        return words.map(escapeRegex);

    } catch (error) {
        console.error("Error loading banned words:", error);
        return [];
    }
}

// Initial words and regex
let bannedRegex;

async function startServer() {
  const words = await loadBannedWords();

  bannedRegex = words.length > 0
    ? new RegExp(`\\b(${words.join("|")})\\b`, "gi")
    : new RegExp(`$^`, "gi");

  const app = createApp();
  const router = createRouter();

  router.get("/", defineEventHandler(() => {
    return { message: "⚡️ Tadaa!" };
  }));

  router.get("/check", defineEventHandler((event) => {
    const query = getQuery(event.node.req.url);
    const text = query.text ?? "";
    const matches = text.match(bannedRegex);

    return {
      text,
      containsProfanity: matches !== null,
      matchedWords: matches || [],
    };
  }));

  app.use(router);

  createServer(app).listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  });
}

startServer();
