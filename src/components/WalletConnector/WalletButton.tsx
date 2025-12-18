import React from 'react';
import { Wallet, User, LogOut, Loader2 } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { formatWalletAddress } from '../../types/wallet';

interface WalletButtonProps {
  onConnectClick?: () => void;
  onDisconnectClick?: () => void;
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  onConnectClick,
  onDisconnectClick,
  className = '',
}) => {
  const { state, disconnect } = useWallet();

  // 处理点击事件
  const handleClick = () => {
    if (state.isConnected) {
      if (onDisconnectClick) {
        onDisconnectClick();
      } else {
        disconnect();
      }
    } else {
      if (onConnectClick) {
        onConnectClick();
      }
    }
  };

  // 渲染连接按钮
  if (!state.isConnected) {
    return (
      <button
        onClick={handleClick}
        disabled={state.isLoading}
        className={`neon-glow px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          state.isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-blue-500/20 text-gray-300 hover:text-white'
        } ${className}`}
      >
        {state.isLoading ? (
          <>
            <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
            连接中...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 inline mr-2" />
            连接钱包
          </>
        )}
      </button>
    );
  }

  // 渲染已连接状态
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"
        title={state.address || ''}
      >
        <User className="w-4 h-4" />
        <span className="font-mono text-sm">
          {formatWalletAddress(state.address)}
        </span>
      </button>

      <button
        onClick={handleClick}
        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        title="断开连接"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};