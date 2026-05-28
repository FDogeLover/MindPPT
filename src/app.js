import { NodeTree } from './components/NodeTree.js';
import { NodeEditor } from './components/NodeEditor.js';
import { Preview } from './components/Preview.js';

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
  }

  init() {
    this.render();
    this.setupNodeTree();
    this.setupNodeEditor();
    this.setupPreview();
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

  flattenNodes(nodes, result = []) {
    for (const node of nodes) {
      result.push({ id: node.id, title: node.title, subtitle: node.subtitle, image: node.image });
      if (node.children) {
        this.flattenNodes(node.children, result);
      }
    }
    return result;
  }
}
