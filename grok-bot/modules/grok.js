// ============================================================
// modules/grok.js — מודול Grok (חינמי: xAI free tier, OpenAI-compatible)
// אם אין GROK_API_KEY — מחזיר הודעה ידידותית במקום לשבור את הבוט.
// ============================================================
import { config } from "../config.js";

const API_URL = "https://api.x.ai/v1/chat/completions";
const FETCH_TIMEOUT = 30000; // ל-LLM לוקח זמן — 30 שניות

/**
 * שליחת פרומפט ל-Grok והחזרת התשובה כטקסט.
 * @param {string} prompt
 * @param {{system?: string, history?: Array<{role:string,content:string}>}} opts
 */
export async function askGrok(prompt, opts = {}) {
  if (!config.grokApiKey) {
    return "⚠️ לא הוגדר מפתח Grok. הרשם בחינם ב-https://docs.x.ai (יש free tier) והזן את המפתח ב-config.js או במשתנה הסביבה GROK_API_KEY.";
  }

  const messages = [
    { role: "system", content: opts.system || "אתה עוזר בוט דיסקורד. ענה בקצרה ובעברית אם המשתמש כתב בעברית." },
    ...(opts.history || []),
    { role: "user", content: prompt },
  ];

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.grokApiKey}`,
    },
    body: JSON.stringify({
      model: config.grokModel,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Grok API error:", res.status, text);
    return `שגיאה בפנייה ל-Grok (${res.status}). נסה שוב מאוחר יותר.`;
  }

  const data = await res.json();
  const answer = data?.choices?.[0]?.message?.content?.trim();
  return answer || config.fallbackReply;
}

// פקודות הבוט מהמודול הזה
export const commands = [
  {
    name: "grok",
    usage: "!grok <שאלה>",
    description: "שאל את Grok (xAI) — דורש מפתח חינמי מ-docs.x.ai",
    slash: { name: "grok", description: "שאל את Grok AI", options: [{ name: "prompt", type: 3, description: "השאלה שלך", required: true }] },
    async run(args) {
      const prompt = args.join(" ");
      if (!prompt) return "Usage: !grok <שאלה>";
      return askGrok(prompt);
    },
  },
  {
    name: "joke",
    usage: "!joke",
    description: "בדיחה קצרה מ-Grok",
    slash: { name: "joke", description: "בדיחה קצרה מ-Grok" },
    async run() {
      return askGrok("ספר בדיחה קצרה וטובה בעברית.", { system: "אתה קומיקאי. ענה בבדיחה אחת קצרה בעברית בלבד." });
    },
  },
];
