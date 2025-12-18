#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取命令行参数
const args = process.argv.slice(2);
const options = {};

// 解析参数
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    options[key] = value || true;
  }
}

// 设置默认值
const branch = options.branch || getCurrentBranch();
const outputDir = options.output || `archives/${branch}/requirements`;
const limit = options.limit ? parseInt(options.limit) : null;
const types = options.types ? options.types.split(',') : null;

console.log(`📝 需求文档生成器`);
console.log(`📂 输出目录: ${outputDir}`);
console.log(`🌿 分析分支: ${branch}`);
console.log('');

// 获取当前分支
function getCurrentBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    return branch;
  } catch (error) {
    console.error('❌ 无法获取当前分支');
    process.exit(1);
  }
}

// 获取提交历史
function getCommits(branch, limit = null) {
  try {
    const limitArg = limit ? `-${limit}` : '';
    const cmd = `git log ${limitArg} --oneline --decorate=short ${branch}`;
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.trim().split('\n');
  } catch (error) {
    console.error('❌ 无法获取提交历史');
    return [];
  }
}

// 分析并分类提交
function analyzeCommits(commits) {
  const categorized = {
    PD: [], // 产品需求 (Product)
    TD: [], // 技术需求 (Technical)
    QA: [], // 质量需求 (Quality)
    UI: [], // 界面需求 (UI)
    OTHER: [] // 其他
  };

  const typeKeywords = {
    PD: ['feat', '新增', '添加', 'feature'],
    TD: ['refactor', '优化', '重构', 'tech', 'technical'],
    QA: ['fix', '修复', 'bug', '问题', 'issue'],
    UI: ['ui', '界面', '样式', 'style', 'design']
  };

  commits.forEach(commit => {
    const match = commit.match(/^(\w+)\s+(.*)/);
    if (match) {
      const [, hash, message] = match;
      const lowerMessage = message.toLowerCase();

      let categorizedType = 'OTHER';
      for (const [type, keywords] of Object.entries(typeKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
          categorizedType = type;
          break;
        }
      }

      categorized[categorizedType].push({
        hash,
        message,
        type: categorizedType
      });
    }
  });

  return categorized;
}

// 生成需求文档
function generateRequirementDoc(type, index, title, commits, context) {
  const fileName = `${type}-${String(index).padStart(3, '0')}-${title}.md`;
  const filePath = path.join(outputDir, fileName);

  const content = `# ${title}

## 基本信息

- **需求类型**: ${getTypeName(type)}
- **生成时间**: ${new Date().toISOString().split('T')[0]}
- **相关分支**: ${branch}
- **文档编号**: ${type}-${String(index).padStart(3, '0')}

## 会话上下文

${context}

## 相关提交

${commits.map(commit => `- ${commit.hash} - ${commit.message}`).join('\n')}

## 功能概述

基于提交历史分析，此需求涉及以下功能点：

${commits.map(commit => `- ${commit.message}`).join('\n')}

---

*本文档由 req-gen 工具自动生成*
`;

  return { fileName, filePath, content };
}

// 获取类型名称
function getTypeName(type) {
  const names = {
    PD: '产品需求',
    TD: '技术需求',
    QA: '质量需求',
    UI: '界面需求',
    OTHER: '其他需求'
  };
  return names[type] || '未知类型';
}

// 生成索引文件
function generateIndex(docs, context) {
  const indexContent = `# 需求文档索引

## 会话上下文概览

${context}

## 文档列表

| 编号 | 类型 | 标题 | 生成时间 |
|------|------|------|----------|
${docs.map(doc => {
  const fileName = path.basename(doc.fileName, '.md');
  const [type, number] = fileName.split('-');
  return `| ${type}-${number} | ${getTypeName(type)} | [${doc.title}](./${doc.fileName}) | ${new Date().toISOString().split('T')[0]} |`;
}).join('\n')}

## 统计信息

- 总需求文档数: ${docs.length}
- 产品需求 (PD): ${docs.filter(d => d.fileName.startsWith('PD-')).length}
- 技术需求 (TD): ${docs.filter(d => d.fileName.startsWith('TD-')).length}
- 质量需求 (QA): ${docs.filter(d => d.fileName.startsWith('QA-')).length}
- 界面需求 (UI): ${docs.filter(d => d.fileName.startsWith('UI-')).length}
- 其他需求 (OTHER): ${docs.filter(d => d.fileName.startsWith('OTHER-')).length}

---

*索引文件由 req-gen 工具自动生成*
`;

  fs.writeFileSync(path.join(outputDir, 'index.md'), indexContent, 'utf8');
}

// 主执行函数
async function main() {
  try {
    // 确保输出目录存在
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ 创建输出目录: ${outputDir}`);

    // 获取当前会话上下文（这里简化处理）
    const context = `基于当前会话记录，主要涉及以下内容：
- 项目引入 Tailwind CSS v4 框架
- 配置 PostCSS 构建工具
- 修复构建配置问题
- 创建测试组件验证功能
- 清理和优化项目文件结构`;

    // 获取提交历史
    console.log('📊 分析提交历史...');
    const commits = getCommits(branch, limit);
    console.log(`找到 ${commits.length} 个提交`);

    // 分类提交
    const categorized = analyzeCommits(commits);

    // 生成需求文档
    const docs = [];
    let indexCounter = 1;

    for (const [type, typeCommits] of Object.entries(categorized)) {
      if (typeCommits.length > 0 && (!types || types.includes(type))) {
        const title = generateTitle(type, typeCommits);
        const doc = generateRequirementDoc(type, indexCounter++, title, typeCommits, context);

        fs.writeFileSync(doc.filePath, doc.content, 'utf8');
        docs.push({
          fileName: doc.fileName,
          title: title,
          type: type
        });

        console.log(`✅ 生成文档: ${doc.fileName}`);
      }
    }

    // 生成索引
    generateIndex(docs, context);
    console.log('✅ 生成索引文件: index.md');

    console.log('');
    console.log(`🎉 需求文档生成完成！`);
    console.log(`📁 文档位置: ${outputDir}`);
    console.log(`📄 生成文档: ${docs.length + 1} 个（含索引）`);

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  }
}

// 生成标题
function generateTitle(type, commits) {
  const titles = {
    PD: '产品功能需求',
    TD: '技术优化需求',
    QA: '质量改进需求',
    UI: '界面优化需求',
    OTHER: '其他需求'
  };

  // 如果提交中有共同主题，提取出来
  const commonWords = extractCommonWords(commits.map(c => c.message));
  if (commonWords) {
    return `${titles[type]} - ${commonWords}`;
  }

  return titles[type];
}

// 提取共同词汇
function extractCommonWords(messages) {
  if (messages.length === 0) return '';

  // 简单的关键词提取
  const keywords = ['tailwind', 'css', '构建', '配置', '测试', '优化', '修复'];
  for (const keyword of keywords) {
    if (messages.every(msg => msg.toLowerCase().includes(keyword))) {
      return keyword;
    }
  }

  return '';
}

// 运行主函数
main();