import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { requireApiKey } from "../lib/config.js";
import { api } from "../lib/api.js";
import { resolveAgent } from "../lib/resolver.js";
import { startPolling } from "../lib/poll.js";

interface LogEntry {
  id: string;
  level: string;
  message: string;
  source: string;
  timestamp: string | null;
}

const LEVEL_COLORS: Record<string, (s: string) => string> = {
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  debug: chalk.gray,
};

export const logs = new Command("logs")
  .description("View agent logs")
  .argument("<agent>", "Agent name or ID")
  .option("-n, --lines <n>", "Number of log lines", "50")
  .option("-l, --level <level>", "Filter by level (error, warning, info, debug)")
  .option("-f, --follow", "Follow logs (poll every 3s)")
  .action(async (agentArg, opts) => {
    const apiKey = requireApiKey();

    const spinner = ora("Fetching logs...").start();
    try {
      const agent = await resolveAgent(agentArg, apiKey);
      spinner.stop();

      const printLogs = async (since?: string) => {
        const params = new URLSearchParams();
        params.set("limit", opts.lines);
        if (opts.level) params.set("level", opts.level);

        const entries = await api<LogEntry[]>(
          `/api/v1/agents/${agent.agent_id}/logs?${params}`,
          { apiKey },
        );

        const filtered = since
          ? entries.filter((e) => e.timestamp && e.timestamp > since)
          : entries;

        // Reverse to show oldest first
        for (const entry of [...filtered].reverse()) {
          const color = LEVEL_COLORS[entry.level] || chalk.white;
          const ts = entry.timestamp
            ? new Date(entry.timestamp).toLocaleTimeString()
            : "";
          console.log(
            `${chalk.dim(ts)} ${color(`[${entry.level}]`)} ${entry.message}`,
          );
        }

        return entries[0]?.timestamp || since;
      };

      let lastTs = await printLogs();

      if (opts.follow) {
        startPolling({
          task: () => printLogs(lastTs),
          intervalMs: 3000,
          onResult: (nextTs) => {
            lastTs = nextTs;
          },
          onError: (err) => {
            console.error(
              chalk.yellow(
                `Log poll failed; retrying: ${err instanceof Error ? err.message : String(err)}`,
              ),
            );
          },
        });
      }
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });
