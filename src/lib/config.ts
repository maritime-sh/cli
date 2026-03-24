import Conf from "conf";

interface MaritimeConfig {
  apiKey?: string;
  apiUrl?: string;
}

const config = new Conf<MaritimeConfig>({
  projectName: "maritime",
  schema: {
    apiKey: { type: "string" },
    apiUrl: { type: "string" },
  },
});

export function getApiKey(): string | undefined {
  return process.env.MARITIME_API_KEY || config.get("apiKey");
}

export function setApiKey(key: string): void {
  config.set("apiKey", key);
}

export function clearApiKey(): void {
  config.delete("apiKey");
}

export function getApiUrl(): string {
  return (
    process.env.MARITIME_API_URL ||
    config.get("apiUrl") ||
    "https://api.maritime.sh"
  );
}

export function requireApiKey(): string {
  const key = getApiKey();
  if (!key) {
    console.error(
      "Not logged in. Run `maritime login` or set MARITIME_API_KEY.",
    );
    process.exit(1);
  }
  return key;
}
