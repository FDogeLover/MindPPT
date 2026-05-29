import { escapeHtml } from '../utils/escapeHtml.js';

export class SettingsGroup {
  constructor(options = {}) {
    this.label = options.label || '';
    this.icon = options.icon || '';
    this.collapsed = options.collapsed ?? false;
    this.content = options.content || '';
    this.onToggle = options.onToggle || (() => {});
    this.element = null;
    this.headerClickHandler = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = `settings-group ${this.collapsed ? 'collapsed' : ''}`;
    
    // Create header
    const header = document.createElement('div');
    header.className = 'settings-group-header';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'settings-group-icon';
    iconSpan.textContent = this.icon;
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'settings-group-label';
    labelSpan.textContent = this.label;
    
    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'settings-group-arrow';
    arrowSpan.textContent = this.collapsed ? '▶' : '▼';
    
    header.appendChild(iconSpan);
    header.appendChild(labelSpan);
    header.appendChild(arrowSpan);
    
    // Create content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'settings-group-content';
    // Note: content is expected to be trusted HTML from SettingsItem components
    // Do not use with user-provided content without sanitization
    contentDiv.innerHTML = this.content;
    
    this.element.appendChild(header);
    this.element.appendChild(contentDiv);
    
    // Store handler reference for cleanup
    this.headerClickHandler = () => this.toggle();
    header.addEventListener('click', this.headerClickHandler);
    
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
      // Note: content is expected to be trusted HTML from SettingsItem components
      // Do not use with user-provided content without sanitization
      contentEl.innerHTML = content;
    }
  }

  collapse() {
    if (!this.collapsed) this.toggle();
  }

  expand() {
    if (this.collapsed) this.toggle();
  }

  destroy() {
    if (this.element) {
      const header = this.element.querySelector('.settings-group-header');
      if (header && this.headerClickHandler) {
        header.removeEventListener('click', this.headerClickHandler);
        this.headerClickHandler = null;
      }
      this.element = null;
    }
  }
}