# Docker 快速参考

## 🚀 快速开始（3 步）

### 1. 配置环境变量
```bash
cp .env.example .env
# 生成密钥并填入 .env
openssl rand -base64 32
```

### 2. 启动
```bash
# 开发环境（支持热重载）
./docker.sh dev:up

# 生产环境
./docker.sh prod:up
```

### 3. 访问
- 应用：http://localhost:3000
- 数据库：localhost:5432

---

## 📋 常用命令

### 开发环境
```bash
./docker.sh dev:up       # 启动
./docker.sh dev:down     # 停止
./docker.sh dev:restart  # 重启
./docker.sh dev:logs     # 查看日志
```

### 生产环境
```bash
./docker.sh prod:up      # 启动
./docker.sh prod:down    # 停止
./docker.sh prod:logs    # 查看日志
```

### 数据库
```bash
./docker.sh db:migrate   # 执行迁移
./docker.sh db:backup    # 备份数据库
./docker.sh db:studio    # Prisma Studio
```

### 工具
```bash
./docker.sh ps           # 查看状态
./docker.sh clean        # 清理容器
./docker.sh help         # 所有命令
```

---

## 🔧 使用 pnpm 脚本

```bash
# 开发环境
pnpm docker:dev          # 启动
pnpm docker:dev:down     # 停止
pnpm docker:dev:logs     # 日志

# 生产环境
pnpm docker:prod         # 启动
pnpm docker:prod:down    # 停止
pnpm docker:prod:logs    # 日志
```

---

## 📦 包含的文件

| 文件 | 说明 |
|------|------|
| `Dockerfile` | 生产环境镜像（多阶段构建）|
| `Dockerfile.dev` | 开发环境镜像（支持热重载）|
| `docker-compose.yml` | 生产环境编排 |
| `docker-compose.dev.yml` | 开发环境编排 |
| `.dockerignore` | Docker 构建排除文件 |
| `docker.sh` | 管理脚本（推荐使用）|
| `.env.example` | 环境变量示例 |
| `DOCKER.md` | 完整部署指南 |

---

## ⚡ 特性

✅ **生产环境**
- 多阶段构建，镜像体积小
- 非 root 用户运行
- 自动执行数据库迁移
- 健康检查

✅ **开发环境**
- 代码热重载
- 源码挂载
- 实时调试
- 数据持久化

✅ **数据库**
- PostgreSQL 15
- 自动健康检查
- 数据卷持久化
- 备份恢复支持

---

## 🔐 环境变量（必须修改）

```env
# 生产环境必须修改这些！
POSTGRES_PASSWORD=your-secure-password
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=https://yourdomain.com
```

---

## 📚 详细文档

- 完整指南：[DOCKER.md](./DOCKER.md)
- 快速开始：[QUICK_START.md](./QUICK_START.md)
- 项目文档：[README.md](./README.md)

---

## 🆘 故障排查

### 端口被占用
```bash
# 修改 .env 文件
APP_PORT=3001
POSTGRES_PORT=5433
```

### 重新构建
```bash
./docker.sh dev:down
docker-compose -f docker-compose.dev.yml build --no-cache
./docker.sh dev:up
```

### 查看详细日志
```bash
docker-compose -f docker-compose.dev.yml logs -f --tail=100
```

### 进入容器调试
```bash
docker-compose exec app sh
```

---

**提示**：第一次启动可能需要几分钟来下载镜像和构建。

