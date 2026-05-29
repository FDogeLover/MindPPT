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
      
      // 创建API地址设置项
      const endpointItem = document.createElement('div');
      endpointItem.className = 'settings-item';
      const endpointLabel = document.createElement('label');
      endpointLabel.className = 'settings-item-label';
      endpointLabel.textContent = 'API地址';
      const endpointInput = document.createElement('input');
      endpointInput.type = 'text';
      endpointInput.className = 'settings-item-input';
      endpointInput.id = 'aiEndpoint';
      endpointInput.value = this.tempSettings.ai?.customEndpoint || '';
      endpointInput.placeholder = 'https://api.example.com/v1';
      endpointItem.appendChild(endpointLabel);
      endpointItem.appendChild(endpointInput);
      
      // 创建请求格式设置项
      const formatItem = document.createElement('div');
      formatItem.className = 'settings-item';
      const formatLabel = document.createElement('label');
      formatLabel.className = 'settings-item-label';
      formatLabel.textContent = '请求格式';
      const formatSelect = document.createElement('select');
      formatSelect.className = 'settings-item-select';
      formatSelect.id = 'aiFormat';
      API_FORMATS.forEach(f => {
        const option = document.createElement('option');
        option.value = f.value;
        option.textContent = f.label;
        formatSelect.appendChild(option);
      });
      formatItem.appendChild(formatLabel);
      formatItem.appendChild(formatSelect);
      
      // 创建API Key设置项
      const apiKeyItem = document.createElement('div');
      apiKeyItem.className = 'settings-item';
      const apiKeyLabel = document.createElement('label');
      apiKeyLabel.className = 'settings-item-label';
      apiKeyLabel.textContent = 'API Key';
      const apiKeyInput = document.createElement('input');
      apiKeyInput.type = 'password';
      apiKeyInput.className = 'settings-item-input';
      apiKeyInput.id = 'aiApiKey';
      apiKeyInput.value = this.tempSettings.ai?.apiKey || '';
      apiKeyInput.placeholder = 'sk-...';
      apiKeyItem.appendChild(apiKeyLabel);
      apiKeyItem.appendChild(apiKeyInput);
      
      // 创建模型名称设置项
      const modelItem = document.createElement('div');
      modelItem.className = 'settings-item';
      const modelLabel = document.createElement('label');
      modelLabel.className = 'settings-item-label';
      modelLabel.textContent = '模型名称';
      const modelInput = document.createElement('input');
      modelInput.type = 'text';
      modelInput.className = 'settings-item-input';
      modelInput.id = 'aiModel';
      modelInput.value = this.tempSettings.ai?.model || '';
      modelInput.placeholder = 'gpt-3.5-turbo';
      modelItem.appendChild(modelLabel);
      modelItem.appendChild(modelInput);
      
      // 创建测试连接按钮项
      const testButtonItem = document.createElement('div');
      testButtonItem.className = 'settings-item';
      const testButtonLabel = document.createElement('label');
      testButtonLabel.className = 'settings-item-label';
      testButtonLabel.textContent = '';
      const testButton = document.createElement('button');
      testButton.className = 'btn btn-small';
      testButton.id = 'aiTestConnection';
      testButton.textContent = '测试连接';
      const testResult = document.createElement('span');
      testResult.className = 'ai-test-result';
      testResult.id = 'aiTestResult';
      testButtonItem.appendChild(testButtonLabel);
      testButtonItem.appendChild(testButton);
      testButtonItem.appendChild(testResult);
      
      // 添加所有设置项到容器
      customConfig.appendChild(endpointItem);
      customConfig.appendChild(formatItem);
      customConfig.appendChild(apiKeyItem);
      customConfig.appendChild(modelItem);
      customConfig.appendChild(testButtonItem);
      
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
    // 注意：这里直接修改 Settings 实例的内部 .settings 属性，
    // 然后立即调用 save() 持久化。这种模式在当前实现中是安全的，
    // 因为 Settings 类没有验证逻辑，且 save() 会触发 listeners。
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
    // 获取DOM元素并添加空值检查
    const endpointEl = this.element.querySelector('#aiEndpoint');
    const apiKeyEl = this.element.querySelector('#aiApiKey');
    const modelEl = this.element.querySelector('#aiModel');
    const formatEl = this.element.querySelector('#aiFormat');
    const resultEl = this.element.querySelector('#aiTestResult');
    const testBtn = this.element.querySelector('#aiTestConnection');
    
    // 检查所有必需的DOM元素是否存在
    if (!endpointEl || !apiKeyEl || !modelEl || !formatEl || !resultEl || !testBtn) {
      console.error('测试连接所需的DOM元素不存在');
      return;
    }
    
    const endpoint = endpointEl.value;
    const apiKey = apiKeyEl.value;
    const model = modelEl.value;
    const format = formatEl.value;
    
    if (!endpoint || !apiKey || !model) {
      resultEl.textContent = '请填写所有字段';
      resultEl.className = 'ai-test-result error';
      return;
    }
    
    testBtn.disabled = true;
    testBtn.textContent = '测试中...';
    resultEl.textContent = '';
    
    // 安全说明：API密钥直接发送到用户指定的端点是预期行为。
    // 用户正在测试他们自己的API密钥与他们自己的端点。
    // 密钥仅发送到用户配置的endpoint，不会存储或传输到其他地方。
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