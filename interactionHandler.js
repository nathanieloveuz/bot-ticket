const { InteractionType } = require('discord.js');
const {
  handleMenuButton,
  handleCategoryModal,
  handleTicketButton,
  handleMenuBack,
  handleReviewInteraction
} = require('./buttonHandler');
const { handleModalSubmit } = require('./modalHandler');

async function handleInteraction(interaction, client) {
  if (interaction.type === InteractionType.MessageComponent) {
    const customId = interaction.customId;

    // Handle tombol review/modal review
    if (customId === 'review-open-modal' || customId === 'review-modal') {
      await handleReviewInteraction(interaction, client);
      return;
    }

    // Panel kategori & menu
    if (customId.startsWith('panel-category-')) {
      await handleCategoryModal(interaction, client);
    } else if (customId === 'panel-menu') {
      await handleMenuButton(interaction, client);
    } else if (customId.startsWith('menu-')) {
      if (customId === 'menu-back') {
        await handleMenuBack(interaction, client);
      } else {
        await handleMenuButton(interaction, client);
      }
    } else if (customId.startsWith('ticket-')) {
      await handleTicketButton(interaction, client);
    }
  } else if (interaction.type === InteractionType.ModalSubmit) {
    // Modal review
    if (interaction.customId === 'review-modal') {
      await handleReviewInteraction(interaction, client);
    } else {
      await handleModalSubmit(interaction, client);
    }
  }
}

module.exports = { handleInteraction };
