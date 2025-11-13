// 加载并展开环境变量（支持变量引用）
// 这个脚本会在 Next.js 启动前执行，确保环境变量支持引用其他变量

const path = require("path");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

// 确定 .env 文件路径
// load-env.js 在项目根目录，所以 __dirname 就是项目根目录
const projectRoot = __dirname;
const envPath = path.join(projectRoot, ".env");

// 加载 .env 文件
const env = dotenv.config({ path: envPath });

// 展开环境变量（支持 ${VAR} 语法）
if (env.error) {
  console.warn("Warning: .env file not found or error loading:", env.error.message);
  console.warn(`Looking for .env at: ${envPath}`);
} else {
  dotenvExpand.expand(env);
}

// 导出以便在其他地方使用
module.exports = env;
