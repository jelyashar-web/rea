// ============================================================
// modules/fun.js — מודול כיף: אנימה/מנגה (Jisho — חינמי, בלי מפתח) + תמונות חיות (ddg images)
// ============================================================

const UA = "GrokBot/1.0 (personal Discord bot)";
const FETCH_TIMEOUT = 8000;

async function timedFetch(url, opts = {}) {
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

async function jishoSearch(term) {
  const res = await timedFetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(term)}`, {
    headers: { "User-Agent": UA },
  });
  return res.json();
}

// תמונה ראשונה מ-DuckDuckGo Images (חינמי, ללא מפתח)
async function ddgImage(query) {
  // שלב 1: vqd token
  const r1 = await timedFetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`, {
    headers: { "User-Agent": UA },
  });
  const html = await r1.text();
  const vqd = html.match(/vqd=([\d-]+)&/)?.[1];
  if (!vqd) return null;
  // שלב 2: JSON תוצאות
  try {
    const r2 = await timedFetch(`https://duckduckgo.com/i.js?l=fyat&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,width-height,color,type,,time,dsl&pn=1&o=json`, {
      headers: { "User-Agent": UA, Referer: "https://duckduckgo.com/" },
    });
    const data = await r2.json().catch(() => null);
    return data?.results?.[0]?.url || null;
  } catch {
    return null;
  }
}

export const commands = [
  {
    name: "anime",
    usage: "!anime <יפנית/רומג'י>",
    description: "חיפוש מילה/אנימה ב-Jisho (מילון יפני חינמי)",
    slash: { name: "anime", description: "חיפוש ב-Jisho", options: [{ name: "term", type: 3, description: "מילה ביפנית או רומג'י", required: true }] },
    async run(args) {
      const term = args.join(" ");
      if (!term) return "Usage: !anime <term>";
      try {
        const data = await jishoSearch(term);
        const first = data?.data?.[0];
        if (!first) return `לא נמצא דבר עבור "${term}"`;
        const ja = first.japanese?.[0]?.word || "?";
        const reading = first.japanese?.[0]?.reading || "?";
        const glosses = (first.senses?.[0]?.english_words || []).slice(0, 5).join(", ") || "—";
        return `🎌 **${ja}** (${reading})\n→ ${glosses}`;
      } catch {
        return "שגיאה בחיפוש ב-Jisho 😕";
      }
    },
  },
  {
    name: "cat",
    usage: "!cat",
    description: "תמונת חתול אקראית (TheCatAPI — חינמי)",
    slash: { name: "cat", description: "תמונת חתול" },
    async run() {
      try {
        const res = await fetch("https://api.thecatapi.com/v1/images/search", {
          headers: { "User-Agent": UA },
          signal: AbortSignal.timeout(FETCH_TIMEOUT),
        });
        const data = await res.json();
        return data?.[0]?.url ? `🐱 ${data[0].url}` : configFallback();
      } catch {
        return "החתול ברח 😿";
      }
    },
  },
  {
    name: "img",
    usage: "!img <תיאור>",
    description: "תמונה ראשונה מחיפוש (ללא מפתח)",
    slash: { name: "img", description: "חיפוש תמונה", options: [{ name: "query", type: 3, description: "מה לחפש", required: true }] },
    async run(args) {
      const q = args.join(" ");
      if (!q) return "Usage: !img <query>";
      const url = await ddgImage(q);
      return url ? `🖼️ ${q}\n${url}` : `לא מצאתי תמונה ל-${q}`;
    },
  },
];

function configFallback() {
  return "לא הצלחתי להשיג תמונה 😅";
}
