function log(...args) {
  console.log('[LOG]', ...args);
}
function error(...args) {
  console.error('[ERR]', ...args);
}

module.exports = { log, error };
