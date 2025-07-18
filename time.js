const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

function wibNow() {
  return dayjs().tz('Asia/Jakarta').format('DD MMM YYYY, hh:mm A');
}

module.exports = { wibNow };
