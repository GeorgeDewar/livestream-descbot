import dotenv from 'dotenv';
import OpenAI from "openai";
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';

import { youtube } from './youtube.js';
import {truncate} from './util.js'
import {prompt} from './content.js'

dotenv.config()
dayjs.extend(timezone);
dayjs.tz.setDefault("Pacific/Auckland");
console.log(`Current time is ${dayjs().format('DD/MM/YYYY HH:mm:ss Z')}\n`);

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
  console.log('Title:', title);
  console.log('Published at:', broadcast.snippet.publishedAt);
  console.log('Description:', truncate(description.replaceAll('\n', ' '), 100));
  console.log('');
  //console.log(broadcast);

  // Get the captions for the broadcast
  // First, list the caption tracks
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

  // Download the captions
  console.log('Downloading captions...');
  const captionData = await youtube.captions.download({
    id: servingCaptions.id,
    tfmt: 'srt'
  }, {responseType: 'text'});
  console.log(`✅ Captions downloaded successfully - length: ${captionData.data.length} characters`);

  const transcription = captionData.data.replace(/^\d+$/gm, '').replace(/\n\n/g, '\n').trim();
  //console.log(transcription);
  
  const client = new OpenAI();

  // Generate chapter markers using OpenAI API
  console.log('Generating chapter markers using AI...');
  const response = await client.responses.create({
    model: "gpt-5.2",
    input: prompt + transcription,
  });
  console.log('✅ Chapter markers generated successfully:');
  console.log(response.output_text);

  // Generate title and description
  const formattedDate = dayjs(broadcast.snippet.publishedAt).format('DD/MM/YYYY');
  const newTitle = `Sunday Morning Worship - ${formattedDate}`;
  console.log('New title:', newTitle);
  const newDescription = `Welcome to our Sunday Morning worship service on ${formattedDate}.\n\n${response.output_text}\n\nPlease note: The timestamp descriptions above are automatically generated and may not always be accurate.`
  console.log('New description:', newDescription);

  // Update video with new title and description
  console.log('Updating broadcast details on YouTube...');
  await youtube.liveBroadcasts.update({
    part: 'snippet',
    requestBody: {
      id: broadcast.id,
      snippet: {
        ...broadcast.snippet,
        title: newTitle,
        description: newDescription
      }
    }
  });
  console.log('✅ Broadcast updated successfully');

  // Print a link to the video
  console.log('Check the video here: https://www.youtube.com/watch?v=' + broadcast.id);
}

main();

