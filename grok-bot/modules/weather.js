// ============================================================
// modules/weather.js — דוגמה למודול: Open-Meteo (חינמי, בלי מפתח)
// ============================================================

export const commands = [
  {
    name: "weather",
    usage: "!weather <עיר>",
    description: "מצב אוויר (Open-Meteo — חינמי)",
    slash: { name: "weather", description: "מצב אוויר", options: [{ name: "city", type: 3, description: "עיר", required: true }] },
    async run(args) {
      const city = args.join(" ");
      if (!city) return "Usage: !weather <city>";
      try {
        const geo = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, { signal: AbortSignal.timeout(8000) })).json();
        const loc = geo.results?.[0];
        if (!loc) return `לא מצאתי את ${city}`;
        const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,wind_speed_10m`, { signal: AbortSignal.timeout(8000) })).json();
        const c = w.current;
        return `🌍 ${loc.name}: ${c.temperature_2m}°C, רוח ${c.wind_speed_10m} km/h`;
      } catch {
        return "שגיאה במצב האוויר 😕";
      }
    },
  },
];
