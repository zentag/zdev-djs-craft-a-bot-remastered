import { ICommand } from "wokcommands";
import { Constants, GuildTextBasedChannel, Interaction, MessageEmbed } from "discord.js";

import configSchema from "../schemas/config-schema";

export default {
  category: "User Input",
  description: "Suggest something for the server",

  slash: true,
  testOnly: true,
  guildOnly: true,

  options: [
    {
      name: "suggestion",
      description: "suggestion",
      required: true,
      type: Constants.ApplicationCommandOptionTypes.STRING,
    },
  ],
  callback: async ({ user, guild,args, interaction }) => {
    if (!guild) return;
    const doc = await configSchema.findOne({ guildId: guild.id });
    if (!doc || !doc.suggestionId)
      return "Sorry, ask the server admin to configure a suggestions channel";
    //@ts-expect-error
    const suggestions: GuildTextBasedChannel = guild!.channels.cache.get(doc.suggestionId);
    const message = await suggestions.send({embeds:[new MessageEmbed().setTitle(`New suggestion from ${user.tag}`).setDescription(args[0])]})
    message.react("✅")
    message.react("❌")
    interaction.reply({content: `Posted! Find it here: ${message.url}`, ephemeral: true})
  },
} as ICommand;
