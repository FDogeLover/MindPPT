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
      nodes: this.flattenNodes(this.state.projectData.nodes),
      activeNodeId: this.state.activeNodeId,
      onSelect: (id) => this.selectNode(id)
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

  flattenNodes(nodes, result = []) {
    for (const node of nodes) {
      result.push({ id: node.id, title: node.title, subtitle: node.subtitle, image: node.image });
      if (node.children) {
        this.flattenNodes(node.children, result);
      }
    }
    return result;
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
    this.preview.update(this.flattenNodes(this.state.projectData.nodes), this.state.activeNodeId);
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

    const generateBtn = document.getElementById('generateBtn');
    const originalText = generateBtn?.textContent;
    if (generateBtn) {
      generateBtn.textContent = '生成中...';
      generateBtn.disabled = true;
    }

    try {
      const nodes = await this.ai.generateMindmap(topic);
      this.state.projectData.nodes = this.buildTreeFromNodes(nodes);
      this.updateComponents();
    } catch (error) {
      alert('AI生成失败：' + error.message);
    } finally {
      if (generateBtn) {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
      }
    }
  }

  buildTreeFromNodes(nodes) {
    const result = [];
    const stack = [{ children: result, level: -1 }];

    for (const node of nodes) {
      const newNode = {
        id: node.id,
        title: node.title,
        subtitle: node.subtitle || '',
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

  nodesToMarkdown(nodes, level = 0) {
    let markdown = '';
    const indent = '  '.repeat(level);
    
    for (const node of nodes) {
      const subtitle = node.subtitle || '';
      const title = node.title || '未命名';
      
      if (subtitle) {
        markdown += `${indent}- ${subtitle}\n`;
        markdown += `${indent}  ${title}\n`;
      } else {
        markdown += `${indent}- ${title}\n`;
      }
      
      if (node.image) {
        markdown += `${indent}  @image ${node.image.src}\n`;
      }
      
      if (node.children && node.children.length > 0) {
        markdown += this.nodesToMarkdown(node.children, level + 1);
      }
    }
    
    return markdown;
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
