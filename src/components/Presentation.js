export class Presentation {
  constructor(container, options = {}) {
    this.container = container;
    this.nodes = options.nodes || [];
    this.onExit = options.onExit || (() => {});
    this.activeIndex = 0;
    this.renderer = null;
    this.hideTimer = null;
    this.element = null;
    this.controls = null;
    this.viewport = null;
    this._onKeyDown = null;
    this._onMouseMove = null;
    this.flatNodes = [];
  }

  async init() {
    this.flatNodes = this.flattenNodes(this.nodes);
    this.createUI();
    await new Promise(resolve => requestAnimationFrame(resolve));
    await this.initRenderer();
    this.enterFullscreen();
    this.bindKeyboard();
    this.bindMouse();
    this.showControls();
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

  createUI() {
    this.element = document.createElement('div');
    this.element.className = 'presentation';
    this.element.innerHTML = `
      <div class="presentation-viewport">
        <section class="presentation-frame">
          <div id="mindmap" role="img" aria-label="Animated mindmap presentation">
            <div class="map-layer" id="mapLayer">
              <svg class="link-layer" id="linkLayer" aria-hidden="true"></svg>
              <div class="node-layer" id="nodeLayer"></div>
            </div>
          </div>
        </section>
      </div>
      <div class="presentation-controls">
        <button class="presentation-btn" id="prevBtn">◀ 上一步</button>
        <span class="presentation-progress">1 / ${this.flatNodes.length}</span>
        <button class="presentation-btn" id="nextBtn">下一步 ▶</button>
        <button class="presentation-btn presentation-exit" id="exitBtn">✕ 退出</button>
      </div>
    `;
    this.container.appendChild(this.element);

    this.controls = this.element.querySelector('.presentation-controls');
    this.viewport = this.element.querySelector('.presentation-viewport');

    this.element.querySelector('#prevBtn').addEventListener('click', () => this.prev());
    this.element.querySelector('#nextBtn').addEventListener('click', () => this.next());
    this.element.querySelector('#exitBtn').addEventListener('click', () => this.exit());
  }

  async initRenderer() {
    const { MindmapRenderer } = await import('../core/MindmapRenderer.js');

    this.renderer = new MindmapRenderer(this.viewport, {
      onNodeClick: (id) => {
        const index = this.flatNodes.findIndex(n => n.id === id);
        if (index >= 0) {
          this.activeIndex = index;
          this.update();
        }
      }
    });
    this.renderer.init();

    const markdown = this.nodesToMarkdown(this.nodes);
    this.renderer.loadMarkdown(markdown);
  }

  nodesToMarkdown(nodes, level = 0) {
    let markdown = '';
    const indent = '  '.repeat(level);
    const childIndent = '  '.repeat(level + 1);

    for (const node of nodes) {
      const subtitle = node.subtitle || '';
      const title = node.title || '未命名';

      markdown += `${indent}- ${title}\n`;

      if (subtitle) {
        markdown += `${childIndent}${subtitle}\n`;
      }

      if (node.image) {
        markdown += `${childIndent}@image ${node.image.src || node.image}\n`;
      }

      if (node.children && node.children.length > 0) {
        markdown += this.nodesToMarkdown(node.children, level + 1);
      }
    }

    return markdown;
  }

  enterFullscreen() {
    const el = this.element.requestFullscreen || this.element.webkitRequestFullscreen;
    if (el) el.call(this.element);

    // 监听全屏变化，处理浏览器原生 ESC 退出
    this._onFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        this.cleanup();
        this.onExit();
      }
    };
    document.addEventListener('fullscreenchange', this._onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this._onFullscreenChange);
  }

  bindKeyboard() {
    this._onKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          e.stopImmediatePropagation();
          this.next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          e.stopImmediatePropagation();
          this.prev();
          break;
        case 'Escape':
          e.preventDefault();
          e.stopImmediatePropagation();
          this.exit();
          break;
      }
    };
    document.addEventListener('keydown', this._onKeyDown, true);
  }

  bindMouse() {
    this._onMouseMove = () => this.showControls();
    this.element.addEventListener('mousemove', this._onMouseMove);
  }

  showControls() {
    this.controls.classList.remove('hidden');
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.controls.classList.add('hidden');
    }, 3000);
  }

  next() {
    if (this.activeIndex < this.flatNodes.length - 1) {
      this.activeIndex++;
      this.update();
    }
  }

  prev() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
      this.update();
    }
  }

  update() {
    if (this.renderer) {
      this.renderer.setActiveIndex(this.activeIndex);
    }
    this.updateProgress();
  }

  updateProgress() {
    const progress = this.element.querySelector('.presentation-progress');
    if (progress) {
      progress.textContent = `${this.activeIndex + 1} / ${this.flatNodes.length}`;
    }
  }

  exit() {
    // 仅在全屏时调用 exitFullscreen，避免重复退出报错
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      const exitFs = document.exitFullscreen || document.webkitExitFullscreen;
      if (exitFs) exitFs.call(document);
    } else {
      // 已不在全屏（浏览器 ESC 已退出），直接清理
      this.cleanup();
      this.onExit();
    }
  }

  cleanup() {
    // 先销毁 renderer，移除其事件监听器
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
    
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown, true);
      this._onKeyDown = null;
    }
    if (this._onMouseMove) {
      this.element.removeEventListener('mousemove', this._onMouseMove);
      this._onMouseMove = null;
    }
    if (this._onFullscreenChange) {
      document.removeEventListener('fullscreenchange', this._onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', this._onFullscreenChange);
      this._onFullscreenChange = null;
    }
    clearTimeout(this.hideTimer);
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.controls = null;
    this.viewport = null;
  }
}
