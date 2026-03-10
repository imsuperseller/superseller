module.exports = {
  apps: [
    {
      name: "tourreel-worker", // TODO: rename to "videoforge-worker" on server (PM2 name must match)
      script: "npx",
      args: "tsx src/index.ts",
      cwd: "/opt/tourreel-worker/apps/worker",
      node_args: "--max-old-space-size=2048",
      max_memory_restart: "1800M",
      env: {
        NODE_ENV: "production",
      },
      // Restart behavior
      exp_backoff_restart_delay: 1000,
      max_restarts: 50,
      restart_delay: 3000,
      // Logs
      error_file: "/root/.pm2/logs/tourreel-worker-error.log",
      out_file: "/root/.pm2/logs/tourreel-worker-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
