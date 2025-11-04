# Mars-Notes - 数据库设计文档

## 文档信息

- **项目名称**: Mars-Notes
- **数据库版本**: v1.0
- **文档版本**: 1.0
- **创建日期**: 2025-11-04
- **最后更新**: 2025-11-04

---

## 目录

1. [数据库概览](#1-数据库概览)
2. [ER 关系图](#2-er-关系图)
3. [数据表设计](#3-数据表设计)
4. [索引策略](#4-索引策略)
5. [Prisma Schema](#5-prisma-schema)
6. [数据迁移](#6-数据迁移)
7. [数据安全](#7-数据安全)
8. [性能优化](#8-性能优化)

---

## 1. 数据库概览

### 1.1 数据库选型

**PostgreSQL 14+**

**选择理由**
- ✅ 功能强大，支持复杂查询
- ✅ 完整的 ACID 支持，数据可靠性高
- ✅ 支持 JSON 类型，便于扩展
- ✅ 全文搜索功能（未来可用）
- ✅ 开源免费，社区活跃
- ✅ 与 Prisma 完美集成

**对比其他数据库**

| 特性 | PostgreSQL | MySQL | SQLite |
|-----|-----------|-------|--------|
| ACID 支持 | ✅ 完整 | ✅ 部分 | ✅ 完整 |
| 并发性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| JSON 支持 | ✅ 原生 | ✅ 较弱 | ✅ 原生 |
| 全文搜索 | ✅ 强大 | ✅ 基础 | ✅ 基础 |
| 扩展性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| 部署复杂度 | 中 | 中 | 低 |
| 适用场景 | 生产环境 | 生产环境 | 开发/小型项目 |

### 1.2 数据库架构

```
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│                                         │
│  ┌───────────┐      ┌───────────┐     │
│  │   User    │      │  Account  │     │
│  │  (用户)    │◄─────│  (账户)    │     │
│  └─────┬─────┘      └───────────┘     │
│        │                               │
│        │ 1:N                           │
│        ▼                               │
│  ┌───────────┐                        │
│  │   Note    │                        │
│  │  (笔记)    │                        │
│  └───────────┘                        │
│        │                               │
│        │ 1:N (未来)                    │
│        ▼                               │
│  ┌───────────┐                        │
│  │  Session  │                        │
│  │  (会话)    │                        │
│  └───────────┘                        │
└─────────────────────────────────────────┘
```

### 1.3 数据规模预估

**初期 (1-6 个月)**
- 用户数: < 1,000
- 笔记数: < 10,000
- 存储空间: < 1 GB
- QPS: < 100

**中期 (6-12 个月)**
- 用户数: < 10,000
- 笔记数: < 100,000
- 存储空间: < 10 GB
- QPS: < 500

**长期 (1-2 年)**
- 用户数: < 100,000
- 笔记数: < 1,000,000
- 存储空间: < 100 GB
- QPS: < 2,000

---

## 2. ER 关系图

### 2.1 实体关系图 (ERD)

```
┌──────────────────────┐
│       User           │
├──────────────────────┤
│ id (PK)              │◄──────────┐
│ email (UNIQUE)       │           │
│ emailVerified        │           │
│ name                 │           │
│ password             │           │
│ image                │           │
│ createdAt            │           │
│ updatedAt            │           │
└──────────────────────┘           │
         △                         │
         │ 1                       │
         │                         │
         │ N                       │
         │                         │
┌──────────────────────┐           │
│      Note            │           │
├──────────────────────┤           │
│ id (PK)              │           │
│ userId (FK)          │───────────┘
│ title                │
│ content              │
│ createdAt            │
│ updatedAt            │
└──────────────────────┘
         △
         │ 1
         │
         │ N
         │
┌──────────────────────┐
│     Account          │
│  (NextAuth 账户表)    │
├──────────────────────┤
│ id (PK)              │
│ userId (FK)          │───────────┐
│ type                 │           │
│ provider             │           │
│ providerAccountId    │           │
│ refresh_token        │           │
│ access_token         │           │
│ expires_at           │           │
│ token_type           │           │
│ scope                │           │
│ id_token             │           │
│ session_state        │           │
└──────────────────────┘           │
                                   │
┌──────────────────────┐           │
│     Session          │           │
│  (NextAuth 会话表)    │           │
├──────────────────────┤           │
│ id (PK)              │           │
│ sessionToken (UNIQUE)│           │
│ userId (FK)          │───────────┘
│ expires              │
└──────────────────────┘

┌──────────────────────┐
│ VerificationToken    │
│  (验证令牌表)         │
├──────────────────────┤
│ identifier           │
│ token (UNIQUE)       │
│ expires              │
└──────────────────────┘
```

### 2.2 关系说明

**User ↔ Note (一对多)**
- 一个用户可以拥有多篇笔记
- 每篇笔记属于一个用户
- 级联删除：删除用户时删除其所有笔记

**User ↔ Account (一对多)**
- 一个用户可以有多个账户（不同登录方式）
- 用于 NextAuth.js OAuth 支持（未来扩展）

**User ↔ Session (一对多)**
- 一个用户可以有多个活跃会话
- 用于多设备登录管理

---

## 3. 数据表设计

### 3.1 User 表（用户表）

**表名**: `User`

**用途**: 存储用户基本信息和认证数据

**字段定义**

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | String (CUID) | - | PK | cuid() | 用户唯一标识 |
| email | String | 255 | NOT NULL, UNIQUE | - | 邮箱地址（登录账号） |
| emailVerified | DateTime | - | NULL | NULL | 邮箱验证时间 |
| name | String | 100 | NULL | NULL | 用户昵称 |
| password | String | 255 | NOT NULL | - | 密码哈希（bcrypt） |
| image | String | 500 | NULL | NULL | 头像 URL |
| createdAt | DateTime | - | NOT NULL | now() | 创建时间 |
| updatedAt | DateTime | - | NOT NULL | updatedAt | 更新时间 |

**业务规则**
- email 必须唯一，用于登录
- password 存储 bcrypt 哈希值，不存储明文
- name 可选，默认使用邮箱前缀
- image 支持外部 URL 或本地路径
- emailVerified 用于未来的邮箱验证功能

**示例数据**
```sql
INSERT INTO "User" (id, email, name, password, "createdAt", "updatedAt")
VALUES (
  'clh1234567890abcdef',
  'user@example.com',
  '张三',
  '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', -- bcrypt hash
  '2025-11-04 10:00:00',
  '2025-11-04 10:00:00'
);
```

### 3.2 Note 表（笔记表）

**表名**: `Note`

**用途**: 存储用户笔记内容

**字段定义**

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | String (CUID) | - | PK | cuid() | 笔记唯一标识 |
| userId | String | - | FK, NOT NULL | - | 所属用户 ID |
| title | String | 200 | NOT NULL | - | 笔记标题 |
| content | Text | - | NOT NULL | '' | 笔记内容（Markdown） |
| createdAt | DateTime | - | NOT NULL | now() | 创建时间 |
| updatedAt | DateTime | - | NOT NULL | updatedAt | 更新时间 |

**业务规则**
- userId 外键关联到 User.id
- title 必填，最长 200 字符
- content 使用 TEXT 类型，支持大文本
- 删除用户时级联删除其笔记
- updatedAt 自动更新（Prisma 自动处理）

**索引**
- `userId` - 加速用户笔记查询
- `userId, updatedAt` - 复合索引，用于排序查询

**示例数据**
```sql
INSERT INTO "Note" (id, "userId", title, content, "createdAt", "updatedAt")
VALUES (
  'clh9876543210zyxwvu',
  'clh1234567890abcdef',
  'React Hooks 学习笔记',
  '# React Hooks

## useState
useState 是最常用的 Hook...

## useEffect
useEffect 用于处理副作用...',
  '2025-11-04 11:00:00',
  '2025-11-04 15:30:00'
);
```

### 3.3 Account 表（NextAuth 账户表）

**表名**: `Account`

**用途**: 支持 OAuth 登录（未来扩展）

**字段定义**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (CUID) | PK | 账户唯一标识 |
| userId | String | FK, NOT NULL | 关联用户 |
| type | String | NOT NULL | 账户类型（oauth/email） |
| provider | String | NOT NULL | 提供商（google/github） |
| providerAccountId | String | NOT NULL | 提供商账户 ID |
| refresh_token | String | NULL | 刷新令牌 |
| access_token | String | NULL | 访问令牌 |
| expires_at | Int | NULL | 过期时间戳 |
| token_type | String | NULL | 令牌类型 |
| scope | String | NULL | 权限范围 |
| id_token | String | NULL | ID 令牌 |
| session_state | String | NULL | 会话状态 |

**业务规则**
- 支持多种登录方式（邮箱、OAuth）
- provider + providerAccountId 唯一
- v1.0 仅使用邮箱登录，此表暂时可选

**索引**
- `userId` - 加速用户账户查询
- `provider, providerAccountId` - 唯一索引

### 3.4 Session 表（会话表）

**表名**: `Session`

**用途**: 管理用户会话（使用 JWT 时可选）

**字段定义**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (CUID) | PK | 会话唯一标识 |
| sessionToken | String | UNIQUE, NOT NULL | 会话令牌 |
| userId | String | FK, NOT NULL | 关联用户 |
| expires | DateTime | NOT NULL | 过期时间 |

**业务规则**
- sessionToken 必须唯一
- 过期时间用于自动清理
- v1.0 使用 JWT，此表可选

**索引**
- `sessionToken` - 唯一索引
- `userId` - 加速用户会话查询

### 3.5 VerificationToken 表（验证令牌表）

**表名**: `VerificationToken`

**用途**: 存储邮箱验证、密码重置等令牌

**字段定义**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| identifier | String | NOT NULL | 标识符（邮箱） |
| token | String | UNIQUE, NOT NULL | 验证令牌 |
| expires | DateTime | NOT NULL | 过期时间 |

**业务规则**
- identifier + token 唯一
- 过期后自动失效
- v1.0 暂不使用，预留扩展

**索引**
- `identifier, token` - 唯一索引

---

## 4. 索引策略

### 4.1 索引设计原则

**创建索引的场景**
- 经常用于 WHERE 条件的字段
- 经常用于 ORDER BY 的字段
- 经常用于 JOIN 的字段
- 外键字段

**避免过度索引**
- 索引会影响写入性能
- 占用额外存储空间
- 小表不需要索引

### 4.2 索引列表

#### **User 表索引**

```sql
-- 主键索引（自动创建）
CREATE UNIQUE INDEX "User_pkey" ON "User"("id");

-- 唯一索引
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

**说明**
- `email` 用于登录查询，必须唯一且高效
- 预计 QPS: 登录时 ~10 次/秒

#### **Note 表索引**

```sql
-- 主键索引（自动创建）
CREATE UNIQUE INDEX "Note_pkey" ON "Note"("id");

-- 单列索引
CREATE INDEX "Note_userId_idx" ON "Note"("userId");

-- 复合索引（推荐）
CREATE INDEX "Note_userId_updatedAt_idx" ON "Note"("userId", "updatedAt" DESC);

-- 全文搜索索引（未来可添加）
-- CREATE INDEX "Note_search_idx" ON "Note" USING GIN(to_tsvector('english', title || ' ' || content));
```

**说明**
- `userId` 索引：查询用户的所有笔记
- `userId + updatedAt` 复合索引：查询并按更新时间排序（最常用）
- 预计 QPS: ~50 次/秒

**查询优化示例**

```sql
-- ✅ 使用复合索引（高效）
SELECT * FROM "Note"
WHERE "userId" = 'xxx'
ORDER BY "updatedAt" DESC
LIMIT 20;

-- ✅ 使用索引（高效）
SELECT * FROM "Note"
WHERE "userId" = 'xxx'
AND "id" = 'yyy';

-- ⚠️ 未使用索引（慢查询）
SELECT * FROM "Note"
WHERE "title" LIKE '%关键词%';  -- 需要全表扫描
```

#### **Account 表索引**

```sql
-- 主键索引
CREATE UNIQUE INDEX "Account_pkey" ON "Account"("id");

-- 外键索引
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- 唯一索引
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" 
ON "Account"("provider", "providerAccountId");
```

#### **Session 表索引**

```sql
-- 主键索引
CREATE UNIQUE INDEX "Session_pkey" ON "Session"("id");

-- 唯一索引
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- 外键索引
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
```

### 4.3 索引维护

**定期分析**
```sql
-- 查看表和索引大小
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看未使用的索引
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';
```

**重建索引**
```sql
-- 当索引碎片较多时
REINDEX TABLE "Note";
```

---

## 5. Prisma Schema

### 5.1 完整 Schema 定义

**文件路径**: `prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// 用户表
// ============================================
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  name          String?
  password      String
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // 关系
  notes    Note[]
  accounts Account[]
  sessions Session[]

  @@map("users")
}

// ============================================
// 笔记表
// ============================================
model Note {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  title     String   @db.VarChar(200)
  content   String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // 关系
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 索引
  @@index([userId])
  @@index([userId, updatedAt(sort: Desc)])
  @@map("notes")
}

// ============================================
// NextAuth.js 相关表
// ============================================

// 账户表（支持 OAuth）
model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("accounts")
}

// 会话表（使用 JWT 时可选）
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

// 验证令牌表（邮箱验证、密码重置等）
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

### 5.2 Schema 配置说明

**Generator 配置**
```prisma
generator client {
  provider = "prisma-client-js"
}
```
- 生成 TypeScript/JavaScript 客户端
- 提供类型安全的查询 API

**Datasource 配置**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
- 使用 PostgreSQL 数据库
- 连接字符串从环境变量读取
- 支持切换到 MySQL 或 SQLite

**字段映射**
```prisma
@map("user_id")     // 字段名映射（数据库使用下划线）
@@map("users")      // 表名映射
```

**关系定义**
```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```
- `fields`: 本表的外键字段
- `references`: 关联表的主键字段
- `onDelete: Cascade`: 级联删除

**索引定义**
```prisma
@@index([userId])                          // 单列索引
@@index([userId, updatedAt(sort: Desc)])   // 复合索引（降序）
@@unique([provider, providerAccountId])    // 唯一索引
```

### 5.3 Prisma Client 使用示例

**初始化 Client** (`src/lib/prisma.ts`)
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**CRUD 操作示例**

```typescript
// 创建用户
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    name: '张三',
  },
});

// 查询用户（包含笔记）
const userWithNotes = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { notes: true },
});

// 创建笔记
const note = await prisma.note.create({
  data: {
    title: '我的第一篇笔记',
    content: '# Hello World',
    userId: user.id,
  },
});

// 查询笔记列表（分页）
const notes = await prisma.note.findMany({
  where: { userId: user.id },
  orderBy: { updatedAt: 'desc' },
  take: 20,
  skip: 0,
  select: {
    id: true,
    title: true,
    updatedAt: true,
    // content 字段较大，列表不查询
  },
});

// 更新笔记
const updatedNote = await prisma.note.update({
  where: { id: note.id },
  data: {
    title: '更新后的标题',
    content: '更新后的内容',
  },
});

// 删除笔记
await prisma.note.delete({
  where: { id: note.id },
});

// 搜索笔记
const searchResults = await prisma.note.findMany({
  where: {
    userId: user.id,
    OR: [
      { title: { contains: '关键词', mode: 'insensitive' } },
      { content: { contains: '关键词', mode: 'insensitive' } },
    ],
  },
});

// 事务操作
await prisma.$transaction([
  prisma.user.update({ where: { id: userId }, data: { name: '新名字' } }),
  prisma.note.create({ data: { title: '新笔记', userId, content: '' } }),
]);
```

---

## 6. 数据迁移

### 6.1 迁移流程

**开发环境**

```bash
# 1. 创建迁移（自动生成 SQL）
npx prisma migrate dev --name init

# 2. 查看迁移状态
npx prisma migrate status

# 3. 重置数据库（危险！仅开发环境）
npx prisma migrate reset

# 4. 生成 Prisma Client
npx prisma generate
```

**生产环境**

```bash
# 1. 应用迁移
npx prisma migrate deploy

# 2. 生成 Client
npx prisma generate
```

### 6.2 初始迁移文件

**文件路径**: `prisma/migrations/20250104000000_init/migration.sql`

```sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "notes_user_id_idx" ON "notes"("user_id");

-- CreateIndex
CREATE INDEX "notes_user_id_updated_at_idx" ON "notes"("user_id", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 6.3 迁移最佳实践

**命名规范**
```bash
# 好的迁移名称
npx prisma migrate dev --name add_note_tags
npx prisma migrate dev --name add_user_avatar
npx prisma migrate dev --name create_notebooks_table

# 避免无意义的名称
npx prisma migrate dev --name update  ❌
npx prisma migrate dev --name fix     ❌
```

**迁移原则**
- ✅ 向后兼容（不破坏现有数据）
- ✅ 小步迭代（一次迁移做一件事）
- ✅ 可回滚（保留回滚脚本）
- ✅ 测试验证（先在开发环境测试）
- ❌ 不要修改已部署的迁移文件

---

## 7. 数据安全

### 7.1 数据加密

**传输加密**
- 使用 SSL/TLS 连接数据库
- 配置示例：
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

**存储加密**
- 密码使用 bcrypt 哈希（成本因子 10）
- 敏感字段可使用应用层加密（如需要）

### 7.2 访问控制

**数据库用户权限**
```sql
-- 创建应用专用用户（最小权限原则）
CREATE USER app_user WITH PASSWORD 'strong_password';

-- 授予必要权限
GRANT CONNECT ON DATABASE notedb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

**应用层权限控制**
- 所有查询必须带 `userId` 过滤
- API 层验证用户身份
- 防止横向越权访问

```typescript
// ✅ 正确：带用户过滤
const note = await prisma.note.findUnique({
  where: {
    id: noteId,
    userId: session.user.id,  // 必须验证所有权
  },
});

// ❌ 错误：未验证所有权
const note = await prisma.note.findUnique({
  where: { id: noteId },
});
```

### 7.3 数据备份

**自动备份策略**

```bash
# 每日备份脚本
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="notedb"

# 创建备份
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# 保留最近 30 天的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**恢复操作**

```bash
# 从备份恢复
gunzip -c backup_20250104_120000.sql.gz | psql -U postgres notedb
```

### 7.4 审计日志

**记录关键操作** (未来可添加)

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // CREATE, UPDATE, DELETE
  resource  String   // Note, User
  resourceId String?
  details   Json?
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

---

## 8. 性能优化

### 8.1 查询优化

**N+1 问题**

```typescript
// ❌ N+1 查询（性能差）
const notes = await prisma.note.findMany();
for (const note of notes) {
  const user = await prisma.user.findUnique({ where: { id: note.userId } });
}

// ✅ 使用 include（一次查询）
const notes = await prisma.note.findMany({
  include: { user: true },
});
```

**分页查询**

```typescript
// ✅ 使用 take 和 skip
const notes = await prisma.note.findMany({
  where: { userId },
  orderBy: { updatedAt: 'desc' },
  take: 20,    // 每页数量
  skip: 0,     // 偏移量
});
```

**字段选择**

```typescript
// ❌ 查询所有字段（包括大文本）
const notes = await prisma.note.findMany({
  where: { userId },
});

// ✅ 仅选择需要的字段
const notes = await prisma.note.findMany({
  where: { userId },
  select: {
    id: true,
    title: true,
    updatedAt: true,
    // 不查询 content
  },
});
```

### 8.2 连接池配置

```env
# .env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

**推荐配置**
- `connection_limit`: 10-20（根据并发量调整）
- `pool_timeout`: 20 秒

### 8.3 数据库监控

**慢查询日志**

```sql
-- 启用慢查询日志
ALTER DATABASE notedb SET log_min_duration_statement = 1000; -- 1秒

-- 查看慢查询
SELECT
  query,
  calls,
  total_time / calls AS avg_time,
  min_time,
  max_time
FROM pg_stat_statements
WHERE total_time / calls > 1000
ORDER BY total_time DESC
LIMIT 10;
```

**连接监控**

```sql
-- 查看当前连接数
SELECT count(*) FROM pg_stat_activity;

-- 查看活跃查询
SELECT pid, usename, query, state
FROM pg_stat_activity
WHERE state != 'idle';
```

### 8.4 缓存策略（未来优化）

**Redis 缓存**
- 缓存热点笔记
- 缓存用户信息
- 缓存搜索结果

```typescript
// 示例：使用 Redis 缓存
import { redis } from '@/lib/redis';

async function getNote(id: string) {
  // 先查缓存
  const cached = await redis.get(`note:${id}`);
  if (cached) return JSON.parse(cached);

  // 缓存未命中，查数据库
  const note = await prisma.note.findUnique({ where: { id } });
  
  // 写入缓存（5 分钟过期）
  await redis.setex(`note:${id}`, 300, JSON.stringify(note));
  
  return note;
}
```

---

## 9. 数据迁移方案

### 9.1 从其他数据库迁移

**从 MySQL 迁移**

1. 导出 MySQL 数据
```bash
mysqldump -u root -p notedb > mysql_backup.sql
```

2. 转换为 PostgreSQL 格式（使用工具）
```bash
# 使用 pgloader
pgloader mysql://user:pass@localhost/notedb postgresql://user:pass@localhost/notedb
```

3. 验证数据完整性

**从 SQLite 迁移**

```bash
# 使用 Prisma 迁移
# 1. 修改 schema.prisma
datasource db {
  provider = "sqlite"  // 改为 "postgresql"
  url      = env("DATABASE_URL")
}

# 2. 生成新迁移
npx prisma migrate dev

# 3. 数据导出导入
# 需要编写脚本逐表迁移
```

### 9.2 数据导入导出

**导出数据**

```bash
# 导出整个数据库
pg_dump -U postgres notedb > backup.sql

# 仅导出数据（不含结构）
pg_dump -U postgres -a notedb > data.sql

# 导出特定表
pg_dump -U postgres -t notes notedb > notes.sql
```

**导入数据**

```bash
# 导入 SQL 文件
psql -U postgres notedb < backup.sql

# 导入 CSV 数据
COPY notes(id, user_id, title, content, created_at, updated_at)
FROM '/path/to/notes.csv'
DELIMITER ','
CSV HEADER;
```

---

## 10. 常见问题

### Q1: 如何重置数据库？

```bash
# 开发环境（危险！会删除所有数据）
npx prisma migrate reset

# 或手动删除并重建
DROP DATABASE notedb;
CREATE DATABASE notedb;
npx prisma migrate deploy
```

### Q2: 如何修改已有字段？

```prisma
// 1. 修改 schema.prisma
model Note {
  title String @db.VarChar(300)  // 从 200 改为 300
}

// 2. 生成迁移
npx prisma migrate dev --name extend_title_length
```

### Q3: 如何添加新字段？

```prisma
// 1. 添加可选字段（不影响现有数据）
model Note {
  tags String?  // 新增字段

// 2. 或添加带默认值的字段
model Note {
  views Int @default(0)  // 新增字段
}

// 3. 生成迁移
npx prisma migrate dev --name add_note_tags
```

### Q4: 生产环境如何执行迁移？

```bash
# 1. 备份数据库
pg_dump -U postgres notedb > backup_before_migration.sql

# 2. 测试迁移（在测试环境）
npx prisma migrate deploy

# 3. 验证无误后，生产环境执行
npx prisma migrate deploy

# 4. 如有问题，回滚
psql -U postgres notedb < backup_before_migration.sql
```

---

## 11. 总结

本文档详细描述了 Mars-Notes 系统的数据库设计，包括：

✅ **完整的 ER 模型**：清晰的实体关系设计  
✅ **规范的表结构**：符合范式，便于扩展  
✅ **高效的索引策略**：优化查询性能  
✅ **类型安全的 ORM**：Prisma 提供优秀开发体验  
✅ **完善的迁移方案**：支持平滑升级  
✅ **数据安全保障**：多层次安全防护  
✅ **性能优化建议**：查询优化和缓存策略  

**下一步**
- 参考 [API 设计文档](./API.md) 了解接口实现
- 参考 [部署指南](./DEPLOYMENT.md) 了解数据库部署

---

**文档维护**
- 数据库 Schema 变更必须同步更新本文档
- 新增表或字段需补充说明
- 性能问题及时记录和优化

