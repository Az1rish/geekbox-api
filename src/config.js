module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  // CLIENT_ORIGIN: 'https://geekbox.now.sh',
  CLIENT_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://geekbox:geekbox@localhost/geekbox',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://geekbox:geekbox@localhost/geekbox-test',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
};
