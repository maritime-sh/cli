import { Command } from "commander";
import chalk from "chalk";
import { writeFileSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";

const TEMPLATE = `# Maritime agent configuration
# Docs: https://docs.maritime.sh/cli

name = "{name}"
# framework = "auto"       # auto | crewai | langgraph | openclaw | docker
# image = ""               # custom Docker image (optional)
# repo = ""                # GitHub repo URL (optional)
# branch = "main"
# tier = "smart"           # smart | fast

# [env]
# API_KEY = "your-key"
`;

export const init = new Command("init")
  .description("Generate a maritime.toml configuration file")
  .option("-n, --name <name>", "Agent name")
  .action((opts) => {
    const target = resolve("maritime.toml");
    if (existsSync(target)) {
      console.error(chalk.yellow("maritime.toml already exists."));
      process.exit(1);
    }

    const name = opts.name || basename(process.cwd());
    const content = TEMPLATE.replace("{name}", name);
    writeFileSync(target, content, "utf-8");
    console.log(`Created ${chalk.cyan("maritime.toml")} for "${name}".`);
  });
