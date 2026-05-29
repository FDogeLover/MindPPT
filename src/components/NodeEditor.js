import { escapeHtml } from "../utils/escapeHtml.js";

export class NodeEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.node = options.node || null;
    this.currentNodeId = options.node?.id || null;
    this.onChange = options.onChange || (() => {});
    this.onImageUpload = options.onImageUpload || (() => {});
    this.bindEvents();
    this.render();
  }

  render() {
    if (!this.node) {
      this.container.innerHTML = `
        <div class="node-editor-empty">
          <p>请选择一个节点进行编辑</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="node-editor-header">
        <h3>编辑节点</h3>
      </div>
      <div class="node-editor-form">
        <div class="form-group">
          <label>主标题</label>
          <input type="text" id="nodeSubtitle" value="${escapeHtml(this.node.subtitle || "")}" placeholder="可选的副标题">
        </div>
        <div class="form-group">
          <label>副标题（小字）</label>
          <input type="text" id="nodeTitle" value="${escapeHtml(this.node.title || "")}" placeholder="节点主标题">
        </div>
        <div class="form-group">
          <label>图片</label>
          <div class="image-preview" id="imagePreview">
            ${
              this.node.image
                ? `
              <img src="${escapeHtml(this.node.image.src)}" alt="${escapeHtml(this.node.image.alt || "")}">
              <button class="btn-remove-image" id="removeImage">×</button>
            `
                : `
              <div class="image-placeholder">无图片</div>
            `
            }
          </div>
          <div class="image-actions">
            <button class="btn btn-small" id="uploadImage">上传图片</button>
            <button class="btn btn-small" id="generateImage">AI生成</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const titleInput = this.container.querySelector("#nodeTitle");
    const subtitleInput = this.container.querySelector("#nodeSubtitle");

    titleInput?.addEventListener("input", (e) => {
      this.onChange({ title: e.target.value });
    });

    subtitleInput?.addEventListener("input", (e) => {
      this.onChange({ subtitle: e.target.value });
    });

    this.container
      .querySelector("#uploadImage")
      ?.addEventListener("click", () => {
        this.onImageUpload("local");
      });

    this.container
      .querySelector("#generateImage")
      ?.addEventListener("click", () => {
        this.onImageUpload("ai");
      });

    this.container
      .querySelector("#removeImage")
      ?.addEventListener("click", () => {
        this.onChange({ image: null });
      });
  }

  update(node) {
    this.node = node;
    
    // 如果没有节点，重新渲染为空状态
    if (!node) {
      this.currentNodeId = null;
      this.render();
      return;
    }
    
    // 检查是否切换到了不同的节点
    if (node.id !== this.currentNodeId) {
      this.currentNodeId = node.id;
      this.render();
      return;
    }
    
    // 同一个节点，只更新图片部分，不重新渲染输入框
    const imagePreview = this.container.querySelector("#imagePreview");
    if (imagePreview) {
      imagePreview.innerHTML = this.node.image
        ? `<img src="${escapeHtml(this.node.image.src)}" alt="${escapeHtml(this.node.image.alt || "")}">
           <button class="btn-remove-image" id="removeImage">×</button>`
        : `<div class="image-placeholder">无图片</div>`;
      
      // 重新绑定图片删除事件
      imagePreview.querySelector("#removeImage")?.addEventListener("click", () => {
        this.onChange({ image: null });
      });
    }
  }
}
