import { Command } from "commander";
import { clearApiKey } from "../lib/config.js";

export const logout = new Command("logout")
  .description("Remove stored API key")
  .action(() => {
    clearApiKey();
    console.log("Logged out.");
  });
