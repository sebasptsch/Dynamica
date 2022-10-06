import help from '@/help/unlock';
import Command from '@classes/Command';
import DynamicaSecondary from '@classes/Secondary';
import { SlashCommandBuilder } from '@discordjs/builders';
import checkAdminPermissions from '@preconditions/admin';
import checkCreator from '@preconditions/creator';
import { ErrorEmbed } from '@utils/discordEmbeds';
import {
  CacheType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDescription('Remove any existing locks on locked secondary channels.');

const response = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const guildMember = await interaction.guild.members.cache.get(
    interaction.user.id
  );

  const { channelId } = guildMember.voice;

  const dynamicaSecondary = DynamicaSecondary.get(channelId);

  if (dynamicaSecondary) {
    await dynamicaSecondary.unlock(interaction.client);
    await interaction.reply(`Removed lock on <#${channelId}>`);
  } else {
    await interaction.reply({
      ephemeral: true,
      embeds: [ErrorEmbed('Not a valid Dynamica channel.')],
    });
  }
};

export const unlock = new Command({
  preconditions: [checkCreator, checkAdminPermissions],
  data,
  response,
  help,
});
