import dotenv from "dotenv";
import { google } from "googleapis";
import crypto from "crypto";
import express from "express";
import session from "express-session";
import url from "url";
import { checkEnv } from "./util.js";

dotenv.config();
checkEnv("YOUTUBE_CLIENT_ID");
checkEnv("YOUTUBE_CLIENT_SECRET");
checkEnv("YOUTUBE_REDIRECT_URL");

const app = express();
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  }),
);

// Initialise the OAuth2 client with credentials from the .env file (supplied by dotenv)
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URL,
);

// Generate a secure random state value.
const state = crypto.randomBytes(32).toString("hex");

// Generate a url that asks permissions for YouTube scopes
const authorizationUrl = oauth2Client.generateAuthUrl({
  // Offline, so we get a refresh token
  access_type: "offline",
  // See, edit, and permanently delete your YouTube videos, ratings, comments and captions
  scope: "https://www.googleapis.com/auth/youtube.force-ssl",
  // Enable incremental authorization. Recommended as a best practice.
  include_granted_scopes: true,
  // Include the state parameter to reduce the risk of CSRF attacks.
  state: state,
});

console.log("Authorize this app by visiting this url:", authorizationUrl);

// Receive the callback from Google's OAuth 2.0 server.
app.get("/", async (req, res) => {
  let q = url.parse(req.url, true).query;

  if (q.error) {
    // An error response e.g. error=access_denied
    console.log("Error:" + q.error);
  } else if (q.state !== state) {
    //check state value
    console.log("State mismatch. Possible CSRF attack");
    res.end("State mismatch. Possible CSRF attack");
  } else {
    // Get access and refresh tokens
    let { tokens } = await oauth2Client.getToken(q.code);
    oauth2Client.setCredentials(tokens);
    console.log(tokens);
  }
});

oauth2Client.on("tokens", (tokens) => {
  if (tokens.refresh_token) {
    // Print the refresh token
    console.log("Refresh token:", tokens.refresh_token);
  }
  console.log("Access token:", tokens.access_token);
});

app.listen(8080, () => {
  console.log(`App listening on port 8080`);
});
