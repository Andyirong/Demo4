/**
 * Branch Archive Skill
 * 分支归档自动化工具
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 在 ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // 从需求文档提取变更信息
  async extractRequirementInfo(branchName: string): Promise<{
    summary: string;
    requirements: Array<{
      type: string;
      title: string;
      description: string;
      commits: string[];
    }>;
  }> {
    const requirementsDir = path.join('archives', branchName, 'requirements');

    if (!fs.existsSync(requirementsDir)) {
      return {
        summary: '暂无需求文档',
        requirements: []
      };
    }

    const requirements: Array<{
      type: string;
      title: string;
      description: string;
      commits: string[];
    }> = [];

    try {
      const files = fs.readdirSync(requirementsDir)
        .filter(file => file.endsWith('.md') && file !== 'index.md');

      for (const file of files) {
        const filePath = path.join(requirementsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // 解析需求文档
        const typeMatch = file.match(/^(PD|TD|QA|UI|OTHER)-\d+/);
        const type = typeMatch ? typeMatch[1] : 'OTHER';

        // 提取标题
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

        // 提取功能概述
        const overviewMatch = content.match(/## 功能概述\s*\n\n(.+?)(?=\n\n|\n#|$)/s);
        const description = overviewMatch ? overviewMatch[1].trim() : '暂无描述';

        // 提取相关提交
        const commitSection = content.match(/## 相关提交\s*\n\n(.+?)(?=\n\n|\n#|$)/s);
        let commits: string[] = [];
        if (commitSection) {
          commits = commitSection[1]
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.trim().replace(/^-\s*/, ''));
        }

        requirements.push({
          type,
          title,
          description,
          commits
        });
      }
    } catch (error) {
      console.error('读取需求文档失败:', error);
    }

    // 生成需求总结
    const summary = this.generateRequirementSummary(requirements);

    return {
      summary,
      requirements
    };
  },

  // 生成需求总结
  generateRequirementSummary(requirements: Array<any>): string {
    if (requirements.length === 0) {
      return '本分支暂无需求文档';
    }

    const typeCounts = {
      PD: 0,
      TD: 0,
      QA: 0,
      UI: 0,
      OTHER: 0
    };

    requirements.forEach(req => {
      typeCounts[req.type as keyof typeof typeCounts]++;
    });

    const summaryParts: string[] = [];

    if (typeCounts.PD > 0) {
      summaryParts.push(`${typeCounts.PD}个产品需求`);
    }
    if (typeCounts.TD > 0) {
      summaryParts.push(`${typeCounts.TD}个技术需求`);
    }
    if (typeCounts.QA > 0) {
      summaryParts.push(`${typeCounts.QA}个质量需求`);
    }
    if (typeCounts.UI > 0) {
      summaryParts.push(`${typeCounts.UI}个界面需求`);
    }
    if (typeCounts.OTHER > 0) {
      summaryParts.push(`${typeCounts.OTHER}个其他需求`);
    }

    return `本分支包含${requirements.length}个需求：${summaryParts.join('、')}`;
  },

  // 生成 README 内容
  async generateReadme(branchName: string, commitId: string): Promise<string> {
    const date = new Date().toISOString().split('T')[0];
    const changes = await this.analyzeChanges();
    const files = await this.getChangedFiles();
    const requirementInfo = await this.extractRequirementInfo(branchName);

    let content = `# ${branchName} 分支归档

## 概述
本归档包含 \`${branchName}\` 分支的所有文档说明，记录了本次开发的完整内容。

## 归档信息
- **归档日期**：${date}
- **分支名称**：${branchName}
- **最新提交ID**：${commitId}
- **状态**：已完成并归档

## 需求变更总览
${requirementInfo.summary}
`;

    // 添加详细需求信息
    if (requirementInfo.requirements.length > 0) {
      content += '\n### 📋 需求详情\n';

      // 按类型分组
      const grouped = requirementInfo.requirements.reduce((acc, req) => {
        if (!acc[req.type]) {
          acc[req.type] = [];
        }
        acc[req.type].push(req);
        return acc;
      }, {} as Record<string, typeof requirementInfo.requirements>);

      const typeNames = {
        PD: '🎯 产品需求 (PD)',
        TD: '⚙️ 技术需求 (TD)',
        QA: '🐛 质量需求 (QA)',
        UI: '🎨 界面需求 (UI)',
        OTHER: '📌 其他需求 (OTHER)'
      };

      for (const [type, reqs] of Object.entries(grouped)) {
        content += `\n#### ${typeNames[type as keyof typeof typeNames]}\n`;
        reqs.forEach(req => {
          content += `\n- **${req.title}**\n`;
          content += `  ${req.description}\n`;
          if (req.commits.length > 0) {
            content += `  - 相关提交：${req.commits.slice(0, 3).join(', ')}\n`;
            if (req.commits.length > 3) {
              content += `  - 及其他 ${req.commits.length - 3} 个提交\n`;
            }
          }
        });
      }
    }

    content += `\n## 主要变更内容
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
├── requirements/             # 需求文档目录
│   ├── PD-*.md              # 产品需求
│   ├── TD-*.md              # 技术需求
│   ├── QA-*.md              # 质量需求
│   ├── UI-*.md              # 界面需求
│   ├── OTHER-*.md           # 其他需求
│   └── index.md             # 需求文档索引
├── documentation/           # 文档目录
│   └── file-list.md         # 完整文件变更清单
└── meta/                    # 元信息目录
    └── git-info.txt         # Git 基本信息
\`\`\`

## 注意事项
本归档由自动化工具生成，记录了分支开发过程中的所有重要变更，用于后续参考和审计。

## 查看需求文档
详细的需求文档请查看 \`requirements/\` 目录下的各个文件。
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

  // 获取项目名称
  async getProjectName(): Promise<string> {
    try {
      // 方法1: 从 git remote 获取项目名称
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      const urlParts = remoteUrl.split('/');
      const repoName = urlParts[urlParts.length - 1];
      const projectName = repoName.replace('.git', '');
      return projectName;
    } catch {
      try {
        // 方法2: 从当前目录名获取项目名称
        const cwd = process.cwd();
        return path.basename(cwd);
      } catch {
        // 方法3: 默认使用 'project'
        return 'project';
      }
    }
  },

  // 获取下一个分支编号
  async getNextBranchNumber(): Promise<string> {
    try {
      // 获取所有远程分支
      const branches = execSync('git branch -r', { encoding: 'utf8' });
      const branchNumbers: number[] = [];
      const projectName = await this.getProjectName();

      // 使用动态项目名称匹配分支
      const branchPattern = new RegExp(`${projectName}-(\\d{3})`);

      branches.split('\n').forEach(branch => {
        const match = branch.trim().match(branchPattern);
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
    const projectName = await this.getProjectName();
    const newBranchName = `${projectName}-${nextNumber}`;

    try {
      // 获取当前分支
      let currentBranch: string;
      try {
        currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      } catch {
        const ref = execSync('git symbolic-ref -q HEAD', { encoding: 'utf8' }).trim();
        currentBranch = ref.replace('refs/heads/', '');
      }

      console.log(`📌 基于 ${currentBranch} 分支创建新分支`);

      // 直接从当前分支创建新分支（保留所有文件和配置）
      execSync(`git checkout -b ${newBranchName}`, { encoding: 'utf8' });

      // 推送新分支到远程（设置 upstream 但不创建 PR）
      execSync(`git push -u origin ${newBranchName}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'] // 忽略 stderr 输出，避免显示 PR 提示
      });

      if (description) {
        console.log(`✅ 新分支 ${newBranchName} 已创建并推送`);
        console.log(`📝 描述: ${description}`);
        console.log(`💡 基于 ${currentBranch} 创建，保留所有配置和文件`);
        console.log(`💡 不会自动创建 Pull Request`);
      } else {
        console.log(`✅ 新分支 ${newBranchName} 已创建并推送`);
        console.log(`💡 基于 ${currentBranch} 创建，保留所有配置和文件`);
        console.log(`💡 不会自动创建 Pull Request`);
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

备注:
- 本归档由 branch-archive skill 自动生成
- 临时文件存储在 temp/ 目录
- 归档完成后会自动清理临时文件
`;
    fs.writeFileSync(path.join(metaPath, 'git-info.txt'), gitInfo);

    return archivePath;
  },

  // 生成动态提交信息
  async generateCommitMessage(branchName: string): Promise<string> {
    const changes = await this.analyzeChanges();
    const files = await this.getChangedFiles();

    let commitMessage = `feat: 完成${branchName}分支功能开发\n\n`;

    // 添加功能描述
    if (changes.features.length > 0) {
      commitMessage += '✨ 新增功能:\n';
      changes.features.forEach(feat => {
        commitMessage += `- ${feat}\n`;
      });
      commitMessage += '\n';
    }

    // 添加修复内容
    if (changes.fixes.length > 0) {
      commitMessage += '🐛 Bug 修复:\n';
      changes.fixes.forEach(fix => {
        commitMessage += `- ${fix}\n`;
      });
      commitMessage += '\n';
    }

    // 添加文档更新
    if (changes.docs.length > 0) {
      commitMessage += '📚 文档更新:\n';
      changes.docs.forEach(doc => {
        commitMessage += `- ${doc}\n`;
      });
      commitMessage += '\n';
    }

    // 添加文件统计
    commitMessage += `📊 统计信息:\n`;
    commitMessage += `- 文件变更: ${files.length} 个\n`;

    if (files.length > 0) {
      commitMessage += `- 代码行数: ${await this.getLineCount()} 行新增\n`;
    }

    commitMessage += `\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;

    return commitMessage;
  },

  // 获取代码行数统计
  async getLineCount(): Promise<string> {
    try {
      const output = execSync('git diff --stat HEAD~1', { encoding: 'utf8' });
      const match = output.match(/(\d+)\s*insertion/);
      return match ? match[1] : '0';
    } catch {
      return '0';
    }
  },

  // 主执行函数
  async execute(args: SkillArgs = {}): Promise<any> {
    const { push = false, newBranch = false, description = '', branchName } = args;
  const requirements = true;  // 固定为 true，用于测试 README 生成

    try {
      console.log('\n🚀 开始分支归档流程...');
      console.log('\n📊 归档配置:');
      console.log(`  - 推送远程: ${push ? '✅ 是' : '❌ 否'}`);
      console.log(`  - 创建新分支: ${newBranch ? '✅ 是' : '❌ 否'}`);
      console.log(`  - 生成需求文档: ${requirements ? '✅ 是' : '❌ 否'}`);
      console.log('');

      // 步骤1: 使用指定的分支名或获取当前分支
      const currentBranch = branchName || await this.getCurrentBranch();
      const commitId = await this.getCurrentCommit();

      console.log(`📦 归档分支: ${currentBranch}`);
      console.log(`📝 最新提交: ${commitId}`);

      // 步骤2: 创建归档目录结构和生成文档
      console.log('📁 创建归档目录结构...');
      const archivePath = await this.createArchive(currentBranch, commitId);
      console.log(`✅ 归档文档生成完成: ${archivePath}`);

      // 步骤2.5: 处理需求文档
      if (requirements) {
        console.log('📋 处理需求文档...');

        // 首先检查是否已有需求文档
        const existingRequirementsDir = path.join('archives', currentBranch, 'requirements');
        let hasExistingDocs = false;

        try {
          if (fs.existsSync(existingRequirementsDir)) {
            const existingFiles = fs.readdirSync(existingRequirementsDir)
              .filter(file => file.endsWith('.md') && file !== 'index.md');

            if (existingFiles.length > 0) {
              console.log(`📖 发现已有的需求文档: ${existingFiles.length} 个`);
              console.log(`✅ 已读取 ${existingFiles.length} 个需求文档`);
              hasExistingDocs = true;
            }
          }
        } catch (error) {
          console.error('⚠️ 读取已有需求文档失败:', error);
        }

        // 如果没有已有文档，则生成新的需求文档
        if (!hasExistingDocs) {
          console.log('📝 生成新的需求文档...');
          try {
            // 执行 requirements 命令生成文档
            execSync(`node .claude/skills/req-gen/scripts/requirements.cjs --branch=${currentBranch}`, {
              encoding: 'utf8',
              cwd: process.cwd()
            });

            // 读取生成的需求文档
            const requirementsDir = path.join('archives', currentBranch, 'requirements');
            if (fs.existsSync(requirementsDir)) {
              const generatedFiles = fs.readdirSync(requirementsDir)
                .filter(file => file.endsWith('.md') && file !== 'index.md');

              if (generatedFiles.length > 0) {
                console.log(`✅ 已生成并读取 ${generatedFiles.length} 个新需求文档`);
              }
            }
          } catch (error) {
            console.error('❌ 生成需求文档失败:', error);
          }
        }

        // 将需求文档复制到归档目录中（如果不在同一位置）
        const archiveRequirementsDir = path.join(archivePath, 'requirements');
        if (fs.existsSync(existingRequirementsDir) && existingRequirementsDir !== archiveRequirementsDir) {
          try {
            // 复制所有需求文档到归档目录
            fs.mkdirSync(archiveRequirementsDir, { recursive: true });
            const filesToCopy = fs.readdirSync(existingRequirementsDir);

            for (const file of filesToCopy) {
              const srcPath = path.join(existingRequirementsDir, file);
              const destPath = path.join(archiveRequirementsDir, file);
              fs.copyFileSync(srcPath, destPath);
            }

            console.log(`✅ 已将需求文档复制到归档目录`);
          } catch (error) {
            console.error('⚠️ 复制需求文档到归档目录失败:', error);
          }
        }
      }

      // 步骤3: 添加所有修改和新增的文件到暂存区
      console.log('📚 添加文件到暂存区...');
      execSync('git add .', { encoding: 'utf8' });
      console.log('✅ 已添加所有文件到暂存区');

      // 步骤4: 创建提交，记录功能完成
      console.log('💾 创建提交...');
      const commitMessage = await this.generateCommitMessage(currentBranch);
      execSync(`git commit -m "${commitMessage}"`, { encoding: 'utf8' });
      console.log('✅ 提交创建完成');

      // 步骤5: 提交并推送当前分支到远程
      if (push) {
        console.log('📤 推送当前分支到远程...');
        execSync(`git push origin ${currentBranch}`, { encoding: 'utf8' });
        console.log(`✅ 已推送到远程: ${currentBranch}`);
      }

      // 步骤6: 确定项目名称并生成新分支编号
      let newBranchName: string | null = null;
      if (newBranch) {
        console.log('🔢 生成新分支编号...');
        const projectName = await this.getProjectName();
        const nextNumber = await this.getNextBranchNumber();
        newBranchName = `${projectName}-${nextNumber}`;
        console.log(`✅ 新分支名称: ${newBranchName}`);
      }

      // 步骤7: 创建并推送新开发分支
      if (newBranch && newBranchName) {
        console.log('🌱 创建新的开发分支...');

        // 从当前分支创建新分支
        execSync(`git checkout -b ${newBranchName}`, { encoding: 'utf8' });
        console.log(`✅ 已从 ${currentBranch} 创建新分支 ${newBranchName}`);

        // 推送新分支到远程
        if (push) {
          execSync(`git push -u origin ${newBranchName}`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'] // 忽略 stderr 输出，避免显示 PR 提示
          });
          console.log(`✅ 新分支已推送到远程: ${newBranchName}`);
          console.log(`💡 可通过以下链接创建 PR: https://github.com/Andyirong/Pomodoro/pull/new/${newBranchName}`);
        }
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

// 如果直接运行此文件，执行归档操作
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  (async () => {
    console.log('🚀 开始执行分支归档...');
    const result = await branchArchiveSkill.execute();
    console.log('\n✅ 归档结果:', result);
  })().catch(console.error);
}

export default branchArchiveSkill;