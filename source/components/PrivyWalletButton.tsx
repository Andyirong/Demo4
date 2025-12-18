import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Wallet, Loader2, LogOut } from 'lucide-react';

export const PrivyWalletButton: React.FC = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  // 添加调试日志
  console.log('PrivyWalletButton - ready:', ready);
  console.log('PrivyWalletButton - authenticated:', authenticated);
  console.log('PrivyWalletButton - user:', user);

  // 格式化钱包地址
  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!ready) {
    return (
      <button className="neon-glow px-4 py-2 rounded-lg text-sm font-medium transition-all opacity-50">
        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
        初始化中...
      </button>
    );
  }

  if (authenticated) {
    // 获取钱包地址
    const wallet = user?.linkedAccounts?.find(
      (account: any) => account.type === 'wallet' || account.type === 'embedded_wallet'
    );

    return (
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-all"
          title={`已连接: ${wallet?.address || 'Unknown'}`}
        >
          <Wallet className="w-4 h-4" />
          <span className="font-mono text-sm">
            {formatAddress(wallet?.address)}
          </span>
        </button>
        <button
          onClick={logout}
          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="断开连接"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleLogin = async () => {
    console.log('开始登录...');
    try {
      await login();
      console.log('登录成功');
    } catch (error) {
      console.error('登录失败:', error);
      alert('登录失败: ' + (error as Error).message);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="neon-glow px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all text-sm font-medium"
    >
      <Wallet className="w-4 h-4 inline mr-2" />
      连接钱包
    </button>
  );
};