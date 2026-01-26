import dotenv from 'dotenv';
import {google} from 'googleapis';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
});

const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
});

youtube.liveBroadcasts.list({
    part: 'snippet,contentDetails,status',
    mine: true
}).then(response => {
    console.log('Live Broadcasts:', response.data.items);
}).catch(error => {
    console.error('Error fetching live broadcasts:', error);
});