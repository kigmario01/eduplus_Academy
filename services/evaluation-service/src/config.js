require('dotenv').config();

module.exports = {
  port: process.env.PORT ? Number(process.env.PORT) : 5005,
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/eduplus',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
};