# 实时输出解决方案

## 问题描述
`/archive` 命令执行时界面卡住，无法实时看到执行进度。

## 解决方案

### 方案 1：使用改进的 Runner 脚本（推荐）

创建了 `archive-runner.js`，提供实时输出和更好的用户体验：

```bash
# 直接使用 runner
node .claude/skills/branch-archive/scripts/archive-runner.js --push=false --new-branch=false
```

特性：
- ✅ 实时彩色输出
- ✅ 显示执行配置
- ✅ 过滤无用的错误信息
- ✅ 进度提示

### 方案 2：增强原有脚本

在 `skill.ts` 中添加了更多日志输出：

1. **配置显示**：开始时显示归档配置
2. **进度提示**：每个步骤都有清晰的日志
3. **结果摘要**：完成后显示当前状态

### 方案 3：使用 unbuffer 强制实时输出

```bash
unbuffer npx tsx .claude/skills/branch-archive/scripts/skill.ts
```

## 测试命令

```bash
# 测试基本归档（不推送，不创建新分支）
node .claude/skills/branch-archive/scripts/archive-runner.js --push=false --new-branch=false

# 测试完整归档
node .claude/skills/branch-archive/scripts/archive-runner.js

# 测试不生成需求文档
node .claude/skills/branch-archive/scripts/archive-runner.js --requirements=false
```

## 实时输出技巧

1. **使用 console.log** 而不是 console.error
2. **避免大量输出**：过滤 Git 命令的冗余信息
3. **使用进度标记**：每个步骤用 emoji 标记
4. **颜色输出**：使用 ANSI 颜色码提升可读性

## 根本原因

1. **Node.js 缓冲**：输出被缓冲直到进程结束
2. **Git 命令错误**：`git branch --show-current` 的错误信息干扰
3. **斜杠命令机制**：可能无法实时捕获子进程输出

## 最佳实践

1. 对于长时间运行的命令，使用 `spawn` 而不是 `exec`
2. 实时处理 stdout 和 stderr
3. 提供清晰的进度反馈
4. 允许用户中断（Ctrl+C）