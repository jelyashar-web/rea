// ============================================================
// index.js — נקודת הכניסה של Grok Bot עם מודולים חינמיים
// תומך גם ב-!prefix (פשוט) וגם ב-Slash Commands.
// ============================================================
import {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  Events,
} from "discord.js";
import { config } from "./config.js";
import { loadModules } from "./loader.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// ---------------- טעינת מודולים ----------------
const modulesDir = new URL("./modules", import.meta.url).pathname;
const allCommands = await loadModules(modulesDir);
const commandMap = new Map(allCommands.map((c) => [c.name, c]));

// ---------------- הרשמת Slash Commands ----------------
async function registerSlashCommands() {
  const rest = new REST({ version: "10" }).setToken(config.discordToken);
  const body = allCommands
    .filter((c) => c.slash)
    .map((c) => {
      let b = new SlashCommandBuilder().setName(c.slash.name).setDescription(c.slash.description);
      for (const opt of c.slash.options || []) {
        b = b.addStringOption((op) =>
          op.setName(opt.name).setDescription(opt.description).setRequired(!!opt.required),
        );
      }
      return b.toJSON();
    });
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body });
    console.log(`[index] 🚀 נרשמו ${body.length} slash commands`);
  } catch (e) {
    console.error("[index] שגיאה ברישום slash commands:", e.message);
  }
}

// ---------------- הפעלת פקודה משותפת לשני המצבים ----------------
async function executeCommand(cmdName, args, ctx) {
  const cmd = commandMap.get(cmdName);
  if (!cmd) return config.fallbackReply;
  try {
    return await cmd.run(args, ctx);
  } catch (e) {
    console.error(`[index] שגיאה בפקודה ${cmdName}:`, e);
    return `שגיאה בהפעלת ${cmdName} 😵`;
  }
}

// ---------------- הודעות רגילות (prefix) ----------------
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;
  const receivedAt = Date.now();
  const parts = message.content.slice(config.prefix.length).trim().split(/\s+/);
  const name = parts.shift()?.toLowerCase();
  const ctx = { message, client, guild: message.guild, receivedAt, allCommands };
  const reply = await executeCommand(name, parts, ctx);
  if (reply) await message.reply(String(reply).slice(0, 1990));
});

// ---------------- Slash Commands ----------------
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const receivedAt = Date.now();
  const cmd = commandMap.get(interaction.commandName);
  const args = [];
  if (cmd?.slash?.options) {
    for (const opt of cmd.slash.options) {
      const v = interaction.options.getString(opt.name);
      if (v) args.push(v);
    }
  }
  const ctx = { interaction, client, guild: interaction.guild, receivedAt, allCommands };
  await interaction.deferReply();
  const reply = await executeCommand(interaction.commandName, args, ctx);
  await interaction.editReply(String(reply ?? config.fallbackReply).slice(0, 1990));
});

// ---------------- הדלקה ----------------
if (config.discordToken === "PUT_YOUR_DISCORD_TOKEN_HERE") {
  console.error("❌ שים את הדיסקורד טוקן שלך ב-config.js או במשתנה הסביבה DISCORD_TOKEN");
  process.exit(1);
}

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ הבוט רץ כ-${c.user.tag}`);
  await registerSlashCommands();
});

client.login(config.discordToken);
