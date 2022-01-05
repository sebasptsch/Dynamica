import Fuse from "fuse.js";
import { AutocompleteBuilder } from "../lib/builders";
import { db } from "../lib/prisma";

export const general = new AutocompleteBuilder()
  .setCommandName("channel")
  .setResponse(async (interaction) => {
    const { value } = interaction.options.getFocused(true);
    const primaries = await db.primary.findMany({
      where: { guildId: interaction.guild.id },
    });

    if (!interaction.guild) return;

    const discordChannels = [...interaction.guild.channels.cache.values()];

    const availablePrimaryChannels = discordChannels.filter((discordChannel) =>
      primaries.find((primary) => discordChannel.id === primary.id)
    );
    const options = availablePrimaryChannels.map((channel) => ({
      name: channel.name,
      value: channel.id,
    }));
    const fuse = new Fuse(options, { keys: ["name", "id"] });
    const query = fuse.search(value.toString());
    interaction.respond(query.map((result) => result.item));
  });
