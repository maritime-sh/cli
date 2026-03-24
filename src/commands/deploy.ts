import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireApiKey } from "../lib/config.js";
import { api } from "../lib/api.js";
import { loadToml } from "../lib/toml.js";
import { fetchAgents, type Agent } from "../lib/resolver.js";

export const deploy = new Command("deploy")
  .description("Deploy an agent from maritime.toml")
  .option("-d, --dir <dir>", "Directory containing maritime.toml", ".")
  .action(async (opts) => {
    const apiKey = requireApiKey();
    const toml = loadToml(opts.dir);

    const spinner = ora(`Deploying ${chalk.cyan(toml.name)}...`).start();

    try {
      // Check if agent already exists
      const agents = await fetchAgents(apiKey);
      const existing = agents.find(
        (a) => a.name.toLowerCase() === toml.name.toLowerCase(),
      );

      let agentId: string;

      if (existing) {
        agentId = existing.agent_id;
        spinner.text = `Redeploying ${chalk.cyan(toml.name)}...`;
      } else {
        // Provision new agent
        spinner.text = `Provisioning ${chalk.cyan(toml.name)}...`;
        const result = await api<{
          agent_id: string;
          deployment_id: string | null;
        }>("/api/v1/provision", {
          apiKey,
          method: "POST",
          body: {
            name: toml.name,
            description: toml.description || "",
            image: toml.framework || "auto",
            image_name: toml.image || null,
            repo_url: toml.repo || null,
            branch: toml.branch || "main",
            tier: toml.tier || "smart",
            env_vars: toml.env || {},
            auto_deploy: true,
          },
        });
        agentId = result.agent_id;

        if (result.deployment_id) {
          spinner.succeed(
            `Deployed ${chalk.cyan(toml.name)} (${chalk.dim(agentId)})`,
          );
          return;
        }
      }

      // Set env vars from toml if any
      if (toml.env) {
        for (const [key, value] of Object.entries(toml.env)) {
          await api(`/api/v1/agents/${agentId}/env`, {
            apiKey,
            method: "POST",
            body: { key, value, is_secret: false },
          });
        }
      }

      // Trigger deploy
      const deployment = await api<{
        deployment_id: string;
      }>(`/api/v1/agents/${agentId}/deploy`, {
        apiKey,
        method: "POST",
        body: {
          image_name: toml.image || null,
          repo_url: toml.repo || null,
          branch: toml.branch || "main",
        },
      });

      spinner.succeed(
        `Deployed ${chalk.cyan(toml.name)} (${chalk.dim(deployment.deployment_id)})`,
      );
    } catch (err) {
      spinner.fail(
        `Deploy failed: ${err instanceof Error ? err.message : err}`,
      );
      process.exit(1);
    }
  });
