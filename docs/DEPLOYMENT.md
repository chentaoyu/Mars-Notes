# Mars-Notes - 部署指南

## 文档信息

- **项目名称**: Mars-Notes
- **版本**: v1.0
- **文档版本**: 1.0
- **创建日期**: 2025-11-04
- **最后更新**: 2025-11-04

---

## 目录

1. [环境要求](#1-环境要求)
2. [本地开发](#2-本地开发)
3. [环境变量配置](#3-环境变量配置)
4. [数据库设置](#4-数据库设置)
5. [生产部署](#5-生产部署)
6. [持续集成/持续部署](#6-持续集成持续部署)
7. [监控与维护](#7-监控与维护)
8. [常见问题](#8-常见问题)

---

## 1. 环境要求

### 1.1 开发环境

| 工具 | 版本要求 | 说明 |
|-----|---------|------|
| Node.js | 18.17.0+ | 推荐使用 LTS 版本 |
| npm | 9.0.0+ | 或使用 pnpm/yarn |
| PostgreSQL | 14.0+ | 数据库 |
| Git | 2.30.0+ | 版本控制 |

### 1.2 推荐工具

- **代码编辑器**: VS Code
- **API 测试**: Postman / Insomnia
- **数据库管理**: pgAdmin / DBeaver / TablePlus
- **终端**: iTerm2 (macOS) / Windows Terminal

### 1.3 VS Code 扩展推荐

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "GitHub.copilot"
  ]
}
```

---

## 2. 本地开发

### 2.1 克隆项目

```bash
# 克隆仓库
git clone https://github.com/chentaoyu/mars-notes.git

# 进入项目目录
cd mars-notes
```

### 2.2 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm（推荐，更快）
pnpm install

# 或使用 yarn
yarn install
```

### 2.3 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填写必要的配置
nano .env  # 或使用你喜欢的编辑器
```

**`.env` 配置示例**：

```env
# 数据库连接
DATABASE_URL="postgresql://postgres@localhost:5432/notebook?schema=public"

# NextAuth.js 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# 应用配置
NODE_ENV="development"
```

**生成 NEXTAUTH_SECRET**：

```bash
# 使用 openssl 生成随机字符串
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2.4 设置数据库

#### **方法 1: 本地 PostgreSQL**

```bash
# 安装 PostgreSQL (macOS)
brew install postgresql@14

# 启动 PostgreSQL
brew services start postgresql@14

# 创建数据库
createdb notebook

# 或使用 psql
psql postgres
CREATE DATABASE notebook;
\q
```

#### **方法 2: 云数据库（推荐用于测试）**

**Vercel Postgres**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 创建 Postgres 数据库
vercel postgres create notebook

# 获取连接字符串并添加到 .env
```

**Supabase**
1. 访问 https://supabase.com
2. 创建新项目
3. 获取数据库连接字符串
4. 更新 `.env` 中的 `DATABASE_URL`

### 2.5 运行数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 运行迁移（创建数据表）
npx prisma migrate dev --name init

# 查看数据库
npx prisma studio  # 打开可视化界面 http://localhost:5555
```

### 2.6 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 或指定端口
PORT=3001 npm run dev
```

访问 http://localhost:3000 查看应用

### 2.7 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check

# 数据库相关
npx prisma studio       # 数据库可视化
npx prisma migrate dev  # 创建迁移
npx prisma migrate reset # 重置数据库（危险！）
npx prisma generate     # 生成 Prisma Client
```

---

## 3. 环境变量配置

### 3.1 环境变量说明

**`.env.example`** (提交到 Git)

```env
# ============================================
# 数据库配置
# ============================================
# 方式一：直接配置完整连接字符串
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# 方式二：使用变量引用（推荐，更灵活）
# 首先定义数据库连接的各部分（使用默认用户，无需密码）
POSTGRES_USER="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DB="notebook"

# 然后使用变量引用组合成完整的连接字符串（不带密码）
DATABASE_URL="postgresql://${POSTGRES_USER}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# ============================================
# NextAuth.js 认证配置
# ============================================
# 应用 URL（生产环境改为实际域名）
NEXTAUTH_URL="http://localhost:3000"

# 认证密钥（必须修改为随机字符串，至少 32 字符）
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# ============================================
# 应用配置
# ============================================
# 环境：development | production | test
NODE_ENV="development"

# ============================================
# 可选配置
# ============================================
# Sentry 错误追踪（生产环境）
# SENTRY_DSN=""

# 日志级别
# LOG_LEVEL="info"
```

**💡 环境变量引用说明**

项目已配置支持在 `.env` 文件中使用变量引用，语法如下：

- 使用 `${VAR_NAME}` 引用其他环境变量
- 变量引用会在加载时自动展开
- 支持嵌套引用（变量可以引用其他变量）

**示例：**

```env
# 定义基础配置
API_BASE_URL="https://api.example.com"
API_VERSION="v1"

# 使用变量引用组合完整 URL
API_URL="${API_BASE_URL}/${API_VERSION}"

# 数据库连接示例
DB_USER="myuser"
DB_PASS="mypass"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="mydb"

# 组合完整的数据库连接字符串
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
```

### 3.2 不同环境的配置

#### **开发环境** (`.env.local`)

```env
# 方式一：直接配置
DATABASE_URL="postgresql://postgres@localhost:5432/notebook"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-only-for-development"
NODE_ENV="development"

# 方式二：使用变量引用（推荐，使用默认用户无需密码）
POSTGRES_USER="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DB="notebook"

DATABASE_URL="postgresql://${POSTGRES_USER}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-only-for-development"
NODE_ENV="development"
```

#### **测试环境** (`.env.test`)

```env
DATABASE_URL="postgresql://postgres@localhost:5432/notebook_test"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key"
NODE_ENV="test"
```

#### **生产环境** (在部署平台配置)

```env
DATABASE_URL="postgresql://user@prod-db.example.com:5432/notebook?sslmode=require"
NEXTAUTH_URL="https://note.yourdomain.com"
NEXTAUTH_SECRET="生产环境的超长随机密钥"
NODE_ENV="production"
```

### 3.3 环境变量安全

**⚠️ 重要提醒**

- ❌ 永远不要提交 `.env` 文件到 Git
- ✅ 始终使用 `.env.example` 作为模板
- ✅ 生产环境使用强随机密钥
- ✅ 定期轮换密钥
- ✅ 使用环境变量管理服务（如 Vercel、Doppler）

**`.gitignore` 配置**

```gitignore
# 环境变量
.env
.env*.local
.env.production

# Next.js
.next/
out/
build/

# 依赖
node_modules/

# 日志
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 其他
.DS_Store
*.pem
```

---

## 4. 数据库设置

### 4.1 Prisma 配置

**`prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 数据模型定义...
```

### 4.2 创建迁移

```bash
# 创建新迁移
npx prisma migrate dev --name add_user_avatar

# 迁移流程：
# 1. Prisma 检测 schema 变化
# 2. 生成 SQL 迁移文件
# 3. 执行迁移
# 4. 重新生成 Prisma Client
```

### 4.3 生产环境迁移

```bash
# ⚠️ 生产环境请谨慎操作

# 1. 备份数据库
pg_dump -U postgres notebook > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 执行迁移（不会提示确认）
npx prisma migrate deploy

# 3. 验证迁移
npx prisma migrate status
```

### 4.3.1 切换数据库后的迁移指南

当你需要切换 `POSTGRES_DB`（数据库名称）时，需要在新数据库中重新应用所有迁移。以下是详细步骤：

#### **场景 1: 全新数据库（无数据需要迁移）**

如果新数据库是空的，只需要应用现有的迁移文件：

```bash
# 1. 更新 .env 文件中的 DATABASE_URL
# 例如：从 notebook 切换到 notebook_prod
DATABASE_URL="postgresql://postgres@localhost:5432/notebook_prod"

# 2. 确保新数据库已创建（如果不存在）
createdb notebook_prod
# 或使用 psql
psql postgres -c "CREATE DATABASE notebook_prod;"

# 3. 生成 Prisma Client（使用新的数据库连接）
npx prisma generate

# 4. 应用所有现有迁移到新数据库
npx prisma migrate deploy

# 5. 验证迁移状态
npx prisma migrate status
```

#### **场景 2: 需要迁移数据（从旧数据库到新数据库）**

如果需要保留现有数据，需要先迁移数据，再应用迁移：

```bash
# 1. 备份旧数据库
pg_dump -U postgres -d notebook > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 创建新数据库
createdb notebook_prod

# 3. 先应用迁移到新数据库（创建表结构）
DATABASE_URL="postgresql://postgres@localhost:5432/notebook_prod" npx prisma migrate deploy

# 4. 迁移数据（只迁移数据，不迁移结构）
pg_dump -U postgres -d notebook --data-only --inserts | \
  psql -U postgres -d notebook_prod

# 5. 更新 .env 文件
DATABASE_URL="postgresql://postgres@localhost:5432/notebook_prod"

# 6. 重新生成 Prisma Client
npx prisma generate

# 7. 验证数据迁移
npx prisma studio
```

#### **场景 3: 使用 Docker 环境变量切换**

如果使用 Docker Compose，可能通过环境变量 `POSTGRES_DB` 切换数据库：

```bash
# 1. 更新 docker-compose.yml 或 .env 文件
POSTGRES_DB=notebook_prod

# 2. 重启 PostgreSQL 容器（如果数据库不存在会自动创建）
docker-compose down
docker-compose up -d postgres

# 3. 等待数据库就绪
sleep 5

# 4. 更新应用的 DATABASE_URL
DATABASE_URL="postgresql://postgres@localhost:5432/notebook_prod"

# 5. 应用迁移
npx prisma migrate deploy

# 6. 验证
npx prisma migrate status
```

#### **迁移验证步骤**

```bash
# 1. 检查迁移状态
npx prisma migrate status

# 2. 查看数据库表结构
npx prisma studio

# 3. 连接数据库验证
psql -U postgres -d notebook_prod
# 在 psql 中执行：
\dt          # 列出所有表
SELECT COUNT(*) FROM users;  # 验证数据
\q           # 退出
```

#### **常见问题排查**

**问题 1: 迁移状态不一致**

```bash
# 如果迁移状态显示不一致，可以重置迁移历史（⚠️ 谨慎使用）
npx prisma migrate resolve --applied 20251104052944_init
npx prisma migrate resolve --applied 20251104152414_add_notebooks_and_tags
```

**问题 2: 数据库连接失败**

```bash
# 检查数据库是否运行
pg_isready -U postgres

# 检查数据库是否存在
psql -U postgres -l | grep notebook_prod

# 测试连接
psql -U postgres -d notebook_prod -c "SELECT version();"
```

**问题 3: 迁移文件冲突**

```bash
# 查看迁移历史
ls -la prisma/migrations/

# 检查迁移锁定文件
cat prisma/migrations/migration_lock.toml
```

#### **最佳实践**

1. **始终备份**：切换数据库前先备份原数据库
2. **测试环境验证**：先在测试环境验证迁移流程
3. **使用迁移部署命令**：生产环境使用 `migrate deploy`，开发环境使用 `migrate dev`
4. **版本控制**：确保迁移文件已提交到 Git
5. **监控迁移状态**：迁移后检查 `_prisma_migrations` 表

```bash
# 查看迁移历史表
psql -U postgres -d notebook_prod -c "SELECT * FROM _prisma_migrations ORDER BY finished_at;"
```

### 4.4 数据库连接池

**推荐配置**

```env
# 连接池参数
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

**参数说明**：
- `connection_limit`: 连接池大小（默认：无限制，推荐 10-20）
- `pool_timeout`: 连接超时时间（秒，默认：10）
- `sslmode=require`: 强制 SSL 连接（生产环境必须）

### 4.5 种子数据（可选）

**`prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 创建测试用户
  const hashedPassword = await bcrypt.hash('Test1234', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: '测试用户',
    },
  });

  // 创建测试笔记
  await prisma.note.create({
    data: {
      title: '欢迎使用 Mars-Notes',
      content: '# 欢迎\n\n这是你的第一篇笔记！',
      userId: user.id,
    },
  });

  console.log('种子数据创建成功');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**`package.json`** 添加脚本：

```json
{
  "scripts": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**执行种子数据**：

```bash
npm run seed
```

---

## 5. 生产部署

### 5.1 Vercel 部署（推荐）

#### **步骤 1: 准备代码**

```bash
# 确保代码已推送到 GitHub
git add .
git commit -m "准备部署"
git push origin main
```

#### **步骤 2: 连接 Vercel**

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. Vercel 自动检测 Next.js 项目

#### **步骤 3: 配置环境变量**

在 Vercel 项目设置中添加：

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=生产环境密钥
NODE_ENV=production
```

#### **步骤 4: 配置数据库**

**选项 A: Vercel Postgres（推荐）**

```bash
# 在 Vercel 项目中创建 Postgres
vercel postgres create

# 连接到项目
vercel link

# 环境变量自动设置
```

**选项 B: Supabase / Railway / Neon**

1. 在对应平台创建 PostgreSQL 数据库
2. 获取连接字符串
3. 添加到 Vercel 环境变量

#### **步骤 5: 部署**

```bash
# 自动部署（推送到 main 分支）
git push origin main

# 或使用 Vercel CLI
vercel --prod
```

#### **步骤 6: 运行数据库迁移**

```bash
# 方法 1: 使用 Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# 方法 2: 在 package.json 添加 postinstall 脚本
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**部署后检查清单**：
- ✅ 访问网站，检查首页
- ✅ 测试注册功能
- ✅ 测试登录功能
- ✅ 创建和编辑笔记
- ✅ 检查 API 响应时间
- ✅ 查看 Vercel 日志

### 5.2 VPS / 云服务器部署

#### **服务器配置**

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 4. 安装 Nginx
sudo apt install -y nginx

# 5. 安装 PM2
sudo npm install -g pm2
```

#### **部署应用**

```bash
# 1. 克隆代码
cd /var/www
git clone https://github.com/chentaoyu/mars-notes.git
cd mars-notes

# 2. 安装依赖
npm ci --production

# 3. 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 4. 运行迁移
npx prisma migrate deploy
npx prisma generate

# 5. 构建应用
npm run build

# 6. 使用 PM2 启动
pm2 start npm --name "mars-notes" -- start
pm2 save
pm2 startup
```

#### **Nginx 配置**

```nginx
# /etc/nginx/sites-available/mars-notes
server {
    listen 80;
    server_name note.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/mars-notes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### **SSL 证书（Let's Encrypt）**

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d note.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 6. 持续集成/持续部署

### 6.1 GitHub Actions

**`.github/workflows/ci.yml`**

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 代码检查
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Type check
        run: npm run type-check

  # 构建测试
  build:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          NEXTAUTH_URL: http://localhost:3000
          NEXTAUTH_SECRET: test-secret

  # 部署到生产环境
  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 6.2 预提交检查（Husky）

```bash
# 安装 Husky
npm install -D husky lint-staged

# 初始化 Husky
npx husky init
```

**`.husky/pre-commit`**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**`package.json`**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 7. 监控与维护

### 7.1 日志管理

**生产环境日志**

```typescript
// lib/logger.ts
const logger = {
  info: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
    } else {
      console.log(`[INFO] ${message}`, meta);
    }
  },
  error: (message: string, error?: Error, meta?: any) => {
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify({ level: 'error', message, error: error?.message, stack: error?.stack, ...meta, timestamp: new Date().toISOString() }));
    } else {
      console.error(`[ERROR] ${message}`, error, meta);
    }
  },
};

export default logger;
```

### 7.2 错误追踪（Sentry）

```bash
# 安装 Sentry
npm install @sentry/nextjs
```

**配置 Sentry**

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 7.3 性能监控

**Vercel Analytics**

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 7.4 健康检查

**`app/api/health/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

### 7.5 数据库备份

**自动备份脚本**

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="notebook"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# 保留最近 30 天的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "备份完成: backup_$TIMESTAMP.sql.gz"
```

**设置定时任务（crontab）**

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

---

## 8. 常见问题

### Q1: 构建时出现 "Cannot find module '@prisma/client'"

**解决方案**：

```bash
# 生成 Prisma Client
npx prisma generate

# 如果仍然失败，清理缓存
rm -rf node_modules
rm package-lock.json
npm install
npx prisma generate
```

### Q2: 数据库连接失败

**检查清单**：
- ✅ 数据库服务是否启动
- ✅ 连接字符串是否正确
- ✅ 防火墙是否放行端口
- ✅ SSL 模式是否匹配

```bash
# 测试数据库连接
psql "postgresql://user:pass@host:5432/dbname"

# 检查 PostgreSQL 状态
sudo systemctl status postgresql
```

### Q3: NextAuth 会话丢失

**检查**：
- `NEXTAUTH_URL` 是否与实际域名匹配
- `NEXTAUTH_SECRET` 是否设置
- Cookie 是否被浏览器阻止

### Q4: 迁移冲突

```bash
# 查看迁移状态
npx prisma migrate status

# 如果有冲突，解决方案 1：重置（开发环境）
npx prisma migrate reset

# 解决方案 2：手动解决（生产环境）
npx prisma migrate resolve --applied <migration-name>
```

### Q5: 部署后 API 500 错误

**调试步骤**：

```bash
# 查看 Vercel 日志
vercel logs

# 检查环境变量
vercel env ls

# 本地模拟生产环境
npm run build
npm start
```

### Q6: 性能问题

**优化建议**：
- 添加数据库索引
- 使用 Prisma 的 `select` 减少查询数据
- 启用 Next.js 缓存
- 使用 CDN 托管静态资源
- 数据库连接池配置

---

## 9. 维护清单

### 9.1 每日维护

- [ ] 检查应用健康状态 (`/api/health`)
- [ ] 查看错误日志
- [ ] 监控响应时间

### 9.2 每周维护

- [ ] 数据库备份验证
- [ ] 检查磁盘空间
- [ ] 更新依赖包安全补丁

### 9.3 每月维护

- [ ] 数据库性能优化
- [ ] 清理过期会话
- [ ] 审查安全日志
- [ ] 更新依赖包

### 9.4 每季度维护

- [ ] 全面安全审计
- [ ] 性能测试和优化
- [ ] 备份恢复演练
- [ ] 依赖大版本更新评估

---

## 10. 安全建议

### 10.1 生产环境检查清单

- [ ] ✅ 使用强随机 `NEXTAUTH_SECRET`
- [ ] ✅ 数据库使用 SSL 连接
- [ ] ✅ 启用 HTTPS（Let's Encrypt）
- [ ] ✅ 配置 CSP (Content Security Policy)
- [ ] ✅ 设置速率限制
- [ ] ✅ 定期更新依赖
- [ ] ✅ 启用错误追踪（Sentry）
- [ ] ✅ 配置自动备份
- [ ] ✅ 设置监控告警

### 10.2 安全最佳实践

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 11. 性能优化

### 11.1 Next.js 配置

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 SWC 编译器
  swcMinify: true,
  
  // 图片优化
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 压缩
  compress: true,
  
  // 生产环境输出
  output: 'standalone',
  
  // 实验性功能
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

### 11.2 数据库优化

```sql
-- 定期分析表
ANALYZE notes;
ANALYZE users;

-- 查看慢查询
SELECT
  query,
  calls,
  total_time / calls AS avg_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- 重建索引
REINDEX TABLE notes;
```

---

## 12. 总结

本文档提供了 Mars-Notes 系统的完整部署指南，涵盖：

✅ **本地开发环境搭建**：从零开始配置开发环境  
✅ **环境变量管理**：安全的配置管理  
✅ **数据库设置**：Prisma 迁移和管理  
✅ **多种部署方案**：Vercel、VPS  
✅ **CI/CD 流程**：自动化测试和部署  
✅ **监控与维护**：日志、错误追踪、备份  
✅ **安全建议**：生产环境最佳实践  

**相关文档**
- [产品需求文档](./PRD.md)
- [技术架构设计](./ARCHITECTURE.md)
- [数据库设计](./DATABASE.md)
- [API 设计文档](./API.md)

---

**需要帮助？**

- 查看 [GitHub Issues](https://github.com/chentaoyu/mars-notes/issues)
- 阅读 [Next.js 文档](https://nextjs.org/docs)
- 查看 [Prisma 文档](https://www.prisma.io/docs)

---

**文档维护**
- 部署流程变更需同步更新文档
- 新增部署方式需补充完整说明
- 遇到新问题请添加到常见问题部分

