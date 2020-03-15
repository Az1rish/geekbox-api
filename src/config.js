module.exports = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: 'https://geekbox.now.sh/',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://geekbox:geekbox@localhost/geekbox',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://geekbox:geekbox@localhost/geekbox-test'
  }