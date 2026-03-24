import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { createInterface } from "node:readline";
import { requireApiKey } from "../lib/config.js";
import { api } from "../lib/api.js";
import { resolveAgent } from "../lib/resolver.js";

async function confirm(msg: string): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(msg, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

export const destroy = new Command("destroy")
  .description("Delete an agent and all its resources")
  .argument("<agent>", "Agent name or ID")
  .option("-y, --yes", "Skip confirmation")
  .action(async (agentArg, opts) => {
    const apiKey = requireApiKey();

    try {
      const agent = await resolveAgent(agentArg, apiKey);

      if (!opts.yes) {
        const ok = await confirm(
          `Delete ${chalk.red(agent.name)} and all its data? (y/N) `,
        );
        if (!ok) {
          console.log("Aborted.");
          return;
        }
      }

      const spinner = ora("Destroying agent...").start();
      await api(`/api/v1/agents/${agent.agent_id}`, {
        apiKey,
        method: "DELETE",
      });
      spinner.succeed(`Deleted ${chalk.cyan(agent.name)}`);
    } catch (err) {
      console.error(
        chalk.red(err instanceof Error ? err.message : String(err)),
      );
      process.exit(1);
    }
  });
