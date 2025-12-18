# Privy 文档资源

## 官方文档
- **React SDK 设置指南**: https://docs.privy.io/basics/react/setup
- **React SDK API 参考**: https://docs.privy.io/reference/react
- **配置选项**: https://docs.privy.io/guide/react/configuration
- **登录方法**: https://docs.privy.io/guide/react/login
- **嵌入式钱包**: https://docs.privy.io/guide/react/embedded-wallets

## 常见问题
1. **embeddedWallets 配置**
   - 位置：在 config 对象的顶层
   - 格式：`embeddedWallets: { createOnLogin: 'all-users' }`
   - 不支持嵌套在链配置中

2. **loginMethods 选项**
   - email: 邮箱登录
   - google: Google 登录
   - twitter: Twitter 登录
   - discord: Discord 登录
   - wallet: 外部钱包连接
   - sms: 短信登录

3. **appearance 主题**
   - theme: 'light' | 'dark'
   - accentColor: 主题色
   - logo: 自定义 logo URL