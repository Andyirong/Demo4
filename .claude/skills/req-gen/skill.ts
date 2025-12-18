/**
 * Requirement Generator Skill
 * 需求文档生成自动化工具
 */

import { execSync, spawn } from 'child_process';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 在 ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SkillArgs {
  output?: string;
  branch?: string;
  limit?: number;
  types?: string;
}

interface RequirementDoc {
  type: string;
  number: string;
  title: string;
  content: string;
  filePath: string;
}

const requirementGeneratorSkill = {
  name: 'requirement-generator',
  description: '从Git提交历史自动生成需求文档',
  author: 'Claude Code',
  version: '1.0.0',

  // 斜杠命令配置
  slashCommand: {
    name: 'requirements',
    description: '生成需求文档',
    usage: '/requirements [选项]',
    examples: [
      '/requirements',
      '/requirements --branch=feature-xyz',
      '/requirements --output=./docs',
      '/requirements --types=PD,QA',
      '/requirements --limit=50'
    ]
  },

  // 技能配置
  config: {
    category: 'documentation',
    tags: ['git', 'documentation', 'requirements', 'analysis'],
    permissions: ['read', 'write']
  },

  /**
   * 执行技能
   */
  async execute(args: SkillArgs = {}): Promise<any> {
    try {
      console.log('🚀 开始执行需求文档生成...');

      // 获取当前分支
      const currentBranch = this.getCurrentBranch();
      const branchName = args.branch || currentBranch;

      console.log(`📦 生成配置:`);
      console.log(`  - 目标分支: ${branchName}`);
      console.log(`  - 输出目录: ${args.output || './requirements'}`);
      console.log(`  - 提交数量: ${args.limit || '全部'}`);
      console.log(`  - 需求类型: ${args.types || '全部'}\n`);

      // 设置输出目录
      const outputDir = args.output || path.join(process.cwd(), 'requirements');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`✅ 创建输出目录: ${outputDir}`);
      }

      // 执行需求生成
      const { RequirementGenerator } = await import('./scripts/requirement-generator.js');
      const generator = new RequirementGenerator();

      const generationOptions = {
        branchName,
        outputDir,
        templateDir: __dirname,
        types: args.types ? args.types.split(',') : undefined
      };

      const docs = await generator.generate(generationOptions);

      // 返回结果
      const result = {
        success: true,
        branchName,
        outputDir,
        generatedDocs: docs.length,
        documents: docs.map(doc => ({
          type: doc.type,
          number: doc.number,
          title: doc.title,
          file: path.basename(doc.filePath)
        }))
      };

      console.log(`\n✅ 需求文档生成完成！`);
      console.log(`📄 生成了 ${docs.length} 个文档`);
      console.log(`📍 保存位置: ${outputDir}`);

      // 生成索引内容预览
      if (fs.existsSync(path.join(outputDir, 'index.md'))) {
        const indexContent = fs.readFileSync(path.join(outputDir, 'index.md'), 'utf8');
        console.log(`\n📋 索引文件预览:`);
        console.log(indexContent.split('\n').slice(0, 10).join('\n') + '\n...');
      }

      return result;

    } catch (error: any) {
      console.error('❌ 生成失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * 获取当前分支
   */
  getCurrentBranch(): string {
    try {
      const output = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' });
      return output.trim();
    } catch {
      return 'main';
    }
  },

  /**
   * 生成提交消息
   */
  generateCommitMessage(result: any): string {
    if (!result.success) {
      return `chore: 需求文档生成失败 - ${result.error}`;
    }

    const types = result.documents.map((d: any) => d.type).join(', ');
    return `feat: 生成需求文档 (${result.generatedDocs}个)

生成类型: ${types}
目标分支: ${result.branchName}
保存位置: ${result.outputDir}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
  }
};

// 导出技能
export default requirementGeneratorSkill;

// CLI 入口
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const parsedArgs: SkillArgs = {};

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (value) {
        (parsedArgs as any)[key] = value;
      }
    }
  }

  // 执行技能
  requirementGeneratorSkill.execute(parsedArgs)
    .then(result => {
      if (result.success) {
        console.log('\n🎉 执行成功！');
        process.exit(0);
      } else {
        console.error('\n❌ 执行失败:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ 执行错误:', error);
      process.exit(1);
    });
}