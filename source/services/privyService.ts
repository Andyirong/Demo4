// Privy 服务 - 使用全局变量方式
declare global {
  interface Window {
    privy?: any;
  }
}

import { WalletType, WalletState } from '../types/wallet';
import { LocalStorage } from '../utils/storage';

// Privy 配置
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'cmayugmew01guju0m8b6nrsnv';

// 钱包服务类
export class PrivyService {
  private isInitialized = false;
  private privy: any = null;

  // 初始化服务
  async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // 检查是否已经通过 CDN 加载了 Privy
      if (window.privy) {
        this.initializePrivy(resolve, reject);
        return;
      }

      // 动态加载 Privy 脚本
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@privy-io/react-auth@latest/dist/index.global.js';
      script.async = true;

      script.onload = () => {
        console.log('Privy script loaded');
        this.initializePrivy(resolve, reject);
      };

      script.onerror = (error) => {
        console.error('Failed to load Privy script:', error);
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  // 初始化 Privy
  private async initializePrivy(resolve: Function, reject: Function) {
    try {
      if (!window.privy || !window.privy.createPrivy) {
        throw new Error('Privy not available');
      }

      this.privy = await window.privy.createPrivy({
        appId: PRIVY_APP_ID,
        config: {
          appearance: {
            theme: 'dark',
            accentColor: '#00d4ff',
          },
          loginMethods: ['email', 'google', 'twitter', 'discord', 'wallet'],
          embeddedWallets: {
            createOnLogin: 'all-users',
          },
          defaultChain: 'ethereum',
        },
      });

      this.isInitialized = true;
      console.log('Privy initialized successfully');
      resolve();
    } catch (error) {
      console.error('Failed to initialize Privy:', error);
      reject(error);
    }
  }

  // 连接钱包
  async connect(): Promise<{ address: string; walletType: WalletType }> {
    if (!this.isInitialized || !this.privy) {
      await this.init();
    }

    try {
      console.log('Starting Privy authentication...');
      const authResult = await this.privy.authenticate();

      console.log('Auth result:', authResult);

      if (authResult && authResult.user) {
        const walletAccount = authResult.user.linkedAccounts.find(
          (account: any) => account.type === 'wallet' || account.type === 'embedded_wallet'
        );

        if (walletAccount && walletAccount.address) {
          let walletType: WalletType = WalletType.METAMASK;

          if (authResult.user.loginMethod === 'google') {
            walletType = WalletType.GOOGLE;
          } else if (authResult.user.loginMethod === 'twitter') {
            walletType = WalletType.TWITTER;
          } else if (authResult.user.loginMethod === 'discord') {
            walletType = WalletType.DISCORD;
          } else if (authResult.user.loginMethod === 'email') {
            walletType = WalletType.EMAIL;
          }

          const result = {
            address: walletAccount.address,
            walletType,
          };

          LocalStorage.setItem('wallet_connection', result);
          console.log('Wallet connected successfully:', result);
          return result;
        }
      }
      throw new Error('Failed to get wallet address from Privy');
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  // 断开连接
  async disconnect(): Promise<void> {
    if (this.privy) {
      try {
        await this.privy.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    LocalStorage.removeItem('wallet_connection');
    console.log('Wallet disconnected');
  }

  // 获取已连接的钱包状态
  async getConnectedWallet(): Promise<{ address: string; walletType: WalletType } | null> {
    if (!this.isInitialized || !this.privy) {
      // 从本地存储获取
      const savedConnection = LocalStorage.getItem<{
        address: string;
        walletType: WalletType;
      }>('wallet_connection');
      return savedConnection || null;
    }

    try {
      const isAuthenticated = await this.privy.isAuthenticated();
      if (isAuthenticated) {
        const user = await this.privy.getAuthenticatedUser();
        if (user && user.linkedAccounts) {
          const wallet = user.linkedAccounts.find(
            (account: any) => account.type === 'wallet' || account.type === 'embedded_wallet'
          );
          if (wallet && wallet.address) {
            const savedConnection = LocalStorage.getItem('wallet_connection');
            return {
              address: wallet.address,
              walletType: savedConnection?.walletType || WalletType.METAMASK,
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get connected wallet:', error);
      const savedConnection = LocalStorage.getItem<{
        address: string;
        walletType: WalletType;
      }>('wallet_connection');
      return savedConnection || null;
    }
  }

  // 检查是否已连接
  async isConnected(): Promise<boolean> {
    const wallet = await this.getConnectedWallet();
    return wallet !== null;
  }
}

// 导出单例实例
export const privyService = new PrivyService();