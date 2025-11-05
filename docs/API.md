# Mars-Notes - API 设计文档

## 文档信息

- **项目名称**: Mars-Notes
- **API 版本**: v1.2
- **文档版本**: 1.2
- **创建日期**: 2025-11-04
- **最后更新**: 2025-01-27
- **Base URL**: `https://your-domain.com/api`

---

## 目录

1. [API 概览](#1-api-概览)
2. [认证鉴权](#2-认证鉴权)
3. [通用规范](#3-通用规范)
4. [认证 API](#4-认证-api)
5. [笔记 API](#5-笔记-api)
6. [笔记本 API](#6-笔记本-api)
7. [标签 API](#7-标签-api)
8. [用户管理 API](#8-用户管理-api)
9. [错误处理](#9-错误处理)
10. [速率限制](#10-速率限制)
11. [测试指南](#11-测试指南)

---

## 1. API 概览

### 1.1 API 架构

```
┌─────────────────────────────────────────┐
│           客户端应用                     │
└────────────────┬────────────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────┐
│         Next.js API Routes              │
│  /api/auth/*  |  /api/notes/*          │
│  /api/notebooks/*  |  /api/tags/*      │
│  /api/user/*  |  (用户管理)            │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴───────┐
         ▼               ▼
┌──────────────┐  ┌──────────────┐
│  NextAuth.js │  │   业务逻辑    │
│   认证层     │  │   数据验证    │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                ▼
       ┌─────────────────┐
       │  Prisma ORM     │
       └────────┬────────┘
                ▼
       ┌─────────────────┐
       │  PostgreSQL DB  │
       └─────────────────┘
```

### 1.2 API 端点列表

| 分类 | 端点 | 方法 | 认证 | 描述 |
|-----|------|------|------|------|
| **认证** |
| | `/api/auth/register` | POST | ❌ | 用户注册 |
| | `/api/auth/[...nextauth]` | GET/POST | ❌ | NextAuth.js 认证 |
| | `/api/auth/session` | GET | ✅ | 获取当前会话 |
| **笔记** |
| | `/api/notes` | GET | ✅ | 获取笔记列表（支持过滤） |
| | `/api/notes` | POST | ✅ | 创建新笔记 |
| | `/api/notes/[id]` | GET | ✅ | 获取单个笔记 |
| | `/api/notes/[id]` | PUT | ✅ | 更新笔记 |
| | `/api/notes/[id]` | DELETE | ✅ | 删除笔记 |
| | `/api/notes/search` | GET | ✅ | 搜索笔记 |
| **笔记本** |
| | `/api/notebooks` | GET | ✅ | 获取笔记本列表 |
| | `/api/notebooks` | POST | ✅ | 创建新笔记本 |
| | `/api/notebooks/[id]` | GET | ✅ | 获取单个笔记本 |
| | `/api/notebooks/[id]` | PUT | ✅ | 更新笔记本 |
| | `/api/notebooks/[id]` | DELETE | ✅ | 删除笔记本 |
| **标签** |
| | `/api/tags` | GET | ✅ | 获取标签列表 |
| | `/api/tags` | POST | ✅ | 创建新标签 |
| | `/api/tags/[id]` | GET | ✅ | 获取单个标签 |
| | `/api/tags/[id]` | PUT | ✅ | 更新标签 |
| | `/api/tags/[id]` | DELETE | ✅ | 删除标签 |
| **用户管理** |
| | `/api/user/name` | PUT | ✅ | 修改昵称 |
| | `/api/user/password` | PUT | ✅ | 修改密码 |
| | `/api/user/avatar` | PUT | ✅ | 更新头像 |
| | `/api/user/avatar` | DELETE | ✅ | 删除头像 |
| | `/api/user/upload` | POST | ✅ | 上传头像文件 |
| | `/api/user/delete` | DELETE | ✅ | 注销账户 |

---

## 2. 认证鉴权

### 2.1 认证方式

**NextAuth.js + JWT**
- 使用 NextAuth.js 提供的 Credentials Provider
- 登录成功后生成 JWT Token
- Token 存储在 HTTP-Only Cookie 中
- 所有受保护的 API 都需要验证 Token

### 2.2 认证流程

```
1. 用户提交登录信息
   ↓
2. POST /api/auth/signin
   ↓
3. NextAuth.js 验证凭据
   ↓
4. 生成 JWT Token
   ↓
5. 设置 HTTP-Only Cookie
   ↓
6. 返回认证结果
```

### 2.3 获取认证信息

**服务端（API Routes）**

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const userId = session.user.id;
  // ... 继续处理
}
```

**客户端（React 组件）**

```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>加载中...</div>;
  }
  
  if (status === "unauthenticated") {
    return <div>请先登录</div>;
  }
  
  return <div>欢迎, {session.user.name}</div>;
}
```

### 2.4 认证错误

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 401 | UNAUTHORIZED | 未登录或 Token 无效 |
| 403 | FORBIDDEN | 无权限访问资源 |

---

## 3. 通用规范

### 3.1 请求格式

**Content-Type**
```
Content-Type: application/json
```

**请求示例**
```bash
curl -X POST https://api.example.com/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的笔记",
    "content": "# Hello World"
  }'
```

### 3.2 响应格式

**成功响应**

```json
{
  "id": "clh1234567890abcdef",
  "title": "我的笔记",
  "content": "# Hello World",
  "userId": "clh0987654321zyxwvu",
  "createdAt": "2025-11-04T10:00:00.000Z",
  "updatedAt": "2025-11-04T10:00:00.000Z"
}
```

**错误响应**

```json
{
  "error": "Validation failed",
  "message": "标题不能为空",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "title",
    "reason": "required"
  }
}
```

### 3.3 HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|---------|
| 200 | OK | 成功获取资源 |
| 201 | Created | 成功创建资源 |
| 204 | No Content | 成功删除资源 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如邮箱已存在） |
| 422 | Unprocessable Entity | 数据验证失败 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器错误 |

### 3.4 分页参数

**查询参数**
```
GET /api/notes?page=1&limit=20
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|------|
| page | number | ❌ | 1 | 页码（从 1 开始） |
| limit | number | ❌ | 20 | 每页数量（1-100） |

**分页响应**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3.5 排序参数

```
GET /api/notes?sort=updatedAt&order=desc
```

| 参数 | 类型 | 可选值 | 默认值 | 说明 |
|-----|------|--------|--------|------|
| sort | string | updatedAt, createdAt, title | updatedAt | 排序字段 |
| order | string | asc, desc | desc | 排序方向 |

---

## 4. 认证 API

### 4.1 用户注册

**端点**: `POST /api/auth/register`

**描述**: 创建新用户账号

**认证**: ❌ 不需要

**请求体**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "张三"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| email | string | ✅ | 邮箱格式 | 用户邮箱 |
| password | string | ✅ | 最少 8 位，包含字母和数字 | 登录密码 |
| name | string | ❌ | 1-50 字符 | 用户昵称 |

**成功响应** (201 Created)

```json
{
  "id": "clh1234567890abcdef",
  "email": "user@example.com",
  "name": "张三",
  "createdAt": "2025-11-04T10:00:00.000Z"
}
```

**错误响应**

```json
// 409 Conflict - 邮箱已存在
{
  "error": "Email already exists",
  "message": "该邮箱已被注册",
  "code": "EMAIL_EXISTS"
}

// 422 Unprocessable Entity - 验证失败
{
  "error": "Validation failed",
  "message": "密码不符合要求",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "password",
    "reason": "Password must be at least 8 characters"
  }
}
```

**实现示例**

```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "密码必须包含字母和数字"),
  name: z.string().min(1).max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 验证请求数据
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: result.error.errors[0].message,
          code: "VALIDATION_ERROR",
        },
        { status: 422 }
      );
    }

    const { email, password, name } = result.data;

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email already exists",
          message: "该邮箱已被注册",
          code: "EMAIL_EXISTS",
        },
        { status: 409 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "注册失败，请稍后重试",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
```

### 4.2 用户登录

**端点**: `POST /api/auth/callback/credentials`

**描述**: 用户登录（由 NextAuth.js 处理）

**认证**: ❌ 不需要

**请求体**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**成功响应** (200 OK)

NextAuth.js 自动设置 Cookie，无需手动处理

**前端使用示例**

```typescript
import { signIn } from "next-auth/react";

const handleLogin = async (email: string, password: string) => {
  const result = await signIn("credentials", {
    redirect: false,
    email,
    password,
  });

  if (result?.ok) {
    // 登录成功
    router.push("/notes");
  } else {
    // 登录失败
    setError("邮箱或密码错误");
  }
};
```

### 4.3 用户登出

**端点**: `POST /api/auth/signout`

**描述**: 用户登出（由 NextAuth.js 处理）

**认证**: ✅ 需要

**前端使用示例**

```typescript
import { signOut } from "next-auth/react";

const handleLogout = async () => {
  await signOut({ redirect: true, callbackUrl: "/login" });
};
```

### 4.4 获取当前会话

**端点**: `GET /api/auth/session`

**描述**: 获取当前登录用户信息

**认证**: ✅ 需要

**成功响应** (200 OK)

```json
{
  "user": {
    "id": "clh1234567890abcdef",
    "email": "user@example.com",
    "name": "张三",
    "image": null
  },
  "expires": "2025-12-04T10:00:00.000Z"
}
```

**未登录响应** (200 OK)

```json
null
```

---

## 5. 笔记 API

### 5.1 获取笔记列表

**端点**: `GET /api/notes`

**描述**: 获取当前用户的所有笔记，支持多种过滤条件

**认证**: ✅ 需要

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|------|
| page | number | ❌ | 1 | 页码 |
| limit | number | ❌ | 20 | 每页数量（最大100） |
| sort | string | ❌ | updatedAt | 排序字段 |
| order | string | ❌ | desc | 排序方向（asc/desc） |
| search | string | ❌ | - | 搜索关键词（标题或内容） |
| notebookId | string | ❌ | - | 笔记本ID过滤 |
| tagIds | string | ❌ | - | 标签ID列表（逗号分隔） |

**请求示例**

```bash
# 基础查询
GET /api/notes?page=1&limit=20&sort=updatedAt&order=desc

# 搜索笔记
GET /api/notes?search=React

# 按笔记本过滤
GET /api/notes?notebookId=clh1234567890

# 按标签过滤
GET /api/notes?tagIds=tag1,tag2

# 组合过滤
GET /api/notes?notebookId=clh1234567890&tagIds=tag1&search=React
```

**成功响应** (200 OK)

```json
{
  "data": [
    {
      "id": "clh1234567890abcdef",
      "title": "React Hooks 学习",
      "content": "# React Hooks\n\n## useState\n...",
      "notebookId": "notebook123",
      "createdAt": "2025-11-04T10:00:00.000Z",
      "updatedAt": "2025-11-04T15:30:00.000Z",
      "notebook": {
        "id": "notebook123",
        "name": "前端开发",
        "color": "#3b82f6",
        "icon": "📘"
      },
      "tags": [
        {
          "id": "tag1",
          "name": "React",
          "color": "#61dafb",
          "userId": "user123",
          "createdAt": "2025-11-04T10:00:00.000Z",
          "updatedAt": "2025-11-04T10:00:00.000Z"
        }
      ]
    },
    {
      "id": "clh9876543210zyxwvu",
      "title": "Next.js 笔记",
      "content": "# Next.js\n\n## App Router\n...",
      "notebookId": "notebook123",
      "createdAt": "2025-11-03T14:00:00.000Z",
      "updatedAt": "2025-11-04T12:00:00.000Z",
      "notebook": {
        "id": "notebook123",
        "name": "前端开发",
        "color": "#3b82f6",
        "icon": "📘"
      },
      "tags": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

**实现示例**

```typescript
// src/app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const sort = searchParams.get("sort") || "updatedAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const skip = (page - 1) * limit;

  // 查询笔记
  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where: { userId: session.user.id },
      orderBy: { [sort]: order },
      take: limit,
      skip: skip,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.note.count({
      where: { userId: session.user.id },
    }),
  ]);

  return NextResponse.json({
    data: notes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### 5.2 创建笔记

**端点**: `POST /api/notes`

**描述**: 创建新笔记

**认证**: ✅ 需要

**请求体**

```json
{
  "title": "我的新笔记",
  "content": "# 标题\n\n这是笔记内容...",
  "notebookId": "notebook123",
  "tagIds": ["tag1", "tag2"]
}
```

**注意**: `notebookId` 可以为 `null` 或不传该字段，表示创建不指定笔记本的笔记。如果传入空字符串，会自动转换为 `null`。

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| title | string | ✅ | 1-200 字符 | 笔记标题 |
| content | string | ❌ | 最大 100,000 字符 | 笔记内容（Markdown） |
| notebookId | string \| null | ❌ | - | 所属笔记本ID（可为 null，表示不指定笔记本） |
| tagIds | string[] | ❌ | - | 标签ID数组 |

**成功响应** (201 Created)

```json
{
  "id": "clh1234567890abcdef",
  "title": "我的新笔记",
  "content": "# 标题\n\n这是笔记内容...",
  "userId": "clh0987654321zyxwvu",
  "notebookId": "notebook123",
  "createdAt": "2025-11-04T10:00:00.000Z",
  "updatedAt": "2025-11-04T10:00:00.000Z",
  "notebook": {
    "id": "notebook123",
    "name": "前端开发",
    "color": "#3b82f6",
    "icon": "📘"
  },
  "tags": [
    {
      "id": "tag1",
      "name": "React",
      "color": "#61dafb",
      "userId": "user123",
      "createdAt": "2025-11-04T10:00:00.000Z",
      "updatedAt": "2025-11-04T10:00:00.000Z"
    },
    {
      "id": "tag2",
      "name": "JavaScript",
      "color": "#f7df1e",
      "userId": "user123",
      "createdAt": "2025-11-04T10:00:00.000Z",
      "updatedAt": "2025-11-04T10:00:00.000Z"
    }
  ]
}
```

**错误响应**

```json
// 422 Unprocessable Entity - 验证失败
{
  "error": "Validation failed",
  "message": "标题不能为空",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "title",
    "reason": "required"
  }
}
```

**实现示例**

```typescript
// src/app/api/notes/route.ts (POST 方法)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // 验证数据
    const noteSchema = z.object({
      title: z.string().min(1, "标题不能为空").max(200, "标题最多 200 字符"),
      content: z.string().max(100000, "内容过长").default(""),
      notebookId: z
        .string()
        .optional()
        .nullable()
        .transform((val) => (val && typeof val === "string" && val.trim() !== "" ? val : null)),
      tagIds: z.array(z.string()).optional(),
    });

    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: result.error.errors[0].message,
          code: "VALIDATION_ERROR",
        },
        { status: 422 }
      );
    }

    const { title, content, notebookId, tagIds } = result.data;

    // 创建笔记
    const note = await prisma.note.create({
      data: {
        title,
        content: content || "",
        userId: session.user.id,
        notebookId: notebookId ?? null,
        noteTags: tagIds
          ? {
              create: tagIds.map((tagId: string) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        notebook: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        noteTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("创建笔记失败:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
```

### 5.3 获取单个笔记

**端点**: `GET /api/notes/[id]`

**描述**: 获取指定笔记的详细信息

**认证**: ✅ 需要

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 笔记 ID |

**请求示例**

```bash
GET /api/notes/clh1234567890abcdef
```

**成功响应** (200 OK)

```json
{
  "id": "clh1234567890abcdef",
  "title": "React Hooks 学习",
  "content": "# React Hooks\n\n## useState\n...",
  "userId": "clh0987654321zyxwvu",
  "notebookId": "notebook123",
  "createdAt": "2025-11-04T10:00:00.000Z",
  "updatedAt": "2025-11-04T15:30:00.000Z",
  "notebook": {
    "id": "notebook123",
    "name": "前端开发",
    "color": "#3b82f6",
    "icon": "📘"
  },
  "tags": [
    {
      "id": "tag1",
      "name": "React",
      "color": "#61dafb",
      "userId": "user123",
      "createdAt": "2025-11-04T10:00:00.000Z",
      "updatedAt": "2025-11-04T10:00:00.000Z"
    }
  ]
}
```

**错误响应**

```json
// 404 Not Found - 笔记不存在
{
  "error": "Note not found",
  "message": "笔记不存在或无权访问",
  "code": "NOT_FOUND"
}
```

**实现示例**

```typescript
// src/app/api/notes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const note = await prisma.note.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // 确保只能访问自己的笔记
      },
    });

    if (!note) {
      return NextResponse.json(
        {
          error: "Note not found",
          message: "笔记不存在或无权访问",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("获取笔记失败:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
```

### 5.4 更新笔记

**端点**: `PUT /api/notes/[id]`

**描述**: 更新指定笔记

**认证**: ✅ 需要

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 笔记 ID |

**请求体**

```json
{
  "title": "更新后的标题",
  "content": "更新后的内容...",
  "notebookId": "notebook456",
  "tagIds": ["tag3", "tag4"]
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| title | string | ❌ | 1-200 字符 | 笔记标题 |
| content | string | ❌ | 最大 100,000 字符 | 笔记内容 |
| notebookId | string \| null | ❌ | - | 所属笔记本ID（可为 null，表示移除笔记本关联） |
| tagIds | string[] | ❌ | - | 标签ID数组（会完全替换现有标签） |

**成功响应** (200 OK)

```json
{
  "id": "clh1234567890abcdef",
  "title": "更新后的标题",
  "content": "更新后的内容...",
  "userId": "clh0987654321zyxwvu",
  "notebookId": "notebook456",
  "createdAt": "2025-11-04T10:00:00.000Z",
  "updatedAt": "2025-11-04T16:00:00.000Z",
  "notebook": {
    "id": "notebook456",
    "name": "后端开发",
    "color": "#10b981",
    "icon": "📗"
  },
  "tags": [
    {
      "id": "tag3",
      "name": "Node.js",
      "color": "#68a063",
      "userId": "user123",
      "createdAt": "2025-11-04T10:00:00.000Z",
      "updatedAt": "2025-11-04T10:00:00.000Z"
    }
  ]
}
```

**错误响应**

```json
// 404 Not Found
{
  "error": "Note not found",
  "message": "笔记不存在或无权访问",
  "code": "NOT_FOUND"
}

// 422 Unprocessable Entity
{
  "error": "Validation failed",
  "message": "标题不能为空",
  "code": "VALIDATION_ERROR"
}
```

**实现示例**

```typescript
// src/app/api/notes/[id]/route.ts (PUT 方法)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 验证数据
    const updateSchema = z.object({
      title: z.string().min(1).max(200).optional(),
      content: z.string().max(100000).optional(),
    });

    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: result.error.errors[0].message,
          code: "VALIDATION_ERROR",
        },
        { status: 422 }
      );
    }

    // 检查笔记是否存在且属于当前用户
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // 更新笔记
    const note = await prisma.note.update({
      where: { id: params.id },
      data: result.data,
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("更新笔记失败:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
```

### 5.5 删除笔记

**端点**: `DELETE /api/notes/[id]`

**描述**: 删除指定笔记

**认证**: ✅ 需要

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 笔记 ID |

**请求示例**

```bash
DELETE /api/notes/clh1234567890abcdef
```

**成功响应** (200 OK)

```json
{
  "success": true,
  "message": "笔记已删除"
}
```

**错误响应**

```json
// 404 Not Found
{
  "error": "Note not found",
  "message": "笔记不存在或无权访问",
  "code": "NOT_FOUND"
}
```

**实现示例**

```typescript
// src/app/api/notes/[id]/route.ts (DELETE 方法)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 检查笔记是否存在且属于当前用户
    const note = await prisma.note.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // 删除笔记
    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "笔记已删除",
    });
  } catch (error) {
    console.error("删除笔记失败:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
```

### 5.6 搜索笔记

**端点**: `GET /api/notes/search`

**描述**: 搜索用户的笔记

**认证**: ✅ 需要

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| q | string | ✅ | 搜索关键词 |
| page | number | ❌ | 页码（默认 1） |
| limit | number | ❌ | 每页数量（默认 20） |

**请求示例**

```bash
GET /api/notes/search?q=React&page=1&limit=20
```

**成功响应** (200 OK)

```json
{
  "data": [
    {
      "id": "clh1234567890abcdef",
      "title": "React Hooks 学习",
      "content": "# React Hooks\n\n## useState\n...",
      "createdAt": "2025-11-04T10:00:00.000Z",
      "updatedAt": "2025-11-04T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  },
  "query": "React"
}
```

**空结果响应** (200 OK)

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  },
  "query": "不存在的关键词"
}
```

**实现示例**

```typescript
// src/app/api/notes/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  if (!query) {
    return NextResponse.json({
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      query: "",
    });
  }

  const skip = (page - 1) * limit;

  // 搜索笔记
  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.note.count({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
    }),
  ]);

  return NextResponse.json({
    data: notes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    query,
  });
}
```

---

## 6. 笔记本 API

### 6.1 获取笔记本列表

**端点**: `GET /api/notebooks`

**描述**: 获取当前用户的所有笔记本

**认证**: ✅ 需要

**成功响应** (200 OK)

```json
{
  "data": [
    {
      "id": "notebook123",
      "userId": "user123",
      "name": "前端开发",
      "description": "前端相关技术笔记",
      "color": "#3b82f6",
      "icon": "📘",
      "sortOrder": 0,
      "createdAt": "2025-11-04T10:00:00.000Z",
      "updatedAt": "2025-11-04T10:00:00.000Z",
      "_count": {
        "notes": 15
      }
    },
    {
      "id": "notebook456",
      "userId": "user123",
      "name": "后端开发",
      "description": "后端技术学习笔记",
      "color": "#10b981",
      "icon": "📗",
      "sortOrder": 1,
      "createdAt": "2025-11-03T10:00:00.000Z",
      "updatedAt": "2025-11-03T10:00:00.000Z",
      "_count": {
        "notes": 8
      }
    }
  ],
  "message": "获取笔记本列表成功"
}
```

### 6.2 创建笔记本

**端点**: `POST /api/notebooks`

**描述**: 创建新笔记本

**认证**: ✅ 需要

**请求体**

```json
{
  "name": "新笔记本",
  "description": "笔记本描述",
  "color": "#3b82f6",
  "icon": "📘"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| name | string | ✅ | 1-100 字符 | 笔记本名称 |
| description | string | ❌ | 最大 500 字符 | 笔记本描述 |
| color | string | ❌ | 最大 20 字符 | 颜色代码 |
| icon | string | ❌ | 最大 50 字符 | 图标（emoji 或图标名称） |

**成功响应** (201 Created)

```json
{
  "data": {
    "id": "notebook789",
    "userId": "user123",
    "name": "新笔记本",
    "description": "笔记本描述",
    "color": "#3b82f6",
    "icon": "📘",
    "sortOrder": 2,
    "createdAt": "2025-11-04T10:00:00.000Z",
    "updatedAt": "2025-11-04T10:00:00.000Z",
    "_count": {
      "notes": 0
    }
  },
  "message": "笔记本创建成功"
}
```

**错误响应**

```json
// 400 Bad Request - 笔记本名称已存在
{
  "error": "笔记本名称已存在",
  "code": "NOTEBOOK_EXISTS"
}

// 400 Bad Request - 数据验证失败
{
  "error": "数据验证失败",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "message": "笔记本名称不能为空",
      "path": ["name"]
    }
  ]
}
```

### 6.3 获取单个笔记本

**端点**: `GET /api/notebooks/[id]`

**描述**: 获取指定笔记本的详细信息

**认证**: ✅ 需要

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 笔记本 ID |

**成功响应** (200 OK)

```json
{
  "data": {
    "id": "notebook123",
    "userId": "user123",
    "name": "前端开发",
    "description": "前端相关技术笔记",
    "color": "#3b82f6",
    "icon": "📘",
    "sortOrder": 0,
    "createdAt": "2025-11-04T10:00:00.000Z",
    "updatedAt": "2025-11-04T10:00:00.000Z",
    "_count": {
      "notes": 15
    }
  },
  "message": "获取笔记本成功"
}
```

**错误响应**

```json
// 404 Not Found
{
  "error": "笔记本不存在",
  "code": "NOTEBOOK_NOT_FOUND"
}

// 403 Forbidden
{
  "error": "无权访问此笔记本",
  "code": "FORBIDDEN"
}
```

### 6.4 更新笔记本

**端点**: `PUT /api/notebooks/[id]`

**描述**: 更新指定笔记本

**认证**: ✅ 需要

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 笔记本 ID |

**请求体**

```json
{
  "name": "更新后的名称",
  "description": "更新后的描述",
  "color": "#ef4444",
  "icon": "📕",
  "sortOrder": 5
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| name | string | ❌ | 1-100 字符 | 笔记本名称 |
| description | string | ❌ | 最大 500 字符 | 笔记本描述 |
| color | string | ❌ | 最大 20 字符 | 颜色代码 |
| icon | string | ❌ | 最大 50 字符 | 图标 |
| sortOrder | number | ❌ | 整数 | 排序顺序 |

**成功响应** (200 OK)

```json
{
  "data": {
    "id": "notebook123",
    "userId": "user123",
    "name": "更新后的名称",
    "description": "更新后的描述",
    "color": "#ef4444",
    "icon": "📕",
    "sortOrder": 5,
    "createdAt": "2025-11-04T10:00:00.000Z",
    "updatedAt": "2025-11-04T16:00:00.000Z",
    "_count": {
      "notes": 15
    }
  },
  "message": "笔记本更新成功"
}
```

### 6.5 删除笔记本

**端点**: `DELETE /api/notebooks/[id]`

**描述**: 删除指定笔记本（笔记本必须为空）

**认证**: ✅ 需要

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 笔记本 ID |

**成功响应** (200 OK)

```json
{
  "message": "笔记本删除成功"
}
```

**错误响应**

```json
// 400 Bad Request - 笔记本不为空
{
  "error": "笔记本中还有笔记，无法删除",
  "code": "NOTEBOOK_NOT_EMPTY"
}

// 404 Not Found
{
  "error": "笔记本不存在",
  "code": "NOTEBOOK_NOT_FOUND"
}
```

---

## 7. 标签 API

### 7.1 获取标签列表

**端点**: `GET /api/tags`

**描述**: 获取当前用户的所有标签

**认证**: ✅ 需要

**成功响应** (200 OK)

```json
{
  "data": [
    {
      "id": "tag1",
      "userId": "user123",
      "name": "React",
      "color": "#61dafb",
      "createdAt": "2025-11-04T10:00:00.000Z",
      "updatedAt": "2025-11-04T10:00:00.000Z",
      "_count": {
        "notes": 10
      }
    },
    {
      "id": "tag2",
      "userId": "user123",
      "name": "JavaScript",
      "color": "#f7df1e",
      "createdAt": "2025-11-03T10:00:00.000Z",
      "updatedAt": "2025-11-03T10:00:00.000Z",
      "_count": {
        "notes": 15
      }
    }
  ],
  "message": "获取标签列表成功"
}
```

### 7.2 创建标签

**端点**: `POST /api/tags`

**描述**: 创建新标签

**认证**: ✅ 需要

**请求体**

```json
{
  "name": "新标签",
  "color": "#3b82f6"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| name | string | ✅ | 1-50 字符 | 标签名称 |
| color | string | ❌ | 最大 20 字符 | 颜色代码 |

**成功响应** (201 Created)

```json
{
  "data": {
    "id": "tag3",
    "userId": "user123",
    "name": "新标签",
    "color": "#3b82f6",
    "createdAt": "2025-11-04T10:00:00.000Z",
    "updatedAt": "2025-11-04T10:00:00.000Z",
    "_count": {
      "notes": 0
    }
  },
  "message": "标签创建成功"
}
```

**错误响应**

```json
// 400 Bad Request - 标签名称已存在
{
  "error": "标签名称已存在",
  "code": "TAG_EXISTS"
}

// 400 Bad Request - 数据验证失败
{
  "error": "数据验证失败",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "message": "标签名称不能为空",
      "path": ["name"]
    }
  ]
}
```

### 7.3 获取单个标签

**端点**: `GET /api/tags/[id]`

**描述**: 获取指定标签的详细信息

**认证**: ✅ 需要

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 标签 ID |

**成功响应** (200 OK)

```json
{
  "data": {
    "id": "tag1",
    "userId": "user123",
    "name": "React",
    "color": "#61dafb",
    "createdAt": "2025-11-04T10:00:00.000Z",
    "updatedAt": "2025-11-04T10:00:00.000Z",
    "_count": {
      "notes": 10
    }
  },
  "message": "获取标签成功"
}
```

**错误响应**

```json
// 404 Not Found
{
  "error": "标签不存在",
  "code": "TAG_NOT_FOUND"
}

// 403 Forbidden
{
  "error": "无权访问此标签",
  "code": "FORBIDDEN"
}
```

### 7.4 更新标签

**端点**: `PUT /api/tags/[id]`

**描述**: 更新指定标签

**认证**: ✅ 需要

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 标签 ID |

**请求体**

```json
{
  "name": "更新后的标签",
  "color": "#ef4444"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| name | string | ❌ | 1-50 字符 | 标签名称 |
| color | string | ❌ | 最大 20 字符 | 颜色代码 |

**成功响应** (200 OK)

```json
{
  "data": {
    "id": "tag1",
    "userId": "user123",
    "name": "更新后的标签",
    "color": "#ef4444",
    "createdAt": "2025-11-04T10:00:00.000Z",
    "updatedAt": "2025-11-04T16:00:00.000Z",
    "_count": {
      "notes": 10
    }
  },
  "message": "标签更新成功"
}
```

### 7.5 删除标签

**端点**: `DELETE /api/tags/[id]`

**描述**: 删除指定标签（会自动解除与笔记的关联）

**认证**: ✅ 需要

**路径参数**

| 参数 | 类型 | 说明 |
|-----|------|------|
| id | string | 标签 ID |

**成功响应** (200 OK)

```json
{
  "message": "标签删除成功"
}
```

**错误响应**

```json
// 404 Not Found
{
  "error": "标签不存在",
  "code": "TAG_NOT_FOUND"
}
```

---

## 8. 用户管理 API

### 8.1 修改昵称

**端点**: `PUT /api/user/name`

**描述**: 修改当前用户的昵称

**认证**: ✅ 需要

**请求体**

```json
{
  "name": "新昵称"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| name | string | ✅ | 1-20 字符 | 用户昵称 |

**成功响应** (200 OK)

```json
{
  "success": true,
  "message": "昵称修改成功",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "新昵称",
    "image": null
  }
}
```

**错误响应**

```json
// 422 Unprocessable Entity - 数据验证失败
{
  "error": "验证失败",
  "message": "昵称最多 20 字符",
  "code": "VALIDATION_ERROR"
}
```

### 8.2 修改密码

**端点**: `PUT /api/user/password`

**描述**: 修改当前用户的登录密码

**认证**: ✅ 需要

**请求体**

```json
{
  "currentPassword": "旧密码123",
  "newPassword": "新密码456",
  "confirmPassword": "新密码456"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| currentPassword | string | ✅ | 不能为空 | 当前密码 |
| newPassword | string | ✅ | 至少 8 位，包含字母和数字 | 新密码 |
| confirmPassword | string | ✅ | 必须与新密码一致 | 确认新密码 |

**成功响应** (200 OK)

```json
{
  "success": true,
  "message": "密码修改成功，请重新登录"
}
```

**错误响应**

```json
// 401 Unauthorized - 当前密码错误
{
  "error": "当前密码错误",
  "code": "INVALID_PASSWORD"
}

// 422 Unprocessable Entity - 数据验证失败
{
  "error": "验证失败",
  "message": "两次输入的密码不一致",
  "code": "VALIDATION_ERROR"
}
```

### 8.3 更新头像

**端点**: `PUT /api/user/avatar`

**描述**: 更新当前用户的头像URL

**认证**: ✅ 需要

**请求体**

```json
{
  "image": "/uploads/avatars/user123-1699099200000.jpg"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| image | string | ✅ | 有效的URL | 头像URL |

**成功响应** (200 OK)

```json
{
  "success": true,
  "message": "头像更新成功",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "用户",
    "image": "/uploads/avatars/user123-1699099200000.jpg"
  }
}
```

### 8.4 删除头像

**端点**: `DELETE /api/user/avatar`

**描述**: 删除当前用户的头像（恢复默认头像）

**认证**: ✅ 需要

**成功响应** (200 OK)

```json
{
  "success": true,
  "message": "头像已删除",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "用户",
    "image": null
  }
}
```

### 8.5 上传头像文件

**端点**: `POST /api/user/upload`

**描述**: 上传头像文件到服务器

**认证**: ✅ 需要

**请求体** (FormData)

```
Content-Type: multipart/form-data

file: [二进制文件]
```

**文件限制**

| 限制项 | 说明 |
|--------|------|
| 文件类型 | JPG、PNG、GIF |
| 文件大小 | 最大 2MB |
| 文件格式 | 图片格式 |

**成功响应** (200 OK)

```json
{
  "success": true,
  "url": "/uploads/avatars/user123-1699099200000.jpg",
  "message": "头像上传成功"
}
```

**错误响应**

```json
// 422 Unprocessable Entity - 文件验证失败
{
  "error": "仅支持 JPG、PNG、GIF 格式的图片",
  "code": "VALIDATION_ERROR"
}

{
  "error": "图片大小不能超过 2MB",
  "code": "VALIDATION_ERROR"
}
```

### 8.6 注销账户

**端点**: `DELETE /api/user/delete`

**描述**: 注销当前用户账户（永久删除所有数据）

**认证**: ✅ 需要

**请求体**

```json
{
  "password": "用户密码"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 验证规则 | 说明 |
|-----|------|------|---------|------|
| password | string | ✅ | 不能为空 | 用户密码（用于确认操作） |

**成功响应** (200 OK)

```json
{
  "success": true,
  "message": "账户已注销"
}
```

**错误响应**

```json
// 401 Unauthorized - 密码错误
{
  "error": "密码错误",
  "code": "INVALID_PASSWORD"
}

// 404 Not Found - 用户不存在
{
  "error": "用户不存在",
  "code": "USER_NOT_FOUND"
}
```

**注意事项**

- 注销账户后，所有数据将被永久删除，包括：
  - 所有笔记
  - 所有笔记本
  - 所有标签
  - 个人设置
- 此操作**无法撤销**，请谨慎操作
- 注销后需要密码验证，防止误操作

---

## 9. 错误处理

### 9.1 错误码列表

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| UNAUTHORIZED | 401 | 未登录或 Token 无效 |
| FORBIDDEN | 403 | 无权限访问 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400/422 | 数据验证失败 |
| EMAIL_EXISTS | 409 | 邮箱已存在 |
| NOTEBOOK_EXISTS | 400 | 笔记本名称已存在 |
| NOTEBOOK_NOT_FOUND | 404 | 笔记本不存在 |
| NOTEBOOK_NOT_EMPTY | 400 | 笔记本不为空 |
| TAG_EXISTS | 400 | 标签名称已存在 |
| TAG_NOT_FOUND | 404 | 标签不存在 |
| USER_NOT_FOUND | 404 | 用户不存在 |
| INVALID_PASSWORD | 401 | 密码错误 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| RATE_LIMIT_EXCEEDED | 429 | 请求过于频繁 |

### 9.2 错误响应格式

```json
{
  "error": "错误类型",
  "message": "详细错误信息",
  "code": "错误码",
  "details": {
    // 可选的详细信息
  }
}
```

### 9.3 错误处理示例

**客户端错误处理**

```typescript
async function createNote(title: string, content: string) {
  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const error = await response.json();
      
      switch (error.code) {
        case "UNAUTHORIZED":
          // 跳转到登录页
          router.push("/login");
          break;
        case "VALIDATION_ERROR":
          // 显示验证错误
          toast.error(error.message);
          break;
        case "RATE_LIMIT_EXCEEDED":
          // 显示限流提示
          toast.warning("操作过于频繁，请稍后再试");
          break;
        default:
          // 通用错误处理
          toast.error("操作失败，请重试");
      }
      
      return null;
    }

    const note = await response.json();
    return note;
  } catch (error) {
    console.error("请求失败:", error);
    toast.error("网络错误，请检查连接");
    return null;
  }
}
```

---

## 10. 速率限制

### 10.1 限制策略（未来可实现）

| API 类型 | 限制 | 时间窗口 |
|---------|------|---------|
| 登录/注册 | 5 次 | 15 分钟 |
| 笔记 CRUD | 100 次 | 1 分钟 |
| 搜索 | 30 次 | 1 分钟 |

### 10.2 限流响应

**响应头**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699099200
```

**错误响应** (429 Too Many Requests)

```json
{
  "error": "Rate limit exceeded",
  "message": "请求过于频繁，请稍后再试",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## 11. 测试指南

### 11.1 使用 cURL 测试

**注册用户**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "测试用户"
  }'
```

**创建笔记**

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "title": "测试笔记",
    "content": "# 测试内容"
  }'
```

**获取笔记列表**

```bash
curl -X GET "http://localhost:3000/api/notes?page=1&limit=20" \
  -H "Cookie: next-auth.session-token=..."
```

### 10.2 使用 Postman 测试

1. 导入 API 文档到 Postman
2. 设置环境变量：
   - `BASE_URL`: `http://localhost:3000`
   - `SESSION_TOKEN`: 登录后的 Cookie
3. 测试各个端点

### 10.3 单元测试示例

```typescript
// __tests__/api/notes.test.ts
import { POST } from "@/app/api/notes/route";
import { NextRequest } from "next/server";

describe("POST /api/notes", () => {
  it("应该创建新笔记", async () => {
    const mockSession = {
      user: { id: "test-user-id", email: "test@example.com" },
    };

    // Mock getServerSession
    jest.mock("next-auth", () => ({
      getServerSession: jest.fn(() => Promise.resolve(mockSession)),
    }));

    const req = new NextRequest("http://localhost:3000/api/notes", {
      method: "POST",
      body: JSON.stringify({
        title: "测试笔记",
        content: "测试内容",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.title).toBe("测试笔记");
  });

  it("应该拒绝未登录的请求", async () => {
    jest.mock("next-auth", () => ({
      getServerSession: jest.fn(() => Promise.resolve(null)),
    }));

    const req = new NextRequest("http://localhost:3000/api/notes", {
      method: "POST",
      body: JSON.stringify({ title: "测试" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });
});
```

---

## 11. 版本控制

### 11.1 API 版本

- 当前版本: `v1.2`
- 版本策略: URL 路径暂不包含版本号（后续可添加 `/api/v1/...`）
- 更新历史：
  - v1.2 (2025-01-27): 新增用户管理功能（我的页面）
  - v1.1 (2025-11-04): 新增笔记本和标签功能
  - v1.0 (2025-11-04): 初始版本，包含基础笔记功能

### 11.2 版本兼容性

- 向后兼容：新增字段不影响现有客户端
- 废弃策略：提前 3 个月通知，保留 6 个月过渡期
- 重大变更：升级主版本号

---

## 12. 最佳实践

### 12.1 客户端最佳实践

**使用 TypeScript**

```typescript
// types/api.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 使用
const response = await fetch("/api/notes");
const result: ApiResponse<Note[]> = await response.json();
```

**封装 API 调用**

```typescript
// lib/api-client.ts
class ApiClient {
  private baseURL = "/api";

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  }

  // ... PUT, DELETE 方法
}

export const apiClient = new ApiClient();
```

### 12.2 服务端最佳实践

**统一错误处理**

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}
```

**使用中间件**

```typescript
// lib/with-auth.ts
export function withAuth(
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    return handler(req, session);
  };
}

// 使用
export const GET = withAuth(async (req, session) => {
  // 已认证的处理逻辑
});
```

---

## 13. 总结

本文档详细描述了 Mars-Notes 系统的 API 设计，包括：

✅ **完整的 API 端点**：覆盖认证、笔记、笔记本、标签管理所有功能  
✅ **标准的 RESTful 设计**：符合行业最佳实践  
✅ **详细的请求响应示例**：便于前端开发对接  
✅ **完善的错误处理**：提供友好的错误提示  
✅ **实现代码示例**：加速后端开发  
✅ **测试指南**：确保 API 质量  
✅ **笔记本和标签支持**：增强笔记组织能力

**相关文档**
- [产品需求文档](./PRD.md)
- [技术架构设计](./ARCHITECTURE.md)
- [数据库设计](./DATABASE.md)
- [部署指南](./DEPLOYMENT.md)

---

**文档维护**
- API 变更必须同步更新文档
- 新增端点需补充完整说明和示例
- 废弃的 API 需标注并保留迁移指南

