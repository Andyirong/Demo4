---
name: branch-archive
description: 自动化归档已完成的功能分支，创建标准化的归档文档并生成新的开发分支。使用时请调用相关的斜杠命令如 /archive。
allowed-tools: Bash, Read, Write, Glob, Grep
---

# Branch Archive Skill

## 功能
自动归档当前分支，创建归档文档，并生成新的开发分支。

## 使用场景
- 完成一个功能开发需要归档当前分支
- 创建标准化的分支归档文档
- 自动生成下一个开发分支
- 保存分支变更历史和元信息

## 调用方式
### 方式1：斜杠命令（推荐）
- `/archive` - 归档当前分支
- `/archive --push=false` - 只归档不推送
- `/archive --new-branch=false` - 归档但不创建新分支
- `/archive --description="描述"` - 为新分支添加描述

### 方式2：自然语言
- "请帮我归档当前分支"
- "创建分支归档"
- "归档 feature 分支"

## 实现细节
本 skill 通过执行 TypeScript 文件来实现功能：
1. 调用 `node .claude/skills/branch-archive/scripts/skill.ts` 执行归档脚本
2. 分析当前分支的 Git 变更
3. 生成归档文档和元信息
4. 创建新的开发分支
5. 可选推送到远程仓库

## 执行要求
- 需要 Node.js 环境
- 建议使用 `tsx` 运行 TypeScript 文件（如果没有安装 tsx，可以先用 `npx tsx`）

## 注意事项
- 确保在 Git 仓库中执行
- 需要有提交的变更才能归档
- 新分支名格式为 {项目名}-XXX
- 执行前请确保已提交所有更改