/**
 * 简化版需求文档生成器
 * 用于从 Git 提交生成需求文档
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 在 ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RequirementDoc {
  type: string;
  number: string;
  title: string;
  content: string;
  filePath: string;
}

export interface GenerationOptions {
  branchName: string;
  commitRange?: string;
  types?: string[];
  outputDir: string;
  templateDir: string;
}

export class RequirementGenerator {
  /**
   * 生成需求文档
   */
  async generate(options: GenerationOptions): Promise<RequirementDoc[]> {
    const docs: RequirementDoc[] = [];

    // 1. 获取提交信息
    const commits = this.getCommits(options.branchName);
    if (commits.length === 0) {
      console.log('ℹ️  没有找到需要分析的提交');
      return docs;
    }

    // 2. 分析提交并分类
    const analysis = this.analyzeCommits(commits);

    // 3. 生成各类型的需求文档
    for (const [type, typeCommits] of Object.entries(analysis)) {
      if (typeCommits.length > 0) {
        const doc = await this.generateDoc(type, typeCommits, options);
        if (doc) {
          docs.push(doc);
        }
      }
    }

    // 4. 生成索引
    await this.generateIndex(docs, options);

    return docs;
  }

  /**
   * 获取提交信息
   */
  private getCommits(branchName: string): any[] {
    try {
      const output = execSync(`git log --oneline -20 ${branchName}`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');

      return lines.map(line => {
        const [hash, ...messageParts] = line.split(' ');
        return {
          hash,
          message: messageParts.join(' '),
          type: this.getCommitType(messageParts.join(' '))
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * 判断提交类型
   */
  private getCommitType(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.startsWith('feat') || lowerMessage.includes('新增') || lowerMessage.includes('添加')) {
      return 'PD'; // Product Requirement
    } else if (lowerMessage.startsWith('refactor') || lowerMessage.includes('优化') || lowerMessage.includes('重构')) {
      return 'TD'; // Technical Requirement
    } else if (lowerMessage.startsWith('fix') || lowerMessage.includes('修复') || lowerMessage.includes('bug')) {
      return 'QA'; // Quality Requirement
    } else if (lowerMessage.includes('ui') || lowerMessage.includes('界面') || lowerMessage.includes('样式')) {
      return 'UI'; // UI Requirement
    }

    return 'OTHER';
  }

  /**
   * 分析提交
   */
  private analyzeCommits(commits: any[]): { [type: string]: any[] } {
    const analysis: { [type: string]: any[] } = {
      PD: [],
      TD: [],
      QA: [],
      UI: [],
      OTHER: []
    };

    commits.forEach(commit => {
      if (analysis[commit.type]) {
        analysis[commit.type].push(commit);
      }
    });

    return analysis;
  }

  /**
   * 生成单个需求文档
   */
  private async generateDoc(type: string, commits: any[], options: GenerationOptions): Promise<RequirementDoc | null> {
    if (commits.length === 0) return null;

    const typeNames = {
      PD: '产品需求',
      TD: '技术需求',
      QA: '质量需求',
      UI: '界面需求',
      OTHER: '其他需求'
    };

    const number = this.getNextNumber(type, options.outputDir);
    const title = this.generateTitle(commits, type);

    // 简单的模板内容
    const content = this.renderTemplate({
      type: typeNames[type] || type,
      number,
      title,
      branchName: options.branchName,
      commits,
      timestamp: new Date().toLocaleString('zh-CN')
    });

    const fileName = `${type}-${number}-${this.sanitizeTitle(title)}.md`;
    const filePath = path.join(options.outputDir, fileName);

    fs.writeFileSync(filePath, content, 'utf8');

    return {
      type,
      number,
      title,
      content,
      filePath
    };
  }

  /**
   * 渲染模板
   */
  private renderTemplate(data: any): string {
    return `# ${data.type} ${data.number}: ${data.title}

## 基本信息
- **需求类型**: ${data.type}
- **生成时间**: ${data.timestamp}
- **关联分支**: ${data.branchName}

## 相关提交
${data.commits.map(c => `- ${c.hash}: ${c.message}`).join('\n')}

## 功能概述
基于提交历史分析生成的${data.type.toLowerCase()}文档。

---
*本文档由系统自动生成*
`;
  }

  /**
   * 获取下一个编号
   */
  private getNextNumber(type: string, outputDir: string): string {
    if (!fs.existsSync(outputDir)) {
      return '001';
    }

    const files = fs.readdirSync(outputDir);
    const pattern = new RegExp(`^${type}-(\\d{3})-`);
    let maxNumber = 0;

    files.forEach(file => {
      const match = file.match(pattern);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });

    return String(maxNumber + 1).padStart(3, '0');
  }

  /**
   * 生成标题
   */
  private generateTitle(commits: any[], type: string): string {
    if (commits.length === 0) return '需求文档';

    // 提取关键词
    const keywords = new Set<string>();
    commits.forEach(commit => {
      const words = commit.message
        .replace(/^(feat|fix|refactor):?\s*/i, '')
        .split(/\s+/)
        .filter(word => word.length > 1);

      words.forEach(word => {
        keywords.add(word);
      });
    });

    const keyWords = Array.from(keywords).slice(0, 3);
    return keyWords.length > 0 ? keyWords.join('、') : '需求文档';
  }

  /**
   * 清理标题
   */
  private sanitizeTitle(title: string): string {
    return title
      .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  }

  /**
   * 生成索引
   */
  private async generateIndex(docs: RequirementDoc[], options: GenerationOptions): Promise<void> {
    const content = `# ${options.branchName} 需求文档索引

生成时间: ${new Date().toLocaleString('zh-CN')}

## 文档列表

${docs.map(doc => `- [${doc.title}](${path.basename(doc.filePath)})`).join('\n')}

---

总计: ${docs.length} 个文档
`;

    fs.writeFileSync(path.join(options.outputDir, 'index.md'), content, 'utf8');
  }
}