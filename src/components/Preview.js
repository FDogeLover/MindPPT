import { escapeHtml } from '../utils/escapeHtml.js';
import { MindmapRenderer } from '../core/MindmapRenderer.js';

export class Preview {
  constructor(container, options = {}) {
    this.container = container;
    this.nodes = options.nodes || [];
    this.flatNodes = []; // 扁平化的节点列表，按前序遍历顺序
    this.activeNodeId = options.activeNodeId || null;
    this.onSelect = options.onSelect || (() => {});
    this.renderer = null;
    this.render();
    this.initRenderer();
  }

  render() {
    this.container.innerHTML = `
      <section class="presentation-frame">
        <div id="mindmap" role="img" aria-label="Animated mindmap presentation">
          <div class="map-layer" id="mapLayer">
            <svg class="link-layer" id="linkLayer" aria-hidden="true"></svg>
            <div class="node-layer" id="nodeLayer"></div>
          </div>
        </div>

        <section class="floating-ui" aria-label="Presentation controls">
          <div class="controls glass-panel" aria-label="节点演示操作区">
            <button
              class="controls-toggle"
              id="controlsToggle"
              type="button"
              aria-expanded="true"
              aria-controls="controlsBody"
              aria-label="收起控制面板"
              title="收起控制面板"
            >
              <span aria-hidden="true">−</span>
            </button>
            <div class="control-main" id="controlsBody">
              <label class="node-scrubber" for="nodeSlider">
                <input id="nodeSlider" type="range" min="0" max="0" value="0" aria-label="快速定位节点" />
                <span class="counter" id="counter">1 / 1</span>
              </label>
              <div class="node-readout" aria-live="polite">
                <div class="readout-card">
                  <div class="readout-icon" aria-hidden="true">
                    <span class="letter-grid">
                      <span>N</span>
                      <span>E</span>
                      <span>X</span>
                      <span>T</span>
                    </span>
                  </div>
                  <div class="node-content has-subtitle" id="nextNodePreview">
                    <span class="node-subtitle" id="nextNodeSubtitle">即将进入</span>
                    <span class="node-title" id="nextNodeTitle">root</span>
                  </div>
                </div>
                <div class="zoom-control" aria-label="缩放设置">
                  <span class="zoom-icon" aria-hidden="true">
                    <span class="letter-grid">
                      <span>Z</span>
                      <span>O</span>
                      <span>O</span>
                      <span>M</span>
                    </span>
                  </span>
                  <div class="zoom-fields">
                    <label class="zoom-row" for="zoomSlider">
                      <input id="zoomSlider" type="range" min="70" max="140" value="100" aria-label="调整整体大小" />
                      <strong id="zoomValue">100%</strong>
                    </label>
                    <label class="zoom-row" for="activeScaleSlider">
                      <input
                        id="activeScaleSlider"
                        type="range"
                        min="100"
                        max="200"
                        step="5"
                        value="150"
                        aria-label="调整选中节点放大倍率"
                      />
                      <strong id="activeScaleValue">1.50x</strong>
                    </label>
                  </div>
                </div>
              </div>
              <p class="control-hint">翻页：↑ ↓、Page Up / Page Down、滚轮或移动端上划/下划</p>
            </div>
          </div>
        </section>
      </section>
    `;
  }

  initRenderer() {
    this.renderer = new MindmapRenderer(this.container, {
      onNodeClick: (nodeId) => this.handleNodeClick(nodeId)
    });
    this.renderer.init();
  }

  handleNodeClick(nodeId) {
    // MindmapRenderer使用自己的nodeId格式（node-0, node-1等）
    // 使用扁平化的节点列表来映射
    const nodeIndex = parseInt(nodeId.replace('node-', ''), 10);
    if (!isNaN(nodeIndex) && nodeIndex < this.flatNodes.length) {
      this.onSelect(this.flatNodes[nodeIndex].id);
    }
  }

  flattenNodes(nodes, result = []) {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        this.flattenNodes(node.children, result);
      }
    }
    return result;
  }

  loadMarkdown(markdown) {
    if (this.renderer) {
      this.renderer.loadMarkdown(markdown);
    }
  }

  update(nodes, activeNodeId) {
    this.nodes = nodes;
    this.activeNodeId = activeNodeId;
    this.flatNodes = this.flattenNodes(nodes);
    
    // 将节点数据转换为Markdown格式
    const markdown = this.nodesToMarkdown(nodes);
    this.loadMarkdown(markdown);
    
    // 恢复选中节点的位置
    if (activeNodeId && this.renderer) {
      const activeIndex = this.flatNodes.findIndex(n => n.id === activeNodeId);
      if (activeIndex >= 0) {
        this.renderer.setActiveIndex(activeIndex);
      }
    }
  }

  nodesToMarkdown(nodes, level = 0) {
    let markdown = '';
    const indent = '  '.repeat(level);
    const childIndent = '  '.repeat(level + 1);
    
    for (const node of nodes) {
      const subtitle = node.subtitle || '';
      const title = node.title || '未命名';
      
      // 生成节点行（使用title作为节点标签）
      markdown += `${indent}- ${title}\n`;
      
      // 如果有副标题，生成副标题作为续行
      if (subtitle) {
        markdown += `${childIndent}${subtitle}\n`;
      }
      
      // 如果有图片，生成@image续行
      if (node.image) {
        markdown += `${childIndent}@image ${node.image.src}\n`;
      }
      
      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        markdown += this.nodesToMarkdown(node.children, level + 1);
      }
    }
    
    return markdown;
  }
}