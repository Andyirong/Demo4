/**
 * Branch Archive Skill
 * 分支归档自动化工具
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface SkillArgs {
  push?: boolean;
  newBranch?: boolean;
  description?: string;
  branchName?: string;
}

interface GitInfo {
  currentBranch: string;
  currentCommit: string;
  changes: {
    features: string[];
    fixes: string[];
    configs: string[];
    docs: string[];
    tests: string[];
    others: string[];
  };
  files: string[];
}

const branchArchiveSkill = {
  name: 'branch-archive',
  description: '自动化归档已完成的功能分支',
  author: 'Claude Code',
  version: '1.0.0',

  // 斜杠命令配置
  slashCommand: {
    name: 'archive',
    description: '归档当前分支并创建新分支',
    usage: '/archive [选项]',
    examples: [
      '/archive',
      '/archive --push=false',
      '/archive --description="新功能开发"',
      '/archive --push=false --new-branch=false'
    ],
    args: {
      optional: [
        {
          name: 'push',
          type: 'boolean',
          description: '是否提交并推送当前分支（默认: true）'
        },
        {
          name: 'newBranch',
          type: 'boolean',
          description: '是否创建新的开发分支（默认: true）'
        },
        {
          name: 'description',
          type: 'string',
          description: '新分支的描述信息'
        }
      ]
    }
  },

  // 获取当前分支信息
  async getCurrentBranch(): Promise<string> {
    try {
      // 尝试使用新版本 Git 命令
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch {
      // 兼容旧版本 Git
      try {
        const ref = execSync('git symbolic-ref -q HEAD', { encoding: 'utf8' }).trim();
        return ref.replace('refs/heads/', '');
      } catch {
        return 'unknown';
      }
    }
  },

  // 获取当前提交ID
  async getCurrentCommit(): Promise<string> {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  },

  // 分析变更内容
  async analyzeChanges(): Promise<GitInfo['changes']> {
    const changes: GitInfo['changes'] = {
      features: [],
      fixes: [],
      configs: [],
      docs: [],
      tests: [],
      others: []
    };

    try {
      // 获取提交信息
      const commits = execSync('git log --oneline -20', { encoding: 'utf8' });
      const commitMessages = commits.trim().split('\n');

      // 分析提交信息
      commitMessages.forEach(msg => {
        const message = msg.replace(/^\w+\s+/, ''); // 移除 commit hash
        if (message.includes('feat') || message.includes('新增') || message.includes('添加')) {
          changes.features.push(message);
        } else if (message.includes('fix') || message.includes('修复') || message.includes('bug')) {
          changes.fixes.push(message);
        } else if (message.includes('config') || message.includes('配置') || message.includes('.config')) {
          changes.configs.push(message);
        } else if (message.includes('docs') || message.includes('文档') || message.includes('README')) {
          changes.docs.push(message);
        } else if (message.includes('test') || message.includes('spec')) {
          changes.tests.push(message);
        } else if (message.length > 0) {
          changes.others.push(message);
        }
      });
    } catch (error) {
      console.warn('分析变更失败:', error);
    }

    return changes;
  },

  // 获取变更文件列表
  async getChangedFiles(): Promise<string[]> {
    try {
      // 尝试获取与 main 分支的差异
      const output = execSync('git diff --name-only main...', { encoding: 'utf8' });
      return output.trim().split('\n').filter(f => f.length > 0);
    } catch {
      // 如果失败，获取最近的变更
      try {
        const output = execSync('git diff --name-only HEAD~10', { encoding: 'utf8' });
        return output.trim().split('\n').filter(f => f.length > 0);
      } catch {
        return [];
      }
    }
  },

  // 生成 README 内容
  async generateReadme(branchName: string, commitId: string): Promise<string> {
    const date = new Date().toISOString().split('T')[0];
    const changes = await this.analyzeChanges();
    const files = await this.getChangedFiles();

    let content = `# ${branchName} 分支归档

## 概述
本归档包含 \`${branchName}\` 分支的所有文档说明，记录了本次开发的完整内容。

## 归档信息
- **归档日期**：${date}
- **分支名称**：${branchName}
- **最新提交ID**：${commitId}
- **状态**：已完成并归档

## 主要变更内容
`;

    // 根据实际变更生成内容
    if (changes.features.length > 0) {
      content += '\n### ✨ 新增功能\n';
      changes.features.forEach(feat => {
        content += `- ${feat}\n`;
      });
    }

    if (changes.fixes.length > 0) {
      content += '\n### 🐛 Bug 修复\n';
      changes.fixes.forEach(fix => {
        content += `- ${fix}\n`;
      });
    }

    if (changes.configs.length > 0) {
      content += '\n### ⚙️ 配置修改\n';
      changes.configs.forEach(conf => {
        content += `- ${conf}\n`;
      });
    }

    if (changes.tests.length > 0) {
      content += '\n### 🧪 测试相关\n';
      changes.tests.forEach(test => {
        content += `- ${test}\n`;
      });
    }

    if (changes.docs.length > 0) {
      content += '\n### 📚 文档更新\n';
      changes.docs.forEach(doc => {
        content += `- ${doc}\n`;
      });
    }

    if (changes.others.length > 0) {
      content += '\n### 🔧 其他变更\n';
      changes.others.forEach(other => {
        content += `- ${other}\n`;
      });
    }

    // 添加文件统计
    content += `\n## 文件变更统计
- 修改文件数：${files.length} 个
`;

    if (files.length > 0) {
      content += '\n### 主要文件\n';
      files.slice(0, 10).forEach(file => {
        content += `- ${file}\n`;
      });
      if (files.length > 10) {
        content += `- ...及其他 ${files.length - 10} 个文件\n`;
      }
    }

    content += `\n## 归档结构
\`\`\`
archives/${branchName}/
├── README.md                 # 本文件
├── documentation/           # 文档目录
│   └── file-list.md         # 完整文件变更清单
└── meta/                    # 元信息目录
    └── git-info.txt         # Git 基本信息
\`\`\`

## 注意事项
本归档由自动化工具生成，记录了分支开发过程中的所有重要变更，用于后续参考和审计。
`;

    return content;
  },

  // 生成文件清单
  async generateFileList(): Promise<string> {
    const date = new Date().toISOString().split('T')[0];
    const files = await this.getChangedFiles();

    let content = `# 分支文件变更清单

## 修改日期
${date}

## 文件变更统计
- 变更文件数：${files.length} 个

## 详细变更列表

`;

    if (files.length > 0) {
      content += '### 修改的文件\n';
      files.forEach((file, index) => {
        content += `${index + 1}. **${file}**\n`;

        // 分析文件类型
        let fileType = '未知类型';
        if (file.includes('src/') || file.includes('source/')) {
          fileType = '源代码文件';
        } else if (file.includes('test') || file.includes('spec')) {
          fileType = '测试文件';
        } else if (file.includes('docs/') || file.includes('README')) {
          fileType = '文档文件';
        } else if (file.includes('.config') || file.includes('config.')) {
          fileType = '配置文件';
        } else if (file.includes('.claude/')) {
          fileType = 'Claude 配置';
        }

        content += `   - 路径：${file}\n`;
        content += `   - 类型：${fileType}\n\n`;
      });
    } else {
      content += '无文件变更\n';
    }

    content += `## 备注
此清单由自动化工具生成于 ${date}，记录了分支的所有文件变更。
`;

    return content;
  },

  // 获取下一个分支编号
  async getNextBranchNumber(): Promise<string> {
    try {
      // 获取所有远程分支
      const branches = execSync('git branch -r', { encoding: 'utf8' });
      const branchNumbers: number[] = [];

      branches.split('\n').forEach(branch => {
        const match = branch.trim().match(/demo4-(\d{3})/);
        if (match) {
          branchNumbers.push(parseInt(match[1]));
        }
      });

      const nextNum = branchNumbers.length > 0 ? Math.max(...branchNumbers) + 1 : 1;
      return String(nextNum).padStart(3, '0');
    } catch {
      return '001';
    }
  },

  // 创建新分支
  async createNewBranch(description?: string): Promise<string> {
    const nextNumber = await this.getNextBranchNumber();
    const newBranchName = `demo4-${nextNumber}`;

    try {
      // 切换到 main 分支并更新
      execSync('git checkout main', { encoding: 'utf8' });
      execSync('git pull origin main', { encoding: 'utf8' });

      // 创建并切换到新分支
      execSync(`git checkout -b ${newBranchName}`, { encoding: 'utf8' });

      // 推送新分支到远程（设置 upstream 但不创建 PR）
      execSync(`git push -u origin ${newBranchName}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'] // 忽略 stderr 输出，避免显示 PR 提示
      });

      if (description) {
        console.log(`✅ 新分支 ${newBranchName} 已创建并推送`);
        console.log(`📝 描述: ${description}`);
        console.log(`💡 分支已准备好进行开发，不会自动创建 PR`);
      } else {
        console.log(`✅ 新分支 ${newBranchName} 已创建并推送`);
        console.log(`💡 分支已准备好进行开发，不会自动创建 PR`);
      }

      return newBranchName;
    } catch (error) {
      console.error('创建新分支失败:', error);
      throw error;
    }
  },

  // 提交并推送
  async commitAndPush(): Promise<void> {
    try {
      // 检查是否有未提交的更改
      const status = execSync('git status --porcelain', { encoding: 'utf8' });

      if (status.trim()) {
        // 有未提交的更改，执行提交
        execSync('git add .', { encoding: 'utf8' });
        execSync('git commit -m "完成分支归档\n\n🤖 Generated with Branch Archive Skill"', { encoding: 'utf8' });
        console.log('已提交本地更改');
      }

      // 推送到远程
      let currentBranch: string;
      try {
        currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      } catch {
        const ref = execSync('git symbolic-ref -q HEAD', { encoding: 'utf8' }).trim();
        currentBranch = ref.replace('refs/heads/', '');
      }

      execSync(`git push origin ${currentBranch}`, { encoding: 'utf8' });
      console.log(`已推送到远程: ${currentBranch}`);
    } catch (error) {
      console.error('提交推送失败:', error);
      throw error;
    }
  },

  // 创建归档
  async createArchive(branchName: string, commitId: string): Promise<string> {
    const archivesDir = 'archives';
    const archivePath = path.join(archivesDir, branchName);
    const docPath = path.join(archivePath, 'documentation');
    const metaPath = path.join(archivePath, 'meta');

    // 创建目录
    fs.mkdirSync(docPath, { recursive: true });
    fs.mkdirSync(metaPath, { recursive: true });

    // 生成 README
    const readme = await this.generateReadme(branchName, commitId);
    fs.writeFileSync(path.join(archivePath, 'README.md'), readme);

    // 生成文件清单
    const fileList = await this.generateFileList();
    fs.writeFileSync(path.join(docPath, 'file-list.md'), fileList);

    // 生成 Git 信息
    const gitInfo = `Git 基本信息
===========

分支名称: ${branchName}
最新提交: ${commitId}
归档日期: ${new Date().toISOString().split('T')[0]}

分支状态:
- 状态: 已完成并归档
- 远程分支: 存在
- 归档位置: archives/${branchName}/
`;
    fs.writeFileSync(path.join(metaPath, 'git-info.txt'), gitInfo);

    return archivePath;
  },

  // 主执行函数
  async execute(args: SkillArgs = {}): Promise<any> {
    const { push = true, newBranch = true, description = '', branchName } = args;

    try {
      console.log('\n🚀 开始分支归档流程...\n');

      // 使用指定的分支名或获取当前分支
      const currentBranch = branchName || await this.getCurrentBranch();
      const commitId = await this.getCurrentCommit();

      console.log(`📦 归档分支: ${currentBranch}`);
      console.log(`📝 最新提交: ${commitId}`);

      // 创建归档
      const archivePath = await this.createArchive(currentBranch, commitId);
      console.log(`✅ 归档完成: ${archivePath}`);

      // 提交并推送
      if (push) {
        await this.commitAndPush();
        console.log('📤 已推送到远程仓库');
      }

      // 创建新分支
      let newBranchName: string | null = null;
      if (newBranch) {
        newBranchName = await this.createNewBranch(description);
        console.log(`🌱 新分支: ${newBranchName}`);
      }

      return {
        success: true,
        currentBranch,
        commitId,
        archivePath,
        newBranch: newBranchName,
        message: '分支归档成功完成'
      };

    } catch (error) {
      console.error('❌ 归档失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
};

export default branchArchiveSkill;