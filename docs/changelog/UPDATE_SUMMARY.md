# 更新摘要 - 2025-12-16

## 主要变更

### ✅ 新增功能
- **浏览器延时测试**：使用 Playwright 实现自动化延时测试
- **性能指标采集**：FCP、LCP、加载时间等
- **后端 API 服务**：Express.js 服务支持延时测试

### 🐛 修复问题
- **ResponseTimeChart 缺失 Activity 图标**：添加导入语句修复渲染错误
- **API 请求日志**：增加详细调试信息

### 📦 依赖更新
- playwright & @playwright/test
- express & cors
- concurrently

### 🗂️ 文件变更
- 新增：`src/browser-automation.ts`、`src/latency-test-service.ts`
- 修复：`components/ResponseTimeChart.tsx`
- 配置：`package.json`、`.env`
- 文档：`CHANGES.md`

## 状态
- 延时测试功能：开发中（UI 待完善）
- 性能监控：正常运行（连接生产 API）