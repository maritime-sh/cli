import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { requireApiKey } from "../lib/config.js";
import { api } from "../lib/api.js";
import { resolveAgent, type Agent } from "../lib/resolver.js";
import { table, colorStatus, timeAgo } from "../lib/output.js";

export const status = new Command("status")
  .description("List agents or show agent detail")
  .argument("[agent]", "Agent name or ID")
  .action(async (agentArg) => {
    const apiKey = requireApiKey();

    if (agentArg) {
      const spinner = ora("Fetching agent...").start();
      try {
        const agent = await resolveAgent(agentArg, apiKey);
        spinner.stop();
        printDetail(agent);
      } catch (err) {
        spinner.fail(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
      return;
    }

    const spinner = ora("Fetching agents...").start();
    try {
      const agents = await api<Agent[]>("/api/v1/agents", { apiKey });
      spinner.stop();

      if (agents.length === 0) {
        console.log("No agents found. Run `maritime deploy` to create one.");
        return;
      }

      table(
        ["Name", "Status", "Framework", "Tier", "Updated"],
        agents.map((a) => [
          a.name,
          colorStatus(a.status),
          a.framework,
          a.tier,
          timeAgo(a.updated_at),
        ]),
      );
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

function printDetail(a: Agent) {
  console.log(chalk.bold(a.name));
  console.log(`  ID:         ${a.agent_id}`);
  console.log(`  Status:     ${colorStatus(a.status)}`);
  console.log(`  Framework:  ${a.framework}`);
  console.log(`  Tier:       ${a.tier}`);
  if (a.image_name) console.log(`  Image:      ${a.image_name}`);
  if (a.container_id) console.log(`  Container:  ${a.container_id.slice(0, 12)}`);
  console.log(`  Invocations: ${a.invocation_count}`);
  console.log(`  Compute:    ${Math.round(a.total_compute_seconds / 60)}m`);
  if (a.error_message) console.log(`  Error:      ${chalk.red(a.error_message)}`);
  console.log(`  Created:    ${timeAgo(a.created_at)}`);
  console.log(`  Updated:    ${timeAgo(a.updated_at)}`);
}
