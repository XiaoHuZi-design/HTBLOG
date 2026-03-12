#!/bin/bash
# 自动部署脚本 - 小诺的网站自动化

echo "🦞 开始自动部署流程..."

# 进入项目目录
cd ~/projects/机械仔的小站

# 检查是否有更改
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 没有需要推送的更改"
    exit 0
fi

# 添加所有更改
echo "📝 添加所有更改..."
git add .

# 生成提交信息（基于时间和更改）
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
COMMIT_MSG="🚀 自动部署 · ${TIMESTAMP}"

# 提交更改
echo "💾 提交更改..."
git commit -m "${COMMIT_MSG}"

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🌐 访问 https://ht-libra.top"
