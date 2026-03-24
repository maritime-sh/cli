import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { setApiKey } from "../lib/config.js";
import { api } from "../lib/api.js";

export const login = new Command("login")
  .description("Authenticate with your Maritime API key")
  .option("--key <key>", "API key (mk_...)")
  .action(async (opts) => {
    let key: string = opts.key;

    if (!key) {
      // Read from stdin if piped, otherwise prompt
      if (!process.stdin.isTTY) {
        const chunks: Buffer[] = [];
        for await (const chunk of process.stdin) {
          chunks.push(chunk);
        }
        key = Buffer.concat(chunks).toString().trim();
      } else {
        console.error(
          "Usage: maritime login --key mk_...",
        );
        console.error(
          "       echo mk_... | maritime login",
        );
        process.exit(1);
      }
    }

    if (!key.startsWith("mk_")) {
      console.error(chalk.red("Invalid API key format. Keys start with mk_"));
      process.exit(1);
    }

    const spinner = ora("Validating API key...").start();
    try {
      await api("/api/v1/agents", { apiKey: key });
      setApiKey(key);
      spinner.succeed("Logged in successfully.");
    } catch (err) {
      spinner.fail(
        `Authentication failed: ${err instanceof Error ? err.message : err}`,
      );
      process.exit(1);
    }
  });
