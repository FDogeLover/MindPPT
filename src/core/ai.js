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

  async callWithRetry(fn, maxRetries = 3, timeoutMs = 30000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const result = await fn(controller.signal);
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  async callApi(endpoint, body, headers = {}) {
    return this.callWithRetry(async (signal) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...headers
        },
        body: JSON.stringify(body),
        signal
      });
      
      if (!response.ok) {
        throw new Error(`API调用失败: ${response.statusText}`);
      }
      
      return await response.json();
    });
  }

  async callMimo(prompt) {
    return this.callApi(`${AI_PROVIDERS.mimo.endpoint}/chat/completions`, {
      model: this.model,
      messages: [
        { role: 'system', content: '你是一个专业的思维导图生成助手。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
  }

  async callQwen(prompt) {
    return this.callApi(`${AI_PROVIDERS.qwen.endpoint}/services/aigc/text-generation/generation`, {
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
    });
  }

  parseResponse(response) {
    try {
      const content = response.choices?.[0]?.message?.content || 
                      response.output?.text || '';
      
      // 解析两行格式的思维导图
      const lines = content.split('\n').filter(line => line.trim());
      const nodes = [];
      let nodeId = 1;
      let i = 0;
      
      while (i < lines.length) {
        const line = lines[i];
        const match = line.match(/^(\s*)[-*+]\s+(.+)$/);
        
        if (match) {
          const indent = match[1].length;
          const firstLine = match[2].trim();
          
          // 检查下一行是否是续行（缩进更多且不是列表项）
          let secondLine = '';
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const nextMatch = nextLine.match(/^(\s*)[-*+]\s+(.+)$/);
            const nextIndent = nextLine.match(/^(\s*)/)?.[1].length || 0;
            
            if (!nextMatch && nextIndent > indent) {
              secondLine = nextLine.trim();
              i++;
            }
          }
          
          nodes.push({
            id: `node-${nodeId++}`,
            title: secondLine || firstLine,
            subtitle: secondLine ? firstLine : '',
            level: Math.floor(indent / 2)
          });
        }
        
        i++;
      }
      
      return nodes;
    } catch (error) {
      console.error('解析AI响应失败:', error);
      return [];
    }
  }
}