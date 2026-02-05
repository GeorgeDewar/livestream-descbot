import dotenv from "dotenv";
import { google } from "googleapis";
import crypto from "crypto";
import express from "express";
import session from "express-session";
import url from "url";

dotenv.config();

const app = express();
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  }),
);

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URL,
);

// Access scopes for YouTube API
const scopes = ["https://www.googleapis.com/auth/youtube.force-ssl"];

// Generate a secure random state value.
const state = crypto.randomBytes(32).toString("hex");

// Generate a url that asks permissions for YouTube scopes
const authorizationUrl = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: "offline",
  /** Pass in the scopes array defined above.
   * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
  scope: scopes,
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
    // Get access and refresh tokens (if access_type is offline)

    let { tokens } = await oauth2Client.getToken(q.code);
    oauth2Client.setCredentials(tokens);
    console.log(tokens);
  }
});

oauth2Client.on("tokens", (tokens) => {
  if (tokens.refresh_token) {
    // store the refresh_token in my database!
    console.log("Refresh token:", tokens.refresh_token);
  }
  console.log("Access token:", tokens.access_token);
});

app.listen(8080, () => {
  console.log(`App listening on port 8080`);
});
