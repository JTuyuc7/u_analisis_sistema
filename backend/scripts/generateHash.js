const bcrypt = require('bcrypt');

async function generateHash() {
    const password = '123456';
    const hash = await bcrypt.hash(password, 10);
}

generateHash();
