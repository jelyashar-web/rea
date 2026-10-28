// ============================================================
// config.js — כל ההגדרות במקום אחד. שים את המפתחות שלך כאן
// (או משתני סביבה: DISCORD_TOKEN, GROK_API_KEY)
// ============================================================

export const config = {
  // --- Discord Bot Token (חינמי): https://discord.com/developers/applications
  discordToken: process.env.DISCORD_TOKEN || "PUT_YOUR_DISCORD_TOKEN_HERE",

  // --- מפתח Grok API (יש tier חינמי של xAI: api.x.ai)
  // אם אין לך מפתח — מודול ה-Grok פשוט ינותב לבטע ולא תשבור את הבוט.
  grokApiKey: process.env.GROK_API_KEY || "",

  // מודל Grok (grok-2-mini / grok-3-mini — הזולים/החינמיים ביותר ב-xAI)
  grokModel: "grok-2-mini-1212",

  // prefix של פקודות (בנוסף ל-slash commands)
  prefix: "!",

  // טקסט ברירת מחדל כשהבוט לא יודע לענות
  fallbackReply: "לא הצלחתי לענות 😅 נסה !help כדי לראות פקודות.",
};
