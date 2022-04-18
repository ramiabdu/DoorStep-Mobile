const crypto = require('crypto');

const randomId = (prefix) =>
  `${prefix}_${crypto.randomBytes(9).toString('hex')}`;

const orderNumber = () => {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');

  return `DS-${stamp}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

module.exports = {
  orderNumber,
  randomId,
};
