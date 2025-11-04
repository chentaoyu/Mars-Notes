# Mars-Notes v1.1 升级指南

本指南将帮助你从 v1.0 升级到 v1.1 版本。

## 📋 新功能概览

v1.1 版本新增以下主要功能：
- 📚 笔记本分类管理
- 🏷️ 标签系统
- 🔍 高级搜索和筛选
- 📊 多种排序方式

## 🚀 升级步骤

### 1. 备份数据库（重要！）

在升级前，请务必备份你的数据库：

```bash
# PostgreSQL 备份命令
pg_dump -U your_username -d notedb > backup_v1.0_$(date +%Y%m%d).sql

# 或使用 Docker
docker exec postgres_container pg_dump -U your_username notedb > backup_v1.0_$(date +%Y%m%d).sql
```

### 2. 拉取最新代码

```bash
git pull origin main
# 或者
git fetch origin
git checkout v1.1.0
```

### 3. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 4. 运行数据库迁移

v1.1 版本新增了三个数据库表（notebooks, tags, note_tags），并修改了 notes 表结构。

#### 方式 1：使用 Prisma Migrate（推荐）

```bash
# 生成 Prisma Client
npx prisma generate

# 运行迁移
npx prisma migrate deploy
```

#### 方式 2：手动运行迁移 SQL

如果你使用 Docker 或远程数据库，可以手动执行迁移 SQL：

```bash
# 找到迁移文件
cat prisma/migrations/20251104152414_add_notebooks_and_tags/migration.sql

# 手动执行 SQL（根据你的环境调整命令）
psql -U your_username -d notedb -f prisma/migrations/20251104152414_add_notebooks_and_tags/migration.sql
```

### 5. 验证迁移

连接到数据库检查新表是否创建成功：

```bash
# 使用 Prisma Studio
npx prisma studio

# 或直接连接数据库
psql -U your_username -d notedb
\dt  # 列出所有表
```

你应该能看到以下表：
- `notebooks`
- `tags`
- `note_tags`
- `notes`（已更新，新增 `notebook_id` 字段）

### 6. 启动应用

```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

### 7. 测试新功能

访问应用并测试以下功能：
- ✅ 创建笔记本
- ✅ 创建标签
- ✅ 为笔记分配笔记本
- ✅ 为笔记添加标签
- ✅ 使用筛选和排序功能

## 🐳 Docker 升级

如果你使用 Docker 部署，请按照以下步骤升级：

### 1. 停止当前容器

```bash
docker-compose down
```

### 2. 拉取最新代码

```bash
git pull origin main
```

### 3. 重新构建镜像

```bash
docker-compose build --no-cache
```

### 4. 启动服务

```bash
docker-compose up -d
```

### 5. 运行迁移

```bash
docker-compose exec app npx prisma migrate deploy
```

### 6. 查看日志

```bash
docker-compose logs -f app
```

## 📊 数据迁移

### 现有数据兼容性

v1.1 版本与 v1.0 的数据完全兼容：
- ✅ 所有现有笔记将继续正常工作
- ✅ `notebook_id` 字段默认为 NULL（笔记不属于任何笔记本）
- ✅ 现有笔记默认没有标签

### 批量分配笔记本（可选）

如果你想将现有笔记批量分配到笔记本，可以使用以下 SQL：

```sql
-- 1. 创建一个默认笔记本
INSERT INTO notebooks (id, user_id, name, description, sort_order, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  '默认笔记本',
  '从 v1.0 迁移的笔记',
  0,
  NOW(),
  NOW()
FROM users;

-- 2. 将所有现有笔记分配到默认笔记本
UPDATE notes
SET notebook_id = (
  SELECT nb.id 
  FROM notebooks nb 
  WHERE nb.user_id = notes.user_id 
    AND nb.name = '默认笔记本'
  LIMIT 1
)
WHERE notebook_id IS NULL;
```

## 🔧 配置更新

### 环境变量

v1.1 版本不需要新的环境变量，但请确保以下变量已正确配置：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/notedb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## ⚠️ 注意事项

### 1. 数据库索引

新版本添加了多个索引以提升查询性能：
- `notebooks_user_id_idx`
- `notebooks_user_id_sort_order_idx`
- `tags_user_id_idx`
- `note_tags_note_id_idx`
- `note_tags_tag_id_idx`
- `notes_notebook_id_idx`

这些索引会在迁移时自动创建。

### 2. API 变更

v1.1 版本的 API 是向后兼容的，但增加了新的字段和端点：

#### 笔记 API 新增字段
```typescript
// GET /api/notes 响应新增
{
  data: [
    {
      id: string,
      title: string,
      content: string,
      notebookId: string | null,  // 新增
      notebook: { ... } | null,   // 新增
      tags: [ ... ],              // 新增
      createdAt: Date,
      updatedAt: Date
    }
  ]
}

// POST/PUT /api/notes 请求新增可选字段
{
  title: string,
  content: string,
  notebookId?: string,  // 新增
  tagIds?: string[]     // 新增
}
```

#### 新增 API 端点
- `GET/POST /api/notebooks`
- `GET/PUT/DELETE /api/notebooks/[id]`
- `GET/POST /api/tags`
- `GET/PUT/DELETE /api/tags/[id]`

### 3. 前端组件

如果你修改过前端组件，请注意以下组件已更新：
- `NoteCard` - 现在显示笔记本和标签
- `NoteList` - 新增 `onDelete` 属性
- `MarkdownEditor` - 新增笔记本和标签选择器

## 🆘 故障排除

### 问题 1：迁移失败

```bash
Error: P1001: Can't reach database server
```

**解决方案**：
1. 确保数据库正在运行
2. 检查 DATABASE_URL 环境变量
3. 如果使用 Docker，确保数据库容器已启动

### 问题 2：Prisma Client 版本不匹配

```bash
Error: Prisma Client version mismatch
```

**解决方案**：
```bash
npx prisma generate
```

### 问题 3：表已存在错误

```bash
Error: relation "notebooks" already exists
```

**解决方案**：
迁移可能已部分运行，请检查数据库状态：
```bash
npx prisma db pull
npx prisma generate
```

### 问题 4：外键约束错误

```bash
Error: foreign key constraint failed
```

**解决方案**：
确保用户表中有数据，并且所有引用的 ID 都存在。

## 📞 获取帮助

如果遇到问题：
1. 查看日志：`docker-compose logs -f` 或 `npm run dev`
2. 检查数据库连接
3. 确认所有迁移都已成功执行
4. 提交 Issue：https://github.com/chentaoyu/mars-notes/issues

## 🎉 升级完成

恭喜！你已成功升级到 Mars-Notes v1.1。

现在你可以：
- 📚 创建笔记本组织你的笔记
- 🏷️ 使用标签对笔记进行分类
- 🔍 使用高级搜索快速找到笔记
- 📊 使用多种方式排序笔记

享受新功能带来的便利！

