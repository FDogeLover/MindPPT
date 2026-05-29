import { NodeTree } from './components/NodeTree.js';
import { NodeEditor } from './components/NodeEditor.js';
import { Preview } from './components/Preview.js';
import { AI } from './core/ai.js';
import { Storage } from './core/storage.js';
import { Exporter } from './core/exporter.js';
import { Settings } from './core/settings.js';
import { SettingsPanel } from './components/SettingsPanel.js';

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
    this.settings = new Settings();
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
    
    // 页面初始化时应用保存的设置
    this.applySettings(this.settings.getAll());
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
          <button class="btn btn-accent" id="exportMindmap">导出项目</button>
          <button class="btn btn-icon" id="settingsBtn" title="设置">⚙️</button>
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

    this.settingsPanel = new SettingsPanel(document.body, {
      settings: this.settings,
      onSave: (newSettings) => this.onSettingsSave(newSettings),
      onCancel: () => this.onSettingsCancel(),
      onPreview: (tempSettings) => this.onSettingsPreview(tempSettings)
    });
  }

  bindEvents() {
    document.getElementById('newProject')?.addEventListener('click', () => this.newProject());
    document.getElementById('openFile')?.addEventListener('click', () => this.openFile());
    document.getElementById('saveProject')?.addEventListener('click', () => this.saveProject());
    document.getElementById('exportMindmap')?.addEventListener('click', () => this.exportMindmap());
    document.getElementById('generateBtn')?.addEventListener('click', () => this.generateWithAI());
    document.getElementById('settingsBtn')?.addEventListener('click', () => this.toggleSettings());
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
    this.preview.update(this.state.projectData.nodes, this.state.activeNodeId);
    
    // 自动保存项目
    this.autoSave();
  }

  autoSave() {
    // 使用防抖，避免频繁保存
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.autoSaveTimer = setTimeout(() => {
      this.storage.saveProject(this.state.projectData);
    }, 500);
  }

  async generateWithAI() {
    const topic = prompt('请输入思维导图主题：');
    if (!topic) return;

    // 从 Settings 实例读取 AI 配置，不再使用 state.projectData.settings
    const apiKey = this.settings.get('ai.apiKey') || prompt('请输入API Key：');
    if (!apiKey) return;

    // 如果用户输入了新的API密钥，保存到设置中
    if (!this.settings.get('ai.apiKey')) {
      this.settings.set('ai.apiKey', apiKey);
      this.settings.save();
    }

    this.ai = new AI({
      provider: this.settings.get('ai.provider'),
      apiKey: apiKey,
      model: this.settings.get('ai.model')
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

      // 找到正确的父节点
      while (stack.length > 1 && stack[stack.length - 1].level >= node.level) {
        stack.pop();
      }

      // 将新节点添加到父节点的children中
      stack[stack.length - 1].children.push(newNode);
      
      // 将新节点压入栈中
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

  exportMindmap() {
    this.storage.exportToFile(this.state.projectData);
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

  toggleSettings() {
    this.settingsPanel.toggle();
  }

  onSettingsSave(newSettings) {
    this.applySettings(newSettings);
    this.updateComponents();
    // 强制 MindmapRenderer 重新渲染以应用新样式
    if (this.preview && this.preview.renderer) {
      this.preview.renderer.render();
    }
  }

  onSettingsCancel() {
    this.applySettings(this.settings.getAll());
    this.updateComponents();
    // 强制 MindmapRenderer 重新渲染以应用新样式
    if (this.preview && this.preview.renderer) {
      this.preview.renderer.render();
    }
  }

  onSettingsPreview(tempSettings) {
    this.applySettings(tempSettings);
    // 强制 MindmapRenderer 重新渲染以应用新样式
    if (this.preview && this.preview.renderer) {
      this.preview.renderer.render();
    }
  }

  applySettings(settings) {
    const root = document.documentElement;
    
    // 应用配色方案
    const colorSchemes = {
      default: { 
        primary: '#183a4a', 
        accent: '#d8894f', 
        bg: '#fcfcf8',
        pathNodeBg: '#fffdf8',
        completeNodeBg: '#eef7f3',
        activeNodeBg: '#183a4a',
        activeNodeBorder: '#d8894f',
        activeNodeText: '#ffffff'
      },
      business: { 
        primary: '#2c5282', 
        accent: '#3182ce', 
        bg: '#f5f7fa',
        pathNodeBg: '#ebf8ff',
        completeNodeBg: '#e6fffa',
        activeNodeBg: '#2c5282',
        activeNodeBorder: '#3182ce',
        activeNodeText: '#ffffff'
      },
      minimal: { 
        primary: '#000000', 
        accent: '#666666', 
        bg: '#ffffff',
        pathNodeBg: '#f5f5f5',
        completeNodeBg: '#eeeeee',
        activeNodeBg: '#000000',
        activeNodeBorder: '#333333',
        activeNodeText: '#ffffff'
      },
      vibrant: { 
        primary: '#d8894f', 
        accent: '#e53e3e', 
        bg: '#fff8f0',
        pathNodeBg: '#fff5eb',
        completeNodeBg: '#fed7d7',
        activeNodeBg: '#d8894f',
        activeNodeBorder: '#e53e3e',
        activeNodeText: '#ffffff'
      }
    };
    
    const scheme = settings.pptStyle?.colorScheme || 'default';
    const colors = colorSchemes[scheme] || colorSchemes.default;
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--path-node-bg', colors.pathNodeBg);
    root.style.setProperty('--complete-node-bg', colors.completeNodeBg);
    root.style.setProperty('--active-node-bg', colors.activeNodeBg);
    root.style.setProperty('--active-node-border', colors.activeNodeBorder);
    
    // 应用背景
    const preview = document.querySelector('.preview-panel');
    if (preview) {
      const bgColor = settings.pptStyle?.bgStyle?.color || colors.bg;
      const bgType = settings.pptStyle?.bgStyle?.type || 'solid';
      
      if (bgType === 'gradient') {
        preview.style.background = `linear-gradient(135deg, ${bgColor} 0%, ${this.lightenColor(bgColor, 20)} 100%)`;
      } else {
        preview.style.background = bgColor;
      }
    }
    
    // 应用节点样式
    if (settings.pptStyle?.nodeStyle) {
      const { borderRadius, shadow, bgColor, borderColor, unselectedBg, selectedBg } = settings.pptStyle.nodeStyle;
      root.style.setProperty('--node-border-radius', `${borderRadius}px`);
      root.style.setProperty('--node-shadow', shadow ? 'drop-shadow(0 10px 18px rgb(24 38 44 / 0.1))' : 'none');
      root.style.setProperty('--node-bg-color', bgColor || '#ffffff');
      root.style.setProperty('--node-border-color', borderColor || '#eee');
      
      // 应用自定义节点背景（如果设置了自己的颜色，则覆盖配色方案）
      if (unselectedBg && unselectedBg !== '#ffffff') {
        root.style.setProperty('--path-node-bg', unselectedBg);
        root.style.setProperty('--complete-node-bg', unselectedBg);
      }
      if (selectedBg && selectedBg !== '#183a4a') {
        root.style.setProperty('--active-node-bg', selectedBg);
      }
    }
    
    // 应用连线样式
    if (settings.pptStyle?.lineStyle) {
      const { color, width, type } = settings.pptStyle.lineStyle;
      root.style.setProperty('--line-color', color || '#999999');
      root.style.setProperty('--line-width', `${width}px`);
      root.style.setProperty('--line-type', type === 'straight' ? 'straight' : 'curve');
    }
    
    // 应用动画样式
    if (settings.pptStyle?.animation) {
      const { type, duration } = settings.pptStyle.animation;
      root.style.setProperty('--animation-duration', `${duration}ms`);
      root.style.setProperty('--animation-type', type);
    }
    
    // 应用文字样式
    if (settings.textStyle) {
      const { fontFamily, fontSize, fontWeight, color, align } = settings.textStyle;
      root.style.setProperty('--text-font-family', fontFamily);
      root.style.setProperty('--text-font-size-title', `${fontSize?.title || 16}px`);
      root.style.setProperty('--text-font-size-subtitle', `${fontSize?.subtitle || 14}px`);
      root.style.setProperty('--text-font-weight', fontWeight);
      
      // 兼容 color 为字符串或对象两种格式
      const titleColor = typeof color === 'object' ? color?.title : color;
      const subtitleColor = typeof color === 'object' ? color?.subtitle : color;
      root.style.setProperty('--node-text-color', titleColor || '#172033');
      root.style.setProperty('--node-text-color-subtitle', subtitleColor || '#6b745d');
      root.style.setProperty('--text-align', align);
    }
  }
  
  lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  }
}
