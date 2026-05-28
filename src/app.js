import { NodeTree } from './components/NodeTree.js';
import { NodeEditor } from './components/NodeEditor.js';
import { Preview } from './components/Preview.js';
import { AI } from './core/ai.js';
import { Storage } from './core/storage.js';

export class App {
  constructor() {
    this.state = {
      projectData: null,
      activeNodeId: null,
      isWizardMode: true,
      nodes: [
        { id: '1', title: '根节点', subtitle: '主标题', children: [
          { id: '2', title: '子节点1', subtitle: '描述' },
          { id: '3', title: '子节点2', subtitle: '描述', children: [
            { id: '4', title: '孙节点', subtitle: '描述' }
          ]}
        ]},
        { id: '5', title: '另一个根节点', subtitle: '描述' }
      ]
    };
    this.container = document.getElementById('app');
    this.storage = new Storage();
  }

  init() {
    this.render();
    this.setupNodeTree();
    this.setupNodeEditor();
    this.setupPreview();
    this.setupStorage();
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

  setupNodeTree() {
    const nodeTreeContainer = document.getElementById('nodeTree');
    if (nodeTreeContainer) {
      this.nodeTree = new NodeTree(nodeTreeContainer, {
        nodes: this.state.nodes,
        activeNodeId: this.state.activeNodeId,
        onSelect: (id) => this.selectNode(id),
        onAdd: (id) => console.log('添加节点:', id),
        onDelete: (id) => console.log('删除节点:', id)
      });
    }
  }

  setupNodeEditor() {
    const nodeEditorContainer = document.getElementById('nodeEditor');
    if (nodeEditorContainer) {
      this.nodeEditor = new NodeEditor(nodeEditorContainer, {
        node: this.getActiveNode(),
        onChange: (changes) => this.handleNodeChange(changes),
        onImageUpload: (type) => this.handleImageUpload(type)
      });
    }
  }

  selectNode(id) {
    this.state.activeNodeId = id;
    const activeNode = this.getActiveNode();
    
    if (this.nodeTree) {
      this.nodeTree.update(this.state.nodes, id);
    }
    
    if (this.nodeEditor) {
      this.nodeEditor.update(activeNode);
    }
    
    if (this.preview) {
      const flatNodes = this.flattenNodes(this.state.nodes);
      this.preview.update(flatNodes, id);
    }
    
    console.log('选择节点:', id);
  }

  getActiveNode() {
    if (!this.state.activeNodeId) return null;
    return this.findNodeById(this.state.nodes, this.state.activeNodeId);
  }

  findNodeById(nodes, id) {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  handleNodeChange(changes) {
    const activeNode = this.getActiveNode();
    if (activeNode) {
      Object.assign(activeNode, changes);
      if (this.nodeTree) {
        this.nodeTree.update(this.state.nodes, this.state.activeNodeId);
      }
      if (this.preview) {
        const flatNodes = this.flattenNodes(this.state.nodes);
        this.preview.update(flatNodes, this.state.activeNodeId);
      }
      console.log('节点已更新:', changes);
    }
  }

  handleImageUpload(type) {
    console.log('图片上传:', type);
  }

  setupPreview() {
    const previewContainer = document.getElementById('preview');
    if (previewContainer) {
      const flatNodes = this.flattenNodes(this.state.nodes);
      this.preview = new Preview(previewContainer, {
        nodes: flatNodes,
        activeNodeId: this.state.activeNodeId,
        onSelect: (id) => this.selectNode(id)
      });
    }
  }

  setupStorage() {
    const newProjectBtn = document.getElementById('newProject');
    const openFileBtn = document.getElementById('openFile');
    const saveProjectBtn = document.getElementById('saveProject');
    const exportHtmlBtn = document.getElementById('exportHtml');

    if (newProjectBtn) {
      newProjectBtn.addEventListener('click', () => this.handleNewProject());
    }
    if (openFileBtn) {
      openFileBtn.addEventListener('click', () => this.handleOpenFile());
    }
    if (saveProjectBtn) {
      saveProjectBtn.addEventListener('click', () => this.handleSaveProject());
    }
    if (exportHtmlBtn) {
      exportHtmlBtn.addEventListener('click', () => this.handleExportHtml());
    }

    // 尝试从本地存储加载项目
    const savedProject = this.storage.loadProject();
    if (savedProject) {
      this.state.nodes = savedProject.nodes || this.state.nodes;
      this.state.projectData = savedProject;
      // 重新渲染节点树、编辑器和预览
      if (this.nodeTree) {
        this.nodeTree.update(this.state.nodes, this.state.activeNodeId);
      }
      if (this.nodeEditor) {
        this.nodeEditor.update(this.getActiveNode());
      }
      if (this.preview) {
        const flatNodes = this.flattenNodes(this.state.nodes);
        this.preview.update(flatNodes, this.state.activeNodeId);
      }
    }
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

  handleNewProject() {
    if (confirm('确定要新建项目吗？当前未保存的更改将丢失。')) {
      this.state.nodes = [
        { id: '1', title: '根节点', subtitle: '主标题', children: [] }
      ];
      this.state.activeNodeId = null;
      this.state.projectData = null;
      this.storage.clearProject();
      
      if (this.nodeTree) {
        this.nodeTree.update(this.state.nodes, this.state.activeNodeId);
      }
      if (this.nodeEditor) {
        this.nodeEditor.update(null);
      }
      if (this.preview) {
        const flatNodes = this.flattenNodes(this.state.nodes);
        this.preview.update(flatNodes, this.state.activeNodeId);
      }
    }
  }

  async handleOpenFile() {
    try {
      const data = await this.storage.importFromFile();
      this.state.nodes = data.nodes || this.state.nodes;
      this.state.projectData = data;
      this.state.activeNodeId = null;
      
      if (this.nodeTree) {
        this.nodeTree.update(this.state.nodes, this.state.activeNodeId);
      }
      if (this.nodeEditor) {
        this.nodeEditor.update(this.getActiveNode());
      }
      if (this.preview) {
        const flatNodes = this.flattenNodes(this.state.nodes);
        this.preview.update(flatNodes, this.state.activeNodeId);
      }
      
      console.log('项目已加载');
    } catch (error) {
      console.error('打开文件失败:', error);
      alert('打开文件失败: ' + error.message);
    }
  }

  handleSaveProject() {
    const projectData = {
      name: this.state.projectData?.name || 'mindmap',
      nodes: this.state.nodes,
      createdAt: this.state.projectData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (this.storage.saveProject(projectData)) {
      this.state.projectData = projectData;
      console.log('项目已保存');
      alert('项目已保存到本地存储');
    } else {
      alert('保存项目失败');
    }
  }

  handleExportHtml() {
    const projectData = {
      name: this.state.projectData?.name || 'mindmap',
      nodes: this.state.nodes,
      createdAt: this.state.projectData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.storage.exportToFile(projectData);
    console.log('项目已导出');
  }
}
