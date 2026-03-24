import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireApiKey } from "../lib/config.js";
import { api } from "../lib/api.js";
import { resolveAgent } from "../lib/resolver.js";

export const restart = new Command("restart")
  .description("Restart an agent")
  .argument("<agent>", "Agent name or ID")
  .action(async (agentArg) => {
    const apiKey = requireApiKey();
    const spinner = ora("Restarting agent...").start();
    try {
      const agent = await resolveAgent(agentArg, apiKey);
      const result = await api<{ status: string }>(
        `/api/v1/agents/${agent.agent_id}/restart`,
        { apiKey, method: "POST" },
      );
      spinner.succeed(`${chalk.cyan(agent.name)} is now ${result.status}`);
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });
