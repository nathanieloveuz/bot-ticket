module.exports = {
  TICKET_STATUS: {
    SUBMITTED: 'submitted',
    CHECKING: 'checking',
    CONFIRMED: 'confirmed',
    ARCHIVED: 'archived',
    DELETED: 'deleted',
    REJECTED: 'rejected'
  },
  STATUS_EMOJI: {
    submitted: '✉️',
    checking: '📩',
    confirmed: '📨',
    archived: '📂',
    deleted: '🗑️',
    rejected: '🗑️'
  },
  CATEGORIES: [
    { key: 'support', label: '🛠️ Support' },
    { key: 'claim', label: '🎫 Claim Role' },
    { key: 'partner', label: '🤝 Partnership' },
    { key: 'other', label: '💬 Lainnya' }
  ]
};
