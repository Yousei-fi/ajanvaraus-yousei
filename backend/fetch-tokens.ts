/**
 * Google OAuth Token Fetcher
 *
 * HUOM: Varmista että Google Cloud Consolessa on rekisteröity redirect URI:
 * http://localhost:8090/api/oauth2/callback
 *
 * APIs & Services → Credentials → OAuth 2.0 Client IDs → Authorized redirect URIs
 */
import "dotenv/config";
import express from "express";
import open from "open";
import { google } from "googleapis";

const app = express();

const LOCAL_PORT = 8090;
const LOCAL_REDIRECT_URI = `http://localhost:${LOCAL_PORT}/api/oauth2/callback`;

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  LOCAL_REDIRECT_URI
);

const scopes = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar",
];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent",
});

console.log("Avaa tämä URL selaimessa:", authUrl);
console.log(`\nRedirect URI: ${LOCAL_REDIRECT_URI}`);
console.log("Tai odota hetki, avataan automaattisesti...\n");

app.get("/api/oauth2/callback", async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    res.send("Virhe: Ei koodia saatu.");
    return;
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("\n=== TOKENS SAATU ===\n");
    console.log("Access token:", tokens.access_token);
    console.log("Refresh token:", tokens.refresh_token);
    console.log("\nKopioi nämä .env-tiedostoon!\n");
    res.send(
      `<h1>Tokenit saatu!</h1><p>Katso konsoli tiedostoon <code>GOOGLE_ACCESS_TOKEN</code> ja <code>GOOGLE_REFRESH_TOKEN</code>.</p>`
    );
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  } catch (error) {
    console.error("Virhe tokenien haussa:", error);
    res.send("Virhe tokenien haussa. Katso konsoli.");
    setTimeout(() => {
      process.exit(1);
    }, 3000);
  }
});

app.listen(LOCAL_PORT, async () => {
  console.log(`Kuuntelen portissa ${LOCAL_PORT}...`);
  console.log(`Odotetaan callbackia osoitteessa: ${LOCAL_REDIRECT_URI}`);
  await open(authUrl);
});

