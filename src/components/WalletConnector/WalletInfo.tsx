import React from 'react';
import { Copy, ExternalLink, LogOut, User } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { formatWalletAddress } from '../../types/wallet';

interface WalletInfoProps {
  onDisconnect?: () => void;
  showCopyButton?: boolean;
  showExplorerLink?: boolean;
  className?: string;
}

export const WalletInfo: React.FC<WalletInfoProps> = ({
  onDisconnect,
  showCopyButton = true,
  showExplorerLink = true,
  className = '',
}) => {
  const { state, disconnect } = useWallet();

  // 复制钱包地址
  const handleCopyAddress = async () => {
    if (state.address) {
      try {
        await navigator.clipboard.writeText(state.address);
        // 这里可以添加一个提示，告诉用户已复制
        console.log('地址已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  // 打开区块链浏览器
  const handleOpenExplorer = () => {
    if (state.address) {
      // 默认使用 Etherscan
      window.open(`https://etherscan.io/address/${state.address}`, '_blank');
    }
  };

  // 处理断开连接
  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
    } else {
      disconnect();
    }
  };

  if (!state.isConnected || !state.address) {
    return null;
  }

  return (
    <div className={`tech-card p-4 ${className}`}>
      {/* 钱包信息头部 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="neon-glow p-2 rounded-full bg-blue-500/20">
          <User className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400">已连接钱包</p>
          <p className="font-mono text-white">
            {formatWalletAddress(state.address)}
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        {showCopyButton && (
          <button
            onClick={handleCopyAddress}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all text-sm"
            title="复制地址"
          >
            <Copy className="w-4 h-4" />
            复制
          </button>
        )}

        {showExplorerLink && (
          <button
            onClick={handleOpenExplorer}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all text-sm"
            title="在 Etherscan 上查看"
          >
            <ExternalLink className="w-4 h-4" />
            查看
          </button>
        )}

        <button
          onClick={handleDisconnect}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all text-sm"
          title="断开连接"
        >
          <LogOut className="w-4 h-4" />
          断开
        </button>
      </div>
    </div>
  );
};