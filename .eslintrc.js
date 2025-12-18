module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'boundaries',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Boundaries rules
    'boundaries/no-unknown-files': [
      'error',
      {
        // 允许的根目录文件
        allowed: [
          '*.config.js',
          '*.config.ts',
          '*.json',
          '*.md',
          '*.html',
          '.env*',
          '.gitignore',
          '.DS_Store',
          '.*rc.*',
          'LICENSE',
          'package*.json',
          'tsconfig.json',
          'yarn.lock',
          'package-lock.json',
        ],
      },
    ],
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            from: 'components',
            allow: ['components', 'services', 'utils', 'types'],
          },
          {
            from: 'services',
            allow: ['services', 'utils', 'types'],
          },
          {
            from: 'utils',
            allow: ['utils', 'types'],
          },
          {
            from: 'types',
            allow: ['types'],
          },
          {
            from: 'context',
            allow: ['components', 'services', 'utils', 'types'],
          },
        ],
      },
    ],
    'boundaries/no-unknown': [
      'error',
      {
        allow: [
          // React 相关
          'react',
          'react-dom',
          'react-*',
          // 已知的库
          'lucide-react',
          'recharts',
          '@privy-io/*',
          // Node.js 内置
          'node:*',
          'path',
          'fs',
          // Vite 相关
          '*.scss',
          '*.css',
          // 类型
          '*.d.ts',
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    boundaries: {
      elements: [
        {
          type: 'components',
          pattern: 'src/components/**/*',
          mode: 'file',
        },
        {
          type: 'services',
          pattern: 'src/services/**/*',
          mode: 'file',
        },
        {
          type: 'utils',
          pattern: 'src/utils/**/*',
          mode: 'file',
        },
        {
          type: 'types',
          pattern: 'src/types/**/*',
          mode: 'file',
        },
        {
          type: 'context',
          pattern: 'src/context/**/*',
          mode: 'file',
        },
        {
          type: 'styles',
          pattern: 'src/styles/**/*',
          mode: 'file',
        },
      ],
    },
  },
};