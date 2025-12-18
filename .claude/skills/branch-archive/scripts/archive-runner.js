#!/usr/bin/env node

/**
 * Archive Runner - 实时输出执行结果的归档脚本
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeWithRealTimeOutput(command, args = []) {
  return new Promise((resolve, reject) => {
    log(`\n🚀 执行命令: ${command} ${args.join(' ')}`, 'cyan');

    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      // 实时输出，但过滤掉一些不重要的信息
      if (!output.includes('error: unknown option') &&
          !output.includes('usage: git branch')) {
        process.stdout.write(output);
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      // 只显示重要的错误信息
      if (!output.includes('error: unknown option') &&
          !output.includes('usage: git branch')) {
        process.stderr.write(`${colors.red}${output}${colors.reset}`);
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`\n✅ 命令执行成功`, 'green');
        resolve({ stdout, stderr, code });
      } else {
        log(`\n❌ 命令执行失败，退出码: ${code}`, 'red');
        reject(new Error(stderr || `命令失败，退出码: ${code}`));
      }
    });

    child.on('error', (error) => {
      log(`\n❌ 执行错误: ${error.message}`, 'red');
      reject(error);
    });
  });
}

async function main() {
  try {
    log('\n🎯 开始执行分支归档...', 'blue');

    // 获取参数
    const args = process.argv.slice(2);
    const push = args.includes('--push=false') ? false : true;
    const newBranch = args.includes('--new-branch=false') ? false : true;
    const requirements = args.includes('--requirements=false') ? false : true;

    // 显示配置
    log('\n📋 归档配置:', 'yellow');
    log(`  - 推送远程: ${push ? '✅ 是' : '❌ 否'}`, push ? 'green' : 'red');
    log(`  - 创建新分支: ${newBranch ? '✅ 是' : '❌ 否'}`, newBranch ? 'green' : 'red');
    log(`  - 生成需求文档: ${requirements ? '✅ 是' : '❌ 否'}`, requirements ? 'green' : 'red');

    // 执行 TypeScript 归档脚本
    const scriptPath = path.join(__dirname, 'skill.ts');
    const tsxArgs = [scriptPath, ...args];

    // 检查 tsx 是否可用
    try {
      execSync('which tsx', { stdio: 'ignore' });
    } catch {
      log('\n⚠️  tsx 未安装，尝试使用 npx tsx...', 'yellow');
      tsxArgs.unshift('tsx');
    }

    // 执行归档
    await executeWithRealTimeOutput(
      tsxArgs.includes('tsx') ? 'npx' : 'tsx',
      tsxArgs
    );

    log('\n🎉 归档完成！', 'green');

    // 显示结果摘要
    if (newBranch) {
      try {
        const currentBranch = execSync('git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        log(`\n📍 当前分支: ${currentBranch}`, 'blue');
      } catch {
        log('\n📍 已切换到新分支', 'blue');
      }
    }

  } catch (error) {
    log(`\n💥 归档失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 处理中断信号
process.on('SIGINT', () => {
  log('\n\n⚠️  归档被用户中断', 'yellow');
  process.exit(1);
});

// 执行主函数
if (require.main === module) {
  main();
}