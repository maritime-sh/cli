import { Command } from "commander";
import chalk from "chalk";
import { getApiKey, getApiUrl } from "../lib/config.js";

export const whoami = new Command("whoami")
  .description("Show current authentication info")
  .action(() => {
    const key = getApiKey();
    if (!key) {
      console.log("Not logged in.");
      process.exit(1);
    }
    console.log(`  Key:  ${chalk.cyan(key.slice(0, 12))}${"*".repeat(8)}`);
    console.log(`  API:  ${getApiUrl()}`);
  });
