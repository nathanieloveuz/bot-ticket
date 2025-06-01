const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const db = require('./database/db');
const { updatePanelEmbed } = require('./src/utils/embedTemplate');
const { handleInteraction } = require('./src/handlers/interactionHandler');
const { setupPanelMessage } = require('./src/handlers/buttonHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ========== CLIENT READY ==========
client.once('ready', async () => {
  console.log(`[READY] Logged in as ${client.user.tag}`);

  // Setup panel embed (anti duplicate)
  await setupPanelMessage(client);

  // Auto update waiting list on startup
  const panelChannel = await client.channels.fetch(config.panelChannelId).catch(() => null);
  if (panelChannel) await updatePanelEmbed(panelChannel, client);

  // Siapkan collection untuk interaction custom
  client.interactions = new Collection();
});

// ========== INTERACTION HANDLER ==========
client.on('interactionCreate', async (interaction) => {
  try {
    await handleInteraction(interaction, client);
  } catch (err) {
    console.error('Error Interaction:', err);
    if (interaction.isRepliable()) {
      await interaction.reply({ content: '❌ Terjadi error pada bot.', ephemeral: true }).catch(() => {});
    }
  }
});

// ========== GUILD MEMBER REMOVE (opsional auto clean) ==========
client.on('guildMemberRemove', async (member) => {
  // (opsional) Auto clean ticket jika user keluar (bisa dikembangkan)
});

// ========== BOT LOGIN ==========
client.login(config.token);
