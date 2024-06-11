#!/bin/bash

# 抓取 Node 進程的 PID
PID=$(pgrep -f "node")

# 檢查是否成功抓取到 PID
if [ -z "$PID" ]; then
  echo "No node process found."
  exit 1
fi

# 使用 reptyr 和 script 捕捉輸出
script -f /path/to/logfile.log -c "reptyr $PID"
