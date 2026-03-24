import { Command } from "commander";
import { VERSION } from "./lib/constants.js";

import { login } from "./commands/login.js";
import { logout } from "./commands/logout.js";
import { whoami } from "./commands/whoami.js";
import { init } from "./commands/init.js";
import { deploy } from "./commands/deploy.js";
import { status } from "./commands/status.js";
import { logs } from "./commands/logs.js";
import { start } from "./commands/start.js";
import { stop } from "./commands/stop.js";
import { restart } from "./commands/restart.js";
import { destroy } from "./commands/destroy.js";
import { env } from "./commands/env.js";
import { deployments } from "./commands/deployments.js";

const program = new Command()
  .name("maritime")
  .description("Maritime CLI — deploy and manage AI agents")
  .version(VERSION);

program.addCommand(login);
program.addCommand(logout);
program.addCommand(whoami);
program.addCommand(init);
program.addCommand(deploy);
program.addCommand(status);
program.addCommand(logs);
program.addCommand(start);
program.addCommand(stop);
program.addCommand(restart);
program.addCommand(destroy);
program.addCommand(env);
program.addCommand(deployments);

program.parse();
