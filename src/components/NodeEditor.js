export class NodeEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.node = options.node || null;
    this.onChange = options.onChange || (() => {});
    this.onImageUpload = options.onImageUpload || (() => {});
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
          <label>副标题（小字）</label>
          <input type="text" id="nodeSubtitle" value="${this.node.subtitle || ''}" placeholder="可选的副标题">
        </div>
        <div class="form-group">
          <label>主标题</label>
          <input type="text" id="nodeTitle" value="${this.node.title || ''}" placeholder="节点主标题">
        </div>
        <div class="form-group">
          <label>图片</label>
          <div class="image-preview" id="imagePreview">
            ${this.node.image ? `
              <img src="${this.node.image.src}" alt="${this.node.image.alt || ''}">
              <button class="btn-remove-image" id="removeImage">×</button>
            ` : `
              <div class="image-placeholder">无图片</div>
            `}
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
    const titleInput = this.container.querySelector('#nodeTitle');
    const subtitleInput = this.container.querySelector('#nodeSubtitle');
    
    titleInput?.addEventListener('input', (e) => {
      this.onChange({ title: e.target.value });
    });
    
    subtitleInput?.addEventListener('input', (e) => {
      this.onChange({ subtitle: e.target.value });
    });
    
    this.container.querySelector('#uploadImage')?.addEventListener('click', () => {
      this.onImageUpload('local');
    });
    
    this.container.querySelector('#generateImage')?.addEventListener('click', () => {
      this.onImageUpload('ai');
    });
    
    this.container.querySelector('#removeImage')?.addEventListener('click', () => {
      this.onChange({ image: null });
    });
  }

  update(node) {
    this.node = node;
    this.render();
  }
}