// ============================================================
// modules/utility.js — פקודות שרת מקומיות (בלי API חיצוני בכלל)
// ============================================================

export const commands = [
  {
    name: "help",
    usage: "!help",
    description: "רשימת כל הפקודות",
    slash: { name: "help", description: "רשימת פקודות" },
    run(args, ctx) {
      const lines = ["🤖 **Grok Bot — פקודות:**"];
      for (const c of ctx.allCommands) {
        lines.push(`\`${c.usage}\` — ${c.description}`);
      }
      return lines.join("\n");
    },
  },
  {
    name: "ping",
    usage: "!ping",
    description: "בודק שהבוט חי + זמן תגובה",
    slash: { name: "ping", description: "זמן תגובה" },
    run(args, ctx) {
      return `🏓 Pong! זמן הודעה→תשובה: ~${Date.now() - ctx.receivedAt}ms | Gateway: ${Math.round(ctx.client.ws.ping)}ms`;
    },
  },
  {
    name: "serverinfo",
    usage: "!serverinfo",
    description: "מידע על השרת",
    slash: { name: "serverinfo", description: "מידע על השרת" },
    run(args, ctx) {
      const g = ctx.guild;
      if (!g) return "רק בשרת אפשר 😅";
      return [
        `🛡️ **${g.name}**`,
        `👥 חברים: ${g.memberCount}`,
        `📅 נוצר: ${g.createdAt.toDateString()}`,
        `💬 ערוצים: ${g.channels.cache.size}`,
      ].join("\n");
    },
  },
];
