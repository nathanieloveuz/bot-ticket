const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const db = require('../../database/db');
const { TICKET_STATUS, STATUS_EMOJI, CATEGORIES } = require('../constants');
const { updatePanelEmbed, buildPanelEmbed, buildTicketEmbed } = require('../utils/embedTemplate');
const { wibNow } = require('../utils/time');

async function handleModalSubmit(interaction, client) {
  const kategori = interaction.customId.replace('modal-submit-', '');
  const userId = interaction.user.id;
  const kategoriObj = CATEGORIES.find(c => c.key === kategori);
  const kategoriName = kategoriObj ? kategoriObj.label : kategori;
  const kategoriEmoji = kategoriObj ? kategoriObj.label.split(' ')[0] : '💬';

  // Ambil data field modal
  const fields = {};
  for (const [id, comp] of interaction.fields.fields) {
    fields[id] = comp.value;
  }

  // Simpan ticket ke DB
  const lobbyChannel = await client.channels.fetch(config.lobbyChannelId).catch(() => null);
  if (!lobbyChannel) {
    return await interaction.reply({ content: '❌ Lobby channel tidak ditemukan!', ephemeral: true });
  }

  // Kirim embed ke lobby, status "submitted" (format rapi)
  const embed = buildTicketEmbed({
    type: 'lobby',
    kategori,
    kategoriName,
    kategoriEmoji,
    userId,
    formData: fields,
    statusText: `${STATUS_EMOJI.submitted} Ticket menunggu konfirmasi...`,
    isTicketChannel: false
  });

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket-confirm')
      .setLabel('Konfirmasi Ticket')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅')
  );

  const lobbyMsg = await lobbyChannel.send({ embeds: [embed], components: [actionRow] });

  // Simpan DB
  const ticketId = await db.createTicket(userId, TICKET_STATUS.SUBMITTED, fields, lobbyMsg.id, kategori);

  // Update panel utama (waiting list)
  const panelChannel = await client.channels.fetch(config.panelChannelId).catch(() => null);
  if (panelChannel) await updatePanelEmbed(panelChannel, client);

  await interaction.reply({ content: '✅ Ticket kamu telah dikirim dan masuk waiting list!', ephemeral: true });
}

module.exports = { handleModalSubmit };
