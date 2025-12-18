import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PrivyProvider } from '@privy-io/react-auth';

// 添加调试日志
console.log('App starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <PrivyProvider
      appId="cmayugmew01guju0m8b6nrsnv"
      clientId="client-WY6LLc5LfQiMXdMzrVy88RnPQQQgPgGxq95ogMz1eN3ZS"
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#6366f1'
        },
        embeddedWallets: {
          createOnLogin: 'all-users'
        },
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord']
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);