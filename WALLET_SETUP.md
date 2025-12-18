# 钱包连接功能设置指南

## 概述
本项目已集成 Privy SDK，提供多种钱包连接方式：
- MetaMask 等浏览器钱包
- WalletConnect 移动钱包
- 社交登录（Google、Twitter、Discord）
- 邮箱创建钱包

## 设置步骤

### 1. 获取 Privy App ID

1. 访问 [Privy Dashboard](https://dashboard.privy.io/)
2. 创建新应用或选择现有应用
3. 复制 App ID

### 2. 配置环境变量

1. 复制 `.env.example` 文件为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，添加您的 Privy App ID：
   ```
   VITE_PRIVY_APP_ID=your_actual_privy_app_id
   ```

### 3. 配置 Privy（可选）

在 Privy Dashboard 中，您可以配置：
- 支持的钱包类型
- 社交登录选项
- 品牌定制
- 安全设置

## 功能说明

### 钱包连接按钮
- 位置：顶部导航栏右侧
- 未连接：显示"连接钱包"按钮
- 已连接：显示截取的钱包地址

### 支持的钱包类型
- **MetaMask**: 最流行的以太坊钱包
- **WalletConnect**: 支持移动钱包扫码连接
- **Google**: 使用 Google 账号快速登录
- **Twitter**: 使用 Twitter 账号登录
- **Email**: 通过邮箱创建新钱包

### 特性
- **持久化存储**: 刷新页面后保持连接状态
- **错误处理**: 友好的错误提示
- **响应式设计**: 适配移动端和桌面端
- **安全性**: 仅保存钱包地址，不存储敏感信息

## 使用方法

### 基本使用
```tsx
import { useWallet } from './context/WalletContext';
import { WalletConnector, WalletInfo } from './components/WalletConnector';

// 在应用中使用
function App() {
  return (
    <WalletProvider>
      <WalletConnector />
      {/* 其他组件 */}
    </WalletProvider>
  );
}

// 在其他组件中使用钱包信息
function SomeComponent() {
  const { state, connect, disconnect } = useWallet();

  if (state.isConnected) {
    return <div>已连接: {state.address}</div>;
  }

  return <button onClick={connect}>连接钱包</button>;
}
```

### 自定义组件
```tsx
// 使用单独的组件
import { WalletButton, WalletModal, WalletInfo } from './components/WalletConnector';

<WalletButton onConnectClick={() => setShowModal(true)} />
<WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
<WalletInfo showCopyButton showExplorerLink />
```

## 开发注意事项

1. **环境变量**: 确保在生产环境中设置了正确的 `VITE_PRIVY_APP_ID`
2. **HTTPS**: Privy 需要在 HTTPS 环境下运行（开发环境 Vite 会自动处理）
3. **错误处理**: 始终检查 `state.error` 并向用户显示友好的错误信息
4. **加载状态**: 使用 `state.isLoading` 显示加载动画，提升用户体验

## 故障排除

### 连接失败
- 检查 Privy App ID 是否正确
- 确保环境变量已正确设置
- 查看浏览器控制台的错误信息

### 社交登录不工作
- 在 Privy Dashboard 中确保已启用相应的社交登录
- 检查回调 URL 配置是否正确

### 移动端问题
- 确保响应式样式正常工作
- 测试各种移动钱包的兼容性

## 更多信息

- [Privy 文档](https://docs.privy.io/)
- [Privy React SDK](https://docs.privy.io/reference/react)
- [示例项目](https://github.com/privy-io/privy-examples)