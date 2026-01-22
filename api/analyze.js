import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { transcript } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `
Extract decisions and action items from this meeting.
Format cleanly with headings.

${transcript}
        `
      }]
    });

    const result = completion.choices[0].message.content;

    const { data: meeting } = await supabase
      .from("meetings")
      .insert({
        transcript,
        title: "Meeting " + new Date().toLocaleString(),
        user_id: req.headers["x-user-id"]
      })
      .select()
      .single();

    await supabase.from("action_items").insert({
      meeting_id: meeting.id,
      content: result
    });

    res.json({ formatted: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
}
