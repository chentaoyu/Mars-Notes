# Mars-Notes - 技术架构设计文档

## 文档信息

- **项目名称**: Mars-Notes
- **架构版本**: v1.2
- **文档版本**: 1.2.1
- **创建日期**: 2025-11-04
- **最后更新**: 2025-01-27

---

## 目录

1. [系统架构概览](#1-系统架构概览)
2. [技术栈详解](#2-技术栈详解)
3. [项目目录结构](#3-项目目录结构)
4. [核心模块设计](#4-核心模块设计)
5. [数据流设计](#5-数据流设计)
6. [安全架构](#6-安全架构)
7. [性能优化策略](#7-性能优化策略)
8. [部署架构](#8-部署架构)

---

## 1. 系统架构概览

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │  登录页   │  │  注册页   │  │  笔记列表  │  │ 编辑器页 │ │
│  │           │  │           │  │ 笔记本列表 │  │ 标签管理 │ │
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 应用层                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              前端层 (React Components)                │   │
│  │  • UI 组件 (Tailwind CSS)                            │   │
│  │  • 页面组件 (App Router)                             │   │
│  │  • 客户端逻辑 (Hooks, Context)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              后端层 (API Routes / Route Handlers)     │   │
│  │  • 认证 API (/api/auth/*)                            │   │
│  │  • 笔记 API (/api/notes/*)                           │   │
│  │  • 笔记本 API (/api/notebooks/*)                     │   │
│  │  • 标签 API (/api/tags/*)                            │   │
│  │  • 用户管理 API (/api/user/*)                        │   │
│  │  • 中间件 (认证、错误处理)                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              数据访问层 (Prisma ORM)                  │   │
│  │  • 数据模型定义                                       │   │
│  │  • 类型安全查询                                       │   │
│  │  • 数据库连接管理                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ TCP/IP
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL 数据库                          │
│  • users 表 (用户信息)                                        │
│  • notes 表 (笔记数据)                                        │
│  • notebooks 表 (笔记本)                                      │
│  • tags 表 (标签)                                            │
│  • note_tags 表 (笔记-标签关联)                               │
│  • sessions 表 (会话管理)                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 架构特点

**前后端一体化 (Monolithic)**
- 单一代码库，便于维护
- 共享类型定义，类型安全
- 统一的构建和部署流程
- 减少网络往返，提升性能

**服务端渲染 + 客户端交互**
- 首屏 SSR，提升 SEO 和首屏加载速度
- 后续交互 CSR，提供流畅体验
- React Server Components 减少客户端 JS

**渐进式增强**
- 核心功能优先
- 基于特性检测的功能启用
- 良好的降级策略

---

## 2. 技术栈详解

### 2.1 前端技术栈

#### **核心框架**

**Next.js 14.x**
- **选择理由**: 
  - 文件系统路由，简化路由配置
  - App Router 提供强大的布局和加载状态管理
  - 内置图片优化、字体优化
  - 优秀的开发体验和性能
- **使用场景**: 整个应用的基础框架

**React 18.x**
- **选择理由**: 
  - 组件化开发，代码复用性高
  - 丰富的生态系统
  - Server Components 提升性能
- **使用场景**: UI 组件开发

**TypeScript 5.x**
- **选择理由**: 
  - 类型安全，减少运行时错误
  - 更好的 IDE 支持
  - 提升代码可维护性
- **使用场景**: 所有代码文件

#### **UI 和样式**

**Tailwind CSS 3.x**
- **选择理由**: 
  - 实用优先的 CSS 框架
  - 快速开发，无需写 CSS 文件
  - 优秀的响应式设计支持
  - 生产环境自动清除未使用的样式
- **使用场景**: 所有样式需求

**shadcn/ui**
- **选择理由**: 
  - 基于 Radix UI 的高质量组件
  - 完全可定制
  - 无需安装依赖，直接复制到项目
  - 与 Tailwind CSS 完美集成
- **使用场景**: Button、Dialog、Input 等基础组件

#### **Markdown 支持**

**vditor**
- **选择理由**: 
  - 功能丰富的 Markdown 编辑器
  - 内置分屏预览模式（sv 模式），编辑与预览同步
  - 支持代码高亮（100+ 编程语言，支持行号）
  - 支持数学公式渲染（KaTeX）
  - 支持目录生成（TOC）、脚注、GFM 等特性
  - 丰富的工具栏和快捷键
  - 优秀的用户体验和性能
- **使用场景**: Markdown 编辑器（主要编辑场景）

**react-markdown**（可选，用于其他预览场景）
- **选择理由**: 
  - React 生态下流行的 Markdown 渲染库
  - 支持自定义组件映射
  - 安全的 HTML 渲染
- **使用场景**: 笔记列表预览等其他场景

**react-syntax-highlighter**（可选，用于 react-markdown 的代码高亮）
- **选择理由**: 
  - 支持 100+ 编程语言
  - 多种高亮主题
  - 轻量级，按需加载
- **使用场景**: 配合 react-markdown 使用（仅在非 Vditor 场景）

#### **表单和验证**

**React Hook Form**
- **选择理由**: 
  - 性能优秀（减少重渲染）
  - API 简洁
  - 与 Zod 集成良好
- **使用场景**: 登录、注册、编辑表单

**Zod**
- **选择理由**: 
  - TypeScript-first 的模式验证库
  - 类型推导能力强
  - 前后端共享验证规则
- **使用场景**: 表单验证、API 参数验证

#### **状态管理**

**React Context**
- **选择理由**: 
  - React 内置，无需额外依赖
  - 适合简单的状态共享
- **使用场景**: 用户认证状态、主题切换

**Zustand (可选)**
- **选择理由**: 
  - 极简的状态管理库
  - 无需 Provider 包裹
  - TypeScript 支持好
- **使用场景**: 复杂的客户端状态（如需要）

### 2.2 后端技术栈

#### **运行环境**

**Node.js 18.x+**
- **选择理由**: 
  - Next.js 的运行基础
  - 丰富的 npm 生态
  - 良好的性能
- **使用场景**: 服务端运行时

**Next.js API Routes / Route Handlers**
- **选择理由**: 
  - 与前端同构，无需单独部署
  - 支持中间件
  - 类型安全的 API 开发
- **使用场景**: 所有后端 API

#### **认证**

**NextAuth.js v5 (Auth.js)**
- **选择理由**: 
  - Next.js 官方推荐的认证方案
  - 支持多种认证方式
  - 内置会话管理
  - 安全性高（CSRF 保护等）
- **使用场景**: 用户注册、登录、会话管理

**bcrypt**
- **选择理由**: 
  - 业界标准的密码哈希算法
  - 防彩虹表攻击
  - 可调节的计算成本
- **使用场景**: 密码加密存储

#### **数据库**

**PostgreSQL 14+**
- **选择理由**: 
  - 功能强大，支持复杂查询
  - ACID 特性，数据可靠
  - 开源免费，社区活跃
  - 支持 JSON、全文搜索等高级特性
- **使用场景**: 主数据库

**Prisma 5.x**
- **选择理由**: 
  - 类型安全的 ORM
  - 自动生成数据库迁移
  - 支持多种数据库（便于迁移）
  - 优秀的开发体验（自动补全、文档）
  - 内置连接池管理
- **使用场景**: 数据库操作

### 2.3 开发工具

**ESLint**
- 代码质量检查
- 统一代码风格

**Prettier**
- 代码格式化
- 与 ESLint 集成

**Husky**
- Git hooks 管理
- 提交前自动检查

**TypeScript**
- 类型检查
- 编译时错误检测

---

## 3. 项目目录结构

```
mars-notes/
├── docs/                          # 📚 项目文档
│   ├── PRD.md                    # 产品需求文档
│   ├── ARCHITECTURE.md           # 架构设计文档 (本文档)
│   ├── DATABASE.md               # 数据库设计文档
│   ├── API.md                    # API 接口文档
│   └── DEPLOYMENT.md             # 部署运维文档
│
├── prisma/                        # 🗄️ 数据库相关
│   ├── schema.prisma             # Prisma 数据模型定义
│   ├── migrations/               # 数据库迁移历史
│   │   └── 20250104_init/       # 初始迁移
│   └── seed.ts                   # 种子数据 (可选)
│
├── public/                        # 🌐 静态资源
│   ├── favicon.ico               # 网站图标
│   ├── logo.svg                  # Logo 图标
│   └── images/                   # 图片资源
│
├── src/                          # 💻 源代码目录
│   │
│   ├── app/                      # 📱 Next.js App Router
│   │   │
│   │   ├── (auth)/              # 🔐 认证路由组 (不影响 URL)
│   │   │   ├── login/           # 登录页
│   │   │   │   └── page.tsx
│   │   │   ├── register/        # 注册页
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx       # 认证页面布局
│   │   │
│   │   ├── (dashboard)/         # 📊 主应用路由组
│   │   │   ├── notes/           # 笔记列表页
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── editor/          # 编辑器页
│   │   │   │   ├── [id]/       # 动态路由
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/        # 新建笔记
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx       # Dashboard 布局
│   │   │
│   │   ├── api/                 # 🔌 API 路由
│   │   │   ├── auth/            # 认证相关 API
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts # NextAuth 配置
│   │   │   │
│   │   │   ├── notes/           # 笔记相关 API
│   │   │   │   ├── route.ts     # GET 列表, POST 创建
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts # GET/PUT/DELETE 单个笔记
│   │   │   │   └── search/
│   │   │   │       └── route.ts # GET 搜索
│   │   │   │
│   │   │   ├── notebooks/       # 笔记本相关 API
│   │   │   │   ├── route.ts     # GET 列表, POST 创建
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET/PUT/DELETE 单个笔记本
│   │   │   │
│   │   │   └── tags/            # 标签相关 API
│   │   │       ├── route.ts     # GET 列表, POST 创建
│   │   │       └── [id]/
│   │   │           └── route.ts # GET/PUT/DELETE 单个标签
│   │   │
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页 (重定向到 /notes)
│   │   ├── globals.css          # 全局样式
│   │   └── error.tsx            # 错误页面
│   │
│   ├── components/               # 🧩 React 组件
│   │   │
│   │   ├── ui/                  # 基础 UI 组件 (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── auth/                # 认证相关组件
│   │   │   ├── LoginForm.tsx    # 登录表单
│   │   │   ├── RegisterForm.tsx # 注册表单
│   │   │   └── AuthGuard.tsx    # 路由守卫
│   │   │
│   │   ├── notes/               # 笔记相关组件
│   │   │   ├── NoteCard.tsx     # 笔记卡片
│   │   │   ├── NoteList.tsx     # 笔记列表
│   │   │   ├── NoteSearch.tsx   # 搜索框
│   │   │   └── DeleteDialog.tsx # 删除确认对话框
│   │   │
│   │   ├── notebooks/           # 笔记本相关组件
│   │   │   ├── NotebookList.tsx # 笔记本列表
│   │   │   └── NotebookDialog.tsx # 笔记本创建/编辑对话框
│   │   │
│   │   ├── tags/                # 标签相关组件
│   │   │   ├── TagList.tsx      # 标签列表
│   │   │   └── TagSelector.tsx  # 标签选择器
│   │   │
│   │   ├── editor/              # 编辑器相关组件
│   │   │   ├── MarkdownEditor.tsx # Markdown 编辑器（主组件）
│   │   │   ├── VditorEditor.tsx    # Vditor 编辑器组件
│   │   │   ├── MarkdownPreview.tsx # Markdown 预览（用于其他场景）
│   │   │   └── AutoSaveIndicator.tsx # 保存状态指示器
│   │   │
│   │   └── layout/              # 布局组件
│   │       ├── Header.tsx       # 顶部导航
│   │       ├── Sidebar.tsx      # 侧边栏
│   │       └── Footer.tsx       # 页脚
│   │
│   ├── lib/                     # 🛠️ 工具库和配置
│   │   ├── prisma.ts            # Prisma 客户端单例
│   │   ├── auth.ts              # NextAuth 配置
│   │   ├── auth-options.ts      # 认证选项
│   │   ├── db.ts                # 数据库工具函数
│   │   ├── utils.ts             # 通用工具函数
│   │   ├── validations.ts       # Zod 验证模式
│   │   └── constants.ts         # 常量定义
│   │
│   ├── types/                   # 📝 TypeScript 类型定义
│   │   ├── index.ts             # 类型导出（包含所有类型）
│   │   └── ... (用户、笔记、笔记本、标签等类型定义)
│   │
│   ├── hooks/                   # 🪝 自定义 React Hooks
│   │   ├── useAuth.ts           # 认证相关
│   │   ├── useNotes.ts          # 笔记数据管理
│   │   ├── useAutoSave.ts       # 自动保存
│   │   └── useDebounce.ts       # 防抖
│   │
│   └── middleware.ts            # 🔒 Next.js 中间件 (路由保护)
│
├── .env                          # 🔐 环境变量 (不提交到 Git)
├── .env.example                  # 环境变量示例
├── eslint.config.mjs            # ESLint 配置
├── .gitignore                   # Git 忽略文件
├── .prettierrc                  # Prettier 配置
├── next.config.js               # Next.js 配置
├── package.json                 # 项目依赖
├── postcss.config.js            # PostCSS 配置
├── tailwind.config.ts           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
└── README.md                    # 项目说明
```

### 3.1 目录设计原则

**按功能模块组织**
- 每个功能模块独立目录
- 相关文件放在一起
- 便于定位和维护

**分层清晰**
- 表现层 (components)
- 业务逻辑层 (hooks, lib)
- 数据访问层 (lib/prisma, api)

**可扩展性**
- 组件按类型分类
- 预留扩展空间
- 易于添加新功能

---

## 4. 核心模块设计

### 4.1 认证模块

#### **模块职责**
- 用户注册和登录
- 会话管理和维护
- 路由权限控制
- 密码加密和验证

#### **技术实现**

**NextAuth.js 配置** (`src/lib/auth-options.ts`)
```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 验证逻辑
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return { id: user.id, email: user.email, name: user.name };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
};
```

**中间件保护** (`src/middleware.ts`)
```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // 如果访问 dashboard，需要登录
      if (req.nextUrl.pathname.startsWith("/notes")) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/notes/:path*", "/editor/:path*"],
};
```

#### **组件示例**

**登录表单** (`src/components/auth/LoginForm.tsx`)
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少 8 位"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.ok) {
      router.push("/notes");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 表单实现 */}
    </form>
  );
}
```

### 4.2 笔记管理模块

#### **模块职责**
- 笔记的 CRUD 操作
- 笔记列表展示（支持按笔记本、标签过滤）
- 搜索和过滤
- 笔记本分类管理
- 标签关联管理
- 数据持久化

#### **数据模型**

**Note 类型定义** (`src/types/index.ts`)
```typescript
export interface Note {
  id: string;
  userId: string;
  notebookId?: string | null;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  notebook?: Notebook | null;
  tags?: Tag[];
}

export interface Notebook {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    notes: number;
  };
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    noteTags: number;
  };
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  notebookId?: string | null;
  tagIds?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  notebookId?: string | null;
  tagIds?: string[];
}

export interface NoteQueryParams {
  search?: string;
  notebookId?: string;
  tagIds?: string[];
  sortBy?: 'updatedAt' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

#### **API 实现**

**笔记列表 API** (`src/app/api/notes/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// GET /api/notes - 获取笔记列表
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(notes);
}

// POST /api/notes - 创建新笔记
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const note = await prisma.note.create({
    data: {
      title: body.title || "未命名笔记",
      content: body.content || "",
      userId: session.user.id,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
```

**单个笔记 API** (`src/app/api/notes/[id]/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// GET /api/notes/[id] - 获取单个笔记
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = await prisma.note.findUnique({
    where: { id: params.id, userId: session.user.id },
  });

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

// PUT /api/notes/[id] - 更新笔记
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const note = await prisma.note.update({
    where: { id: params.id, userId: session.user.id },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return NextResponse.json(note);
}

// DELETE /api/notes/[id] - 删除笔记
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.note.delete({
    where: { id: params.id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
```

### 4.3 编辑器模块

#### **模块职责**
- Markdown 编辑（基于 Vditor）
- 分屏预览（编辑与预览同步）
- 自动保存
- 代码高亮（内置）
- 数学公式支持（KaTeX）
- 目录生成（TOC）

#### **组件实现**

**Markdown 编辑器** (`src/components/editor/MarkdownEditor.tsx`)
```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { VditorEditor } from "./VditorEditor";
// ... 其他导入

interface MarkdownEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  initialNotebookId?: string;
  initialTags?: Tag[];
}

export function MarkdownEditor({
  noteId,
  initialTitle,
  initialContent,
  initialNotebookId,
  initialTags = [],
}: MarkdownEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 防抖，1 秒后自动保存
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTitle = useDebounce(title, 1000);

  useEffect(() => {
    const saveNote = async () => {
      if (debouncedContent === initialContent && debouncedTitle === initialTitle) {
        return;
      }

      setSaving(true);
      try {
        await fetch(`/api/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            notebookId: notebookId || null,
            tagIds,
          }),
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("保存失败:", error);
      } finally {
        setSaving(false);
      }
    };

    if (debouncedContent !== undefined || debouncedTitle !== undefined) {
      saveNote();
    }
  }, [debouncedContent, debouncedTitle]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* 工具栏 */}
      <div className="border-b">
        {/* 标题输入、笔记本选择、标签选择等 */}
      </div>

      {/* 编辑器 - Vditor 内置分屏预览功能 */}
      <div className="flex flex-1 overflow-hidden flex-col">
        <div className="flex-1 overflow-hidden">
          <VditorEditor content={content} onContentChange={setContent} />
        </div>
        <AutoSaveIndicator saving={saving} lastSaved={lastSaved} />
      </div>
    </div>
  );
}
```

**Vditor 编辑器组件** (`src/components/editor/VditorEditor.tsx`)
```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import Vditor from "vditor";
import "vditor/dist/index.css";

interface VditorEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export function VditorEditor({ content, onContentChange }: VditorEditorProps) {
  const [vd, setVd] = useState<Vditor>();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<string>(content);
  const onChangeRef = useRef(onContentChange);
  const isInitializedRef = useRef(false);

  // 初始化 Vditor
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    contentRef.current = content;

    const vditor = new Vditor("vditor", {
      height: "100%",
      mode: "sv", // 分屏预览模式
      preview: {
        delay: 300,
        hljs: {
          enable: true,
          style: "github",
          lineNumber: true,
        },
        markdown: {
          toc: true,
          footnotes: true,
          autoSpace: true,
          fixTermTypo: true,
        },
        math: {
          engine: "KaTeX",
        },
      },
      input: (value: string) => {
        if (value !== contentRef.current) {
          contentRef.current = value;
          onChangeRef.current(value);
        }
      },
      toolbar: [
        "headings", "bold", "italic", "strike", "|",
        "line", "quote", "list", "ordered-list", "check", "|",
        "code", "inline-code", "|",
        "link", "table", "|",
        "undo", "redo", "|",
        "fullscreen", "edit-mode", "preview-mode", "both", "|",
        "outline", "help",
      ],
      cache: {
        enable: false, // 禁用缓存，因为我们自己管理内容
      },
      after: () => {
        if (contentRef.current) {
          vditor.setValue(contentRef.current);
        }
        setVd(vditor);
        isInitializedRef.current = true;
      },
    });

    return () => {
      isInitializedRef.current = false;
    };
  }, []);

  // 同步外部内容变化到编辑器
  useEffect(() => {
    if (vd && content !== contentRef.current) {
      const currentValue = vd.getValue();
      if (currentValue !== content) {
        contentRef.current = content;
        vd.setValue(content);
      }
    }
  }, [content, vd]);

  return (
    <div ref={containerRef} className="vditor-container h-full w-full">
      <div id="vditor" className="h-full w-full" />
    </div>
  );
}
```

**Markdown 预览** (`src/components/editor/MarkdownPreview.tsx`)
> 注意：此组件主要用于笔记列表预览等其他场景，编辑器已使用 Vditor 内置预览功能
```typescript
"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-body prose prose-slate max-w-none p-3 sm:p-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content || "*开始编写你的笔记...*"}
      </ReactMarkdown>
    </div>
  );
}
```

### 4.4 搜索模块

#### **搜索 API** (`src/app/api/notes/search/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// GET /api/notes/search?q=keyword
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query) {
    return NextResponse.json([]);
  }

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(notes);
}
```

### 4.5 笔记本管理模块

#### **模块职责**
- 笔记本的 CRUD 操作
- 笔记本列表展示和排序
- 笔记本与笔记的关联管理
- 笔记数量统计

#### **API 实现示例**

**笔记本列表 API** (`src/app/api/notebooks/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notebooks - 获取笔记本列表
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const notebooks = await prisma.notebook.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { notes: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: notebooks });
}

// POST /api/notebooks - 创建笔记本
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, color, icon } = body;

  // 获取当前最大的 sortOrder
  const maxSortOrder = await prisma.notebook.findFirst({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const notebook = await prisma.notebook.create({
    data: {
      userId: session.user.id,
      name,
      description,
      color,
      icon,
      sortOrder: (maxSortOrder?.sortOrder ?? -1) + 1,
    },
    include: {
      _count: {
        select: { notes: true },
      },
    },
  });

  return NextResponse.json({ data: notebook }, { status: 201 });
}
```

### 4.6 标签管理模块

#### **模块职责**
- 标签的 CRUD 操作
- 标签列表展示
- 标签与笔记的多对多关联
- 标签使用统计

#### **API 实现示例**

**标签列表 API** (`src/app/api/tags/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tags - 获取标签列表
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { notes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: tags });
}

// POST /api/tags - 创建标签
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { name, color } = body;

  try {
    const tag = await prisma.tag.create({
      data: {
        userId: session.user.id,
        name,
        color,
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    return NextResponse.json({ data: tag }, { status: 201 });
  } catch (error: any) {
    // 处理唯一性约束错误
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "标签名称已存在" },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

---

## 5. 数据流设计

### 5.1 认证流程

```
用户提交登录表单
      │
      ▼
客户端验证 (Zod)
      │
      ▼
发送 POST /api/auth/signin
      │
      ▼
NextAuth.js 处理
      │
      ├─→ 查询数据库用户
      │
      ├─→ 验证密码 (bcrypt)
      │
      ├─→ 生成 JWT Token
      │
      └─→ 设置 HTTP-Only Cookie
            │
            ▼
      返回认证结果
            │
            ├─→ 成功: 跳转到 /notes
            │
            └─→ 失败: 显示错误消息
```

### 5.2 笔记保存流程

```
用户编辑笔记内容
      │
      ▼
触发 onChange 事件
      │
      ▼
更新本地 State
      │
      ▼
防抖延迟 (2秒)
      │
      ▼
发送 PUT /api/notes/[id]
      │
      ├─→ 验证用户身份
      │
      ├─→ 验证笔记所有权
      │
      └─→ 更新数据库
            │
            ├─→ 成功: 更新保存状态
            │
            └─→ 失败: 重试或提示错误
```

### 5.3 笔记列表加载流程

```
用户访问 /notes
      │
      ▼
Server Component 渲染
      │
      ├─→ 验证会话 (middleware)
      │
      ├─→ 查询数据库
      │
      └─→ 生成 HTML
            │
            ▼
      返回完整页面
            │
            ▼
      客户端水合 (Hydration)
            │
            ▼
      交互功能激活
```

---

## 6. 安全架构

### 6.1 认证与授权

**多层防护**
```
请求 → Middleware → API Handler → Database
        ↓              ↓              ↓
    会话检查      用户验证      权限控制
```

**具体措施**
1. **Middleware 层**: 检查受保护路由的会话
2. **API 层**: 验证用户身份和权限
3. **Database 层**: 查询时添加 userId 过滤

### 6.2 密码安全

**加密策略**
```typescript
// 注册时加密
const hashedPassword = await bcrypt.hash(password, 10);

// 登录时验证
const isValid = await bcrypt.compare(password, user.password);
```

**密码要求**
- 最少 8 位字符
- 包含字母和数字
- 推荐包含特殊字符

### 6.3 会话安全

**JWT Token 配置**
- HTTP-Only Cookie（防 XSS）
- SameSite=Lax（防 CSRF）
- Secure=true（仅 HTTPS）
- 30 天过期时间
- 自动刷新机制

### 6.4 数据安全

**SQL 注入防护**
- 使用 Prisma 参数化查询
- 所有输入都经过 ORM 处理

**XSS 防护**
- React 自动转义
- Markdown 渲染时过滤危险标签
- CSP (Content Security Policy)

**CSRF 防护**
- NextAuth.js 内置 CSRF Token
- SameSite Cookie 属性

### 6.5 API 安全

**请求验证**
```typescript
// 使用 Zod 验证
const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(100000),
});

const result = schema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { error: result.error },
    { status: 400 }
  );
}
```

**速率限制** (未来可添加)
- 限制 API 调用频率
- 防止暴力破解

---

## 7. 性能优化策略

### 7.1 前端优化

#### **Server Components**
- 大部分页面使用 Server Components
- 减少客户端 JavaScript
- 提升首屏加载速度

#### **代码分割**
```typescript
// 动态导入
const MarkdownEditor = dynamic(
  () => import("@/components/editor/MarkdownEditor"),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
```

#### **图片优化**
```typescript
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority
/>
```

#### **字体优化**
```typescript
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 7.2 后端优化

#### **数据库查询优化**
```typescript
// 使用 select 减少数据传输
const notes = await prisma.note.findMany({
  select: {
    id: true,
    title: true,
    updatedAt: true,
    // 不查询 content（大字段）
  },
});

// 使用索引
// 在 schema.prisma 中定义
model Note {
  id        String   @id @default(cuid())
  userId    String
  title     String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId, updatedAt]) // 复合索引
}
```

#### **连接池管理**
```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

#### **缓存策略**
```typescript
// 使用 Next.js 缓存
export const revalidate = 60; // 60 秒

// 或使用 unstable_cache
import { unstable_cache } from "next/cache";

const getCachedNotes = unstable_cache(
  async (userId) => await prisma.note.findMany({ where: { userId } }),
  ["user-notes"],
  { revalidate: 60 }
);
```

### 7.3 资源优化

**Tailwind CSS 压缩**
- 生产环境自动清除未使用的类
- 压缩后通常 < 10KB

**JavaScript 压缩**
- Next.js 自动压缩和混淆
- 使用 SWC 编译器（比 Babel 快）

**静态资源 CDN**
- 部署到 Vercel 自动 CDN
- 图片、字体等静态资源边缘缓存

---

## 8. 部署架构

### 8.1 推荐部署方案

**Vercel (推荐)**
```
┌─────────────────────────────────────────┐
│           Vercel Edge Network           │
│  (全球 CDN + 边缘函数)                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Next.js Application             │
│  • Server Components                    │
│  • API Routes                           │
│  • Static Assets                        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      PostgreSQL Database                │
│  (Vercel Postgres / Supabase)          │
└─────────────────────────────────────────┘
```

**优势**
- 一键部署
- 自动 HTTPS
- 全球 CDN
- 零配置
- 免费额度充足

### 8.2 环境变量管理

```bash
# .env.example
# 数据库连接
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="生成的随机字符串"

# 应用配置
NODE_ENV="production"
```

### 8.4 CI/CD 流程

**GitHub Actions 示例**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 9. 监控与日志

### 9.1 错误监控

**Sentry 集成**
```typescript
// next.config.js
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig({
  // Next.js config
});
```

### 9.2 性能监控

**Vercel Analytics**
- 自动集成
- 实时性能指标
- Web Vitals 追踪

**自定义日志**
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
};
```

---

## 10. 扩展性设计

### 10.1 水平扩展

- 无状态设计（会话存储在 JWT）
- 数据库连接池
- 静态资源 CDN
- 负载均衡器（如需）

### 10.2 功能扩展

**插件化设计**
- Markdown 编辑器可替换
- 认证方式可扩展（OAuth）
- 数据库可迁移（MySQL/SQLite）

**已实现的模块**
- ✅ 用户认证模块（注册、登录、会话管理）
- ✅ 笔记管理模块（CRUD、搜索、过滤）
- ✅ 笔记本功能模块（分类管理、排序）
- ✅ 标签系统模块（多对多关联、统计）
- ✅ Markdown 编辑器（Vditor 分屏预览、代码高亮、数学公式、TOC）
- ✅ 自动保存功能

**未来可扩展功能**
- 🔄 笔记分享功能（公开链接、权限控制）
- 🔄 多人协作功能（实时编辑、冲突解决）
- 🔄 附件上传功能（图片、文件）
- 🔄 笔记导出功能（PDF、HTML、Markdown）
- 🔄 笔记模板功能
- 🔄 AI 辅助功能（自动摘要、标签推荐）

---

## 11. 开发规范

### 11.1 代码规范

**TypeScript**
- 严格模式
- 显式类型声明
- 避免 any

**命名规范**
- 组件: PascalCase (e.g., `NoteCard`)
- 函数: camelCase (e.g., `getNotes`)
- 常量: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- 类型: PascalCase + Type/Interface 后缀

**文件组织**
- 一个文件一个组件
- 相关文件放在同一目录
- 使用 index.ts 导出

### 11.2 Git 规范

**Commit 消息**
```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建工具或辅助工具变动
```

**分支策略**
- main: 生产环境
- develop: 开发环境
- feature/*: 功能分支
- hotfix/*: 紧急修复

---

## 12. 总结

本文档详细描述了 Mars-Notes 系统的技术架构设计（v1.1），涵盖了从前端到后端、从开发到部署的各个方面。

**核心优势**
- ✅ 前后端一体化，简化开发和部署
- ✅ 类型安全，减少运行时错误
- ✅ 性能优化，提供流畅体验
- ✅ 安全可靠，保护用户数据
- ✅ 易于扩展，支持持续迭代
- ✅ 模块化设计，功能清晰独立

**当前功能状态 (v1.2)**
- ✅ 用户认证系统
- ✅ 笔记 CRUD 完整功能
- ✅ 笔记本分类管理
- ✅ 标签系统
- ✅ 高级搜索和过滤
- ✅ Markdown 编辑器（Vditor 分屏预览）
- ✅ 自动保存

**技术栈总览**
- **前端**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + NextAuth.js v5
- **数据库**: PostgreSQL + Prisma ORM
- **部署**: Vercel (推荐) / VPS

**下一步**
请参考其他文档继续了解：
- [数据库设计](./DATABASE.md) - 详细的数据模型和关系设计
- [API 接口文档](./API.md) - 完整的 API 端点和使用说明
- [部署指南](./DEPLOYMENT.md) - 生产环境部署流程

---

**更新历史**
- **v1.2** (2025-01-27): 编辑器升级为 Vditor，支持分屏预览、数学公式、TOC 等功能
- **v1.1** (2025-11-04): 新增笔记本和标签功能
- **v1.0** (2025-11-04): 初始版本，包含基础笔记功能

**文档维护**
- 本文档随技术栈升级持续更新
- 重大架构变更需同步更新文档
- 所有开发者都应熟悉本文档
- 新功能开发前需评估架构影响

