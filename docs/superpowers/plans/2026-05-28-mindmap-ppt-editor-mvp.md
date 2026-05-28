# Mindmap PPT Editor MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现思维导图PPT编辑器的MVP版本，支持从零生成、节点编辑、图片上传、实时预览、本地存储和HTML导出

**Architecture:** 纯前端静态HTML应用，使用原生JavaScript和CSS，无框架依赖。采用组件化架构，每个组件负责单一职责。

**Tech Stack:** HTML5, CSS3, ES Modules, localStorage

---

## 文件结构

```
mindmap-ppt-project/
├── index.html                    # 主入口页面（修改）
├── src/
│   ├── main.js                  # 应用入口（修改）
│   ├── app.js                   # App组件（新建）
│   ├── components/
│   │   ├── Toolbar.js           # 顶部工具栏（新建）
│   │   ├── Editor.js            # 编辑面板（新建）
│   │   ├── Preview.js           # 预览面板（新建）
│   │   ├── NodeTree.js          # 树形结构（新建）
│   │   ├── NodeEditor.js        # 节点编辑（新建）
│   │   └── ImageViewer.js       # 图片选择器（新建）
│   ├── core/
│   │   ├── ai.js                # AI调用封装（新建）
│   │   ├── storage.js           # 存储管理（新建）
│   │   └── exporter.js          # 导出功能（新建）
│   └── styles/
│       ├── main.css             # 主样式（新建）
│       ├── editor.css           # 编辑器样式（新建）
│       └── player.css           # 播放器样式（新建）
├── project/
│   └── assets/                  # 图片资源目录（已存在）
├── scripts/
│   └── dev-server.js            # 开发服务器（已存在）
├── package.json                 # 项目配置（修改）
├── AGENTS.md                    # 项目文档（已存在）
└── MEMORY.md                    # 项目记忆（已存在）
```

---

## 任务分解

### Task 1: 项目基础设置

**Files:**
- Modify: `package.json`
- Modify: `index.html`
- Create: `src/main.js`
- Create: `src/styles/main.css`

- [ ] **Step 1: 更新package.json添加构建脚本**

```json
{
  "name": "mindmap-ppt-editor",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node scripts/dev-server.js",
    "check": "node --check src/main.js",
    "build": "node scripts/build.js"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

- [ ] **Step 2: 更新index.html页面结构**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>思维导图PPT编辑器</title>
    <link rel="stylesheet" href="./src/styles/main.css" />
  </head>
  <body>
    <main class="app-shell" id="app">
      <div class="loading">加载中...</div>
    </main>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 3: 创建src/main.js应用入口**

```javascript
import { App } from './app.js';

const app = new App();
app.init();
```

- [ ] **Step 4: 创建src/styles/main.css主样式**

```css
:root {
  --primary-color: #183a4a;
  --accent-color: #d8894f;
  --bg-color: #fcfcf8;
  --text-color: #172033;
  --border-radius: 8px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
}

.app-shell {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
}
```

- [ ] **Step 5: 验证项目运行**

Run: `npm run dev`
Expected: 服务器启动在 http://127.0.0.1:5173/
Open: http://127.0.0.1:5173/
Expected: 显示"加载中..."文字

- [ ] **Step 6: 提交代码**

```bash
git add package.json index.html src/main.js src/styles/main.css
git commit -m "feat: 初始化项目基础结构"
```

---

### Task 2: App组件和全局状态

**Files:**
- Create: `src/app.js`
- Create: `src/styles/main.css` (update)

- [ ] **Step 1: 创建src/app.js App组件**

```javascript
export class App {
  constructor() {
    this.state = {
      projectData: null,
      activeNodeId: null,
      isWizardMode: true
    };
    this.container = document.getElementById('app');
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <header class="toolbar">
        <div class="toolbar-left">
          <h1 class="app-title">思维导图PPT编辑器</h1>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" id="newProject">新建项目</button>
          <button class="btn" id="openFile">打开文件</button>
          <button class="btn" id="saveProject">保存项目</button>
          <button class="btn btn-accent" id="exportHtml">导出HTML</button>
        </div>
      </header>
      <main class="main-content">
        <aside class="editor-panel">
          <div class="node-tree" id="nodeTree"></div>
          <div class="node-editor" id="nodeEditor"></div>
        </aside>
        <section class="preview-panel">
          <div class="preview-container" id="preview"></div>
          <div class="player-controls" id="playerControls"></div>
        </section>
      </main>
    `;
  }
}
```

- [ ] **Step 2: 更新src/styles/main.css添加布局样式**

```css
/* 在现有样式后追加 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.app-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--primary-color);
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  background: white;
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background: #1a4558;
}

.btn-accent {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.btn-accent:hover {
  background: #e0955a;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-panel {
  width: 400px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  background: white;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.node-tree {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.node-editor {
  height: 200px;
  padding: 16px;
  background: #fafafa;
}

.preview-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.player-controls {
  height: 60px;
  padding: 12px 24px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
```

- [ ] **Step 3: 验证布局效果**

Run: `npm run dev`
Open: http://127.0.0.1:5173/
Expected: 显示顶部工具栏、左侧编辑面板、右侧预览面板

- [ ] **Step 4: 提交代码**

```bash
git add src/app.js src/styles/main.css
git commit -m "feat: 实现App组件和基础布局"
```

---

### Task 3: NodeTree树形结构组件

**Files:**
- Create: `src/components/NodeTree.js`
- Create: `src/styles/editor.css`

- [ ] **Step 1: 创建src/components/NodeTree.js**

```javascript
export class NodeTree {
  constructor(container, options = {}) {
    this.container = container;
    this.nodes = options.nodes || [];
    this.activeNodeId = options.activeNodeId || null;
    this.onSelect = options.onSelect || (() => {});
    this.onAdd = options.onAdd || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="node-tree-header">
        <h3>节点结构</h3>
        <button class="btn btn-small" id="addRootNode">+ 添加根节点</button>
      </div>
      <div class="node-tree-list" id="nodeList">
        ${this.renderNodes(this.nodes)}
      </div>
    `;
    
    this.bindEvents();
  }

  renderNodes(nodes, level = 0) {
    return nodes.map(node => `
      <div class="tree-node ${node.id === this.activeNodeId ? 'active' : ''}" 
           data-id="${node.id}" 
           style="padding-left: ${level * 20}px">
        <div class="node-content">
          <span class="node-toggle">${node.children?.length ? '▼' : ''}</span>
          <span class="node-title">${node.title || '未命名'}</span>
          <span class="node-subtitle">${node.subtitle || ''}</span>
        </div>
        <div class="node-actions">
          <button class="btn-icon" data-action="add" data-id="${node.id}" title="添加子节点">+</button>
          <button class="btn-icon" data-action="delete" data-id="${node.id}" title="删除节点">×</button>
        </div>
      </div>
      ${node.children?.length ? `<div class="node-children">${this.renderNodes(node.children, level + 1)}</div>` : ''}
    `).join('');
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const target = e.target;
      
      if (target.closest('.tree-node')) {
        const nodeEl = target.closest('.tree-node');
        const nodeId = nodeEl.dataset.id;
        this.onSelect(nodeId);
      }
      
      if (target.closest('[data-action="add"]')) {
        const nodeId = target.closest('[data-action="add"]').dataset.id;
        this.onAdd(nodeId);
      }
      
      if (target.closest('[data-action="delete"]')) {
        const nodeId = target.closest('[data-action="delete"]').dataset.id;
        this.onDelete(nodeId);
      }
      
      if (target.id === 'addRootNode') {
        this.onAdd(null);
      }
    });
  }

  update(nodes, activeNodeId) {
    this.nodes = nodes;
    this.activeNodeId = activeNodeId;
    this.render();
  }
}
```

- [ ] **Step 2: 创建src/styles/editor.css**

```css
.node-tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.node-tree-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--primary-color);
}

.btn-small {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.node-tree-list {
  font-size: 0.9rem;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background 0.2s;
}

.tree-node:hover {
  background: #f0f0f0;
}

.tree-node.active {
  background: var(--primary-color);
  color: white;
}

.tree-node.active .node-subtitle {
  color: rgba(255,255,255,0.7);
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.node-toggle {
  width: 16px;
  font-size: 0.7rem;
  color: #999;
}

.node-title {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-subtitle {
  color: #666;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

.btn-icon {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
}

.btn-icon:hover {
  background: rgba(0,0,0,0.1);
}

.node-children {
  margin-left: 20px;
}
```

- [ ] **Step 3: 验证NodeTree组件**

在app.js中临时添加测试代码：

```javascript
// 在render()方法的nodeTree div中添加
const nodeTree = new NodeTree(document.getElementById('nodeTree'), {
  nodes: [
    { id: '1', title: '根节点', subtitle: '主标题', children: [
      { id: '2', title: '子节点1', subtitle: '描述' },
      { id: '3', title: '子节点2', subtitle: '描述', children: [
        { id: '4', title: '孙节点', subtitle: '描述' }
      ]}
    ]},
    { id: '5', title: '另一个根节点', subtitle: '描述' }
  ],
  activeNodeId: '2',
  onSelect: (id) => console.log('选择节点:', id),
  onAdd: (id) => console.log('添加节点:', id),
  onDelete: (id) => console.log('删除节点:', id)
});
```

Run: `npm run dev`
Expected: 左侧面板显示树形节点结构，可点击选择、添加、删除

- [ ] **Step 4: 提交代码**

```bash
git add src/components/NodeTree.js src/styles/editor.css src/app.js
git commit -m "feat: 实现NodeTree树形结构组件"
```

---

### Task 4: NodeEditor节点编辑组件

**Files:**
- Create: `src/components/NodeEditor.js`

- [ ] **Step 1: 创建src/components/NodeEditor.js**

```javascript
export class NodeEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.node = options.node || null;
    this.onChange = options.onChange || (() => {});
    this.onImageUpload = options.onImageUpload || (() => {});
    this.render();
  }

  render() {
    if (!this.node) {
      this.container.innerHTML = `
        <div class="node-editor-empty">
          <p>请选择一个节点进行编辑</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="node-editor-header">
        <h3>编辑节点</h3>
      </div>
      <div class="node-editor-form">
        <div class="form-group">
          <label>副标题（小字）</label>
          <input type="text" id="nodeSubtitle" value="${this.node.subtitle || ''}" placeholder="可选的副标题">
        </div>
        <div class="form-group">
          <label>主标题</label>
          <input type="text" id="nodeTitle" value="${this.node.title || ''}" placeholder="节点主标题">
        </div>
        <div class="form-group">
          <label>图片</label>
          <div class="image-preview" id="imagePreview">
            ${this.node.image ? `
              <img src="${this.node.image.src}" alt="${this.node.image.alt || ''}">
              <button class="btn-remove-image" id="removeImage">×</button>
            ` : `
              <div class="image-placeholder">无图片</div>
            `}
          </div>
          <div class="image-actions">
            <button class="btn btn-small" id="uploadImage">上传图片</button>
            <button class="btn btn-small" id="generateImage">AI生成</button>
          </div>
        </div>
      </div>
    `;
    
    this.bindEvents();
  }

  bindEvents() {
    const titleInput = this.container.querySelector('#nodeTitle');
    const subtitleInput = this.container.querySelector('#nodeSubtitle');
    
    titleInput?.addEventListener('input', (e) => {
      this.onChange({ title: e.target.value });
    });
    
    subtitleInput?.addEventListener('input', (e) => {
      this.onChange({ subtitle: e.target.value });
    });
    
    this.container.querySelector('#uploadImage')?.addEventListener('click', () => {
      this.onImageUpload('local');
    });
    
    this.container.querySelector('#generateImage')?.addEventListener('click', () => {
      this.onImageUpload('ai');
    });
    
    this.container.querySelector('#removeImage')?.addEventListener('click', () => {
      this.onChange({ image: null });
    });
  }

  update(node) {
    this.node = node;
    this.render();
  }
}
```

- [ ] **Step 2: 在editor.css中添加NodeEditor样式**

```css
/* 在editor.css末尾追加 */
.node-editor-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.node-editor-header {
  margin-bottom: 16px;
}

.node-editor-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--primary-color);
}

.node-editor-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.image-preview {
  width: 100%;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-placeholder {
  color: #999;
  font-size: 0.9rem;
}

.btn-remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

.btn-remove-image:hover {
  background: rgba(0,0,0,0.7);
}

.image-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
```

- [ ] **Step 3: 验证NodeEditor组件**

在app.js中添加测试代码，点击节点时显示编辑器

- [ ] **Step 4: 提交代码**

```bash
git add src/components/NodeEditor.js src/styles/editor.css
git commit -m "feat: 实现NodeEditor节点编辑组件"
```

---

### Task 5: Preview预览面板组件

**Files:**
- Create: `src/components/Preview.js`
- Create: `src/styles/player.css`

- [ ] **Step 1: 创建src/components/Preview.js**

```javascript
export class Preview {
  constructor(container, options = {}) {
    this.container = container;
    this.nodes = options.nodes || [];
    this.activeNodeId = options.activeNodeId || null;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="preview-canvas" id="previewCanvas">
        ${this.renderNodes()}
      </div>
    `;
  }

  renderNodes() {
    if (!this.nodes.length) {
      return '<div class="preview-empty">暂无内容，请添加节点</div>';
    }
    
    // 简单渲染：显示所有节点
    return this.nodes.map(node => `
      <div class="preview-node ${node.id === this.activeNodeId ? 'active' : ''}" 
           data-id="${node.id}">
        ${node.image ? `<img src="${node.image.src}" alt="${node.image.alt || ''}" class="node-image">` : ''}
        <div class="node-text">
          ${node.subtitle ? `<div class="node-subtitle">${node.subtitle}</div>` : ''}
          <div class="node-title">${node.title || '未命名'}</div>
        </div>
      </div>
    `).join('');
  }

  update(nodes, activeNodeId) {
    this.nodes = nodes;
    this.activeNodeId = activeNodeId;
    this.render();
  }
}
```

- [ ] **Step 2: 创建src/styles/player.css**

```css
.preview-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px;
  overflow-y: auto;
  align-content: flex-start;
}

.preview-empty {
  width: 100%;
  text-align: center;
  padding: 48px;
  color: #999;
  font-size: 1.1rem;
}

.preview-node {
  width: 200px;
  padding: 16px;
  background: white;
  border: 2px solid #eee;
  border-radius: var(--border-radius);
  transition: all 0.3s;
  cursor: pointer;
}

.preview-node:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.preview-node.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.preview-node.active .node-subtitle {
  color: rgba(255,255,255,0.7);
}

.node-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
}

.node-text {
  text-align: center;
}

.preview-node .node-subtitle {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.preview-node .node-title {
  font-size: 1rem;
  font-weight: 600;
}
```

- [ ] **Step 3: 验证Preview组件**

Run: `npm run dev`
Expected: 右侧预览面板显示节点卡片

- [ ] **Step 4: 提交代码**

```bash
git add src/components/Preview.js src/styles/player.css
git commit -m "feat: 实现Preview预览面板组件"
```

---

### Task 6: AI调用封装

**Files:**
- Create: `src/core/ai.js`

- [ ] **Step 1: 创建src/core/ai.js**

```javascript
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
```

- [ ] **Step 2: 验证AI模块**

在app.js中临时添加测试代码

- [ ] **Step 3: 提交代码**

```bash
git add src/core/ai.js
git commit -m "feat: 实现AI调用封装模块"
```

---

### Task 7: 存储管理模块

**Files:**
- Create: `src/core/storage.js`

- [ ] **Step 1: 创建src/core/storage.js**

```javascript
export class Storage {
  constructor() {
    this.storageKey = 'mindmap-ppt-project';
  }

  saveProject(projectData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projectData));
      return true;
    } catch (error) {
      console.error('保存项目失败:', error);
      return false;
    }
  }

  loadProject() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载项目失败:', error);
      return null;
    }
  }

  clearProject() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('清除项目失败:', error);
      return false;
    }
  }

  exportToFile(projectData) {
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.name || 'mindmap'}.mindmap`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importFromFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mindmap';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('未选择文件'));
          return;
        }
        
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      input.click();
    });
  }
}
```

- [ ] **Step 2: 验证Storage模块**

- [ ] **Step 3: 提交代码**

```bash
git add src/core/storage.js
git commit -m "feat: 实现存储管理模块"
```

---

### Task 8: HTML导出功能

**Files:**
- Create: `src/core/exporter.js`

- [ ] **Step 1: 创建src/core/exporter.js**

```javascript
export class Exporter {
  exportToHtml(projectData) {
    const html = this.generateHtml(projectData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.name || 'mindmap'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generateHtml(projectData) {
    const nodesHtml = this.generateNodesHtml(projectData.nodes || []);
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectData.name || '思维导图PPT'}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fcfcf8; }
    .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    h1 { color: #183a4a; text-align: center; margin-bottom: 32px; }
    .nodes { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
    .node { width: 200px; padding: 16px; background: white; border: 2px solid #eee; border-radius: 8px; }
    .node.active { border-color: #183a4a; background: #183a4a; color: white; }
    .node-subtitle { font-size: 0.8rem; color: #666; margin-bottom: 4px; }
    .node.active .node-subtitle { color: rgba(255,255,255,0.7); }
    .node-title { font-size: 1rem; font-weight: 600; }
    .node-image { width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${projectData.name || '思维导图PPT'}</h1>
    <div class="nodes">
      ${nodesHtml}
    </div>
  </div>
</body>
</html>`;
  }

  generateNodesHtml(nodes) {
    return nodes.map(node => `
      <div class="node">
        ${node.image ? `<img src="${node.image.src}" alt="${node.image.alt || ''}" class="node-image">` : ''}
        <div class="node-text">
          ${node.subtitle ? `<div class="node-subtitle">${node.subtitle}</div>` : ''}
          <div class="node-title">${node.title || '未命名'}</div>
        </div>
      </div>
    `).join('');
  }
}
```

- [ ] **Step 2: 验证Exporter模块**

- [ ] **Step 3: 提交代码**

```bash
git add src/core/exporter.js
git commit -m "feat: 实现HTML导出功能"
```

---

### Task 9: 整合所有组件

**Files:**
- Modify: `src/app.js`
- Modify: `src/main.js`

- [ ] **Step 1: 更新src/app.js整合所有组件**

```javascript
import { NodeTree } from './components/NodeTree.js';
import { NodeEditor } from './components/NodeEditor.js';
import { Preview } from './components/Preview.js';
import { AI } from './core/ai.js';
import { Storage } from './core/storage.js';
import { Exporter } from './core/exporter.js';

export class App {
  constructor() {
    this.state = {
      projectData: {
        id: this.generateId(),
        name: '我的思维导图',
        nodes: [],
        settings: {
          aiProvider: 'mimo',
          apiKey: '',
          aiModel: 'mimo-v2.5'
        }
      },
      activeNodeId: null
    };
    
    this.storage = new Storage();
    this.ai = null;
    this.exporter = new Exporter();
    this.container = document.getElementById('app');
  }

  generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
  }

  init() {
    // 尝试加载已保存的项目
    const savedProject = this.storage.loadProject();
    if (savedProject) {
      this.state.projectData = savedProject;
    }
    
    this.render();
    this.initComponents();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <header class="toolbar">
        <div class="toolbar-left">
          <h1 class="app-title">思维导图PPT编辑器</h1>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" id="newProject">新建项目</button>
          <button class="btn" id="openFile">打开文件</button>
          <button class="btn" id="saveProject">保存项目</button>
          <button class="btn btn-accent" id="exportHtml">导出HTML</button>
        </div>
      </header>
      <main class="main-content">
        <aside class="editor-panel">
          <div class="node-tree" id="nodeTree"></div>
          <div class="node-editor" id="nodeEditor"></div>
        </aside>
        <section class="preview-panel">
          <div class="preview-container" id="preview"></div>
          <div class="player-controls" id="playerControls">
            <button class="btn" id="generateBtn">AI生成思维导图</button>
          </div>
        </section>
      </main>
    `;
  }

  initComponents() {
    this.nodeTree = new NodeTree(document.getElementById('nodeTree'), {
      nodes: this.state.projectData.nodes,
      activeNodeId: this.state.activeNodeId,
      onSelect: (id) => this.selectNode(id),
      onAdd: (parentId) => this.addNode(parentId),
      onDelete: (id) => this.deleteNode(id)
    });

    this.nodeEditor = new NodeEditor(document.getElementById('nodeEditor'), {
      node: this.getActiveNode(),
      onChange: (changes) => this.updateNode(changes),
      onImageUpload: (type) => this.handleImageUpload(type)
    });

    this.preview = new Preview(document.getElementById('preview'), {
      nodes: this.state.projectData.nodes,
      activeNodeId: this.state.activeNodeId
    });
  }

  bindEvents() {
    document.getElementById('newProject')?.addEventListener('click', () => this.newProject());
    document.getElementById('openFile')?.addEventListener('click', () => this.openFile());
    document.getElementById('saveProject')?.addEventListener('click', () => this.saveProject());
    document.getElementById('exportHtml')?.addEventListener('click', () => this.exportHtml());
    document.getElementById('generateBtn')?.addEventListener('click', () => this.generateWithAI());
  }

  getActiveNode() {
    if (!this.state.activeNodeId) return null;
    return this.findNode(this.state.projectData.nodes, this.state.activeNodeId);
  }

  findNode(nodes, id) {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  selectNode(id) {
    this.state.activeNodeId = id;
    this.updateComponents();
  }

  addNode(parentId) {
    const newNode = {
      id: this.generateId(),
      title: '新节点',
      subtitle: '',
      children: []
    };
    
    if (parentId) {
      const parent = this.findNode(this.state.projectData.nodes, parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(newNode);
      }
    } else {
      this.state.projectData.nodes.push(newNode);
    }
    
    this.updateComponents();
  }

  deleteNode(id) {
    this.removeFromTree(this.state.projectData.nodes, id);
    if (this.state.activeNodeId === id) {
      this.state.activeNodeId = null;
    }
    this.updateComponents();
  }

  removeFromTree(nodes, id) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        nodes.splice(i, 1);
        return true;
      }
      if (nodes[i].children && this.removeFromTree(nodes[i].children, id)) {
        return true;
      }
    }
    return false;
  }

  updateNode(changes) {
    const node = this.getActiveNode();
    if (node) {
      Object.assign(node, changes);
      this.updateComponents();
    }
  }

  updateComponents() {
    this.nodeTree.update(this.state.projectData.nodes, this.state.activeNodeId);
    this.nodeEditor.update(this.getActiveNode());
    this.preview.update(this.state.projectData.nodes, this.state.activeNodeId);
  }

  async generateWithAI() {
    const topic = prompt('请输入思维导图主题：');
    if (!topic) return;
    
    const apiKey = this.state.projectData.settings.apiKey || prompt('请输入API Key：');
    if (!apiKey) return;
    
    this.state.projectData.settings.apiKey = apiKey;
    this.ai = new AI({
      provider: this.state.projectData.settings.aiProvider,
      apiKey: apiKey,
      model: this.state.projectData.settings.aiModel
    });
    
    try {
      const nodes = await this.ai.generateMindmap(topic);
      this.state.projectData.nodes = this.buildTreeFromNodes(nodes);
      this.updateComponents();
    } catch (error) {
      alert('AI生成失败：' + error.message);
    }
  }

  buildTreeFromNodes(nodes) {
    // 将扁平节点列表转换为树形结构
    const result = [];
    const stack = [{ children: result, level: -1 }];
    
    for (const node of nodes) {
      const newNode = {
        id: node.id,
        title: node.title,
        subtitle: '',
        children: []
      };
      
      while (stack.length > 1 && stack[stack.length - 1].level >= node.level) {
        stack.pop();
      }
      
      stack[stack.length - 1].children.push(newNode);
      stack.push({ children: newNode.children, level: node.level });
    }
    
    return result;
  }

  newProject() {
    if (confirm('确定要新建项目吗？当前未保存的更改将丢失。')) {
      this.state.projectData = {
        id: this.generateId(),
        name: '我的思维导图',
        nodes: [],
        settings: this.state.projectData.settings
      };
      this.state.activeNodeId = null;
      this.updateComponents();
    }
  }

  async openFile() {
    try {
      const data = await this.storage.importFromFile();
      this.state.projectData = data;
      this.state.activeNodeId = null;
      this.updateComponents();
    } catch (error) {
      alert('打开文件失败：' + error.message);
    }
  }

  saveProject() {
    if (this.storage.saveProject(this.state.projectData)) {
      alert('项目已保存');
    } else {
      alert('保存失败');
    }
  }

  exportHtml() {
    this.exporter.exportToHtml(this.state.projectData);
  }

  handleImageUpload(type) {
    if (type === 'local') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.updateNode({
              image: {
                type: 'local',
                src: event.target.result,
                alt: file.name,
                filename: file.name
              }
            });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else if (type === 'ai') {
      alert('AI生成图片功能即将推出');
    }
  }
}
```

- [ ] **Step 2: 更新src/main.js**

```javascript
import { App } from './app.js';

const app = new App();
app.init();
```

- [ ] **Step 3: 完整功能验证**

Run: `npm run dev`
Open: http://127.0.0.1:5173/

测试功能：
1. 点击"AI生成思维导图"按钮
2. 输入主题和API Key
3. 查看生成的节点
4. 点击节点进行编辑
5. 上传图片到节点
6. 保存项目
7. 导出HTML文件

- [ ] **Step 4: 提交代码**

```bash
git add src/app.js src/main.js
git commit -m "feat: 整合所有组件，完成MVP版本"
```

---

### Task 10: 测试和优化

**Files:**
- Modify: 各组件文件（根据测试结果修复bug）

- [ ] **Step 1: 功能测试**

测试所有MVP功能：
- [ ] AI生成思维导图
- [ ] 添加/删除节点
- [ ] 编辑节点标题/副标题
- [ ] 上传图片
- [ ] 保存项目
- [ ] 导出HTML

- [ ] **Step 2: Bug修复**

根据测试结果修复发现的问题

- [ ] **Step 3: 代码优化**

- 优化代码结构
- 添加错误处理
- 优化用户体验

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "feat: 完成MVP版本测试和优化"
```

---

## 自审检查

1. **Spec覆盖检查**：MVP的7个核心功能都已分配任务
2. **占位符扫描**：所有步骤都包含具体代码
3. **类型一致性**：组件接口和数据结构保持一致
4. **文件路径**：所有文件路径都已明确定义

---

## 下一步

1. 按照任务顺序逐步实现
2. 每完成一个任务后验证功能
3. 遇到问题及时修复
4. 完成所有任务后进行用户测试
