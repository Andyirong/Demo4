---
description: 归档当前分支并创建新的开发分支
argument-hint: [--push=<boolean>] [--new-branch=<boolean>] [--description=<string>]
---

# 归档当前分支

归档当前分支，可选择是否提交推送以及是否创建新的开发分支。

该命令会执行 **branch-archive skill** 来完成归档操作。

## 参数说明
- `--push`: 是否提交并推送当前分支（默认：true）
- `--new-branch`: 是否创建新的开发分支（默认：true）
- `--description`: 新分支的描述信息

## 使用示例
- `/archive` - 归档当前分支，推送到远程，并创建新的开发分支
- `/archive --push=false` - 归档当前分支，不推送，但创建新的开发分支
- `/archive --description='新功能开发'` - 归档并创建带有描述的新分支
- `/archive --push=false --new-branch=false` - 仅归档当前分支，不推送也不创建新分支

## 功能说明

branch-archive skill 会自动：

1. 检查当前分支状态和未提交的更改
2. 创建归档文档记录所有变更（保存到 archives/ 分支名/ 目录）
3. 根据参数决定是否提交并推送当前分支
4. 根据参数决定是否创建新的开发分支
5. 新分支会保留所有文件和配置