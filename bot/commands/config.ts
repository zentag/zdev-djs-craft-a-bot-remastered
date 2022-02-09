import { Constants, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";

import configSchema from "../schemas/config-schema";

export default {
  category: "Setup",
  description: "Configure ticket categories, Support roles, and server ID",

  slash: true,
  testOnly: true,
  guildOnly: true,

  permissions: ["ADMINISTRATOR"],

  options: [
    {
      name: "setup",
      description: "attempt to auto setup",
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
    },
    {
      name: "archiveid",
      description: "set 'Archived Tickets' category's ID",
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: "id",
          description: "ID for 'Archived Tickets' category",
          type: Constants.ApplicationCommandOptionTypes.INTEGER,
          required: true,
        },
      ],
    },
    {
      name: "newticketcategoryid",
      description: "set 'New Ticket' category's ID",
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: "id",
          description: "ID for 'New Ticket' category",
          type: Constants.ApplicationCommandOptionTypes.INTEGER,
          required: true,
        },
      ],
    },
    {
      name: "roleid",
      description: "set role ID",
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: "id",
          description: "ID for 'Support Team' role",
          type: Constants.ApplicationCommandOptionTypes.INTEGER,
          required: true,
        },
      ],
    },
    {
      name: "serverid",
      description: "set server ID",
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: "id",
          description: "ID for server",
          type: Constants.ApplicationCommandOptionTypes.INTEGER,
          required: true,
        },
      ],
    },
  ],

  callback: async ({ interaction, client, guild }) => {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case "setup":
        if (!guild) {
          interaction.reply({
            content: "Sorry, this has to be used in a guild",
            ephemeral: true,
          });
          break;
        }
        const ticketcat = guild.channels.create("New Tickets", {
          type: Constants.ChannelTypes.GUILD_CATEGORY,
        });
        const guildcat = guild.channels.create("Archived Tickets", {
          type: Constants.ChannelTypes.GUILD_CATEGORY,
        });
        const suggest = guild.channels.create("Suggestions", {
          type: Constants.ChannelTypes.GUILD_TEXT,
        });
        const supportrole = guild.roles.create({ name: "Support Team" });
        const deleted = await configSchema.findOneAndDelete({
          serverId: guild.id,
        });
        configSchema.create({
          serverId: guild.id,
          roleId: (await supportrole).id,
          newId: (await ticketcat).id,
          archiveId: (await guildcat).id,
          suggestionId: (await suggest).id,
        });

        interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("Success!")
              .setColor("GREEN")
              .setDescription(
                `Your support team role is <@&${(await supportrole).id}>`
              ),
          ],
        });
    }
  },
} as ICommand;
