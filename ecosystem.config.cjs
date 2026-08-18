// PM2 Process Manager Configuration for Hostinger VPS (Ubuntu / Debian)
module.exports = {
  apps: [
    {
      name: 'casescreenchecker',
      script: 'server.ts',
      interpreter: 'node',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
