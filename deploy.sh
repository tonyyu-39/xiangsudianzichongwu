#!/bin/bash

# 腾讯云服务器部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

echo "开始部署像素电子宠物应用到腾讯云服务器..."

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到npm，请先安装npm"
    exit 1
fi

# 安装依赖
echo "安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

# 构建项目
echo "构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "错误: 项目构建失败"
    exit 1
fi

# 检查构建输出
if [ ! -d "dist" ]; then
    echo "错误: 构建输出目录不存在"
    exit 1
fi

# 复制文件到web目录
echo "部署文件到web目录..."
sudo cp -r dist/* /var/www/html/

# 设置文件权限
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# 复制nginx配置
if [ -f "nginx.conf" ]; then
    echo "更新nginx配置..."
    sudo cp nginx.conf /etc/nginx/sites-available/default
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        echo "nginx配置已更新并重载"
    else
        echo "警告: nginx配置测试失败，请手动检查"
    fi
fi

echo "部署完成！"
echo "请确保:"
echo "1. nginx服务正在运行: sudo systemctl status nginx"
echo "2. 防火墙已开放80端口: sudo ufw allow 80"
echo "3. 域名已正确解析到服务器IP"
echo "4. SSL证书已配置（如需要）"