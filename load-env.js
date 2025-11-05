// 加载并展开环境变量（支持变量引用）
// 这个脚本会在 Next.js 启动前执行，确保环境变量支持引用其他变量

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

// 加载 .env 文件
const env = dotenv.config();

// 展开环境变量（支持 ${VAR} 语法）
if (env.error) {
  console.warn('Warning: .env file not found or error loading:', env.error.message);
} else {
  dotenvExpand.expand(env);
}

// 导出以便在其他地方使用
module.exports = env;

