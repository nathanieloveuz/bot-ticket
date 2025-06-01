const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js');
const config = require('../../config.json');
const db = require('../../database/db');
const {
  getPanelButtons,
  getMenuButtons,
  buildMenuEmbed,
  buildInformasiEmbed,
  buildLeaderboardEmbed,
  buildReviewEmbed,
  buildPanelEmbed,
  buildStatistikEmbed
} = require('../utils/embedTemplate');
const { CATEGORIES, STATUS_EMOJI, TICKET_STATUS } = require('../constants');

// --- Panel utama setup (anti duplicate) ---
async function setupPanelMessage(client) {
  const panelChannel = await client.channels.fetch(config.panelChannelId).catch(() => null);
  if (!panelChannel) return;
  const messages = await panelChannel.messages.fetch({ limit: 10 }).catch(() => []);
  let panelMsg = messages.find((m) => m.author.id === client.user.id && m.embeds[0]?.title === '📬 Panel Ticket');
  if (!panelMsg) {
    const embed = await buildPanelEmbed(client);
    await panelChannel.send({ embeds: [embed], components: [getPanelButtons()] });
  }
}

// --- Handle tombol kategori (modal) ---
async function handleCategoryModal(interaction, client) {
  const kategori = interaction.customId.replace('panel-category-', '');
  const catObj = CATEGORIES.find((c) => c.key === kategori);

  // Cek: user sudah punya ticket aktif?
  const active = await db.getActiveTicketByUser(interaction.user.id, client);
  if (active) {
    await interaction.reply({ content: '❌ Kamu masih punya ticket berjalan. Selesaikan dulu sebelum buat baru.', ephemeral: true });
    return;
  }

  // Modal sesuai kategori
  const modal = new ModalBuilder().setCustomId(`modal-submit-${kategori}`).setTitle(`Buat Ticket: ${catObj.label}`);
  let inputs = [];
  if (kategori === 'support') {
    inputs = [
      ['subject', 'Judul Masalah', TextInputStyle.Short],
      ['desc', 'Deskripsi Masalah (detail)', TextInputStyle.Paragraph]
    ];
  } else if (kategori === 'claim') {
    inputs = [
      ['role', 'Role yang ingin diklaim', TextInputStyle.Short],
      ['proof', 'Bukti (link/screenshot)', TextInputStyle.Short]
    ];
  } else if (kategori === 'partner') {
    inputs = [
      ['komunitas', 'Nama Komunitas', TextInputStyle.Short],
      ['link', 'Link Komunitas', TextInputStyle.Short],
      ['desc', 'Deskripsi kerjasama', TextInputStyle.Paragraph]
    ];
  } else {
    inputs = [
      ['subject', 'Judul Ticket', TextInputStyle.Short],
      ['desc', 'Detail permintaan', TextInputStyle.Paragraph]
    ];
  }
  modal.addComponents(
    ...inputs.map(([id, label, style]) =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(true)
      )
    )
  );

  await interaction.showModal(modal);
}

// --- Handle tombol Menu utama dan submenu ---
async function handleMenuButton(interaction, client) {
  const customId = interaction.customId;
  let embed;
  if (customId === 'menu-informasi') embed = buildInformasiEmbed();
  else if (customId === 'menu-leaderboard') {
    const allTickets = await db.getAllTickets();
    const leaderboard = {};
    allTickets.forEach((t) => {
      leaderboard[t.userId] = (leaderboard[t.userId] || 0) + 1;
    });
    const data = Object.entries(leaderboard)
      .map(([userId, ticketCount]) => ({ userId, ticketCount }))
      .sort((a, b) => b.ticketCount - a.ticketCount)
      .slice(0, 10);
    embed = buildLeaderboardEmbed(data);
  } else if (customId === 'menu-statistik') {
    embed = await buildStatistikEmbed();
  } else if (customId === 'menu-review') embed = buildReviewEmbed();
  else embed = buildMenuEmbed();

  await interaction.update({
    embeds: [embed],
    components: [getMenuButtons()]
  });
}

// --- Handle tombol back di menu (benar-benar update pesan yang sama) ---
async function handleMenuBack(interaction, client) {
  const embed = await buildPanelEmbed(client);
  await interaction.update({
    embeds: [embed],
    components: [getPanelButtons()]
  });
}

// ----------------------
// --- Ticket Workflow ---
// ----------------------
// (isi handleTicketButton tidak berubah, tetap gunakan milikmu)

module.exports = {
  setupPanelMessage,
  handleCategoryModal,
  handleMenuButton,
  handleMenuBack,
  // ...tambahkan handler lainnya jika ada...
};
