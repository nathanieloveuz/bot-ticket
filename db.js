getActiveTicketByUser: async (userId, client) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM tickets WHERE userId = ? AND status NOT IN ('archived', 'deleted', 'rejected') ORDER BY createdAt DESC LIMIT 1`,
      [userId],
      async (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        if (row.ticketChannelId && client) {
          try {
            const channel = await client.channels.fetch(row.ticketChannelId).catch(() => null);
            if (!channel) {
              await new Promise((res, rej) => {
                db.run(`UPDATE tickets SET status = 'deleted' WHERE id = ?`, [row.id], function (e) {
                  if (e) return rej(e);
                  res();
                });
              });
              return resolve(null);
            }
          } catch {
            await new Promise((res, rej) => {
              db.run(`UPDATE tickets SET status = 'deleted' WHERE id = ?`, [row.id], function (e) {
                if (e) return rej(e);
                res();
              });
            });
            return resolve(null);
          }
        }
        return resolve(row);
      }
    );
  });
},
