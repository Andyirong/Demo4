/**
 * 上下文分析器
 * 用于分析和整理当前聊天记录
 */

export interface ContextSummary {
  sessionTitle: string;
  summary: string;
  keyPoints: string[];
  tasks: string[];
  requirements: string[];
  challenges: string[];
  solutions: string[];
}

export class ContextAnalyzer {
  /**
   * 分析聊天记录（测试版本）
   */
  analyzeChatHistory(): ContextSummary {
    // 在实际实现中，这里应该从系统获取真实的聊天记录
    // 目前使用硬编码的测试数据
    const chatSummary: ContextSummary = {
      sessionTitle: "需求文档生成器改进方案",
      summary: "讨论了如何改进需求文档生成器，使其能够基于会话上下文生成更智能的文档，而不是仅仅分析Git提交信息。",
      keyPoints: [
        "当前需求文档生成缺乏上下文信息",
        "需要收集和分析会话历史",
        "将上下文与Git提交结合生成文档",
        "实现为自动化流程"
      ],
      tasks: [
        "创建ContextCollector模块收集会话上下文",
        "改进requirements命令执行流程",
        "生成包含上下文的智能需求文档"
      ],
      requirements: [
        "执行命令后自动整理当前聊天记录",
        "生成临时文档存储上下文",
        "格式化输出分析结果"
      ],
      challenges: [
        "如何从系统获取会话历史",
        "如何设计自动化执行流程"
      ],
      solutions: [
        "使用测试数据先验证功能",
        "设计新的命令执行流程"
      ]
    };

    return chatSummary;
  }

  /**
   * 生成上下文文档
   */
  generateContextDocument(summary: ContextSummary): string {
    const timestamp = new Date().toLocaleString('zh-CN');

    return `# 会话上下文摘要

**会话主题**: ${summary.sessionTitle}
**生成时间**: ${timestamp}

## 概述
${summary.summary}

## 关键要点
${summary.keyPoints.map(point => `- ${point}`).join('\n')}

## 识别的任务
${summary.tasks.map(task => `- ${task}`).join('\n')}

## 核心需求
${summary.requirements.map(req => `- ${req}`).join('\n')}

${summary.challenges.length > 0 ? `
## 遇到的挑战
${summary.challenges.map(challenge => `- ${challenge}`).join('\n')}
` : ''}

${summary.solutions.length > 0 ? `
## 解决方案
${summary.solutions.map(solution => `- ${solution}`).join('\n')}
` : ''}

---
*此文档由系统自动生成，用于辅助需求文档生成*`;
  }

  /**
   * 格式化输出上下文信息
   */
  formatOutput(summary: ContextSummary): string {
    return `
📝 **会话上下文分析结果**

🎯 **主题**: ${summary.sessionTitle}

📋 **核心摘要**:
${summary.summary}

✅ **主要任务**:
${summary.tasks.map((task, i) => `   ${i + 1}. ${task}`).join('\n')}

🔑 **关键要点**:
${summary.keyPoints.map((point, i) => `   • ${point}`).join('\n')}

💡 **改进方向**:
${summary.requirements.map((req, i) => `   → ${req}`).join('\n')}
`;
  }
}