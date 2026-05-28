import { NodeTree } from './components/NodeTree.js';

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
    this.setupNodeTree();
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
    }
  }
}
