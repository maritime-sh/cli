import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireApiKey } from "../lib/config.js";
import { api } from "../lib/api.js";
import { resolveAgent } from "../lib/resolver.js";
import { table } from "../lib/output.js";

interface EnvVar {
  key: string;
  value: string;
  is_secret: boolean;
}

const envList = new Command("list")
  .description("List environment variables")
  .argument("<agent>", "Agent name or ID")
  .action(async (agentArg) => {
    const apiKey = requireApiKey();
    const spinner = ora("Fetching env vars...").start();
    try {
      const agent = await resolveAgent(agentArg, apiKey);
      const vars = await api<EnvVar[]>(
        `/api/v1/agents/${agent.agent_id}/env`,
        { apiKey },
      );
      spinner.stop();

      if (vars.length === 0) {
        console.log("No environment variables set.");
        return;
      }

      table(
        ["Key", "Value", "Secret"],
        vars.map((v) => [
          v.key,
          v.is_secret ? chalk.dim("(secret)") : v.value,
          v.is_secret ? "yes" : "no",
        ]),
      );
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

const envSet = new Command("set")
  .description("Set an environment variable (KEY=VALUE)")
  .argument("<agent>", "Agent name or ID")
  .argument("<pair>", "KEY=VALUE pair")
  .option("-s, --secret", "Mark as secret")
  .action(async (agentArg, pair, opts) => {
    const apiKey = requireApiKey();
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) {
      console.error("Format: KEY=VALUE");
      process.exit(1);
    }
    const key = pair.slice(0, eqIdx);
    const value = pair.slice(eqIdx + 1);

    const spinner = ora(`Setting ${key}...`).start();
    try {
      const agent = await resolveAgent(agentArg, apiKey);
      await api(`/api/v1/agents/${agent.agent_id}/env`, {
        apiKey,
        method: "POST",
        body: { key, value, is_secret: !!opts.secret },
      });
      spinner.succeed(`Set ${chalk.cyan(key)} on ${agent.name}`);
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

const envRemove = new Command("remove")
  .description("Remove an environment variable")
  .argument("<agent>", "Agent name or ID")
  .argument("<key>", "Variable key to remove")
  .action(async (agentArg, key) => {
    const apiKey = requireApiKey();
    const spinner = ora(`Removing ${key}...`).start();
    try {
      const agent = await resolveAgent(agentArg, apiKey);
      await api(`/api/v1/agents/${agent.agent_id}/env/${key}`, {
        apiKey,
        method: "DELETE",
      });
      spinner.succeed(`Removed ${chalk.cyan(key)} from ${agent.name}`);
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

export const env = new Command("env")
  .description("Manage environment variables")
  .addCommand(envList)
  .addCommand(envSet)
  .addCommand(envRemove);
