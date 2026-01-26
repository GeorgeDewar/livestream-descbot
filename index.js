import dotenv from 'dotenv';
import OpenAI from "openai";
import { youtube } from './youtube.js';
dotenv.config()

async function main() {
  // Get live broadcasts
  const liveBroadcasts = await youtube.liveBroadcasts.list({
    part: 'snippet,contentDetails,status',
    mine: true
  });
  
  // Find the one we're interested in (hard-coded for now)
  const broadcast = liveBroadcasts.data.items.find(item => item.id === '9qbPRexdCUo');
  if (!broadcast) {
    throw new Error('Broadcast not found');
  }

  const title = broadcast.snippet.title;
  const description = broadcast.snippet.description;

  console.log(`Found broadcast ${broadcast.id}`);
  console.log('Current Title:', title);
  console.log('Current Description:', description);

  // Get the captions for the broadcast
  console.log('Looking for captions...');
  const captions = await youtube.captions.list({
    part: 'snippet',
    videoId: broadcast.id
  });
  const servingCaptions = captions.data.items.find(item => item.snippet.status === 'serving');
  if (!servingCaptions) {
    console.debug(captions.data.items);
    throw new Error('No captions found for this broadcast');
  }
  console.log(`✅ Found ${servingCaptions.snippet.trackKind} caption track with ID: ${servingCaptions.id}`);

  console.log('Downloading captions...');
  const captionData = await youtube.captions.download({
    id: servingCaptions.id,
    tfmt: 'sbv'
  }, {responseType: 'text'});
  console.log(`✅ Captions downloaded successfully - length: ${captionData.data.length} characters`);

  const transcription = captionData.data;
  
}

main();
// const client = new OpenAI();

// const response = await client.responses.create({
//   model: "gpt-5.2",
//   input: "Write a short bedtime story about a unicorn.",
// });

// console.log(response.output_text);
