# 需求文档生成命令

根据项目规范自动生成标准格式的需求文档，支持智能提取内容。

## 使用方法

```bash
/req-gen [选项] [内容来源]
```

## 基本用法

### 1. 智能模式（推荐）
自动分析代码变更或需求描述，提取关键信息生成文档。

```bash
# 分析最近的代码变更，自动生成需求文档
/req-gen

# 指定分析特定文件或目录
/req-gen --analyze "Demo5/Views/TimePickerModal.swift"

# 从需求描述生成文档
/req-gen --desc "实现一个弹窗式的时间选择器，支持自定义输入"
```

### 2. 手动模式

手动指定参数生成文档。

```bash
# 创建新的产品需求（默认类型）
/req-gen --title "弹窗选择器" --features "弹窗显示,时间选择,自定义输入"

# 指定文档类型
/req-gen --type UI --title "登录页" --ui-elements "输入框,按钮,图标"
```

## 参数说明

### 基本参数

- `--type <type>` - 文档类型 (PD|TD|NFR|UI|QA|ARCH)，默认：PD
- `--title <title>` - 简短标题（≤10字符，用于文件名）
- `--full-title <title>` - 完整标题（用于文档内部）

### 智能分析参数

- `--analyze <path>` - 分析指定文件或目录的变更
- `--desc <description>` - 需求描述（自动分析功能点）
- `--auto-extract` - 自动提取功能点和技术点
- `--recent-commits <n>` - 分析最近n次提交（默认：1）

### 内容参数

- `--features <list>` - 功能点列表，逗号分隔
- `--tech-points <list>` - 技术点列表（仅TD类型）
- `--ui-elements <list>` - UI元素列表（仅UI类型）
- `--related <docs>` - 关联文档，逗号分隔

### 其他选项

- `--update <doc>` - 更新现有文档
- `--dry-run` - 预览生成内容
- `--template <path>` - 使用自定义模板

## 使用示例

### 智能模式示例

```bash
# 自动分析并生成文档（最简单）
/req-gen

# 分析特定组件
/req-gen --analyze "Demo5/Views/TimePickerModal.swift"

# 从描述智能提取
/req-gen --desc "添加底部弹窗选择器，支持6个预设时间和自定义输入"

# 分析最近3次提交
/req-gen --recent-commits 3
```

### 手动模式示例

```bash
# 使用默认PD类型
/req-gen --title "弹窗选择器" --features "底部弹窗,时间选择,自定义输入"

# 创建UI需求
/req-gen --type UI --title "登录页面" --ui-elements "输入框,登录按钮,社交登录"

# 创建技术需求
/req-gen --type TD --title "API集成" --tech-points "RESTful API,认证,错误处理"

# 更新现有文档
/req-gen --update PD-003 --title "选择器优化"
```

## 智能提取规则

### 从代码中提取

1. **新建文件** → 自动提取为功能需求
2. **SwiftUI组件** → 提取UI元素和交互
3. **ViewModel/Service** → 提取技术实现点
4. **API接口** → 提取技术需求

### 描述关键词映射

- "弹窗"、"对话框" → UI需求
- "性能"、"优化"、"速度" → NFR
- "数据库"、"缓存"、"API" → TD
- "登录"、"注册"、"用户" → PD

### 标题提取规则

- 从文件名提取：`TimePickerModal.swift` → "时间选择器"
- 从功能描述提取：选择最核心的关键词组合
- 自动限制在10个字符内

## 自动关联分析

- 分析文件依赖，自动关联相关文档
- 检测调用关系，推荐相关需求
- 基于文件路径推断关联性

## 文档命名规范

文件名格式：`{类型}-{编号}-{核心需求说明}.md`

- 核心需求说明：≤10字符，优先中文
- 示例：`PD-004-弹窗选择器.md`

## 文档类型

- **PD** - Product Requirement (产品需求) - 默认
- **TD** - Technical Requirement (技术需求)
- **NFR** - Non-Functional Requirement (非功能需求)
- **UI** - User Interface (界面需求)
- **QA** - Quality Assurance (质量需求)
- **ARCH** - Architecture (架构需求)

## 执行流程

1. **智能分析模式**：

   ```text
   输入需求/代码 → AI分析 → 提取关键信息 → 生成文档
   ```

2. **手动模式**：

   ```text
   输入参数 → 应用模板 → 生成文档
   ```

## 最佳实践

1. **使用智能模式**：
   - 让AI自动分析，减少手动输入
   - 提供清晰的需求描述

2. **标题优化**：
   - 使用简洁的核心功能词
   - 避免使用技术术语

3. **批量生成**：
   - 可以一次性分析多个文件
   - 自动生成相关的多个文档