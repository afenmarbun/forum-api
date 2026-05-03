/* eslint-disable camelcase */
module.exports = {
  apps: [
    {
      name: 'forum-api',
      script: 'src/app.js',
      cwd: '/var/www/forum-api',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};