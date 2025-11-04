# ========================================
# 基础镜像阶段
# ========================================
FROM node:18-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 安装 OpenSSL（Prisma 需要）
RUN apk add --no-cache openssl libc6-compat

# ========================================
# 依赖安装阶段
# ========================================
FROM base AS deps

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖（允许锁文件更新以避免版本不一致导致构建失败）
RUN pnpm install --no-frozen-lockfile

# ========================================
# 构建阶段
# ========================================
FROM base AS builder

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN pnpm prisma generate

# 构建应用
RUN pnpm build

# ========================================
# 生产运行阶段
# ========================================
FROM base AS runner

# 设置环境为生产
ENV NODE_ENV=production

# 创建用户和用户组（非 root 用户运行）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 Prisma 文件和生成的客户端
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]

