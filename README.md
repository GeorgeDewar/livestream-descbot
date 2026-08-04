# livestream-descbot

<!-- Counter to bump to prevent the GitHub action being automatically disabled after 60 days of repo inactivity: 1 -->

## Introduction and status

This project automatically generates a description for live-streamed church services, based on a template. Most importantly it generates chapter markers with descriptions for parts of the service such as songs, readings, etc.

This is not built to open-source standards - it's just public so that it can be reused if useful to anyone.

## Google Cloud configuration

This assumes an app exists in Google Cloud. Our is called grace-video-description-tool. An OAuth2 client ID must be created, with http://localhost:8080 is allowed as a redirect URI. Copy that client ID into .env as YOUTUBE_CLIENT_ID, and its associated client secret as YOUTUBE_CLIENT_SECRET.

## To set up and run locally

Copy .env.example to .env. Populate your OpenAI key.

Run `node youtube-login.js` to authenticate with Youtube, and follow the steps to authorise the application to access the relevant YouTube account.
It should print a refresh token to the console. Copy this to .env.

Note that it will only get the refresh token the FIRST time you authorize the app, so if you fail to store it that time, you have to revoke the access and then try again. Since this is inconvenient, save it somewhere safe like your password manager.

Run `node index.js` to process up to 5 matching videos.

Use `--max-videos=<number>` to change that limit when working through older broadcasts, for example `node index.js --max-videos=50`.

## Running in the CI

This is set up to run on GitHub actions periodically. The variables in .env need to be set up as secrets in Actions.
