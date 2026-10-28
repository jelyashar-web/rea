# 🤖 Grok Bot — בוט דיסקורד עם מודולים חינמיים

בוט Discord קטן ונקי ב-Node.js (ESM) עם מערכת מודולים אוטומטית.
**כל ה-APIs כאן חינמיים** — חלקם אפילו בלי מפתח בכלל.

## מה יש בפנים?

| פקודה | מודול | API | עלות |
|---|---|---|---|
| `!grok <שאלה>` / `/grok` | grok.js | xAI (Grok) | ✅ tier חינמי (דורש רישום) |
| `!joke` / `/joke` | grok.js | xAI (Grok) | ✅ חינמי |
| `!search <מילה>` / `/search` | search.js | DuckDuckGo | ✅ **בלי מפתח** |
| `!define <מילה>` / `/define` | search.js | DictionaryAPI | ✅ **בלי מפתח** |
| `!anime <מילה>` / `/anime` | fun.js | Jisho (יפנית/אנימה) | ✅ **בלי מפתח** |
| `!cat` / `/cat` | fun.js | TheCatAPI | ✅ **בלי מפתח** |
| `!img <תיאור>` / `/img` | fun.js | DuckDuckGo Images | ✅ **בלי מפתח** |
| `!help`, `!ping`, `!serverinfo` | utility.js | מקומי | ✅ **בלי אינטרנט** |

## התקנה (3 דקות)

1. **צור בוט בדיסקורד (חינם):**
   - היכנס ל-https://discord.com/developers/applications → New Application → Bot
   - הפעל **Message Content Intent** (טוב חשוב לפקודות `!`)
   - העתק את ה-**Token**

2. **הוסף את הבוט לשרת שלך:**
   - OAuth2 → URL Generator → scopes: `bot, applications.commands` → permissions: Send Messages
   - פתח את הלינק שנוצר והזמן את הבוט

3. **התקן והרץ:**
   ```bash
   cd grok-bot
   npm install
   # שים טוקנים (או ערוך config.js):
   export DISCORD_TOKEN="MTA4..."
   export GROK_API_KEY=""   # אופציונלי! הרשם בחינם ב-https://docs.x.ai
   npm start
   ```

> 💡 בלי `GROK_API_KEY` הבוט עדיין עובד — כל שאר המודולים (חיפוש, מילון, חתולים, אנימה) לא צריכים מפתח.

## איך מוסיפים מודול חדש?

פשוט יוצרים קובץ ב-`modules/` עם `export const commands`:

```js
// modules/weather.js — דוגמה: Open-Meteo (חינמי, בלי מפתח)
export const commands = [
  {
    name: "weather",
    usage: "!weather <עיר>",
    description: "מצב אוויר (Open-Meteo — חינמי)",
    slash: { name: "weather", description: "מצב אוויר", options: [{ name: "city", type: 3, description: "עיר", required: true }] },
    async run(args) {
      const city = args.join(" ");
      if (!city) return "Usage: !weather <city>";
      const geo = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)).json();
      const loc = geo.results?.[0];
      if (!loc) return `לא מצאתי את ${city}`;
      const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,wind_speed_10m`)).json();
      const c = w.current;
      return `🌍 ${loc.name}: ${c.temperature_2m}°C, רוח ${c.wind_speed_10m} km/h`;
    },
  },
];
```

הטוען (`loader.js`) מזהה אותו אוטומטית בהפעלה הבאה — כולל Slash Commands.

## מבנה

```
grok-bot/
├── index.js        ← נקודת כניסה (prefix + slash)
├── config.js       ← טוקנים והגדרות
├── loader.js       ← טוען מודולים אוטומטית
└── modules/
    ├── grok.js     ← AI (xAI free tier)
    ├── search.js   ← חיפוש + מילון (בלי מפתח)
    ├── fun.js      ← אנימה/חתולים/תמונות (בלי מפתח)
    └── utility.js  ← help/ping/serverinfo (מקומי)
```

## אחסון חינמי לבוט (Deploy)

- **Oracle Cloud Free Tier** — VM חינמי לתמיד
- **Raspberry Pi / מחשב ביתי** + `pm2 start index.js --name grok-bot`
- **Railway/Render** — יש trial חינמי (לבוטים 24/7 עדיף Oracle)

⚠️ אל תשתף את ה-Token שלך עם אף אחד, ואל תעלה אותו ל-Git.
