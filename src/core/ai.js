const AI_PROVIDERS = {
  mimo: {
    name: "Mimo",
    models: ["mimo-v2.5"],
    endpoint: "https://token-plan-cn.xiaomimimo.com/v1",
    format: "openai"
  },
  qwen: {
    name: "通义千问",
    models: ["qwen-3.6-plus"],
    endpoint: "https://dashscope.aliyuncs.com/api/v1",
    format: "dashscope"
  }
};

export class AI {
  constructor(options = {}) {
    this.provider = options.provider || 'mimo';
    this.apiKey = options.apiKey || '';
    this.model = options.model || 'mimo-v2.5';
  }

  async generateMindmap(topic) {
    const prompt = `请根据以下主题生成一个思维导图的Markdown格式内容：

主题：${topic}

要求：
1. 使用无序列表格式
2. 每个节点包含副标题（第一行）和主标题（第二行）
3. 保持层级清晰，每个父节点下有2-4个子节点
4. 总节点数控制在10-15个

示例格式：
- 副标题
  主标题
    - 子节点副标题
      子节点主标题`;

    const response = await this.callAI(prompt);
    return this.parseResponse(response);
  }

  async callAI(prompt) {
    switch (this.provider) {
      case 'mimo':
        return await this.callMimo(prompt);
      case 'qwen':
        return await this.callQwen(prompt);
      default:
        throw new Error(`不支持的AI服务商: ${this.provider}`);
    }
  }

  async callMimo(prompt) {
    const response = await fetch(`${AI_PROVIDERS.mimo.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: '你是一个专业的思维导图生成助手。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      throw new Error(`Mimo API调用失败: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async callQwen(prompt) {
    const response = await fetch(`${AI_PROVIDERS.qwen.endpoint}/services/aigc/text-generation/generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          messages: [
            { role: 'system', content: '你是一个专业的思维导图生成助手。' },
            { role: 'user', content: prompt }
          ]
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 2000
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`通义千问API调用失败: ${response.statusText}`);
    }
    
    return await response.json();
  }

  parseResponse(response) {
    try {
      const content = response.choices?.[0]?.message?.content || 
                      response.output?.text || '';
      
      // 解析Markdown格式的思维导图
      const lines = content.split('\n').filter(line => line.trim());
      const nodes = [];
      let nodeId = 1;
      
      for (const line of lines) {
        const match = line.match(/^(\s*)-\s+(.+)$/);
        if (match) {
          const indent = match[1].length;
          const text = match[2].trim();
          nodes.push({
            id: `node-${nodeId++}`,
            title: text,
            level: Math.floor(indent / 2)
          });
        }
      }
      
      return nodes;
    } catch (error) {
      console.error('解析AI响应失败:', error);
      return [];
    }
  }
}