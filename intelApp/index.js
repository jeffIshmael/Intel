const OpenAI = require("openai");
require("dotenv").config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "user",
        content: "Write a one-sentence bedtime story about a unicorn.",
      },
    ],
  });
  // console.log(`completion only: ${completion}`);
  console.log(completion.choices[0].message.content);
}

main();
