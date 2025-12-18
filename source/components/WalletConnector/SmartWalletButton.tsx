import React, { useState, useEffect } from 'react';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { formatWalletAddress } from '../../types/wallet';

export const SmartWalletButton: React.FC = () => {
  const { state, connect, disconnect } = useWallet();
  const [showError, setShowError] = useState<string | null>(null);

  // 处理连接
  const handleConnect = async () => {
    setShowError(null);
    try {
      await connect();
      console.log('连接成功！');
    } catch (error: any) {
      console.error('Connection error:', error);
      setShowError(error.message || '连接失败，请重试');
      // 3秒后隐藏错误
      setTimeout(() => setShowError(null), 3000);
    }
  };

  // 处理断开连接
  const handleDisconnect = async () => {
    try {
      await disconnect();
      console.log('已断开连接');
    } catch (error: any) {
      console.error('Disconnect error:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={state.isConnected ? handleDisconnect : handleConnect}
        disabled={state.isLoading}
        className={`neon-glow px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          state.isLoading
            ? 'opacity-50 cursor-not-allowed'
            : state.isConnected
            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
            : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
        }`}
      >
        {state.isLoading ? (
          <>
            <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
            连接中...
          </>
        ) : state.isConnected && state.address ? (
          <>
            <Wallet className="w-4 h-4 inline mr-2" />
            {formatWalletAddress(state.address)}
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 inline mr-2" />
            连接钱包
          </>
        )}
      </button>

      {/* 错误提示 */}
      {showError && (
        <div className="absolute top-full mt-2 right-0 w-64 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs z-50 shadow-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{showError}</span>
          </div>
        </div>
      )}
    </div>
  );
};