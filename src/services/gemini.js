// services/gemini.js - COMPLETE FILE
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const modelId = "gemini-2.5-flash";

// ✅ matches the structure you logged
function extractText(result) {
  const parts = result.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("").trim();
}

export async function improvePost(text) {
  if (!text?.trim()) return "";
  console.log("improvePost from services/gemini.js");

  const result = await genAI.models.generateContent({
    model: modelId,
    contents: [
      {
        parts: [
          {
            text: `Rewrite this college post professionally.
Keep it short, clear, and friendly.
Do not change the meaning.

Post:
${text}`,
          },
        ],
      },
    ],
  });

  console.log("RAW Gemini result:", JSON.stringify(result, null, 2));
  const out = extractText(result);
  console.log("AI improved text:", out);
  return out;
}

export async function summarizePost(text) {
  if (!text?.trim()) return "";

  const result = await genAI.models.generateContent({
    model: modelId,
    contents: [
      {
        parts: [
          {
            text: `Summarize this college announcement in 2 short lines:

${text}`,
          },
        ],
      },
    ],
  });

  return extractText(result);
}

export async function explainForStudents(text, dept = "general") {
  if (!text?.trim()) return "";

  const result = await genAI.models.generateContent({
    model: modelId,
    contents: [
      {
        parts: [
          {
            text: `Explain the following in simple words for ${dept} students:

${text}`,
          },
        ],
      },
    ],
  });

  return extractText(result);
}

// ✅ NEW FUNCTION for ChatPage AI
export async function generateConversationResponse(userMessage, department) {
  if (!userMessage?.trim()) return "";

  console.log("generateConversationResponse:", userMessage, department);

  const result = await genAI.models.generateContent({
    model: modelId,
    contents: [
      {
        parts: [
          {
            text: `You are a friendly college AI assistant for ${department} students.

User asked: "${userMessage}"

Respond conversationally:
- Keep it 2-3 sentences max
- Friendly and helpful tone
- End with a question to continue the chat
- No "As an AI..." phrases`,
          },
        ],
      },
    ],
  });

  const response = extractText(result);
  console.log("AI conversation response:", response);
  return response;
}
