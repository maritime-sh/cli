import { parse } from "smol-toml";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface MaritimeToml {
  name: string;
  framework?: string;
  image?: string;
  repo?: string;
  branch?: string;
  tier?: string;
  description?: string;
  env?: Record<string, string>;
}

export function loadToml(dir: string = "."): MaritimeToml {
  const filePath = resolve(dir, "maritime.toml");
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    throw new Error(
      `No maritime.toml found in ${resolve(dir)}. Run \`maritime init\` first.`,
    );
  }

  const parsed = parse(raw) as unknown as MaritimeToml;

  if (!parsed.name) {
    throw new Error("maritime.toml must contain a 'name' field.");
  }

  return parsed;
}
