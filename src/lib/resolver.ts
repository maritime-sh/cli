import { api } from "./api.js";

export interface Agent {
  agent_id: string;
  name: string;
  status: string;
  framework: string;
  tier: string;
  image_name: string | null;
  container_id: string | null;
  public_key: string | null;
  invocation_count: number;
  total_compute_seconds: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

let cachedAgents: Agent[] | null = null;

export async function fetchAgents(apiKey: string): Promise<Agent[]> {
  if (cachedAgents) return cachedAgents;
  cachedAgents = await api<Agent[]>("/api/v1/agents", { apiKey });
  return cachedAgents;
}

export async function resolveAgent(
  nameOrId: string,
  apiKey: string,
): Promise<Agent> {
  const agents = await fetchAgents(apiKey);

  // Exact ID match
  const byId = agents.find((a) => a.agent_id === nameOrId);
  if (byId) return byId;

  // Exact name match
  const byName = agents.find(
    (a) => a.name.toLowerCase() === nameOrId.toLowerCase(),
  );
  if (byName) return byName;

  // Prefix match on ID
  const byPrefix = agents.filter((a) => a.agent_id.startsWith(nameOrId));
  if (byPrefix.length === 1) return byPrefix[0];
  if (byPrefix.length > 1) {
    throw new Error(
      `Ambiguous agent prefix "${nameOrId}". Matches: ${byPrefix.map((a) => a.name).join(", ")}`,
    );
  }

  throw new Error(
    `Agent "${nameOrId}" not found. Run \`maritime status\` to list agents.`,
  );
}
