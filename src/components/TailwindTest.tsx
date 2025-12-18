import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">
        Tailwind CSS 测试
      </h1>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* 卡片示例 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">
            响应式卡片
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded hover:bg-gray-600 transition-colors">
              <div className="text-yellow-400 text-6xl mb-2">🚀</div>
              <h3 className="font-bold text-lg">快速开发</h3>
              <p className="text-gray-300 text-sm">使用 Tailwind 快速构建 UI</p>
            </div>
            <div className="bg-gray-700 p-4 rounded hover:bg-gray-600 transition-colors">
              <div className="text-blue-400 text-6xl mb-2">⚡</div>
              <h3 className="font-bold text-lg">高性能</h3>
              <p className="text-gray-300 text-sm">优化的 CSS 体积</p>
            </div>
            <div className="bg-gray-700 p-4 rounded hover:bg-gray-600 transition-colors">
              <div className="text-green-400 text-6xl mb-2">💎</div>
              <h3 className="font-bold text-lg">可定制</h3>
              <p className="text-gray-300 text-sm">灵活的设计系统</p>
            </div>
          </div>
        </div>

        {/* 按钮示例 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">
            按钮样式
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              主要按钮
            </button>
            <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
              次要按钮
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              危险按钮
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              成功按钮
            </button>
          </div>
        </div>

        {/* 表单示例 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">
            表单组件
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="username">
                用户名
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                id="username"
                type="text"
                placeholder="输入用户名"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="email">
                邮箱
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                id="email"
                type="email"
                placeholder="输入邮箱"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="message">
                消息
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white focus:border-blue-500 h-24 resize-none"
                id="message"
                placeholder="输入消息"
              />
            </div>
          </div>
        </div>

        {/* 动画示例 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            动画效果
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="animate-pulse bg-blue-500 p-4 rounded">
              脉冲动画
            </div>
            <div className="animate-spin bg-green-500 p-4 rounded">
              旋转动画
            </div>
            <div className="animate-bounce bg-yellow-500 p-4 rounded">
              弹跳动画
            </div>
            <div className="transition-all duration-300 hover:scale-110 bg-purple-500 p-4 rounded">
              悬停放大
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;