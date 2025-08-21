# 腾讯云服务器部署指南

本文档详细说明如何将像素电子宠物应用部署到腾讯云服务器。

## 前置要求

### 服务器环境
- Ubuntu 20.04+ 或 CentOS 7+
- 至少 1GB RAM
- 至少 10GB 存储空间
- 已开放 80 端口（HTTP）和 443 端口（HTTPS，可选）

### 软件依赖
- Node.js 18+
- npm 或 yarn
- nginx
- git（可选）

## 部署步骤

### 1. 服务器环境准备

#### 安装 Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

#### 安装 nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 启动 nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. 上传项目文件

#### 方法一：使用 git（推荐）
```bash
cd /var/www
sudo git clone <your-repository-url> html
sudo chown -R $USER:$USER /var/www/html
```

#### 方法二：手动上传
1. 将项目文件压缩为 zip 文件
2. 使用 scp 或 FTP 上传到服务器
3. 解压到 `/var/www/html` 目录

### 3. 自动部署

使用提供的部署脚本：
```bash
cd /var/www/html
chmod +x deploy.sh
./deploy.sh
```

### 4. 手动部署（如果自动部署失败）

#### 安装依赖
```bash
cd /var/www/html
npm install
```

#### 构建项目
```bash
npm run build
```

#### 配置 nginx
```bash
# 复制 nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/default

# 测试配置
sudo nginx -t

# 重载 nginx
sudo systemctl reload nginx
```

#### 设置文件权限
```bash
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

## 环境变量配置

### 创建生产环境配置
```bash
cp .env.example .env.production
```

### 编辑环境变量
```bash
nano .env.production
```

确保以下变量正确配置：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_TITLE=像素电子宠物
VITE_APP_VERSION=1.0.0
```

## 域名配置

### 1. DNS 解析
在域名管理控制台添加 A 记录：
- 主机记录：@ 或 www
- 记录值：服务器公网 IP
- TTL：600

### 2. nginx 虚拟主机配置
编辑 `/etc/nginx/sites-available/default`：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/html;
    index index.html;
    
    # 其他配置...
}
```

## SSL 证书配置（可选）

### 使用 Let's Encrypt 免费证书
```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行：
0 12 * * * /usr/bin/certbot renew --quiet
```

## 防火墙配置

```bash
# Ubuntu (ufw)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本是否 >= 18
   - 确保有足够的内存和存储空间
   - 检查网络连接

2. **nginx 404 错误**
   - 检查文件路径是否正确
   - 确认文件权限设置
   - 查看 nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`

3. **API 请求失败**
   - 检查环境变量配置
   - 确认 Supabase 配置正确
   - 检查网络连接

### 日志查看

```bash
# nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u nginx -f
```

## 性能优化

### nginx 优化
编辑 `/etc/nginx/nginx.conf`：
```nginx
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 缓存配置
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 监控和维护

### 设置监控
```bash
# 安装 htop
sudo apt install htop

# 监控系统资源
htop

# 监控磁盘使用
df -h

# 监控内存使用
free -h
```

### 定期维护
```bash
# 更新系统
sudo apt update && sudo apt upgrade

# 清理日志
sudo journalctl --vacuum-time=30d

# 重启服务（如需要）
sudo systemctl restart nginx
```

## 联系支持

如果在部署过程中遇到问题，请检查：
1. 服务器系统日志
2. nginx 配置和日志
3. 应用构建输出
4. 网络连接状态

部署成功后，您的像素电子宠物应用将在 `http://your-domain.com` 或服务器 IP 地址上运行。