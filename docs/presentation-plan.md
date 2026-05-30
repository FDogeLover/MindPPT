# 放映功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为思维导图PPT编辑器添加全屏放映功能，逐节点放映，复用现有 MindmapRenderer 的导航逻辑。

**架构:** 独立 Presentation 组件 + Fullscreen API，复用现有 MindmapRenderer 渲染思维导图，键盘/点击控制导航。

**Tech Stack:** 原生 JavaScript, Fullscreen API, CSS transitions

---

## 文件结构

| 操作 | 文件 | 职责 |
|------|------|------|
| 新增 | `src/components/Presentation.js` | 全屏容器、导航状态、键盘事件、控制栏、退出逻辑 |
| 修改 | `src/app.js:51-116` | 添加 `present()` 方法，创建 Presentation 实例 |
| 修改 | `index.html:51-63` | 工具栏添加放映按钮 |
| 修改 | `src/styles/main.css` | 添加放映按钮样式 |
| 修改 | `src/styles/presentation.css` | 添加控制栏样式 |

---

## Task 1: 添加放映按钮到工具栏

**Files:**
- Modify: `index.html:51-63`
- Modify: `src/styles/main.css`

- [ ] **Step 1: 在 index.html 工具栏添加放映按钮**

在"导出项目"按钮前插入放映按钮：

```html
<!-- 在 id="exportMindmap" 的 button 前插入 -->
<button class="btn btn-accent" id="presentBtn">放映</button>
```

- [ ] **Step 2: 在 main.css 添加放映按钮样式**

在 `.btn-accent:hover` 规则后添加：

```css
#presentBtn {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
#presentBtn:hover {
  background: #1a4558;
}
```

- [ ] **Step 3: 验证按钮显示**

启动开发服务器 `npm run dev`，打开浏览器确认工具栏显示"放映"按钮。

- [ ] **Step 4: 提交**

```bash
git add index.html src/styles/main.css
git commit -m "feat: 添加放映按钮到工具栏"
```

---

## Task 2: 创建 Presentation 组件

**Files:**
- Create: `src/components/Presentation.js`

- [ ] **Step 1: 创建 Presentation.js 基础结构**

```javascript
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
  }

  init() {
    this.createUI();
    this.enterFullscreen();
    this.bindKeyboard();
    this.bindMouse();
    this.render();
  }

  createUI() {
    this.element = document.createElement('div');
    this.element.className = 'presentation';
    this.element.innerHTML = `
      <div class="presentation-viewport"></div>
      <div class="presentation-controls">
        <button class="presentation-btn" id="prevBtn">◀ 上一步</button>
        <span class="presentation-progress">1 / ${this.nodes.length}</span>
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

  enterFullscreen() {
    const el = this.element.requestFullscreen || this.element.webkitRequestFullscreen;
    if (el) el.call(this.element);
  }

  bindKeyboard() {
    this._onKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          this.next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          this.prev();
          break;
        case 'Escape':
          e.preventDefault();
          this.exit();
          break;
      }
    };
    document.addEventListener('keydown', this._onKeyDown);
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
    if (this.activeIndex < this.nodes.length - 1) {
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
    const node = this.nodes[this.activeIndex];
    if (this.renderer && node) {
      this.renderer.setActiveNode(node.id);
    }
    this.updateProgress();
  }

  updateProgress() {
    const progress = this.element.querySelector('.presentation-progress');
    if (progress) {
      progress.textContent = `${this.activeIndex + 1} / ${this.nodes.length}`;
    }
  }

  render() {
    if (this.nodes.length === 0) return;

    const { MindmapRenderer } = await import('../core/MindmapRenderer.js');
    this.renderer = new MindmapRenderer(this.viewport, {
      onNodeClick: (id) => {
        const index = this.nodes.findIndex(n => n.id === id);
        if (index >= 0) {
          this.activeIndex = index;
          this.update();
        }
      }
    });
    this.renderer.loadTree(this.nodes);
    this.showControls();
  }

  exit() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    this.cleanup();
    this.onExit();
  }

  cleanup() {
    document.removeEventListener('keydown', this._onKeyDown);
    this.element.removeEventListener('mousemove', this._onMouseMove);
    clearTimeout(this.hideTimer);
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
```

- [ ] **Step 2: 修复 render 方法中的 async/await**

```javascript
async render() {
  if (this.nodes.length === 0) return;

  const { MindmapRenderer } = await import('../core/MindmapRenderer.js');
  this.renderer = new MindmapRenderer(this.viewport, {
    onNodeClick: (id) => {
      const index = this.nodes.findIndex(n => n.id === id);
      if (index >= 0) {
        this.activeIndex = index;
        this.update();
      }
    }
  });
  this.renderer.loadTree(this.nodes);
  this.showControls();
}
```

- [ ] **Step 3: 语法检查**

```bash
npm run check
```

- [ ] **Step 4: 提交**

```bash
git add src/components/Presentation.js
git commit -m "feat: 创建 Presentation 组件"
```

---

## Task 3: 添加 present() 方法到 App

**Files:**
- Modify: `src/app.js:51-116`

- [ ] **Step 1: 在 App 类中添加 present() 方法**

在 `bindEvents()` 方法后添加：

```javascript
async present() {
  const { Presentation } = await import('./components/Presentation.js');
  const flattened = this.flattenNodes(this.state.projectData.nodes);
  if (flattened.length === 0) {
    alert('没有可放映的节点');
    return;
  }

  const presentContainer = document.createElement('div');
  document.body.appendChild(presentContainer);

  new Presentation(presentContainer, {
    nodes: flattened,
    onExit: () => {
      if (presentContainer.parentNode) {
        presentContainer.parentNode.removeChild(presentContainer);
      }
    }
  });
}
```

- [ ] **Step 2: 在 bindEvents() 中绑定放映按钮**

在 `bindEvents()` 方法中添加：

```javascript
document.getElementById('presentBtn')?.addEventListener('click', () => this.present());
```

- [ ] **Step 3: 语法检查**

```bash
npm run check
```

- [ ] **Step 4: 提交**

```bash
git add src/app.js
git commit -m "feat: 集成 Presentation 到 App"
```

---

## Task 4: 添加控制栏 CSS 样式

**Files:**
- Modify: `src/styles/presentation.css`

- [ ] **Step 1: 在 presentation.css 末尾添加控制栏样式**

```css
/* Presentation controls */
.presentation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--bg-color, #fcfcf8);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.presentation-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.presentation-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 10000;
}

.presentation-controls.hidden {
  opacity: 0;
  pointer-events: none;
}

.presentation-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.presentation-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.presentation-exit {
  margin-left: auto;
}

.presentation-progress {
  font-size: 16px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}
```

- [ ] **Step 2: 语法检查**

```bash
npm run check
```

- [ ] **Step 3: 测试完整流程**

启动开发服务器，打开浏览器：
1. 添加几个节点
2. 点击"放映"按钮
3. 验证进入全屏
4. 使用键盘/按钮导航
5. 验证进度显示
6. 按 ESC 退出

- [ ] **Step 4: 提交**

```bash
git add src/styles/presentation.css
git commit -m "feat: 添加放映控制栏样式"
```

---

## Task 5: 集成测试与修复

**Files:**
- Modify: `src/components/Presentation.js`
- Modify: `src/app.js`

- [ ] **Step 1: 测试 MindmapRenderer 集成**

检查 Presentation 组件中 MindmapRenderer 的调用方式是否正确。需要确认：
1. MindmapRenderer 构造函数参数
2. loadTree() 方法是否存在
3. setActiveNode() 方法签名

如果 MindmapRenderer 没有 loadTree() 方法，需要改用其他方式加载数据。

- [ ] **Step 2: 修复发现的问题**

根据测试结果修复代码。

- [ ] **Step 3: 语法检查**

```bash
npm run check
```

- [ ] **Step 4: 最终测试**

完整测试放映功能：
1. 启动开发服务器
2. 添加多个节点（至少3层嵌套）
3. 点击"放映"
4. 验证全屏显示
5. 使用 → 键导航到下一个节点
6. 使用 ← 键返回上一个节点
7. 点击"下一步"按钮
8. 点击"上一步"按钮
9. 验证进度显示正确
10. 按 ESC 退出
11. 点击"退出"按钮退出
12. 验证回到编辑器

- [ ] **Step 5: 提交**

```bash
git add src/components/Presentation.js src/app.js
git commit -m "feat: 完成放映功能集成测试与修复"
```
