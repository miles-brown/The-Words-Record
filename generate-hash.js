const bcrypt = require('bcryptjs');
const password = process.argv[2];
if (!password) {
  console.error('Usage: node generate-hash.js <password>');
  process.exit(1);
}
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log(hash);