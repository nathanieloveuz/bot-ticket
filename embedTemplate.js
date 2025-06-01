const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');
const { wibNow } = require('./time');
const { STATUS_EMOJI, CATEGORIES } = require('../constants');
const db = require('../../database/db');

function getFooterText() {
  return `Developer by @${config.developerFooter} | Today at ${wibNow()}`;
}

// -------- PANEL UTAMA (dengan waiting list) --------
async function buildPanelEmbed(client) {
  const waitingList = await db.getWaitingList();
  let waitingText = '';
  if (waitingList.length === 0) {
    waitingText = 'Tidak ada ticket yang sedang menunggu.\n';
  } else {
    waitingText = waitingList
      .map((ticket) => {
        const userMention = `<@${ticket.userId}>`;
        const emoji = STATUS_EMOJI[ticket.status] || '✉️';
        return `• ${userMention} [ ${emoji} ]`;
      })
      .join('\n');
  }

  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('📬 Panel Ticket')
    .setDescription(
      `Selamat datang di Panel Tiket ${config.serverName}!\n\n` +
      `**Pilih kategori ticket sesuai kebutuhan kamu:**\n` +
      CATEGORIES.map((c) => `> ${c.label} — ${descKategori(c.key)}`).join('\n') +
      `\n\n**Waiting list ticket:**\n${waitingText}\n` +
      `**Note:**\n` +
      '• ✉️ : tahap pengiriman\n' +
      '• 📩 : dalam pengecekan\n' +
      '• 📨 : konfirmasi berhasil\n' +
      '• 🗑️ : ditolak'
    )
    .setFooter({ text: getFooterText() });
}

function descKategori(key) {
  if (key === 'support') return 'Bantuan terkait server, bot, dsb';
  if (key === 'claim') return 'Klaim role khusus';
  if (key === 'partner') return 'Kerjasama/partnership';
  if (key === 'other') return 'Kebutuhan selain di atas';
  return '-';
}

// -------- PANEL MENU --------
function buildMenuEmbed() {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('📋 Menu Panel Ticket')
    .setDescription(
      '**Menu Fitur Panel:**\n\n' +
      '• ℹ️ **Informasi** — Penjelasan lengkap sistem ticket\n' +
      '• 🏆 **Leaderboard** — Top pengguna/staff by ticket\n' +
      '• 📊 **Statistik** — Statistik tiket per kategori\n' +
      '• ⭐ **Review** — Lihat/beri review pelayanan\n\n' +
      '_Klik tombol di bawah untuk akses fitur, atau klik **Back** untuk kembali ke Panel Utama._'
    )
    .setFooter({ text: getFooterText() });
}

function buildInformasiEmbed() {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('ℹ️ Informasi Sistem Ticket')
    .setDescription(
      '**Sistem Ticket** bertujuan membantu kamu mendapatkan bantuan/admin dengan mudah.\n\n' +
      '- Pilih kategori yang sesuai.\n' +
      '- Setelah submit, request kamu akan masuk waiting list dan dicek admin/staff.\n' +
      '- Status ticket kamu bisa dipantau di panel utama.\n' +
      '- Transkrip & feedback tersedia otomatis.\n\n' +
      'Selalu gunakan kategori yang tepat agar proses lebih cepat!'
    )
    .setFooter({ text: getFooterText() });
}

function buildLeaderboardEmbed(data = []) {
  let desc = data.length === 0
    ? 'Belum ada data leaderboard!'
    : data
        .map((row, i) => `**${i + 1}.** <@${row.userId}> — ${row.ticketCount} ticket`)
        .join('\n');
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🏆 Ticket Leaderboard')
    .setDescription(desc)
    .setFooter({ text: getFooterText() });
}

async function buildStatistikEmbed() {
  const allTickets = await db.getAllTickets();
  const perKategori = {};
  CATEGORIES.forEach(c => perKategori[c.key] = 0);
  allTickets.forEach(t => {
    if (perKategori[t.category] !== undefined) perKategori[t.category]++;
    else perKategori.other = (perKategori.other || 0) + 1;
  });
  const total = allTickets.length;
  let statText = CATEGORIES.map(c =>
    `> **${c.label.replace(/^[^ ]+ /, '')}:** \`${perKategori[c.key] || 0} tiket\``
  ).join('\n');

  return new EmbedBuilder()
    .setColor('#3BA55D')
    .setTitle('📊 Statistik Tiket Per Kategori')
    .setDescription(
      `**Total Tiket:** \`${total}\`\n\n${statText}\n\n` +
      '_Pantau statistik dan gunakan sistem tiket secara bijak!_ 🚀'
    )
    .setFooter({ text: getFooterText() });
}

function buildReviewEmbed() {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('⭐ Review & Feedback')
    .setDescription(
      'Beri rating pelayanan staff! (fitur coming soon)\n\n' +
      'Setelah ticket selesai/diarchive, kamu bisa memberikan review melalui sistem ini.'
    )
    .setFooter({ text: getFooterText() });
}

function getPanelButtons() {
  return new ActionRowBuilder().addComponents(
    ...CATEGORIES.map((c) =>
      new ButtonBuilder()
        .setCustomId(`panel-category-${c.key}`)
        .setLabel(c.label.replace(/^[^ ]+ /, ''))
        .setStyle(ButtonStyle.Primary)
        .setEmoji(c.label.split(' ')[0])
    ),
    new ButtonBuilder()
      .setCustomId('panel-menu')
      .setLabel('Menu')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📋')
  );
}

function getMenuButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('menu-informasi')
      .setLabel('Informasi')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('ℹ️'),
    new ButtonBuilder()
      .setCustomId('menu-leaderboard')
      .setLabel('Leaderboard')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🏆'),
    new ButtonBuilder()
      .setCustomId('menu-statistik')
      .setLabel('Statistik')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📊'),
    new ButtonBuilder()
      .setCustomId('menu-review')
      .setLabel('Review')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('⭐'),
    new ButtonBuilder()
      .setCustomId('menu-back')
      .setLabel('Back')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔙')
  );
}

async function updatePanelEmbed(panelChannel, client) {
  const messages = await panelChannel.messages.fetch({ limit: 10 }).catch(() => []);
  let panelMsg = messages.find((m) => m.author.id === client.user.id && m.embeds[0]?.title === '📬 Panel Ticket');

  const embed = await buildPanelEmbed(client);

  if (panelMsg) {
    await panelMsg.edit({ embeds: [embed], components: [getPanelButtons()] }).catch(() => {});
  } else {
    await panelChannel.send({ embeds: [embed], components: [getPanelButtons()] });
  }
}

module.exports = {
  buildPanelEmbed,
  buildMenuEmbed,
  buildInformasiEmbed,
  buildLeaderboardEmbed,
  buildReviewEmbed,
  buildStatistikEmbed,
  getPanelButtons,
  getMenuButtons,
  updatePanelEmbed
};
