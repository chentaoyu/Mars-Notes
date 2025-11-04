# 云笔记系统 (CloudNote)

> 一个简洁、高效的在线云笔记应用，支持 Markdown 编辑，基于 Next.js + React + PostgreSQL 构建

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![React](https://img.shields.io/badge/React-18+-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📖 项目简介

云笔记是一款面向个人用户的轻量级在线笔记应用，提供流畅的 Markdown 编辑与管理体验。

**核心特性**：
- ✅ 用户注册和登录（账号密码）
- ✅ Markdown 编辑器（实时预览）
- ✅ 笔记 CRUD 操作
- ✅ 笔记搜索功能
- ✅ 代码高亮显示
- ✅ 自动保存机制
- ✅ 响应式设计（支持移动端）
- ✅ 前后端一体化架构

---

## 🚀 快速开始

### 环境要求

- Node.js 18.17.0+
- PostgreSQL 14+
- npm / pnpm / yarn

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/your-username/note-book.git
cd note-book

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填写数据库连接等配置

# 4. 设置数据库
npx prisma generate
npx prisma migrate dev --name init

# 5. 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## 📚 文档目录

完整的项目文档位于 `docs/` 目录：

| 文档 | 说明 | 链接 |
|-----|------|------|
| **产品需求文档** | 产品定位、功能规划、用户故事 | [PRD.md](./docs/PRD.md) |
| **技术架构设计** | 系统架构、技术栈、模块设计 | [ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| **数据库设计** | ER 图、表结构、Prisma Schema | [DATABASE.md](./docs/DATABASE.md) |
| **API 设计文档** | RESTful API 接口说明 | [API.md](./docs/API.md) |
| **部署指南** | 本地开发、生产部署、运维 | [DEPLOYMENT.md](./docs/DEPLOYMENT.md) |
| **Docker 部署指南** | Docker 容器化部署完整指南 | [DOCKER.md](./DOCKER.md) |

---

## 🏗️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **UI 库**: React 18 + Tailwind CSS
- **状态管理**: React Context
- **表单验证**: React Hook Form + Zod
- **Markdown**: react-markdown + react-syntax-highlighter

### 后端
- **运行时**: Node.js (Next.js API Routes)
- **认证**: NextAuth.js v5
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **密码加密**: bcrypt

### 开发工具
- **语言**: TypeScript
- **代码规范**: ESLint + Prettier
- **版本控制**: Git
- **容器化**: Docker + Docker Compose

---

## 📁 项目结构

```
note-book/
├── docs/                      # 📚 项目文档
│   ├── PRD.md                # 产品需求文档
│   ├── ARCHITECTURE.md       # 架构设计文档
│   ├── DATABASE.md           # 数据库设计文档
│   ├── API.md                # API 设计文档
│   └── DEPLOYMENT.md         # 部署指南
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # 认证页面组（登录/注册）
│   │   ├── (dashboard)/     # 主应用页面组（笔记/编辑器）
│   │   ├── api/             # API 路由
│   │   └── ...
│   ├── components/          # React 组件
│   │   ├── ui/             # 基础 UI 组件
│   │   ├── auth/           # 认证组件
│   │   ├── notes/          # 笔记组件
│   │   └── editor/         # 编辑器组件
│   ├── lib/                # 工具库
│   ├── types/              # TypeScript 类型
│   └── hooks/              # 自定义 Hooks
│
├── prisma/
│   ├── schema.prisma       # Prisma 数据模型
│   └── migrations/         # 数据库迁移文件
│
├── public/                 # 静态资源
├── .env.example           # 环境变量示例
├── next.config.js         # Next.js 配置
├── tailwind.config.ts     # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

---

## 🔧 核心功能

### 用户认证
- 邮箱 + 密码注册
- 用户登录（支持"记住我"）
- 会话管理（JWT Token）
- 受保护路由

### 笔记管理
- 笔记列表展示（卡片布局）
- 创建新笔记
- Markdown 编辑（左右分屏预览）
- 自动保存（2 秒防抖）
- 手动保存
- 删除笔记（带确认）

### 搜索功能
- 实时搜索
- 支持标题和内容搜索
- 高亮显示匹配结果

### Markdown 支持
- 标准 Markdown 语法
- 代码高亮（100+ 语言）
- GFM（GitHub Flavored Markdown）
- 表格、引用、链接等

---

## 🌐 API 接口

### 认证 API
```
POST   /api/auth/register      注册
POST   /api/auth/signin        登录
POST   /api/auth/signout       登出
GET    /api/auth/session       获取会话
```

### 笔记 API
```
GET    /api/notes              获取笔记列表
POST   /api/notes              创建笔记
GET    /api/notes/[id]         获取单个笔记
PUT    /api/notes/[id]         更新笔记
DELETE /api/notes/[id]         删除笔记
GET    /api/notes/search       搜索笔记
```

详细 API 文档请参考：[API.md](./docs/API.md)

---

## 🗄️ 数据库设计

### 核心表结构

**User（用户表）**
- id, email, password, name
- createdAt, updatedAt

**Note（笔记表）**
- id, userId, title, content
- createdAt, updatedAt

**关系**：一个用户可以拥有多篇笔记（1:N）

详细数据库设计请参考：[DATABASE.md](./docs/DATABASE.md)

---

## 🚢 部署

### Vercel 部署（推荐）

```bash
# 1. 推送代码到 GitHub
git push origin main

# 2. 在 Vercel 中导入项目
# 3. 配置环境变量
# 4. 自动部署完成
```

### Docker 部署（推荐）

#### 使用管理脚本（最简单）

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库密码和 NextAuth 密钥

# 2. 开发环境（支持热重载）
./docker.sh dev:up

# 3. 生产环境
./docker.sh prod:up

# 查看日志
./docker.sh logs

# 查看所有命令
./docker.sh help
```

#### 使用 Docker Compose

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up -d

# 生产环境
docker-compose up -d

# 运行迁移
docker-compose exec app npx prisma migrate deploy

# 查看日志
docker-compose logs -f
```

**详细的 Docker 部署指南请参考：[DOCKER.md](./DOCKER.md)**

### VPS 部署

```bash
# 克隆代码
git clone https://github.com/your-username/note-book.git

# 安装依赖
npm ci --production

# 构建应用
npm run build

# 使用 PM2 启动
pm2 start npm --name "note-book" -- start
```

详细部署指南请参考：[DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 🔐 环境变量

创建 `.env` 文件：

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@localhost:5432/notedb"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# 应用配置
NODE_ENV="development"
```

**生成 NEXTAUTH_SECRET**：
```bash
openssl rand -base64 32
```

---

## 📝 开发命令

### 本地开发

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 代码质量
npm run lint             # 代码检查
npm run format           # 代码格式化
npm run type-check       # 类型检查

# 数据库
npx prisma studio        # 数据库可视化
npx prisma migrate dev   # 创建迁移
npx prisma generate      # 生成 Prisma Client
```

### Docker 命令

```bash
# 开发环境
./docker.sh dev:up       # 启动开发环境
./docker.sh dev:down     # 停止开发环境
./docker.sh dev:logs     # 查看日志

# 生产环境
./docker.sh prod:up      # 启动生产环境
./docker.sh prod:down    # 停止生产环境
./docker.sh prod:logs    # 查看日志

# 数据库
./docker.sh db:migrate   # 执行数据库迁移
./docker.sh db:backup    # 备份数据库
./docker.sh db:studio    # 打开 Prisma Studio

# 工具
./docker.sh ps           # 查看容器状态
./docker.sh clean        # 清理容器
./docker.sh help         # 查看所有命令
```

---

## 🎯 开发路线图

### ✅ v1.0 (当前版本)
- [x] 用户注册和登录
- [x] 笔记 CRUD 操作
- [x] Markdown 编辑器
- [x] 实时预览
- [x] 代码高亮
- [x] 笔记搜索
- [x] 自动保存
- [x] 响应式设计

### 🚧 v1.1 (计划中)
- [ ] 笔记本分类
- [ ] 标签系统
- [ ] 高级搜索
- [ ] 笔记排序

### 💡 v1.2 (未来)
- [ ] 暗黑模式
- [ ] 快捷键支持
- [ ] 笔记分享
- [ ] PWA 支持

### 🌟 v2.0 (远期)
- [ ] 版本历史
- [ ] 协作编辑
- [ ] 图片上传
- [ ] 数据导出

---

## 🤝 贡献指南

欢迎贡献代码、提出问题或建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

**代码规范**：
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 编写 TypeScript 类型
- 添加必要的注释

---

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

---

## 🙏 致谢

本项目使用了以下优秀的开源项目：

- [Next.js](https://nextjs.org/) - React 框架
- [React](https://react.dev/) - UI 库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Prisma](https://www.prisma.io/) - 数据库 ORM
- [NextAuth.js](https://authjs.dev/) - 认证方案
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染
- [PostgreSQL](https://www.postgresql.org/) - 数据库

---

## 📮 联系方式

- **项目地址**: https://github.com/your-username/note-book
- **问题反馈**: https://github.com/your-username/note-book/issues
- **邮箱**: your-email@example.com

---

## 📊 项目统计

- **开发周期**: 2-3 周
- **代码行数**: ~5,000 行
- **文档数量**: 5 份完整文档
- **技术栈**: 10+ 核心技术

---

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

---

Made with ❤️ by [Your Name](https://github.com/your-username)

