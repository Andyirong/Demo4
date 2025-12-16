# Demo4 项目目录迁移指南

## 概述
本文档说明了如何将项目从旧的目录结构迁移到新的 `source/` 目录结构。

## 目录结构对比

### 旧结构（逐步废弃）
```
demo4/
├── components/
│   ├── FilterPanel.tsx
│   ├── ResponseTimeChart.tsx
│   └── StatsCards.tsx
└── services/
    └── apiService.ts
```

### 新结构（推荐使用）
```
demo4/
├── source/
│   ├── App.tsx
│   ├── components/
│   │   ├── FilterPanel.tsx
│   │   ├── ResponseTimeChart.tsx
│   │   └── StatsCards.tsx
│   ├── services/
│   │   └── apiService.ts
│   ├── types/
│   └── utils/
├── components/ (旧，仅兼容)
└── services/ (旧，仅兼容)
```

## 迁移步骤

### 1. 准备工作
- [x] 创建 `source/` 目录结构
- [x] 更新 `.claude/claude.json` 添加目录规范
- [ ] 备份当前代码

### 2. 创建示例迁移

#### 2.1 迁移组件
```bash
# 创建 source 目录结构
mkdir -p source/components source/services source/types source/utils

# 迁移第一个组件作为示例
cp components/FilterPanel.tsx source/components/FilterPanel.tsx
```

#### 2.2 更新导入路径
需要更新引用这些组件的文件：
```typescript
// 旧的导入方式（需要更新）
import { FilterPanel } from './components/FilterPanel';

// 新的导入方式（推荐）
import { FilterPanel } from '../source/components/FilterPanel';
```

#### 2.3 测试功能
- 运行项目确保功能正常
- 检查组件是否能正确加载

### 3. 批量迁移

#### 3.1 迁移所有组件
```bash
# 迁移所有组件文件
cp components/*.tsx source/components/
cp components/*.ts source/components/  # 如果有的话
```

#### 3.2 迁移服务
```bash
# 迁移所有服务文件
cp services/*.ts source/services/
```

#### 3.3 迁移类型定义
```bash
# 迁移类型定义
cp types.ts source/types/
```

### 4. 更新所有导入路径

需要查找并更新所有导入语句：

```bash
# 查找需要更新的导入
grep -r "from.*components/" . --include="*.tsx" --include="*.ts"
grep -r "from.*services/" . --include="*.tsx" --include="*.ts"
```

### 5. 清理工作

#### 5.1 标记旧目录
在旧目录中创建 `DEPRECATED.md`：
```markdown
# DEPRECATED

此目录已废弃，请使用 `source/` 目录。

迁移说明请参考：[迁移指南](../plans/migration-guide.md)
```

#### 5.2 可选：删除旧目录
在确认所有引用都已更新后，可以删除旧目录。

## 导入路径规范

### 推荐的导入方式

#### 相对路径导入（当前推荐）
```typescript
// 从根目录导入
import { FilterPanel } from '../source/components/FilterPanel';

// 从同一级别导入
import { FilterPanel } from './source/components/FilterPanel';
```

#### 绝对路径导入（未来规划）
需要先配置路径别名（在 vite.config.ts 中）：
```typescript
import { FilterPanel } from '@/components/FilterPanel';
```

### 更新脚本示例

创建批量更新脚本：
```javascript
// update-imports.js
const fs = require('fs');
const path = require('path');

// 更新所有文件中的导入路径
const updateImports = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // 更新组件导入
  content = content.replace(
    /from ['"]\.\/components\//g,
    "from '../source/components/"
  );

  // 更新服务导入
  content = content.replace(
    /from ['"]\.\/services\//g,
    "from '../source/services/"
  );

  fs.writeFileSync(filePath, content);
};

// 应用到所有 tsx 和 ts 文件
const files = fs.readdirSync('.')
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

files.forEach(updateImports);
```

## 验证清单

### 迁移后检查
- [ ] 项目能正常启动
- [ ] 所有组件正常加载
- [ ] API 调用正常工作
- [ ] 测试通过
- [ ] 无控制台错误

### 文档更新
- [ ] README.md 已更新
- [ ] 组件文档已更新
- [ ] API 文档已更新

## 常见问题

### Q: 新旧目录都存在，会有冲突吗？
A: 不会冲突，但建议只使用新目录。可以通过配置 ESLint 规则来避免从旧目录导入。

### Q: 如何处理第三方库的导入？
A: 第三方库的导入保持不变，只更新项目内部的导入。

### Q: 迁移后如何确保没有遗漏？
A: 运行 `grep` 命令查找所有旧路径引用，确保都已更新。

## 时间线

- 第1周：完成示例迁移，验证流程
- 第2周：批量迁移所有文件
- 第3周：清理旧目录，更新文档

## 支持

如果在迁移过程中遇到问题，请：
1. 查看本文档的常见问题部分
2. 检查 `.claude/claude.json` 中的目录规范
3. 提交 issue 并附上错误信息

---

**最后更新**: 2025-12-17
**状态**: 进行中