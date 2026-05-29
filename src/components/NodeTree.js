import { escapeHtml } from '../utils/escapeHtml.js';

export class NodeTree {
  constructor(container, options = {}) {
    this.container = container;
    this.nodes = options.nodes || [];
    this.activeNodeId = options.activeNodeId || null;
    this.onSelect = options.onSelect || (() => {});
    this.onAdd = options.onAdd || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.bindEvents();
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
  }

  renderNodes(nodes, level = 0) {
    return nodes.map(node => `
      <div class="tree-node level-${level} ${node.id === this.activeNodeId ? 'active' : ''}" 
           data-id="${node.id}">
        <div class="node-content">
          <span class="node-toggle">${node.children?.length ? '▼' : ''}</span>
          <span class="node-title">${escapeHtml(node.subtitle || node.title || '未命名')}</span>
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