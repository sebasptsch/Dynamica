import { prisma } from "../lib/prisma";
import { VoiceState } from "discord.js";
import { createSecondary, deleteSecondary } from "../lib/operations/secondary";

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    // If the channel doesn't change then just ignore it.
    if (oldVoiceState.channelId !== newVoiceState.channelId) {
      // User joins channel
      if (newVoiceState.channelId && newVoiceState.member) {
        await createSecondary(
          newVoiceState.guild.channels,
          newVoiceState.channelId,
          newVoiceState.member
        );
      }

      // User leaves subchannel
      if (oldVoiceState.channelId && oldVoiceState.channel && oldVoiceState.member) {
        await deleteSecondary(oldVoiceState.channel);
        const secondaryConfig = await prisma.secondary.findUnique({where: {id: oldVoiceState.channelId}, include: {guild:true}})
        if (secondaryConfig?.guild.textChannelsEnabled && oldVoiceState.channel?.members.size !== 0) {
        
          
            newVoiceState.channel?.permissionOverwrites.create(oldVoiceState.member?.id, 
              {"VIEW_CHANNEL": false}
            )
        
        }
        
      }
      // User joins secondary channel
      if (newVoiceState.channelId && newVoiceState.member) {
        const secondaryConfig = await prisma.secondary.findUnique({where: {id: newVoiceState.channelId}, include: {guild:true}})
        if (secondaryConfig?.guild.textChannelsEnabled) {
            newVoiceState.channel?.permissionOverwrites.create(newVoiceState.member?.id, 
              {"VIEW_CHANNEL": true}
            )
        }
      }
    }
  },
};
