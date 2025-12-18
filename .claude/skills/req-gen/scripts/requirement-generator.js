"use strict";
/**
 * 简化版需求文档生成器
 * 用于从 Git 提交生成需求文档
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirementGenerator = void 0;
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
const url_1 = require("url");
const context_analyzer_js_1 = require("./context-analyzer.js");
// 在 ES 模块中获取 __dirname
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path.dirname(__filename);
class RequirementGenerator {
    constructor() {
        this.contextAnalyzer = new context_analyzer_js_1.ContextAnalyzer();
    }
    /**
     * 生成需求文档
     */
    async generate(options) {
        const docs = [];
        // 1. 首先分析会话上下文
        console.log('\n📊 第一步：整理当前聊天记录');
        const contextSummary = this.contextAnalyzer.analyzeChatHistory();
        // 输出上下文分析结果
        console.log(this.contextAnalyzer.formatOutput(contextSummary));
        // 生成上下文文档
        const contextDoc = this.contextAnalyzer.generateContextDocument(contextSummary);
        const contextFilePath = path.join(options.outputDir, 'CONTEXT-会话摘要.md');
        fs.writeFileSync(contextFilePath, contextDoc, 'utf8');
        console.log(`✅ 上下文文档已生成: ${contextFilePath}\n`);
        // 2. 获取提交信息
        console.log('📝 第二步：分析Git提交历史');
        const commits = this.getCommits(options.branchName);
        if (commits.length === 0) {
            console.log('ℹ️  没有找到需要分析的提交');
            return docs;
        }
        // 3. 分析提交并分类
        const analysis = this.analyzeCommits(commits);
        // 4. 生成各类型的需求文档（结合上下文）
        console.log('\n📄 第三步：生成需求文档');
        for (const [type, typeCommits] of Object.entries(analysis)) {
            if (typeCommits.length > 0) {
                const doc = await this.generateDoc(type, typeCommits, options, contextSummary);
                if (doc) {
                    docs.push(doc);
                }
            }
        }
        // 5. 生成索引
        await this.generateIndex(docs, options, contextSummary);
        return docs;
    }
    /**
     * 获取提交信息
     */
    getCommits(branchName) {
        try {
            // 使用 HEAD 获取最近20次提交
            const output = (0, child_process_1.execSync)('git log --oneline -20 HEAD', { encoding: 'utf8' });
            const lines = output.trim().split('\n');
            if (lines.length === 0) {
                console.log('⚠️  没有找到提交历史');
                return [];
            }
            console.log(`📝 分析到 ${lines.length} 个提交`);
            return lines.map(line => {
                const [hash, ...messageParts] = line.split(' ');
                const message = messageParts.join(' ');
                const type = this.getCommitType(message);
                if (type !== 'OTHER') {
                    console.log(`  - ${hash}: ${message} [${type}]`);
                }
                return {
                    hash,
                    message,
                    type
                };
            });
        }
        catch (error) {
            console.error('❌ 获取提交历史失败:', error.message);
            return [];
        }
    }
    /**
     * 判断提交类型
     */
    getCommitType(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.startsWith('feat') || lowerMessage.includes('新增') || lowerMessage.includes('添加')) {
            return 'PD'; // Product Requirement
        }
        else if (lowerMessage.startsWith('refactor') || lowerMessage.includes('优化') || lowerMessage.includes('重构')) {
            return 'TD'; // Technical Requirement
        }
        else if (lowerMessage.startsWith('fix') || lowerMessage.includes('修复') || lowerMessage.includes('bug')) {
            return 'QA'; // Quality Requirement
        }
        else if (lowerMessage.includes('ui') || lowerMessage.includes('界面') || lowerMessage.includes('样式')) {
            return 'UI'; // UI Requirement
        }
        return 'OTHER';
    }
    /**
     * 分析提交
     */
    analyzeCommits(commits) {
        const analysis = {
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
    async generateDoc(type, commits, options, contextSummary) {
        if (commits.length === 0)
            return null;
        const typeNames = {
            PD: '产品需求',
            TD: '技术需求',
            QA: '质量需求',
            UI: '界面需求',
            OTHER: '其他需求'
        };
        const number = this.getNextNumber(type, options.outputDir);
        const title = this.generateTitle(commits, type);
        // 增强的模板内容（包含上下文）
        const content = this.renderTemplate({
            type: typeNames[type] || type,
            number,
            title,
            branchName: options.branchName,
            commits,
            timestamp: new Date().toLocaleString('zh-CN'),
            contextSummary
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
    renderTemplate(data) {
        return `# ${data.type} ${data.number}: ${data.title}

## 基本信息
- **需求类型**: ${data.type}
- **生成时间**: ${data.timestamp}
- **关联分支**: ${data.branchName}

${data.contextSummary ? `
## 会话上下文

**会话主题**: ${data.contextSummary.sessionTitle}

**关键要点**:
${data.contextSummary.keyPoints.map((point) => `- ${point}`).join('\n')}

**核心需求**:
${data.contextSummary.requirements.map((req) => `- ${req}`).join('\n')}

` : ''}## 相关提交
${data.commits.map((c) => `- ${c.hash}: ${c.message}`).join('\n')}

## 功能概述
${data.contextSummary
            ? `基于会话上下文"${data.contextSummary.sessionTitle}"和提交历史分析生成的${data.type.toLowerCase()}文档。结合了讨论中的关键需求和实际的开发提交记录。`
            : `基于提交历史分析生成的${data.type.toLowerCase()}文档。`}

---
*本文档由系统自动生成${data.contextSummary ? '，包含会话上下文分析' : ''}*`;
    }
    /**
     * 获取下一个编号
     */
    getNextNumber(type, outputDir) {
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
    generateTitle(commits, type) {
        if (commits.length === 0)
            return '需求文档';
        // 提取关键词
        const keywords = new Set();
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
    sanitizeTitle(title) {
        return title
            .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 20);
    }
    /**
     * 生成索引
     */
    async generateIndex(docs, options, contextSummary) {
        const content = `# ${options.branchName} 需求文档索引

生成时间: ${new Date().toLocaleString('zh-CN')}

${contextSummary ? `
## 会话上下文摘要

**主题**: ${contextSummary.sessionTitle}

${contextSummary.summary}

` : ''}

## 文档列表

${docs.map(doc => `- [${doc.title}](${path.basename(doc.filePath)})`).join('\n')}

---

总计: ${docs.length} 个文档
${contextSummary ? '\n*包含会话上下文分析*' : ''}
`;
        fs.writeFileSync(path.join(options.outputDir, 'index.md'), content, 'utf8');
    }
}
exports.RequirementGenerator = RequirementGenerator;
