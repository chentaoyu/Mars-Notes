/**
 * PM2 配置文件
 * 用途：管理应用进程和 webhook 服务器
 *
 * 使用方法：
 * pm2 start ecosystem.config.js
 * pm2 save
 * pm2 startup
 */

// 加载环境变量
require('./load-env');

module.exports = {
  apps: [
    {
      // 主应用
      name: "mars-notes",
      script: "node",
      args: "scripts/start-server.js",
      cwd: "/var/www/note-book",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // 从 .env 文件加载的环境变量会自动合并
        ...process.env,
      },
      // 日志配置
      error_file: "/var/www/logs/mars-notes-error.log",
      out_file: "/var/www/logs/mars-notes-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // 自动重启配置
      watch: false,
      max_memory_restart: "1G",
      // 进程管理
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
      // 健康检查（如果应用有健康检查端点）
      // health_check_grace_period: 3000,
    },
    // 如果需要运行 webhook 服务器，取消下面的注释
    // {
    //   name: 'webhook-server',
    //   script: 'scripts/webhook-server.js',
    //   cwd: '/var/www/note-book',
    //   instances: 1,
    //   exec_mode: 'fork',
    //   env: {
    //     NODE_ENV: 'production',
    //     PORT: 9000,
    //     WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || 'your-webhook-secret',
    //     DEPLOY_SCRIPT: '/var/www/note-book/scripts/deploy.sh',
    //     DEPLOY_BRANCH: 'main',
    //   },
    //   error_file: '/var/log/webhook-error.log',
    //   out_file: '/var/log/webhook-out.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   watch: false,
    //   max_memory_restart: '500M',
    // },
  ],
};
