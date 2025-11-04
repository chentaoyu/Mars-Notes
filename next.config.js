/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 SWC 编译器
  swcMinify: true,

  // 输出模式（Docker 部署需要）
  output: "standalone",

  // 实验性功能
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

  // 图片优化
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // 压缩
  compress: true,
};

module.exports = nextConfig;
