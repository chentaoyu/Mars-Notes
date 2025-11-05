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
  }),
};

module.exports = nextConfig;
