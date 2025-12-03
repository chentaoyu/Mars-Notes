# SSL 证书配置指南

## 概述

本文档介绍如何为 Mars-Notes 应用配置免费的 SSL 证书（使用 Let's Encrypt）。

## 前置要求

1. ✅ 服务器已安装 Nginx
2. ✅ 域名已正确解析到服务器 IP
3. ✅ 80 端口已开放（用于证书验证）
4. ✅ 443 端口已开放（用于 HTTPS）
5. ✅ 应用已正常运行在 3000 端口

## 快速开始

### 方法一：使用自动化脚本（推荐）

```bash
# 1. 进入项目目录
cd /var/www/note-book

# 2. 编辑脚本，修改邮箱地址
nano scripts/setup-ssl.sh
# 修改 EMAIL="your-email@example.com" 为你的邮箱

# 3. 给脚本添加执行权限
chmod +x scripts/setup-ssl.sh

# 4. 运行脚本（需要 root 权限）
sudo ./scripts/setup-ssl.sh
```

脚本会自动：
- ✅ 检查域名解析
- ✅ 安装 Certbot
- ✅ 获取 SSL 证书
- ✅ 配置 Nginx
- ✅ 设置自动续期

### 方法二：手动配置

#### 步骤 1: 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

#### 步骤 2: 确保 Nginx 配置正确

```bash
# 确保 Nginx 配置已存在
sudo ls -la /etc/nginx/sites-available/note-book

# 如果不存在，先运行
cd /var/www/note-book
sudo ./scripts/start-nginx.sh
```

#### 步骤 3: 获取 SSL 证书

```bash
# 获取证书（Certbot 会自动配置 Nginx）
sudo certbot --nginx -d taomat.cc -d www.taomat.cc

# 或者不提供邮箱（不推荐）
sudo certbot --nginx -d taomat.cc -d www.taomat.cc --register-unsafely-without-email --agree-tos
```

#### 步骤 4: 测试自动续期

```bash
# 测试自动续期是否正常工作
sudo certbot renew --dry-run
```

## 验证配置

### 1. 检查证书状态

```bash
# 查看所有证书
sudo certbot certificates

# 查看证书详情
sudo certbot show
```

### 2. 测试 HTTPS 访问

```bash
# 使用 curl 测试
curl -I https://taomat.cc

# 应该看到 HTTP/2 200 响应
```

### 3. 检查 Nginx 配置

```bash
# 测试配置语法
sudo nginx -t

# 查看配置内容
sudo cat /etc/nginx/sites-available/note-book
```

## 自动续期

Let's Encrypt 证书有效期为 90 天，Certbot 会自动续期。

### 检查自动续期状态

```bash
# 查看 Certbot 定时任务
sudo systemctl status certbot.timer

# 查看续期日志
sudo journalctl -u certbot.timer
```

### 手动续期

```bash
# 手动续期所有证书
sudo certbot renew

# 续期后重新加载 Nginx
sudo systemctl reload nginx
```

## 常见问题

### Q1: 证书获取失败 - "Timeout during connect (likely firewall problem)"

**原因**：
- 防火墙或安全组阻止了 80 端口访问
- 域名未正确解析到服务器
- Nginx 未正常运行

**解决方案**：

**步骤 1: 检查防火墙**

```bash
# 运行防火墙检查脚本
sudo ./scripts/check-firewall.sh

# 或手动检查 UFW
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

**步骤 2: 检查云服务器安全组（重要！）**

如果使用阿里云/腾讯云等云服务器，必须在安全组中开放端口：

**阿里云安全组配置**：
1. 登录阿里云控制台
2. 进入 **ECS -> 网络与安全 -> 安全组**
3. 选择对应的安全组 -> **配置规则 -> 添加安全组规则**
4. 添加以下规则：
   - **规则 1（HTTP）**：
     - 端口范围: `80/80`
     - 授权对象: `0.0.0.0/0`
     - 描述: `HTTP`
   - **规则 2（HTTPS）**：
     - 端口范围: `443/443`
     - 授权对象: `0.0.0.0/0`
     - 描述: `HTTPS`

**步骤 3: 验证端口访问**

```bash
# 检查域名解析
dig taomat.cc
nslookup taomat.cc

# 检查端口监听
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 检查 Nginx 状态
sudo systemctl status nginx

# 从外部测试（在其他机器上运行）
curl -I http://你的服务器IP
```

### Q2: 证书续期失败

**解决方案**：
```bash
# 1. 检查 Certbot 日志
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# 2. 手动测试续期
sudo certbot renew --dry-run

# 3. 如果失败，检查 Nginx 配置
sudo nginx -t
```

### Q3: 访问 HTTPS 显示不安全

**检查清单**：
- ✅ 证书是否已正确安装
- ✅ Nginx 配置是否包含 SSL 证书路径
- ✅ 443 端口是否开放
- ✅ 防火墙是否允许 HTTPS 流量

```bash
# 检查证书文件
sudo ls -la /etc/letsencrypt/live/taomat.cc/

# 检查 Nginx 配置中的证书路径
sudo grep -r "ssl_certificate" /etc/nginx/sites-available/note-book

# 检查防火墙
sudo ufw status
sudo ufw allow 443/tcp
```

### Q4: 如何更新证书域名

```bash
# 1. 删除旧证书
sudo certbot delete --cert-name taomat.cc

# 2. 获取新证书
sudo certbot --nginx -d new-domain.com -d www.new-domain.com
```

### Q5: 如何强制使用 HTTPS

Nginx 配置中应包含 HTTP 到 HTTPS 的重定向：

```nginx
server {
    listen 80;
    server_name taomat.cc www.taomat.cc;
    return 301 https://$host$request_uri;
}
```

Certbot 会自动添加此配置。

## 安全建议

### 1. 使用强 SSL 配置

Certbot 会自动配置安全的 SSL 设置，包括：
- TLS 1.2+
- 强加密套件
- HSTS 头（可选）

### 2. 定期检查证书

```bash
# 添加到 crontab，每月检查一次
0 0 1 * * certbot renew --quiet && systemctl reload nginx
```

### 3. 监控证书到期

```bash
# 查看证书到期时间
sudo certbot certificates | grep "Expiry Date"
```

### 4. 备份证书

```bash
# 备份证书目录
sudo tar -czf /backup/letsencrypt-$(date +%Y%m%d).tar.gz /etc/letsencrypt/
```

## 相关文件

- 证书目录: `/etc/letsencrypt/live/taomat.cc/`
- 证书文件: 
  - `fullchain.pem` - 完整证书链
  - `privkey.pem` - 私钥
- Nginx 配置: `/etc/nginx/sites-available/note-book`
- Certbot 日志: `/var/log/letsencrypt/`

## 参考资源

- [Let's Encrypt 官网](https://letsencrypt.org/)
- [Certbot 文档](https://certbot.eff.org/)
- [Nginx SSL 配置](https://nginx.org/en/docs/http/configuring_https_servers.html)

