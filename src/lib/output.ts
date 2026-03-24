import chalk from "chalk";

const STATUS_COLORS: Record<string, (s: string) => string> = {
  running: chalk.green,
  stopped: chalk.gray,
  building: chalk.yellow,
  deploying: chalk.yellow,
  error: chalk.red,
  created: chalk.blue,
  pending: chalk.yellow,
};

export function colorStatus(status: string): string {
  const fn = STATUS_COLORS[status] || chalk.white;
  return fn(status);
}

export function table(
  headers: string[],
  rows: string[][],
): void {
  // Calculate column widths
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => stripAnsi(r[i] || "").length)),
  );

  const sep = widths.map((w) => "─".repeat(w + 2)).join("┼");
  const formatRow = (row: string[]) =>
    row
      .map((cell, i) => {
        const pad = widths[i] - stripAnsi(cell || "").length;
        return ` ${cell}${" ".repeat(Math.max(0, pad))} `;
      })
      .join("│");

  console.log(chalk.bold(formatRow(headers)));
  console.log(sep);
  rows.forEach((row) => console.log(formatRow(row)));
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
