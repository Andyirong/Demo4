# 需求文档生成命令 (requirements)

从 Git 提交历史和当前会话上下文自动生成需求文档，帮助整理和归档项目开发过程中的需求信息。

## 功能说明

执行该命令后，会自动按以下流程执行：

1. **整理当前聊天记录**
   - 分析当前会话的上下文
   - 提取关键信息、任务和需求
   - 生成上下文摘要文档

2. **分析 Git 提交历史**
   - 获取当前分支的提交信息
   - 根据提交信息识别需求类型

3. **生成智能需求文档**
   - 结合上下文摘要和提交分析
   - 自动分类生成需求文档
   - 创建需求文档索引

## 使用方法

```bash
/requirements [选项]
```

## 参数

- `--output`: 指定输出目录（默认：archives/{当前分支}/requirements）
- `--branch`: 指定要分析的分支（默认：当前分支）
- `--limit`: 限制分析的提交数量
- `--types`: 指定生成哪些类型的需求文档，用逗号分隔

## 需求类型

- **PD**: 产品需求 (Product Requirement)
  - 关键词：feat, 新增, 添加
- **TD**: 技术需求 (Technical Requirement)
  - 关键词：refactor, 优化, 重构
- **QA**: 质量需求 (Quality Requirement)
  - 关键词：fix, 修复, bug
- **UI**: 界面需求 (UI Requirement)
  - 关键词：ui, 界面, 样式
- **OTHER**: 其他需求

## 示例

```bash
# 基本用法 - 分析当前分支的所有提交
/requirements

# 指定输出目录
/requirements --output=./docs/requirements

# 只分析特定分支
/requirements --branch=feature/user-login

# 只生成特定类型的需求文档
/requirements --types=PD,QA

# 限制分析的提交数量
/requirements --limit=20

# 组合使用
/requirements --branch=develop --output=./project-docs --types=PD,TD,QA --limit=50
```

## 输出文件

执行后会在 `archives/{分支名称}/requirements` 目录下生成：

1. **需求文档**
   - 格式：`{类型}-{编号}-{标题}.md`
   - 示例：`PD-001-用户登录功能.md`

2. **索引文件**
   - 文件名：`index.md`
   - 包含所有生成文档的链接和统计信息

## 文档内容

每个需求文档包含：
- 基本信息（类型、时间、分支）
- 会话上下文摘要
- 相关提交列表
- 功能概述

## 注意事项

- 需要在 Git 仓库中执行
- 提交信息应遵循 Conventional Commits 规范
- 生成的文档会自动编号，避免覆盖
- 默认输出到 `archives/{分支名称}/requirements` 目录
- 如果目录已存在，新文档会覆盖旧文档

## 相关命令

- `/archive` - 归档当前分支（包含需求文档生成）
- `/git` - Git 相关操作
- `/docs` - 文档相关命令

## 技术细节

- 提交识别规则基于正则表达式匹配
- 文档编号从 001 开始自动递增
- 支持中文和英文关键词识别
- 输出路径自动包含分支名称，便于管理