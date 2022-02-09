import { ICommand } from "wokcommands";
import {
  CategoryChannel,
  Permissions,
  MessageEmbed,
  Constants,
  MessageButton,
  MessageActionRow,
  Client,
  Interaction,
  GuildBasedChannel,
  TextBasedChannel,
  TextChannel,
} from "discord.js";

import configSchema from "../schemas/config-schema";

export default {
  category: "User Input",
  description: "Start a ticket",

  slash: true,
  testOnly: true,
  guildOnly: true,

  options: [
    {
      name: "desc",
      description: "description of issue",
      required: true,
      type: Constants.ApplicationCommandOptionTypes.STRING,
    },
  ],

  callback: async ({ interaction, client, args, guild }) => {
    if (interaction) {
      if (!guild) {
        interaction.reply({
          content: "Sorry, this has to be used in a guild",
          ephemeral: true,
        });
        return;
      }
      const doc = await configSchema.findOne({ serverId: guild.id });
      const serverId = doc.serverId;
      const roleId = doc.serverId;
      const newId = doc.newId;
      const archiveId = doc.archiveId;
      //@ts-expect-error
      const category: CategoryChannel = guild!.channels.cache.get(
        newId || process.env.ticketcategory!
      );
      //@ts-expect-error
      const archivecategory: CategoryChannel = guild!.channels.cache.get(
        archiveId || process.env.archivedcategory!
      );
      const count = category.children.size + archivecategory.children.size;
      const channel = await category.createChannel(`Ticket ${count + 1}`, {
        type: "GUILD_TEXT",
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: Permissions.FLAGS.VIEW_CHANNEL,
          },
          {
            id: serverId || process.env.server!,
            deny: Permissions.FLAGS.VIEW_CHANNEL,
          },
          {
            id: roleId || process.env.roleid!,
            allow: Permissions.FLAGS.VIEW_CHANNEL,
          },
        ],
      });
      interaction.reply({
        content: `<@${interaction.user.id}>erver!`,
        embeds: [
          new MessageEmbed()
            .setTitle("Ticket channel created")
            .setDescription(`Find it here: <#${channel.id}>`),
        ],
      });
      channel.send({
        content: `<@${interaction.user.id}>, <@&${
          roleId || process.env.roleid
        }>`,
        embeds: [
          new MessageEmbed()
            .setTitle("New Ticket")
            .setDescription(`*${args[0]}*`),
        ],
        components: [ticketRow],
      });
    }
  },
  init: (client: Client) => {
    client.on("interactionCreate", async (interaction: Interaction) => {
      if (
        !interaction.isButton() ||
        (interaction.customId !== "lock" && interaction.customId !== "archive")
      )
        return;
      const guild = interaction.guild;
      if (!guild) {
        interaction.reply({
          content: "Sorry, this has to be used in a guild",
          ephemeral: true,
        });
        return;
      }
      const doc = await configSchema.findOne({ serverId: guild.id });
      const archiveId = doc.archiveId;
      //@ts-expect-error
      const channel: TextChannel = guild!.channels.cache.get(
        interaction.channelId
      )!;
      //@ts-expect-error
      const category: CategoryChannel = guild!.channels.cache.get(
        archiveId || process.env.archivedcategory!
      )!;
      switch (interaction.customId) {
        case "archive":
          channel.setParent(category);
          channel.edit({
            permissionOverwrites: [
              {
                id: guild!.id!,
                deny: Permissions.FLAGS.SEND_MESSAGES,
              },
              {
                id: guild!.id!,
                deny: Permissions.FLAGS.VIEW_CHANNEL,
              },
              {
                id: interaction.user.id,
                allow: Permissions.FLAGS.VIEW_CHANNEL,
              },
            ],
          });
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setTitle("Success")
                .setDescription("This ticket has been archived")
                .setColor("GREEN"),
            ],
          });
          const message = channel.messages.cache.get(interaction.message.id);
          if (!message) break;
          message.edit({ components: [dticketRow] });
          break;
      }
    });
  },
} as ICommand;

const ticketRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("archive")
    .setLabel("Archive")
    .setEmoji("🗄️")
    .setStyle("DANGER")
);
const dticketRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("archive")
    .setLabel("Archive")
    .setEmoji("🗄️")
    .setStyle("DANGER")
    .setDisabled(true)
);
