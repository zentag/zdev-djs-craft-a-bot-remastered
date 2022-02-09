import "dotenv/config";
import { Intents, Client } from "discord.js";
import WOKCommands from "wokcommands";
import path from "path";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.on("ready", async () => {
  console.log("ready");

  client!.user!.setActivity("CraftACat || -help", { type: "PLAYING" });
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, "commands"),
    featuresDir: path.join(__dirname, "features"),
    typeScript: true,
    testServers: ["811390529728020480"],
    botOwners: ["521115847801044993"],
    disabledDefaultCommands: ["language", "requiredrole"],
    mongoUri: process.env.mongoPath,
  }).setDefaultPrefix("-");
});
client.login(process.env.token);
