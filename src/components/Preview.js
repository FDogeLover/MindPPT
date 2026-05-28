export class Preview {
  constructor(container, options = {}) {
    this.container = container;
    this.nodes = options.nodes || [];
    this.activeNodeId = options.activeNodeId || null;
    this.onSelect = options.onSelect || (() => {});
    this.render();
    this.bindEvents();
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

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const nodeEl = e.target.closest('.preview-node');
      if (nodeEl) {
        const nodeId = nodeEl.dataset.id;
        this.onSelect(nodeId);
      }
    });
  }

  update(nodes, activeNodeId) {
    this.nodes = nodes;
    this.activeNodeId = activeNodeId;
    this.render();
    this.bindEvents();
  }
}