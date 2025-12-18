# Tailwind CSS 集成指南

## 已完成的配置

### 1. 安装的依赖
- `tailwindcss@4.1.18` - Tailwind CSS 框架
- `postcss@8.5.6` - CSS 后处理器
- `autoprefixer@10.4.23` - 自动添加浏览器前缀
- `@tailwindcss/postcss` - Tailwind CSS v4 的 PostCSS 插件

### 2. 配置文件

#### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### postcss.config.js
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### 3. CSS 入口文件

在 `src/styles/index.css` 中添加了 Tailwind 指令：
```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 使用方法

### 1. 在组件中使用 Tailwind 类

```tsx
import React from 'react';

const ExampleComponent = () => {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg">
      <h1 className="text-2xl font-bold">Hello Tailwind!</h1>
      <p className="mt-2">这是一个使用 Tailwind CSS 的示例</p>
    </div>
  );
};
```

### 2. 响应式设计

Tailwind 提供了响应式前缀：
- `sm:` - 640px 及以上
- `md:` - 768px 及以上
- `lg:` - 1024px 及以上
- `xl:` - 1280px 及以上
- `2xl:` - 1536px 及以上

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 内容 */}
</div>
```

### 3. 状态变体

```tsx
<button className="bg-blue-500 hover:bg-blue-700 focus:bg-blue-800 text-white font-bold py-2 px-4 rounded">
  按钮文本
</button>
```

### 4. 自定义样式

如果需要自定义样式，可以：
1. 在 `tailwind.config.js` 中扩展主题
2. 在 CSS 文件中使用 `@layer components` 添加组件类
3. 使用内联样式作为最后的手段

## 示例页面

### Tailwind 测试组件
访问应用的 "Tailwind 测试" 标签页查看各种 Tailwind 功能的演示，包括：
- 响应式网格布局
- 不同样式的按钮
- 表单组件
- 动画效果

### 独立测试页面
打开 `src/test-tailwind.html` 可以查看一个使用 CDN 版本的简单测试页面。

## 最佳实践

1. **保持组件纯净**：尽可能使用 Tailwind 类，避免编写自定义 CSS
2. **使用响应式设计**：利用 Tailwind 的响应式前缀创建适配不同屏幕的布局
3. **组件复用**：将常用的样式组合抽象为组件
4. **性能优化**：Tailwind 会自动移除未使用的样式，无需手动优化

## 常用类名速查

### 布局
- `flex`, `grid` - 显示类型
- `p-4`, `px-2`, `py-1` - 内边距
- `m-4`, `mx-auto`, `my-2` - 外边距
- `w-full`, `h-screen` - 尺寸

### 颜色
- `bg-white`, `bg-gray-100` - 背景色
- `text-black`, `text-blue-500` - 文字颜色
- `border-gray-300` - 边框颜色

### 排版
- `text-sm`, `text-lg`, `text-2xl` - 字体大小
- `font-normal`, `font-bold` - 字重
- `text-center`, `text-left` - 文本对齐

### 效果
- `shadow-lg` - 阴影
- `rounded-lg` - 圆角
- `transition-all` - 过渡动画
- `hover:bg-blue-600` - 悬停效果

## 获取帮助

- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)
- [Tailwind 组件示例](https://tailwindui.com/components)
- [Tailwind Play](https://play.tailwindcss.com/) - 在线编辑器