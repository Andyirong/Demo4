# 归档命令卡住问题分析与解决方案

## 问题现象
`/archive` 命令执行时界面卡住，无法看到实时进度，用户无法确定命令是否在执行。

## 根本原因分析

### 1. **Node.js 输出缓冲**
- Node.js 默认缓冲 stdout 输出
- 使用 `execSync` 时输出被缓冲直到进程结束
- 导致界面看起来"卡住"

### 2. **斜杠命令执行机制限制**
- Claude 的斜杠命令可能无法实时捕获子进程输出
- 特别是在执行长时间运行的命令时

### 3. **Git 命令兼容性**
- `git branch --show-current` 在旧版本 Git 中不支持
- 产生错误信息干扰正常输出

### 4. **缺少进度反馈**
- 没有明确的进度提示
- 用户无法知道执行到了哪一步

## 已实施的解决方案

### 1. **创建实时输出脚本**
- 文件：`archive-runner.cjs`
- 使用 CommonJS 格式避免 ES 模块问题
- 实时彩色输出
- 自动过滤无用信息

### 2. **增强日志输出**
- 在 skill.ts 中添加配置显示
- 每个步骤都有清晰的日志
- 使用 emoji 标记不同状态

### 3. **Git 兼容性修复**
- 使用 `git symbolic-ref` 替代 `git branch --show-current`
- 添加备选方案确保兼容性

## 使用方法

### 直接使用改进的脚本（推荐）
```bash
node .claude/skills/branch-archive/scripts/archive-runner.cjs
```

### 参数示例
```bash
# 不推送，不创建新分支
node .claude/skills/branch-archive/scripts/archive-runner.cjs --push=false --new-branch=false

# 不生成需求文档
node .claude/skills/branch-archive/scripts/archive-runner.cjs --requirements=false
```

## 进一步优化建议

### 1. 修改 execSync 为 spawn
```typescript
// 替换 execSync 调用
function executeWithRealTimeOutput(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { shell: true, stdio: 'pipe' });
    let output = '';

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stdout.write(chunk); // 实时输出
    });

    child.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}
```

### 2. 强制刷新输出缓冲区
```typescript
// 在关键点添加
process.stdout.write('');
process.stderr.write('');
```

### 3. 使用进度条
```typescript
// 显示进度
function showProgress(current: number, total: number, step: string) {
  const percentage = Math.round((current / total) * 100);
  process.stdout.write(`\r[${step}] ${percentage}% (${current}/${total})`);
}
```

### 4. 添加心跳信号
```typescript
// 每5秒显示一个点表示还在运行
setInterval(() => {
  process.stdout.write('.');
}, 5000);
```

## 总结

卡住问题的核心是输出缓冲和执行机制限制。通过：
1. 使用专门的 runner 脚本
2. 实时输出和进度反馈
3. 过滤干扰信息
4. 增强日志记录

已经解决了主要问题。用户现在可以看到清晰的执行进度，不会再出现"卡住"的感觉。