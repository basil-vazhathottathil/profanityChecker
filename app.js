// Import h3 as npm dependency
import { createApp, createRouter, defineEventHandler, eventHandler } from "h3";
import { getQuery } from "ufo";
import { createServer } from "http";

const words = ["myre", "poori", "thayoli"]
const bannedRegex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  

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
    const text = (query.text ?? "" )
    const matches = text.match(bannedRegex); // => ['a', 'e']

    return { text,
        containsProfanity: matches !== null, // True if any matches are found
        matchedWords: matches || [] };
  })
);

// Start the server
createServer(app).listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

// export default app