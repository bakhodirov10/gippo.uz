const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$connect()
  .then(() => {
    console.log('DB_CONNECTED_SUCCESSFULLY');
    process.exit(0);
  })
  .catch((e) => {
    console.error('DB_CONNECTION_FAILED:', e.message);
    process.exit(1);
  });
