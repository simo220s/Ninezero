/**
 * PM2 Ecosystem Configuration
 * 
 * This file configures PM2 process manager for production deployment
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload ecosystem.config.js --env production
 *   pm2 stop ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'saudi-english-club-api',
      script: './dist/server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable cluster mode for load balancing
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced features
      watch: false, // Disable in production
      ignore_watch: ['node_modules', 'logs', 'dist'],
      
      // Auto-restart configuration
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      min_uptime: '10s', // Minimum uptime before considering app stable
      max_restarts: 10, // Maximum number of restarts within 1 minute
      autorestart: true, // Auto-restart on crash
      
      // Graceful shutdown
      kill_timeout: 5000, // Time to wait for graceful shutdown
      wait_ready: true, // Wait for app to emit 'ready' event
      listen_timeout: 10000, // Time to wait for app to listen
      
      // Source map support
      source_map_support: true,
      
      // Node.js arguments
      node_args: [
        '--max-old-space-size=2048', // Increase heap size to 2GB
        '--optimize-for-size', // Optimize for memory usage
      ],
      
      // Cron restart (optional - restart daily at 3 AM)
      cron_restart: '0 3 * * *',
      
      // Environment file
      env_file: '.env.production',
    },
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/saudi-english-club.git',
      path: '/var/www/saudi-english-club',
      'post-deploy': 'cd auth-backend && npm ci --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git',
    },
  },
};
