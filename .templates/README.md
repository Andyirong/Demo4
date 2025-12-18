# 文件模板使用说明

本目录包含项目常用文件的模板，帮助快速创建符合规范的新文件。

## 模板列表

1. **Component.template.tsx** - React 组件模板
2. **Service.template.ts** - 服务类模板
3. **Utils.template.ts** - 工具函数模板
4. **Types.template.ts** - TypeScript 类型定义模板

## 使用方法

### 方法 1: 复制粘贴
1. 复制对应模板文件
2. 粘贴到目标目录
3. 重命名文件并替换模板内容

### 方法 2: VSCode 代码片段（推荐）

在 VSCode 中添加以下代码片段到用户代码片段中：

```json
{
  "React Component": {
    "prefix": "rc",
    "body": [
      "import React from 'react';",
      "",
      "/**",
      " * ${1:ComponentName} Component",
      " *",
      " * ${2:Description}",
      " */",
      "const ${1:ComponentName}: React.FC<Props> = ({ ${3:prop} }) => {",
      "  return (",
      "    <div className=\"${1/(.*)/${1:/camelcase}/}-container\">",
      "      {$0}",
      "    </div>",
      "  );",
      "};",
      "",
      "interface Props {",
      "  ${3:prop}: ${4:type};",
      "}",
      "",
      "export default ${1:ComponentName};"
    ],
    "description": "Create a React component with TypeScript"
  },

  "Service Class": {
    "prefix": "service",
    "body": [
      "import { apiClient } from './apiService';",
      "",
      "/**",
      " * ${1:ServiceName} Service",
      " */",
      "export class ${1:ServiceName}Service {",
      "  static async ${2:methodName}(${3:param}: ${4:type}): Promise<${5:returnType}> {",
      "    try {",
      "      const response = await apiClient.post('/${6:endpoint}', ${3:param});",
      "      return response.data;",
      "    } catch (error) {",
      "      console.error('${1:ServiceName}.${2:methodName} error:', error);",
      "      throw error;",
      "    }",
      "  }",
      "}"
    ],
    "description": "Create a service class"
  }
}
```

### 方法 3: Shell 脚本（高级用户）

创建脚本自动创建文件：

```bash
#!/bin/bash
# create-component.sh

if [ $# -eq 0 ]; then
  echo "Usage: ./create-component.sh ComponentName"
  exit 1
fi

COMPONENT_NAME=$1
FILE_NAME="src/components/${COMPONENT_NAME}.tsx"

# 从模板复制
cp .templates/Component.template.tsx "$FILE_NAME"

# 替换占位符
sed -i '' "s/ComponentName/$COMPONENT_NAME/g" "$FILE_NAME"

echo "Created: $FILE_NAME"
```

## 注意事项

1. **命名规范**
   - 组件：PascalCase.tsx
   - 服务：camelCase.ts 或 camelCaseService.ts
   - 工具：camelCase.ts
   - 类型：camelCase.ts

2. **文件位置**
   - 组件放在 `src/components/`
   - 服务放在 `src/services/`
   - 工具放在 `src/utils/`
   - 类型放在 `src/types/`

3. **ESLint 检查**
   - 新文件会自动通过 ESLint 检查
   - 确保符合项目规范

## 自定义模板

可以根据项目需要自定义模板或添加新的模板文件。