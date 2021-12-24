import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { checkGuild } from "../lib/checks/guild";
import { checkPermissions } from "../lib/checks/permissions";
import { checkSecondary } from "../lib/checks/validSecondary";
import { SuccessEmbed } from "../lib/discordEmbeds";
import { getGuildMember } from "../lib/getCached";
import { db } from "../lib/prisma";
import { Command } from "./command";

export const allyourbase: Command = {
  conditions: [checkSecondary, checkGuild, checkPermissions],
  data: new SlashCommandBuilder()
    .setName("allyourbase")
    .setDescription(
      "If you are an admin you become the owner of the channel you are in."
    ),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    if (!channel) return;
    if (!guildMember?.voice.channel) return;

    await db.secondary.update({
      where: { id: channel.id },
      data: { creator: interaction.user.id },
    });
    await interaction.reply({
      embeds: [
        SuccessEmbed(
          `Owner of <#${guildMember.voice.channel.id}> changed to <@${guildMember.user.id}>`
        ),
      ],
    });
  },
};
