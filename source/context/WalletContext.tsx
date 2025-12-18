import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { WalletState, WalletContextType, WalletType, WALLET_STORAGE_KEY } from '../types/wallet';
import { walletService } from '../services/walletService';
import { LocalStorage } from '../utils/storage';

// 初始状态
const initialState: WalletState = {
  isConnected: false,
  address: null,
  walletType: null,
  isLoading: false,
  error: null,
};

// Action 类型
type WalletAction =
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS'; payload: { address: string; walletType: WalletType } }
  | { type: 'CONNECT_FAILURE'; payload: string }
  | { type: 'DISCONNECT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// Reducer 函数
const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'CONNECT_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'CONNECT_SUCCESS':
      return {
        ...state,
        isConnected: true,
        address: action.payload.address,
        walletType: action.payload.walletType,
        isLoading: false,
        error: null,
      };
    case 'CONNECT_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'DISCONNECT':
      return {
        ...initialState,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context 创建
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider 组件
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // 初始化钱包服务
  useEffect(() => {
    const initWallet = async () => {
      try {
        await walletService.init();

        // 尝试恢复已保存的连接
        const savedConnection = LocalStorage.getItem<{
          address: string;
          walletType: WalletType;
        }>(WALLET_STORAGE_KEY);

        if (savedConnection) {
          // 验证连接是否仍然有效
          const isConnected = await walletService.isConnected();
          if (isConnected) {
            dispatch({
              type: 'CONNECT_SUCCESS',
              payload: savedConnection,
            });
          } else {
            // 连接已失效，清除存储
            LocalStorage.removeItem(WALLET_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      }
    };

    initWallet();
  }, []);

  // 连接钱包
  const connect = async (): Promise<void> => {
    dispatch({ type: 'CONNECT_START' });

    try {
      const result = await walletService.connect();

      // 保存到本地存储
      LocalStorage.setItem(WALLET_STORAGE_KEY, {
        address: result.address,
        walletType: result.walletType,
      });

      dispatch({
        type: 'CONNECT_SUCCESS',
        payload: result,
      });
    } catch (error: any) {
      dispatch({
        type: 'CONNECT_FAILURE',
        payload: error.message || 'Failed to connect wallet',
      });
    }
  };

  // 断开连接
  const disconnect = async (): Promise<void> => {
    try {
      await walletService.disconnect();
      LocalStorage.removeItem(WALLET_STORAGE_KEY);
      dispatch({ type: 'DISCONNECT' });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      // 即使断开失败，也清除本地状态
      LocalStorage.removeItem(WALLET_STORAGE_KEY);
      dispatch({ type: 'DISCONNECT' });
    }
  };

  // 特定钱包连接方法（这些可以通过 Privy 的特定方法实现）
  const connectWithMetamask = async (): Promise<void> => {
    dispatch({ type: 'CONNECT_START' });

    try {
      const result = await walletService.connect();

      LocalStorage.setItem(WALLET_STORAGE_KEY, {
        address: result.address,
        walletType: WalletType.METAMASK,
      });

      dispatch({
        type: 'CONNECT_SUCCESS',
        payload: result,
      });
    } catch (error: any) {
      dispatch({
        type: 'CONNECT_FAILURE',
        payload: error.message || 'Failed to connect with MetaMask',
      });
    }
  };

  const connectWithGoogle = async (): Promise<void> => {
    // Privy 不支持直接指定 Google 登录，但可以通过 UI 实现
    connect();
  };

  const connectWithTwitter = async (): Promise<void> => {
    // Privy 不支持直接指定 Twitter 登录，但可以通过 UI 实现
    connect();
  };

  const connectWithEmail = async (email: string): Promise<void> => {
    // Privy 不支持直接指定邮箱登录，但可以通过 UI 实现
    connect();
  };

  // Context 值
  const contextValue: WalletContextType = {
    state,
    connect,
    disconnect,
    connectWithMetamask,
    connectWithGoogle,
    connectWithTwitter,
    connectWithEmail,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook for using the wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};