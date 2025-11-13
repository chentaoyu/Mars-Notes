#!/usr/bin/env node

/**
 * 启动脚本 - 用于 standalone 模式
 * 在运行 standalone server 之前加载 .env 文件
 */

const path = require("path");
const { spawn } = require("child_process");

// 加载环境变量
require("./load-env");

// 获取 standalone server 路径
const serverPath = path.join(__dirname, ".next/standalone/server.js");

// 启动服务器
const server = spawn("node", [serverPath], {
  stdio: "inherit",
  env: {
    ...process.env,
  },
});

server.on("error", (error) => {
  console.error("启动服务器失败:", error);
  process.exit(1);
});

server.on("exit", (code) => {
  process.exit(code);
});

// 处理退出信号
process.on("SIGTERM", () => {
  server.kill("SIGTERM");
});

process.on("SIGINT", () => {
  server.kill("SIGINT");
});
