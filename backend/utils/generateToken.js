
const jwt = require('jsonwebtoken');
module.exports = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
