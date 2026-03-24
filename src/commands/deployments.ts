import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireApiKey } from "../lib/config.js";
import { api } from "../lib/api.js";
import { resolveAgent } from "../lib/resolver.js";
import { table, colorStatus, timeAgo } from "../lib/output.js";

interface Deployment {
  id: string;
  status: string;
  source: string;
  branch: string | null;
  build_log: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export const deployments = new Command("deployments")
  .description("Show deployment history for an agent")
  .argument("<agent>", "Agent name or ID")
  .option("-n, --limit <n>", "Number of deployments", "10")
  .action(async (agentArg, opts) => {
    const apiKey = requireApiKey();
    const spinner = ora("Fetching deployments...").start();
    try {
      const agent = await resolveAgent(agentArg, apiKey);
      const deps = await api<Deployment[]>(
        `/api/v1/agents/${agent.agent_id}/deployments?limit=${opts.limit}`,
        { apiKey },
      );
      spinner.stop();

      if (deps.length === 0) {
        console.log("No deployments found.");
        return;
      }

      table(
        ["ID", "Status", "Source", "Branch", "Started"],
        deps.map((d) => [
          d.id.slice(0, 8),
          colorStatus(d.status),
          d.source || "-",
          d.branch || "-",
          d.started_at ? timeAgo(d.started_at) : "-",
        ]),
      );
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });
