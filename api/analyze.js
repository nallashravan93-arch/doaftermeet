import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Extract DECISIONS and TASKS from meeting notes. Respond in clean sections with bullet points."
        },
        { role: "user", content: text }
      ]
    });

    res.status(200).json({
      result: completion.choices[0].message.content
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      error: "AI failed",
      details: error.message
    });
  }
}
