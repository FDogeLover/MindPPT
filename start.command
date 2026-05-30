#!/bin/bash
cd "$(dirname "$0")"
echo "正在启动思维导图PPT编辑器..."
node scripts/dev-server.js &
sleep 1
open http://127.0.0.1:5173/
echo "服务器已启动，按 Ctrl+C 停止"
wait
