import dotenv from 'dotenv';
import OpenAI from "openai";
dotenv.config()

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.2",
  input: "Write a short bedtime story about a unicorn.",
});

console.log(response.output_text);
