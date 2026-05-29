export class SettingsGroup {
  constructor(options = {}) {
    this.label = options.label || '';
    this.icon = options.icon || '';
    this.collapsed = options.collapsed ?? false;
    this.content = options.content || '';
    this.onToggle = options.onToggle || (() => {});
    this.element = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = `settings-group ${this.collapsed ? 'collapsed' : ''}`;
    
    this.element.innerHTML = `
      <div class="settings-group-header">
        <span class="settings-group-icon">${this.icon}</span>
        <span class="settings-group-label">${this.label}</span>
        <span class="settings-group-arrow">${this.collapsed ? '▶' : '▼'}</span>
      </div>
      <div class="settings-group-content">
        ${this.content}
      </div>
    `;
    
    this.element.querySelector('.settings-group-header').addEventListener('click', () => {
      this.toggle();
    });
    
    return this.element;
  }

  toggle() {
    this.collapsed = !this.collapsed;
    this.element.classList.toggle('collapsed', this.collapsed);
    this.element.querySelector('.settings-group-arrow').textContent = this.collapsed ? '▶' : '▼';
    this.onToggle(this.collapsed);
  }

  setContent(content) {
    this.content = content;
    const contentEl = this.element?.querySelector('.settings-group-content');
    if (contentEl) {
      contentEl.innerHTML = content;
    }
  }

  collapse() {
    if (!this.collapsed) this.toggle();
  }

  expand() {
    if (this.collapsed) this.toggle();
  }
}