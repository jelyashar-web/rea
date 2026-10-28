// ============================================================
// loader.js — טוען אוטומטית את כל המודולים מתיקיית modules/
// הוספת מודול חדש = רק קובץ JS עם export const commands = [...]
// ============================================================
import { readdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { pathToFileURL } from "node:url";

export async function loadModules(dir) {
  const files = await readdir(dir);
  const commands = [];
  for (const f of files) {
    if (extname(f) !== ".js") continue;
    const mod = await import(pathToFileURL(join(dir, f)).href);
    if (!Array.isArray(mod.commands)) continue;
    for (const c of mod.commands) {
      if (!c.name || typeof c.run !== "function") {
        console.warn(`[loader] פקודה לא תקינה בקובץ ${f}, דילג`);
        continue;
      }
      commands.push(c);
    }
    console.log(`[loader] ✅ נטען מודול: ${f} (${mod.commands.length} פקודות)`);
  }
  return commands;
}
