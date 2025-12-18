# 开发规范指南

## 代码风格规范

### TypeScript/React 组件规范

#### 1. 组件定义
```tsx
// ✅ 好的做法
import React from 'react';

interface ComponentProps {
  title: string;
  count?: number;
  onSubmit?: (value: string) => void;
}

const ExampleComponent: React.FC<ComponentProps> = ({
  title,
  count = 0,
  onSubmit
}) => {
  // 组件逻辑
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{title}</h1>
      <p>Count: {count}</p>
    </div>
  );
};

export default ExampleComponent;
```

#### 2. 文件命名规范
- 组件文件：`PascalCase.tsx` (例：`UserProfile.tsx`)
- 工具函数：`camelCase.ts` (例：`formatDate.ts`)
- 类型定义：`camelCase.ts` (例：`userTypes.ts`)
- 常量文件：`UPPER_SNAKE_CASE.ts` (例：`API_ENDPOINTS.ts`)

#### 3. 导入顺序
```tsx
// 1. React 相关
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import { Button, Card } from 'antd';
import axios from 'axios';

// 3. 本地组件（按路径层级排序）
import ParentComponent from '../components/ParentComponent';
import { ChildComponent } from '../components';
import { utilityFunction } from '../utils/helpers';

// 4. 类型定义
import { User, ApiResponse } from '../types';

// 5. 样式文件
import './Component.css';
```

### Tailwind CSS 使用规范

#### 1. 类名组织
```tsx
// ✅ 推荐的类名顺序
<div className="
  // 布局
  flex flex-col gap-4 p-6

  // 尺寸
  w-full h-64

  // 颜色
  bg-white text-gray-900

  // 边框和圆角
  border border-gray-200 rounded-lg

  // 阴影和效果
  shadow-lg transition-all duration-300

  // 响应式
  md:w-1/2 lg:w-1/3

  // 状态
  hover:bg-gray-50 focus:outline-none focus:ring-2
">
```

#### 2. 响应式设计
```tsx
// Mobile-first approach
<div className="
  grid grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
">
```

#### 3. 组件样式复用
```tsx
// 创建可复用的样式组合
const cardStyles = "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow";
const buttonStyles = "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600";

const Component = () => {
  return (
    <div className={cardStyles}>
      <button className={buttonStyles}>Click me</button>
    </div>
  );
};
```

## 状态管理规范

### 1. useState 使用
```tsx
// ✅ 将相关的状态组合在一起
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);

// ✅ 处理复杂状态使用 useReducer
type State = {
  count: number;
  step: number;
};

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_STEP'; payload: number };

const counterReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + state.step };
    case 'DECREMENT':
      return { ...state, count: state.count - state.step };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    default:
      return state;
  }
};
```

### 2. useEffect 使用
```tsx
// ✅ 正确的依赖管理
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetchUser(userId);
      setUser(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (userId) {
    fetchData();
  }
}, [userId]); // 只依赖 userId

// ✅ 清理副作用
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Timer tick');
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);
```

## API 调用规范

### 1. 错误处理
```tsx
// ✅ 统一的错误处理
const apiCall = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('API call failed:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

### 2. 类型定义
```tsx
// api/types.ts
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  code?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
```

## 测试规范

### 1. 组件测试
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-500');
  });
});
```

### 2. 测试文件命名
- 组件测试：`ComponentName.test.tsx`
- 工具函数测试：`utilName.test.ts`
- Hook 测试：`useHook.test.ts`

## 性能优化规范

### 1. React 优化
```tsx
// ✅ 使用 React.memo 防止不必要的重渲染
export const ExpensiveComponent = React.memo<Props>(({ data, onClick }) => {
  return (
    <div>
      {data.map(item => (
        <Item key={item.id} item={item} onClick={onClick} />
      ))}
    </div>
  );
});

// ✅ 使用 useMemo 缓存计算结果
const filteredData = useMemo(() => {
  return data.filter(item => item.status === 'active');
}, [data]);

// ✅ 使用 useCallback 缓存函数
const handleSubmit = useCallback((values: FormValues) => {
  onSubmit(values);
}, [onSubmit]);
```

### 2. 代码分割
```tsx
// ✅ 使用 React.lazy 进行组件懒加载
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 使用 Suspense 包裹
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

## Git 工作流规范

### 1. 分支命名
- `feature/功能名称` - 新功能开发
- `fix/问题描述` - Bug 修复
- `docs/文档内容` - 文档更新
- `refactor/重构内容` - 代码重构
- `test/测试相关` - 测试相关

### 2. 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

示例：
```
feat(auth): add user login functionality

- Implement login form with email/password
- Add JWT token handling
- Create login validation logic

Closes #123
```

## 代码审查清单

### 1. 功能性
- [ ] 代码实现了需求功能
- [ ] 边界情况已处理
- [ ] 错误处理完善
- [ ] 性能考虑充分

### 2. 代码质量
- [ ] 代码结构清晰
- [ ] 命名规范合理
- [ ] 无重复代码
- [ ] 注释充分且准确

### 3. 安全性
- [ ] 无安全漏洞
- [ ] 输入验证完善
- [ ] 敏感信息已保护

### 4. 测试
- [ ] 测试覆盖率达标
- [ ] 测试用例合理
- [ ] 集成测试通过

## 常用工具和快捷键

### VSCode 快捷键
- `Ctrl/Cmd + P` - 快速打开文件
- `Ctrl/Cmd + Shift + O` - 跳转到符号
- `Ctrl/Cmd + /` - 切换注释
- `Alt + ↑/↓` - 移动行
- `Ctrl/Cmd + D` - 选择下一个相同内容

### Git 快捷命令
```bash
# 查看提交历史
git log --oneline --graph --decorate

# 暂存当前工作
git stash push -m "描述信息"

# 恢复暂存的工作
git stash pop

# 查看文件修改
git diff --文件名

# 撤销最后一次提交
git reset --soft HEAD~1
```