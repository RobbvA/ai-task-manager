// server/db/client.js
const { PrismaClient } = require("@prisma/client");

let prisma;
if (process.env.NODE_ENV !== "production") {
  if (!global.__prisma) global.__prisma = new PrismaClient();
  prisma = global.__prisma;
} else {
  prisma = new PrismaClient();
}

module.exports = prisma;
