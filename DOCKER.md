# Docker 部署指南

本文档说明如何使用 Docker 和 Docker Compose 部署和运行 Note Book 应用。

## 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [开发环境](#开发环境)
- [生产环境](#生产环境)
- [常用命令](#常用命令)
- [环境变量](#环境变量)
- [故障排查](#故障排查)

## 前置要求

- Docker 20.10 或更高版本
- Docker Compose 2.0 或更高版本

## 快速开始

### 1. 配置环境变量

复制环境变量示例文件并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，至少需要修改以下配置：

```env
# 生产环境必须修改！
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
POSTGRES_PASSWORD=your-secure-password

# 如果部署到服务器，修改为实际域名
NEXTAUTH_URL=https://yourdomain.com
```

### 2. 生成 NextAuth 密钥

```bash
openssl rand -base64 32
```

将生成的密钥填入 `.env` 文件的 `NEXTAUTH_SECRET`。

## 开发环境

开发环境支持热重载，修改代码后会自动重新加载。

### 启动开发环境

```bash
# 构建并启动
docker-compose -f docker-compose.dev.yml up -d

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f
```

### 停止开发环境

```bash
docker-compose -f docker-compose.dev.yml down
```

### 重新构建

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

### 访问应用

- 应用地址: http://localhost:3000
- 数据库端口: 5432

## 生产环境

生产环境使用优化的多阶段构建，镜像体积更小，性能更好。

### 启动生产环境

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 停止生产环境

```bash
docker-compose down
```

### 停止并删除数据卷（⚠️ 会删除数据库数据）

```bash
docker-compose down -v
```

### 访问应用

- 应用地址: http://localhost:3000（或配置的域名）
- 数据库端口: 5432

## 常用命令

### 查看运行状态

```bash
docker-compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看应用日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f postgres
```

### 进入容器

```bash
# 进入应用容器
docker-compose exec app sh

# 进入数据库容器
docker-compose exec postgres sh
```

### 数据库操作

```bash
# 执行数据库迁移
docker-compose exec app npx prisma migrate deploy

# 查看数据库状态
docker-compose exec app npx prisma migrate status

# 连接到 PostgreSQL
docker-compose exec postgres psql -U notebook -d notebook
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启应用
docker-compose restart app

# 重启数据库
docker-compose restart postgres
```

### 清理

```bash
# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、数据卷
docker-compose down -v

# 删除所有相关镜像
docker-compose down --rmi all

# 清理未使用的 Docker 资源
docker system prune -a
```

## 环境变量

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | 应用完整 URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth 密钥（必须修改） | 使用 `openssl rand -base64 32` 生成 |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `POSTGRES_USER` | 数据库用户名 | `notebook` |
| `POSTGRES_PASSWORD` | 数据库密码 | `notebook_password` |
| `POSTGRES_DB` | 数据库名称 | `notebook` |
| `POSTGRES_PORT` | 数据库端口 | `5432` |
| `APP_PORT` | 应用端口 | `3000` |
| `NODE_ENV` | Node 环境 | `production` |

## 生产环境部署建议

### 1. 使用 HTTPS

建议使用 Nginx 或 Traefik 作为反向代理，配置 SSL 证书。

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

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

### 2. 数据库备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U notebook notebook > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U notebook notebook < backup.sql
```

### 3. 日志管理

建议使用 Docker 日志驱动或外部日志收集系统（如 ELK Stack）。

### 4. 监控和健康检查

Docker Compose 配置已包含健康检查，可以集成监控工具如 Prometheus、Grafana。

### 5. 资源限制

生产环境建议在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## 故障排查

### 应用无法连接数据库

1. 检查数据库是否正常运行：
```bash
docker-compose ps postgres
docker-compose logs postgres
```

2. 检查 `DATABASE_URL` 配置是否正确

3. 确保应用等待数据库启动（已在 compose 中配置健康检查）

### 数据库迁移失败

```bash
# 查看迁移状态
docker-compose exec app npx prisma migrate status

# 手动执行迁移
docker-compose exec app npx prisma migrate deploy

# 重置数据库（⚠️ 会删除所有数据）
docker-compose exec app npx prisma migrate reset
```

### 端口冲突

如果端口被占用，修改 `.env` 文件中的端口配置：

```env
APP_PORT=3001
POSTGRES_PORT=5433
```

### 查看详细日志

```bash
# 查看应用详细日志
docker-compose logs -f --tail=100 app

# 查看数据库详细日志
docker-compose logs -f --tail=100 postgres
```

### 重新构建镜像

如果修改了 Dockerfile 或依赖，需要重新构建：

```bash
docker-compose build --no-cache
docker-compose up -d
```

## 性能优化

### 使用构建缓存

```bash
# 使用 BuildKit 加速构建
DOCKER_BUILDKIT=1 docker-compose build
```

### 数据卷备份

```bash
# 备份数据卷
docker run --rm -v notebook_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-data.tar.gz -C /data .

# 恢复数据卷
docker run --rm -v notebook_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-data.tar.gz -C /data
```

## 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Docker 文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)

