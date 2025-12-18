# 项目目录规范

## 项目概述

这是一个 React + TypeScript 的性能监控项目，采用规范驱动开发（SDD）方法。

### Requirement: 统一的目录结构

#### Scenario: 开发者快速定位文件

**GIVEN** 项目采用标准化的目录结构
**WHEN** 开发者需要查找特定类型的文件
**THEN** 可以根据功能快速定位到对应目录
**AND** 所有文件都遵循统一的命名规范

### Requirement: 源代码管理规范

#### Scenario: 新增源代码文件

**GIVEN** 开发者需要添加新的源代码文件
**WHEN** 创建任何 .tsx 或 .ts 文件
**THEN** 文件必须在 `src/` 目录下的相应子目录中
**AND** 不允许在项目根目录创建源代码文件

## 目录结构

```
demo4/
├── src/                    # 📦 所有源代码
│   ├── components/         # 🧩 React 组件
│   │   ├── FilterPanel.tsx
│   │   ├── ResponseTimeChart.tsx
│   │   ├── StatsCards.tsx
│   │   └── WalletConnector/
│   ├── services/          # 🔌 API 服务层
│   │   ├── apiService.ts
│   │   ├── latency-test-service.ts
│   │   └── walletService.ts
│   ├── context/           # 📦 React Context
│   │   └── WalletContext.tsx
│   ├── styles/            # 🎨 样式文件
│   │   └── index.css
│   ├── types/             # 📝 TypeScript 类型定义
│   │   ├── types.ts
│   │   └── wallet.ts
│   ├── utils/             # 🛠️ 工具函数
│   │   └── storage.ts
│   ├── App.tsx             # 🎯 主应用组件
│   ├── index.tsx           # 🚪 应用入口
│   └── vite-env.d.ts       # 📋 Vite 环境类型
├── public/                # 🌐 静态资源
│   ├── index.html
│   └── about.html
├── docs/                  # 📚 项目文档
├── archives/               # 📦 归档文件
├── .vscode/                # ⚙️ VSCode 配置
├── .project-structure.md   # 📋 本文档
├── README.md               # 📖 项目说明
├── package.json            # 📦 项目配置
├── vite.config.ts          # ⚡ Vite 配置
└── tsconfig.json           # 📝 TypeScript 配置
```

## 文件命名规范

### Requirement: 文件命名一致性

#### Scenario: 创建新文件

**GIVEN** 开发者创建新文件
**WHEN** 选择文件名
**THEN** 必须遵循以下规范：

#### React 组件 (.tsx)
- 使用 PascalCase
- 示例：`UserProfile.tsx`、`DataTable.tsx`
- 描述性名称，避免缩写

#### 工具函数和服务 (.ts)
- 使用 camelCase
- 示例：`apiService.ts`、`storageUtils.ts`
- 动词或名词组合，清晰表达功能

#### 目录命名
- 使用 camelCase 或 kebab-case
- 示例：`components/`、`walletConnector/`
- 简洁明了，表达功能

## 核心原则

### Requirement: 简化原则

#### Scenario: 项目架构决策

**GIVEN** 需要添加新功能或修改结构
**WHEN** 评估实现方案
**THEN** 必须通过简化门禁：

- ✅ 使用最少的目录层级
- ✅ 直接使用框架功能，避免过度抽象
- ✅ 专注于当前需求，不做"未来防护"
- ✅ 单一职责原则

### Requirement: 模块化组织

#### Scenario: 代码组织

**GIVEN** 项目包含多个功能模块
**WHEN** 组织代码结构
**THEN** 按功能而非技术分层：

- `components/` - 所有 UI 组件
- `services/` - 所有 API 通信
- `utils/` - 所有共享工具
- `types/` - 所有类型定义

## 检查清单

### 开发前
- [ ] 文件放在正确的 `src/` 子目录中？
- [ ] 命名符合规范？
- [ ] 遵循简化原则？

### 提交前
- [ ] 没有在根目录创建源码文件？
- [ ] 没有重复的目录结构？
- [ ] ESLint 检查通过？

## 工具配置

### ESLint 规则
项目使用 `eslint-plugin-boundaries` 强制执行目录结构：

- 禁止在 `src/` 外创建源码文件
- 强制文件放在正确的功能目录
- 自动检测违规

### VSCode 设置
- 文件排除规则隐藏不相关文件
- 保存时自动格式化
- 目录结构提示

## 常见问题

### Q: 可以在根目录创建工具脚本吗？
A: 可以，但应该是可执行脚本（.sh, .js）而非源代码文件。

### Q: 如何添加新的服务？
A: 在 `src/services/` 目录下创建，命名格式：`serviceNameService.ts`

### Q: 组件需要子目录吗？
A: 当组件包含多个相关文件时，创建子目录，如 `WalletConnector/`

### Q: 类型文件放在哪里？
A: 通用类型在 `src/types/`，组件特定类型可以与组件同文件

---

*最后更新：2024-12-18*
*参考：OpenSpec + Spec Kit 最佳实践*