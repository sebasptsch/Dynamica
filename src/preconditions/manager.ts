import logger from '@utils/logger';
import { CommandInteraction } from 'discord.js';

/**
 * Checks permissions for Dynamica Manager role. (admin overrides)
 * @param interaction Discord Interaction
 * @returns Boolean if the member has permission to manage dynamica channels.
 */
export default async (interaction: CommandInteraction) => {
  try {
    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const dynamicaManager = guildMember?.roles.cache.some(
      (role) => role.name === 'Dynamica Manager'
    );
    const admin = guildMember.permissions.has('ADMINISTRATOR');
    if (!dynamicaManager && !admin) {
      return {
        success: false,
        message: 'You must have the Dynamica Manager role to use this command.',
      };
    }

    return dynamicaManager || admin
      ? { success: true }
      : {
          success: false,
          message: 'You must be an admin to use this command.',
        };
  } catch (error) {
    logger.error('error in manager check', error);
    return { success: false, message: 'An error occured.' };
  }
};
