// 加载并展开环境变量（支持变量引用）
require("./load-env");

console.log("process.env.NODE_ENV", process.env.NODE_ENV);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 输出模式
  output: "standalone",

  // TypedRoutes 配置（Next.js 16+ 移到顶层）
  typedRoutes: false,

  // 实验性功能
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    // 优化包导入（减少编译时间）
    optimizePackageImports: ["lucide-react", "react-markdown", "react-syntax-highlighter"],
  },

  // 图片优化
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // 开发模式优化
  ...(process.env.NODE_ENV === "development" && {
    // 禁用开发模式下的压缩（加快编译）
    compress: false,
    // 减少 Webpack 构建时间
    webpack: (config, { dev, isServer }) => {
      if (dev) {
        // 关闭 source map 以加快编译（如需调试可注释掉）
        config.devtool = "eval-cheap-module-source-map";

        // 优化模块解析
        config.resolve.alias = {
          ...config.resolve.alias,
          // 确保使用相同的 React 实例
          react: require.resolve("react"),
          "react-dom": require.resolve("react-dom"),
        };
      }
      return config;
    },
  }),

  // 生产模式配置
  ...(process.env.NODE_ENV === "production" && {
    compress: true,
    // 构建优化：限制并发和内存使用
    webpack: (config, { dev, isServer }) => {
      if (!dev) {
        // 优化缓存以减少内存使用
        config.cache = {
          type: "filesystem",
          buildDependencies: {
            config: [__filename],
          },
        };

        // 减少内存使用的优化
        config.optimization = {
          ...config.optimization,
          // 使用确定性模块 ID，减少内存占用
          moduleIds: "deterministic",
          // 简化代码分割，减少内存使用
          splitChunks: {
            chunks: "all",
            maxInitialRequests: 20,
            minSize: 20000,
            cacheGroups: {
              default: false,
              vendors: false,
              // 只对较大的包进行分割，减少分割数量
              vendor: {
                name: "vendor",
                chunks: "all",
                test: /[\\/]node_modules[\\/]/,
                minChunks: 2,
                priority: 20,
                reuseExistingChunk: true,
                enforce: true,
              },
            },
          },
        };

        // 限制某些 loader 的内存使用
        if (config.module && config.module.rules) {
          config.module.rules.forEach((rule) => {
            if (rule.use && Array.isArray(rule.use)) {
              rule.use.forEach((use) => {
                if (use.loader && use.loader.includes("thread-loader")) {
                  // 限制 thread-loader 的 worker 数量
                  use.options = {
                    ...use.options,
                    workers: 1,
                  };
                }
              });
            }
          });
        }
      }
      return config;
    },
  }),
};

module.exports = nextConfig;
