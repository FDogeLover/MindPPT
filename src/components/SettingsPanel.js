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
      
      if (config.group === 'ai') {
        this.renderAiSettings(contentContainer);
      }
    });
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
    
    // 找到包含"服务商"标签的settings-item元素
    const settingsItems = container.querySelectorAll('.settings-item');
    let providerItem = null;
    for (const item of settingsItems) {
      const label = item.querySelector('.settings-item-label');
      if (label && label.textContent === '服务商') {
        providerItem = item;
        break;
      }
    }
    
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