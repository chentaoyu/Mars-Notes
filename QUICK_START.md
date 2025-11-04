# 云笔记 - 快速启动指南

## 🚀 项目已完成搭建！

所有代码和配置文件已创建完成，现在可以开始运行项目了。

---

## 📋 下一步操作

### 选择启动方式

你可以选择以下两种方式之一来启动项目：

- **方式 A：Docker 快速启动（推荐）** - 无需配置本地数据库，一键启动
- **方式 B：本地开发环境** - 完全自定义的本地开发环境

---

## 🐳 方式 A：Docker 快速启动（推荐）

### 1. 确保已安装 Docker

```bash
# 检查 Docker 版本
docker --version
docker-compose --version
```

如果未安装，请访问：
- macOS/Windows: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 生成安全的密钥
openssl rand -base64 32
```

编辑 `.env` 文件，至少修改以下内容：

```env
POSTGRES_PASSWORD=your-secure-password-here
NEXTAUTH_SECRET=paste-generated-key-here
```

### 3. 启动开发环境

```bash
# 使用管理脚本（推荐）
./docker.sh dev:up

# 或使用 pnpm 脚本
pnpm docker:dev

# 或直接使用 docker-compose
docker-compose -f docker-compose.dev.yml up -d
```

### 4. 查看日志

```bash
./docker.sh dev:logs
```

### 5. 访问应用

- 应用地址: http://localhost:3000
- 数据库端口: 5432

### Docker 常用命令

```bash
# 停止环境
./docker.sh dev:down

# 重启环境
./docker.sh dev:restart

# 查看容器状态
./docker.sh ps

# 数据库操作
./docker.sh db:migrate    # 执行迁移
./docker.sh db:backup     # 备份数据库
./docker.sh db:studio     # 打开 Prisma Studio

# 查看所有命令
./docker.sh help
```

**跳到 [功能测试](#-功能测试) 部分开始使用！**

---

## 💻 方式 B：本地开发环境

### 1. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm（推荐，更快）
pnpm install

# 或使用 yarn
yarn install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env
```

编辑 `.env` 文件，配置以下内容：

```env
# 数据库连接（本地 PostgreSQL）
DATABASE_URL="postgresql://postgres:password@localhost:5432/notedb?schema=public"

# NextAuth.js 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this"

# 环境
NODE_ENV="development"
```

**生成 NEXTAUTH_SECRET**：
```bash
openssl rand -base64 32
```

### 3. 设置数据库

#### 选项 A：使用本地 PostgreSQL

```bash
# macOS 安装 PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# 创建数据库
createdb notedb
```

#### 选项 B：使用 Docker

```bash
# 启动 PostgreSQL 容器
docker run --name postgres-notedb \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=notedb \
  -p 5432:5432 \
  -d postgres:14
```

#### 选项 C：使用云数据库

- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app

### 4. 运行数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库表
npx prisma migrate dev --name init

# 可选：查看数据库（可视化界面）
npx prisma studio
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 **http://localhost:3000** 🎉

---

## 📱 功能测试

### 1. 注册账号
- 访问 `/register`
- 输入邮箱、密码（可选昵称）
- 注册成功后自动登录

### 2. 创建笔记
- 点击右上角「新建笔记」
- 编辑标题和内容
- 自动保存（2秒防抖）

### 3. 编辑笔记
- Markdown 语法支持
- 左侧编辑，右侧实时预览
- 代码高亮显示

### 4. 笔记管理
- 查看笔记列表
- 点击卡片进入编辑
- 删除笔记

---

## 🛠️ 开发命令

### 本地开发命令

```bash
# 开发
pnpm dev                 # 启动开发服务器

# 构建
pnpm build               # 构建生产版本
pnpm start               # 启动生产服务器

# 代码质量
pnpm lint                # 代码检查
pnpm format              # 代码格式化
pnpm type-check          # 类型检查

# 数据库
pnpm db:push             # 推送 schema 到数据库（快速原型）
pnpm db:studio           # 打开 Prisma Studio
pnpm db:generate         # 生成 Prisma Client
pnpm db:migrate          # 创建迁移
pnpm db:reset            # 重置数据库（危险！）
```

### Docker 命令

```bash
# 开发环境
pnpm docker:dev          # 启动开发环境
pnpm docker:dev:down     # 停止开发环境
pnpm docker:dev:logs     # 查看日志

# 生产环境
pnpm docker:prod         # 启动生产环境
pnpm docker:prod:down    # 停止生产环境
pnpm docker:prod:logs    # 查看日志

# 管理脚本（功能更全）
./docker.sh help         # 查看所有 Docker 命令
```

---

## 📁 项目结构

```
note-book/
├── src/
│   ├── app/
│   │   ├── (auth)/              # 认证页面（登录/注册）
│   │   ├── (dashboard)/         # 主应用（笔记列表/编辑器）
│   │   ├── api/                 # API 路由
│   │   │   ├── auth/           # 认证 API
│   │   │   └── notes/          # 笔记 API
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                  # 基础 UI 组件
│   │   ├── auth/                # 认证组件
│   │   ├── notes/               # 笔记组件
│   │   ├── editor/              # 编辑器组件
│   │   └── layout/              # 布局组件
│   ├── lib/                     # 工具库
│   │   ├── prisma.ts           # Prisma 客户端
│   │   ├── auth-options.ts     # NextAuth 配置
│   │   ├── utils.ts            # 工具函数
│   │   └── validations.ts      # Zod 验证
│   ├── types/                   # TypeScript 类型
│   ├── hooks/                   # 自定义 Hooks
│   └── middleware.ts            # Next.js 中间件
├── prisma/
│   └── schema.prisma           # 数据模型
├── docs/                        # 完整文档
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   └── DEPLOYMENT.md
└── ...配置文件
```

---

## 🎯 已实现功能

✅ **认证系统**
- 用户注册（邮箱+密码）
- 用户登录
- 会话管理（JWT）
- 路由保护

✅ **笔记管理**
- 创建笔记
- 编辑笔记
- 删除笔记
- 笔记列表
- 搜索笔记（API已实现）

✅ **Markdown 编辑器**
- 实时预览
- 代码高亮
- GFM 支持
- 自动保存（2秒防抖）
- 保存状态提示

✅ **UI/UX**
- 响应式设计
- 现代化界面
- 流畅动画
- 友好提示

---

## 🐛 常见问题

### 问题 1: 数据库连接失败

**解决方案**：
- 检查 PostgreSQL 是否启动
- 确认 `.env` 中的 `DATABASE_URL` 正确
- 测试连接：`psql "postgresql://..."`

### 问题 2: Prisma 错误

**解决方案**：
```bash
# 清理并重新生成
rm -rf node_modules
npm install
npx prisma generate
```

### 问题 3: NextAuth 会话问题

**解决方案**：
- 确保 `NEXTAUTH_SECRET` 已设置
- 检查 `NEXTAUTH_URL` 与实际域名匹配
- 清除浏览器 Cookie

### 问题 4: 端口被占用

**解决方案**：
```bash
# 使用其他端口
PORT=3001 npm run dev
```

---

## 📚 文档链接

完整的项目文档位于 `docs/` 目录：

- [产品需求文档](./docs/PRD.md) - 功能规划和用户故事
- [技术架构设计](./docs/ARCHITECTURE.md) - 系统架构和技术选型
- [数据库设计](./docs/DATABASE.md) - 数据模型和 Schema
- [API 设计文档](./docs/API.md) - 接口说明和示例
- [部署指南](./docs/DEPLOYMENT.md) - 生产部署和运维
- [Docker 部署指南](./DOCKER.md) - Docker 容器化部署完整指南

---

## 🚢 生产部署

### Docker 部署（推荐）

```bash
# 1. 配置生产环境变量
cp .env.example .env
# 编辑 .env，设置生产配置

# 2. 启动生产环境
./docker.sh prod:up

# 3. 查看日志
./docker.sh prod:logs
```

详见：[Docker 部署指南](./DOCKER.md)

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署完成

详见：[部署指南](./docs/DEPLOYMENT.md)

---

## 💡 下一步优化建议

### 短期（v1.1）
- [ ] 添加搜索功能 UI
- [ ] 笔记本分类
- [ ] 标签系统
- [ ] 快捷键支持

### 中期（v1.2）
- [ ] 暗黑模式
- [ ] 笔记分享
- [ ] 图片上传
- [ ] 数据导出

### 长期（v2.0）
- [ ] 版本历史
- [ ] 协作编辑
- [ ] AI 辅助写作

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

**祝开发愉快！🎉**

如有问题，请查看文档或提交 Issue。

