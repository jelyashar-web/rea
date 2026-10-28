// ============================================================
// modules/search.js — חיפוש אינטרנט + מילון (חינמי)
// חיפוש: DuckDuckGo Lite (ללא מפתח). מילון: Free Dictionary API (ללא מפתח).
// כל הפניות לרשת עם timeout של 8 שניות כדי לא לתקוע.
// ============================================================

const UA = "GrokBot/1.0 (personal Discord bot; contact: none)";
const FETCH_TIMEOUT = 8000;

/** fetch עם timeout — שלא נתקע על API סורר */
async function timedFetch(url, opts = {}) {
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

/** חיפוש DuckDuckGo Lite — מחזיר כותרת+לינק של התוצאות הראשונות */
async function ddgSearch(query, limit = 5) {
  const html = await (await timedFetch(
    "https://lite.duckduckgo.com/lite/?q=" + encodeURIComponent(query),
    { headers: { "User-Agent": UA } },
  )).text();

  const results = [];
  // ב-Lite כל תוצאה היא <a class="result-link" href="...">כותרת</a>
  const re = /<a[^>]+class="result-link"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) && results.length < limit) {
    let url = decodeURIComponent(m[1]);
    const uddg = url.match(/uddg=([^&]+)/);
    if (uddg) url = decodeURIComponent(uddg[1]);
    const title = m[2].replace(/<[^>]+>/g, "").trim();
    if (title && url.startsWith("http")) results.push({ title, url });
  }
  return results;
}

export const commands = [
  {
    name: "search",
    usage: "!search <מילה>",
    description: "חיפוש בגוגל... בעצם ב-DuckDuckGo (חינמי, בלי מפתח)",
    slash: { name: "search", description: "חיפוש באינטרנט", options: [{ name: "query", type: 3, description: "מה לחפש", required: true }] },
    async run(args) {
      const q = args.join(" ");
      if (!q) return "Usage: !search <מילה>";
      try {
        const results = await ddgSearch(q, 5);
        if (!results.length) return `לא נמצאו תוצאות עבור: ${q}`;
        return ["🔎 תוצאות עבור **" + q + "**:", ...results.map((r, i) => `${i + 1}. [${r.title}](${r.url})`)].join("\n");
      } catch (e) {
        console.error(e);
        return "שגיאה בחיפוש 😕";
      }
    },
  },
  {
    name: "define",
    usage: "!define <מילה>",
    description: "הגדרת מילה (Free Dictionary API — חינמי, בלי מפתח)",
    slash: { name: "define", description: "הגדרת מילה באנגלית", options: [{ name: "word", type: 3, description: "המילה", required: true }] },
    async run(args) {
      const word = args[0];
      if (!word) return "Usage: !define <word>";
      try {
        const data = await (await timedFetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
          { headers: { "User-Agent": UA } },
        )).json();
        const meanings = data[0]?.meanings || [];
        const lines = [`📖 **${data[0]?.word || word}**`];
        for (const m of meanings.slice(0, 3)) {
          lines.push(`_${m.partOfSpeech}_:`);
          for (const d of (m.definitions || []).slice(0, 2)) {
            lines.push(`• ${d.definition}${d.example ? ` — _${d.example}_` : ""}`);
          }
        }
        return lines.join("\n").slice(0, 1900);
      } catch {
        return "שגיאה בפנייה למילון 😕";
      }
    },
  },
];
