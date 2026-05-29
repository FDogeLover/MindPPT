# Settings Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a settings panel to the Mindmap PPT Editor for customizing PPT style, text style, and AI configuration.

**Architecture:** Left-side sliding panel with collapsible groups, real-time preview updates, and localStorage persistence. Uses hybrid approach: config-driven for simple settings, component-based for complex AI configuration.

**Tech Stack:** Vanilla JavaScript, CSS transitions, localStorage API

---

## File Structure

```
src/
├── core/
│   └── settings.js           # Settings manager (read/write localStorage)
├── config/
│   └── settings-config.js    # Settings configuration
├── components/
│   ├── SettingsPanel.js      # Main panel container
│   ├── SettingsGroup.js      # Collapsible group component
│   └── SettingsItem.js       # Config-driven settings item
├── styles/
│   └── settings.css          # Panel styles
└── app.js                    # Modified to integrate panel
```

---

### Task 1: Create Settings Manager

**Files:**
- Create: `src/core/settings.js`

- [ ] **Step 1: Create settings.js with localStorage operations**

```javascript
const SETTINGS_KEY = 'mindmap-ppt-settings';

const DEFAULT_SETTINGS = {
  pptStyle: {
    colorScheme: 'default',
    bgStyle: { type: 'solid', color: '#fcfcf8' },
    nodeStyle: { borderRadius: 8, shadow: true, bgColor: '#ffffff', borderColor: '#eee' },
    lineStyle: { type: 'curve', color: '#999999', width: 2 },
    animation: { type: 'fade', duration: 300 }
  },
  textStyle: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
    fontSize: { title: 16, subtitle: 14, desc: 12 },
    fontWeight: 'normal',
    color: '#172033',
    align: 'left'
  },
  ai: {
    provider: 'mimo',
    customEndpoint: '',
    apiKey: '',
    model: 'mimo-v2.5'
  }
};

export class Settings {
  constructor() {
    this.settings = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  save() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.settings);
  }

  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj[key], this.settings);
    target[lastKey] = value;
  }

  reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
  }

  applyTheme(themeName) {
    const themes = {
      default: DEFAULT_SETTINGS.pptStyle,
      business: {
        colorScheme: 'business',
        bgStyle: { type: 'solid', color: '#f5f7fa' },
        nodeStyle: { borderRadius: 4, shadow: true, bgColor: '#ffffff', borderColor: '#e1e8ed' },
        lineStyle: { type: 'straight', color: '#2c5282', width: 2 },
        animation: { type: 'fade', duration: 300 }
      },
      minimal: {
        colorScheme: 'minimal',
        bgStyle: { type: 'solid', color: '#ffffff' },
        nodeStyle: { borderRadius: 0, shadow: false, bgColor: '#ffffff', borderColor: '#000000' },
        lineStyle: { type: 'curve', color: '#000000', width: 1 },
        animation: { type: 'none', duration: 0 }
      },
      vibrant: {
        colorScheme: 'vibrant',
        bgStyle: { type: 'solid', color: '#fff8f0' },
        nodeStyle: { borderRadius: 12, shadow: true, bgColor: '#ffffff', borderColor: '#d8894f' },
        lineStyle: { type: 'curve', color: '#d8894f', width: 3 },
        animation: { type: 'slide', duration: 400 }
      }
    };
    
    if (themes[themeName]) {
      this.settings.pptStyle = { ...themes[themeName] };
      this.save();
    }
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.settings));
  }

  getAll() {
    return { ...this.settings };
  }

  getDefaults() {
    return { ...DEFAULT_SETTINGS };
  }
}
```

- [ ] **Step 2: Verify module loads correctly**

Run: `node --check src/core/settings.js`
Expected: No output (no syntax errors)

- [ ] **Step 3: Commit**

```bash
git add src/core/settings.js
git commit -m "feat: add settings manager with localStorage persistence"
```

---

### Task 2: Create Settings Configuration

**Files:**
- Create: `src/config/settings-config.js`

- [ ] **Step 1: Create settings-config.js with UI definitions**

```javascript
export const COLOR_SCHEMES = [
  { value: 'default', label: '默认' },
  { value: 'business', label: '商务' },
  { value: 'minimal', label: '简约' },
  { value: 'vibrant', label: '活力' }
];

export const BG_TYPES = [
  { value: 'solid', label: '纯色' },
  { value: 'gradient', label: '渐变' }
];

export const LINE_TYPES = [
  { value: 'curve', label: '曲线' },
  { value: 'straight', label: '直线' }
];

export const ANIMATION_TYPES = [
  { value: 'fade', label: '淡入' },
  { value: 'slide', label: '滑动' },
  { value: 'none', label: '无' }
];

export const FONT_FAMILIES = [
  { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif', label: '系统默认' },
  { value: '"PingFang SC", "Microsoft YaHei", sans-serif', label: '微软雅黑' },
  { value: '"Source Han Sans SC", "Noto Sans CJK SC", sans-serif', label: '思源黑体' },
  { value: 'SimSun, "Songti SC", serif', label: '宋体' }
];

export const FONT_WEIGHTS = [
  { value: 'normal', label: '正常' },
  { value: 'bold', label: '粗体' }
];

export const TEXT_ALIGNMENTS = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐' }
];

export const AI_PROVIDERS = [
  { value: 'mimo', label: 'Mimo' },
  { value: 'qwen', label: '通义千问' },
  { value: 'custom', label: '自定义' }
];

export const API_FORMATS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'dashscope', label: '通义千问' },
  { value: 'ollama', label: 'Ollama' }
];

export const SETTINGS_CONFIG = [
  {
    group: 'pptStyle',
    label: 'PPT风格',
    icon: '🎨',
    items: [
      { key: 'colorScheme', label: '配色方案', type: 'select', options: COLOR_SCHEMES },
      { key: 'bgStyle.type', label: '背景类型', type: 'select', options: BG_TYPES },
      { key: 'bgStyle.color', label: '背景颜色', type: 'color' },
      { key: 'nodeStyle.borderRadius', label: '节点圆角', type: 'slider', min: 0, max: 24, unit: 'px' },
      { key: 'nodeStyle.shadow', label: '节点阴影', type: 'checkbox' },
      { key: 'lineStyle.type', label: '连线样式', type: 'select', options: LINE_TYPES },
      { key: 'lineStyle.color', label: '连线颜色', type: 'color' },
      { key: 'lineStyle.width', label: '连线粗细', type: 'slider', min: 1, max: 6, unit: 'px' },
      { key: 'animation.type', label: '动画类型', type: 'select', options: ANIMATION_TYPES },
      { key: 'animation.duration', label: '动画时长', type: 'slider', min: 0, max: 1000, unit: 'ms' }
    ]
  },
  {
    group: 'textStyle',
    label: '文字样式',
    icon: '✏️',
    items: [
      { key: 'textStyle.fontFamily', label: '字体', type: 'select', options: FONT_FAMILIES },
      { key: 'textStyle.fontSize.title', label: '标题字号', type: 'slider', min: 12, max: 32, unit: 'px' },
      { key: 'textStyle.fontSize.subtitle', label: '副标题字号', type: 'slider', min: 10, max: 24, unit: 'px' },
      { key: 'textStyle.fontSize.desc', label: '描述字号', type: 'slider', min: 8, max: 20, unit: 'px' },
      { key: 'textStyle.fontWeight', label: '字重', type: 'select', options: FONT_WEIGHTS },
      { key: 'textStyle.color', label: '文字颜色', type: 'color' },
      { key: 'textStyle.align', label: '对齐方式', type: 'select', options: TEXT_ALIGNMENTS }
    ]
  },
  {
    group: 'ai',
    label: 'AI设置',
    icon: '🤖',
    items: [
      { key: 'ai.provider', label: '服务商', type: 'select', options: AI_PROVIDERS }
    ]
  }
];
```

- [ ] **Step 2: Verify module loads correctly**

Run: `node --check src/config/settings-config.js`
Expected: No output (no syntax errors)

- [ ] **Step 3: Commit**

```bash
git add src/config/settings-config.js
git commit -m "feat: add settings configuration with UI definitions"
```

---

### Task 3: Create SettingsGroup Component

**Files:**
- Create: `src/components/SettingsGroup.js`

- [ ] **Step 1: Create SettingsGroup.js with collapsible UI**

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsGroup.js
git commit -m "feat: add SettingsGroup component with collapsible UI"
```

---

### Task 4: Create SettingsItem Component

**Files:**
- Create: `src/components/SettingsItem.js`

- [ ] **Step 1: Create SettingsItem.js with config-driven rendering**

```javascript
export class SettingsItem {
  constructor(config, value, onChange) {
    this.config = config;
    this.value = value;
    this.onChange = onChange;
    this.element = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'settings-item';
    
    const label = document.createElement('label');
    label.className = 'settings-item-label';
    label.textContent = this.config.label;
    
    const control = this.createControl();
    
    this.element.appendChild(label);
    this.element.appendChild(control);
    
    return this.element;
  }

  createControl() {
    switch (this.config.type) {
      case 'select':
        return this.createSelect();
      case 'color':
        return this.createColor();
      case 'slider':
        return this.createSlider();
      case 'checkbox':
        return this.createCheckbox();
      default:
        return document.createElement('span');
    }
  }

  createSelect() {
    const select = document.createElement('select');
    select.className = 'settings-item-select';
    
    this.config.options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      opt.selected = option.value === this.value;
      select.appendChild(opt);
    });
    
    select.addEventListener('change', (e) => {
      this.value = e.target.value;
      this.onChange(this.config.key, this.value);
    });
    
    return select;
  }

  createColor() {
    const wrapper = document.createElement('div');
    wrapper.className = 'settings-item-color';
    
    const input = document.createElement('input');
    input.type = 'color';
    input.value = this.value || '#000000';
    input.className = 'settings-item-color-input';
    
    const text = document.createElement('input');
    text.type = 'text';
    text.value = this.value || '';
    text.className = 'settings-item-color-text';
    text.placeholder = '#000000';
    
    input.addEventListener('input', (e) => {
      text.value = e.target.value;
      this.value = e.target.value;
      this.onChange(this.config.key, this.value);
    });
    
    text.addEventListener('change', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        input.value = e.target.value;
        this.value = e.target.value;
        this.onChange(this.config.key, this.value);
      }
    });
    
    wrapper.appendChild(input);
    wrapper.appendChild(text);
    
    return wrapper;
  }

  createSlider() {
    const wrapper = document.createElement('div');
    wrapper.className = 'settings-item-slider';
    
    const input = document.createElement('input');
    input.type = 'range';
    input.min = this.config.min || 0;
    input.max = this.config.max || 100;
    input.value = this.value || 0;
    input.className = 'settings-item-slider-input';
    
    const value = document.createElement('span');
    value.className = 'settings-item-slider-value';
    value.textContent = `${this.value}${this.config.unit || ''}`;
    
    input.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      value.textContent = `${val}${this.config.unit || ''}`;
      this.value = val;
      this.onChange(this.config.key, val);
    });
    
    wrapper.appendChild(input);
    wrapper.appendChild(value);
    
    return wrapper;
  }

  createCheckbox() {
    const wrapper = document.createElement('div');
    wrapper.className = 'settings-item-checkbox';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = this.value || false;
    input.className = 'settings-item-checkbox-input';
    
    input.addEventListener('change', (e) => {
      this.value = e.target.checked;
      this.onChange(this.config.key, this.value);
    });
    
    wrapper.appendChild(input);
    
    return wrapper;
  }

  updateValue(value) {
    this.value = value;
    const control = this.element?.querySelector('select, input');
    if (control) {
      if (control.type === 'checkbox') {
        control.checked = value;
      } else {
        control.value = value;
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsItem.js
git commit -m "feat: add SettingsItem component with config-driven rendering"
```

---

### Task 5: Create SettingsPanel Component

**Files:**
- Create: `src/components/SettingsPanel.js`

- [ ] **Step 1: Create SettingsPanel.js as main container**

```javascript
import { SettingsGroup } from './SettingsGroup.js';
import { SettingsItem } from './SettingsItem.js';
import { SETTINGS_CONFIG, AI_PROVIDERS, API_FORMATS } from '../config/settings-config.js';

export class SettingsPanel {
  constructor(container, options = {}) {
    this.container = container;
    this.settings = options.settings;
    this.onSave = options.onSave || (() => {});
    this.onCancel = options.onCancel || (() => {});
    this.onPreview = options.onPreview || (() => {});
    
    this.isOpen = false;
    this.tempSettings = {};
    this.hasChanges = false;
    this.groups = [];
    
    this.init();
  }

  init() {
    this.element = document.createElement('div');
    this.element.className = 'settings-panel';
    
    this.element.innerHTML = `
      <div class="settings-header">
        <h2>设置</h2>
        <div class="settings-header-actions">
          <button class="btn btn-small" id="settingsReset">重置</button>
          <button class="btn btn-small btn-icon" id="settingsClose">×</button>
        </div>
      </div>
      <div class="settings-body"></div>
      <div class="settings-footer">
        <button class="btn btn-secondary" id="settingsCancel">取消</button>
        <button class="btn btn-primary" id="settingsSave">保存</button>
      </div>
    `;
    
    this.container.appendChild(this.element);
    this.body = this.element.querySelector('.settings-body');
    
    this.tempSettings = this.settings.getAll();
    this.renderGroups();
    this.bindEvents();
  }

  renderGroups() {
    this.body.innerHTML = '';
    this.groups = [];
    
    SETTINGS_CONFIG.forEach(config => {
      const content = this.createGroupContent(config);
      const group = new SettingsGroup({
        label: config.label,
        icon: config.icon,
        content: '',
        collapsed: false
      });
      
      const groupElement = group.render();
      this.body.appendChild(groupElement);
      
      const contentContainer = groupElement.querySelector('.settings-group-content');
      content.forEach(item => contentContainer.appendChild(item));
      
      this.groups.push(group);
    });
    
    if (config.group === 'ai') {
      this.renderAiSettings(contentContainer);
    }
  }

  createGroupContent(config) {
    const items = [];
    
    config.items.forEach(itemConfig => {
      const value = this.getNestedValue(this.tempSettings, itemConfig.key);
      const item = new SettingsItem(itemConfig, value, (key, val) => {
        this.setNestedValue(this.tempSettings, key, val);
        this.hasChanges = true;
        this.onPreview(this.tempSettings);
      });
      items.push(item.render());
    });
    
    return items;
  }

  renderAiSettings(container) {
    const provider = this.tempSettings.ai?.provider || 'mimo';
    
    const providerItem = container.querySelector('[data-key="ai.provider"]');
    if (providerItem) {
      const customConfig = document.createElement('div');
      customConfig.className = 'ai-custom-config';
      customConfig.style.display = provider === 'custom' ? 'block' : 'none';
      
      customConfig.innerHTML = `
        <div class="settings-item">
          <label class="settings-item-label">API地址</label>
          <input type="text" class="settings-item-input" id="aiEndpoint" 
                 value="${this.tempSettings.ai?.customEndpoint || ''}" 
                 placeholder="https://api.example.com/v1">
        </div>
        <div class="settings-item">
          <label class="settings-item-label">请求格式</label>
          <select class="settings-item-select" id="aiFormat">
            ${API_FORMATS.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
          </select>
        </div>
        <div class="settings-item">
          <label class="settings-item-label">API Key</label>
          <input type="password" class="settings-item-input" id="aiApiKey" 
                 value="${this.tempSettings.ai?.apiKey || ''}" 
                 placeholder="sk-...">
        </div>
        <div class="settings-item">
          <label class="settings-item-label">模型名称</label>
          <input type="text" class="settings-item-input" id="aiModel" 
                 value="${this.tempSettings.ai?.model || ''}" 
                 placeholder="gpt-3.5-turbo">
        </div>
        <div class="settings-item">
          <label class="settings-item-label"></label>
          <button class="btn btn-small" id="aiTestConnection">测试连接</button>
          <span class="ai-test-result" id="aiTestResult"></span>
        </div>
      `;
      
      container.appendChild(customConfig);
      
      const providerSelect = providerItem.querySelector('select');
      if (providerSelect) {
        providerSelect.addEventListener('change', (e) => {
          this.tempSettings.ai.provider = e.target.value;
          customConfig.style.display = e.target.value === 'custom' ? 'block' : 'none';
          this.hasChanges = true;
          this.onPreview(this.tempSettings);
        });
      }
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  bindEvents() {
    this.element.querySelector('#settingsClose')?.addEventListener('click', () => this.close());
    this.element.querySelector('#settingsCancel')?.addEventListener('click', () => this.close());
    this.element.querySelector('#settingsSave')?.addEventListener('click', () => this.save());
    this.element.querySelector('#settingsReset')?.addEventListener('click', () => this.reset());
    
    this.element.querySelector('#aiTestConnection')?.addEventListener('click', () => this.testConnection());
  }

  open() {
    this.isOpen = true;
    this.element.classList.add('open');
    this.tempSettings = this.settings.getAll();
    this.hasChanges = false;
    this.renderGroups();
  }

  close() {
    if (this.hasChanges) {
      if (!confirm('有未保存的修改，确定关闭？')) {
        return;
      }
    }
    this.isOpen = false;
    this.element.classList.remove('open');
    this.onCancel();
  }

  save() {
    Object.assign(this.settings.settings, this.tempSettings);
    this.settings.save();
    this.hasChanges = false;
    this.isOpen = false;
    this.element.classList.remove('open');
    this.onSave(this.tempSettings);
  }

  reset() {
    if (confirm('确定恢复默认设置？')) {
      this.tempSettings = this.settings.getDefaults();
      this.hasChanges = true;
      this.renderGroups();
      this.onPreview(this.tempSettings);
    }
  }

  async testConnection() {
    const endpoint = this.element.querySelector('#aiEndpoint')?.value;
    const apiKey = this.element.querySelector('#aiApiKey')?.value;
    const model = this.element.querySelector('#aiModel')?.value;
    const format = this.element.querySelector('#aiFormat')?.value;
    const resultEl = this.element.querySelector('#aiTestResult');
    const testBtn = this.element.querySelector('#aiTestConnection');
    
    if (!endpoint || !apiKey || !model) {
      resultEl.textContent = '请填写所有字段';
      resultEl.className = 'ai-test-result error';
      return;
    }
    
    testBtn.disabled = true;
    testBtn.textContent = '测试中...';
    resultEl.textContent = '';
    
    try {
      const body = this.buildTestBody(format, model);
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        resultEl.textContent = '✓ 连接成功';
        resultEl.className = 'ai-test-result success';
      } else {
        const error = await response.text();
        resultEl.textContent = `✗ 连接失败: ${response.statusText}`;
        resultEl.className = 'ai-test-result error';
      }
    } catch (error) {
      resultEl.textContent = `✗ 连接失败: ${error.message}`;
      resultEl.className = 'ai-test-result error';
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '测试连接';
    }
  }

  buildTestBody(format, model) {
    const messages = [{ role: 'user', content: 'Hi' }];
    
    switch (format) {
      case 'openai':
        return { model, messages, max_tokens: 5 };
      case 'dashscope':
        return { model, input: { messages }, parameters: { max_tokens: 5 } };
      case 'ollama':
        return { model, prompt: 'Hi', stream: false };
      default:
        return { model, messages, max_tokens: 5 };
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsPanel.js
git commit -m "feat: add SettingsPanel component with full functionality"
```

---

### Task 6: Create Settings CSS

**Files:**
- Create: `src/styles/settings.css`

- [ ] **Step 1: Create settings.css with panel styles**

```css
.settings-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.settings-panel.open {
  transform: translateX(0);
}

.main-content.panel-open {
  margin-left: 300px;
  transition: margin-left 0.3s ease;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.settings-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--primary-color);
}

.settings-header-actions {
  display: flex;
  gap: 8px;
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.settings-group {
  margin-bottom: 16px;
}

.settings-group-header {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.settings-group-header:hover {
  background: #eee;
}

.settings-group-icon {
  margin-right: 8px;
}

.settings-group-label {
  flex: 1;
  font-weight: 600;
}

.settings-group-arrow {
  color: #999;
}

.settings-group-content {
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: 8px 0;
}

.settings-group.collapsed .settings-group-content {
  max-height: 0;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.settings-item-label {
  width: 80px;
  font-size: 0.9rem;
  color: #666;
}

.settings-item-select,
.settings-item-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.settings-item-select:focus,
.settings-item-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.settings-item-color {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.settings-item-color-input {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.settings-item-color-text {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.settings-item-slider {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.settings-item-slider-input {
  flex: 1;
}

.settings-item-slider-value {
  min-width: 50px;
  text-align: right;
  font-size: 0.85rem;
  color: #666;
}

.settings-item-checkbox {
  flex: 1;
}

.settings-item-checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.ai-custom-config {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.ai-test-result {
  margin-left: 8px;
  font-size: 0.85rem;
}

.ai-test-result.success {
  color: #22c55e;
}

.ai-test-result.error {
  color: #ef4444;
}

.settings-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
}

.settings-footer .btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.settings-footer .btn-primary {
  background: var(--primary-color);
  color: white;
}

.settings-footer .btn-primary:hover {
  background: #1a4558;
}

.settings-footer .btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.settings-footer .btn-secondary:hover {
  background: #eee;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/settings.css
git commit -m "feat: add settings panel styles with glassmorphism effect"
```

---

### Task 7: Integrate Settings Panel into App

**Files:**
- Modify: `src/app.js`
- Modify: `index.html`

- [ ] **Step 1: Import Settings and SettingsPanel in app.js**

Add to top of src/app.js:
```javascript
import { Settings } from './core/settings.js';
import { SettingsPanel } from './components/SettingsPanel.js';
```

- [ ] **Step 2: Initialize Settings in App constructor**

In App constructor, after `this.exporter = new Exporter();`, add:
```javascript
this.settings = new Settings();
```

- [ ] **Step 3: Add settings button to toolbar in render()**

In the toolbar-right div, add before closing div:
```html
<button class="btn btn-icon" id="settingsBtn" title="设置">⚙️</button>
```

- [ ] **Step 4: Initialize SettingsPanel in initComponents()**

At the end of initComponents() method, add:
```javascript
this.settingsPanel = new SettingsPanel(document.body, {
  settings: this.settings,
  onSave: (newSettings) => this.onSettingsSave(newSettings),
  onCancel: () => this.onSettingsCancel(),
  onPreview: (tempSettings) => this.onSettingsPreview(tempSettings)
});
```

- [ ] **Step 5: Add event binding for settings button in bindEvents()**

In bindEvents() method, add:
```javascript
document.getElementById('settingsBtn')?.addEventListener('click', () => this.toggleSettings());
```

- [ ] **Step 6: Add settings methods to App class**

Add these methods to App class:
```javascript
toggleSettings() {
  this.settingsPanel.toggle();
}

onSettingsSave(newSettings) {
  this.applySettings(newSettings);
  this.updateComponents();
}

onSettingsCancel() {
  this.applySettings(this.settings.getAll());
  this.updateComponents();
}

onSettingsPreview(tempSettings) {
  this.applySettings(tempSettings);
  this.updateComponents();
}

applySettings(settings) {
  const preview = document.querySelector('.preview-panel');
  if (preview) {
    preview.style.background = settings.pptStyle?.bgStyle?.color || '#fcfcf8';
  }
}
```

- [ ] **Step 7: Add settings CSS link to index.html**

In index.html head, add:
```html
<link rel="stylesheet" href="./src/styles/settings.css" />
```

- [ ] **Step 8: Commit**

```bash
git add src/app.js index.html
git commit -m "feat: integrate settings panel into main application"
```

---

### Task 8: Add Settings Button Icon Styles

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add btn-icon styles**

Add to end of src/styles/main.css:
```css
.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: var(--text-color);
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f5f5f5;
  border-color: #ccc;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/main.css
git commit -m "style: add icon button styles for settings"
```

---

### Task 9: Test Settings Panel Functionality

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Test panel open/close**

1. Click settings button (⚙️)
2. Verify panel slides in from left
3. Click close button (×)
4. Verify panel slides out

- [ ] **Step 3: Test settings changes**

1. Open settings panel
2. Change color scheme
3. Verify preview updates in real-time
4. Click save
5. Refresh page
6. Verify settings persist

- [ ] **Step 4: Test AI custom provider**

1. Open settings panel
2. Select "自定义" provider
3. Fill in API endpoint, key, model
4. Click test connection
5. Verify connection result shows

- [ ] **Step 5: Test reset functionality**

1. Open settings panel
2. Make changes
3. Click reset button
4. Confirm reset
5. Verify settings revert to defaults

- [ ] **Step 6: Test unsaved changes warning**

1. Open settings panel
2. Make changes
3. Click close button
4. Verify confirmation dialog appears

- [ ] **Step 7: Commit final state**

```bash
git add -A
git commit -m "feat: complete settings panel implementation"
```

---

## Summary

This plan implements a fully functional settings panel with:

1. **Settings Manager** - localStorage persistence with change listeners
2. **Configuration** - Config-driven UI definitions for all settings
3. **Components** - SettingsGroup (collapsible), SettingsItem (config-driven), SettingsPanel (container)
4. **Styling** - Glassmorphism effect with smooth animations
5. **Integration** - Connected to main app with real-time preview
6. **Features** - Preset themes, reset, test connection, unsaved changes warning

**Total Tasks:** 9  
**Estimated Time:** 2-3 hours
