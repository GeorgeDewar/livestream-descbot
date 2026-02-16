import dotenv from "dotenv";
import OpenAI from "openai";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { writeFileSync } from "node:fs";

import { youtube } from "./youtube.js";
import { checkEnv, truncate } from "./util.js";
import { prompt } from "./content.js";

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);

checkEnv("OPENAI_API_KEY");
checkEnv("YOUTUBE_CLIENT_ID");
checkEnv("YOUTUBE_CLIENT_SECRET");
checkEnv("YOUTUBE_REFRESH_TOKEN");

const TIMEZONE = "Pacific/Auckland";
console.log(`Current time is ${dayjs().tz(TIMEZONE).format("DD/MM/YYYY HH:mm:ss Z")}\n`);

// If the video has this exact title, and the description ends with this, we can assume it hasn't been processed yet.
const DEFAULT_TITLE = "Sunday Morning Worship";
const DEFAULT_DESCRIPTION_END = "Welcome to worship this morning.";

const userArgs = process.argv.slice(2);
const options = {
  showCaptions: userArgs.includes("--show-captions"),
  dryRun: userArgs.includes("--dry-run"),
  id: userArgs.find((arg) => arg.startsWith("--id="))?.split("=")[1],
  debug: userArgs.includes("--debug"),
}

async function main() {
  // Get live broadcasts
  const liveBroadcasts = await youtube.liveBroadcasts.list({
    part: "snippet,contentDetails,status",
    mine: true,
  });

  console.log("Live broadcasts:");
  liveBroadcasts.data.items.forEach((item) => {
    console.log(`- ${item.id}: ${item.snippet.title} (status: ${item.status.lifeCycleStatus}, published: ${item.snippet.publishedAt})`);
  });

  // If an ID is provided, only process that broadcast. Otherwise, process all broadcasts that match the criteria.
  if (options.id) {
    const broadcast = liveBroadcasts.data.items.find((item) => item.id === options.id);
    if (!broadcast) {
      console.error(`No broadcast found with ID: ${options.id}`);
      return;
    }
    console.log(`Processing specified broadcast with ID: ${options.id}`);
    await processBroadcast(broadcast);
    return;
  }

  // Loop through broadcasts and process those that match the criteria (i.e. haven't been processed already and are ready)
  for (const item of liveBroadcasts.data.items) {
    if (item.snippet.title !== DEFAULT_TITLE) {
      console.log(`Skipping broadcast ${item.id} - title has already been changed`);
      continue;
    }
    if (!item.snippet.description.trim().endsWith(DEFAULT_DESCRIPTION_END)) {
      console.log(`Skipping broadcast ${item.id} - description has been changed`);
      continue;
    }
    if (item.status.lifeCycleStatus !== "complete") {
      console.log(`Skipping broadcast ${item.id} - not complete yet (status: ${item.status.lifeCycleStatus})`);
      continue;
    }

    console.log(`Processing broadcast: ${item.id} - ${item.snippet.title}`);
    await processBroadcast(item);
  }
}

async function processBroadcast(broadcast) {
  const title = broadcast.snippet.title;
  const description = broadcast.snippet.description;

  console.log(`Found broadcast ${broadcast.id}`);
  console.log("Title:", title);
  console.log("Published at:", broadcast.snippet.publishedAt);
  console.log("Description:", truncate(description.replaceAll("\n", " "), 100));
  console.log("");
  //console.log(broadcast);

  // Get the captions for the broadcast
  // First, list the caption tracks
  console.log("Looking for captions...");
  const captions = await youtube.captions.list({
    part: "snippet",
    videoId: broadcast.id,
  });
  const servingCaptions = captions.data.items.find((item) => item.snippet.status === "serving");
  if (!servingCaptions) {
    console.debug(captions.data.items);
    console.warn(`⚠️ No captions found for broadcast ${broadcast.id}, skipping...`);
    return;
  }
  console.log(
    `✅ Found ${servingCaptions.snippet.trackKind} caption track with ID: ${servingCaptions.id}`,
  );

  // Download the captions
  console.log("Downloading captions...");
  const captionData = await youtube.captions.download(
    {
      id: servingCaptions.id,
      tfmt: "srt",
    },
    { responseType: "text" },
  );
  console.log(
    `✅ Captions downloaded successfully - length: ${captionData.data.length} characters`,
  );
  // Write the captions to a file for debugging
  writeFileSync(`./tmp/${broadcast.id}.srt`, captionData.data, "utf8");
  if (options.showCaptions) {
    console.log("Captions:\n", captionData.data);
  }

  const transcription = captionData.data.replace(/^\d+$/gm, "").replace(/\n\n/g, "\n").trim();
  //console.log(transcription);

  const client = new OpenAI();

  // Generate chapter markers using OpenAI API
  console.log("Generating chapter markers using AI...");
  const input = prompt + transcription;
  // Write the prompt to a file for debugging
  writeFileSync(`./tmp/${broadcast.id}-prompt.txt`, input, "utf8");
  const response = await client.responses.create({
    model: "gpt-5.2",
    tools: [
      { type: "web_search" },
    ],
    input,
    include: ["web_search_call.action.sources"],
  });
  console.log(`✅ Chapter markers generated successfully - output length: ${response.output_text.length} characters`);
  if (options.debug) {
    console.log("AI response:\n", response);
  }
  for (const outputItem of response.output) {
    if (outputItem.type === "web_search_call") {
      console.log("Searched the web for:");
      for (const query of outputItem.action.queries) {
        console.log(`- ${query}`);
      }
    }
  }
  // Write the chapter markers to a file for debugging
  writeFileSync(`./tmp/${broadcast.id}-chapters.txt`, response.output_text, "utf8");

  // Generate title and description
  const formattedDate = dayjs(broadcast.snippet.publishedAt).tz(TIMEZONE).format("DD/MM/YYYY");
  const newTitle = `Sunday Morning Worship - ${formattedDate}`;
  console.log("New title:", newTitle);
  const newDescription = `Welcome to our Sunday Morning worship service on ${formattedDate}.\n\n${response.output_text}\n\nPlease note: The timestamp descriptions above are automatically generated and may not always be accurate.`;
  console.log("New description:", newDescription);

  if (!options.dryRun) {
    // Update video with new title and description
    console.log("Updating broadcast details on YouTube...");
    await youtube.liveBroadcasts.update({
      part: "snippet",
      requestBody: {
        id: broadcast.id,
        snippet: {
          ...broadcast.snippet,
          title: newTitle,
          description: newDescription,
        },
      },
    });
    console.log("✅ Broadcast updated successfully");

    // Print a link to the video
    console.log("Check the video here: https://www.youtube.com/watch?v=" + broadcast.id);
  } else {
    console.log("☑️ Dry run enabled - not updating broadcast on YouTube");
  }
}

main();
