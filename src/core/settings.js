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
        const storedSettings = JSON.parse(data);
        return this.deepMerge({ ...DEFAULT_SETTINGS }, storedSettings);
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
    const target = keys.reduce((obj, key) => {
      if (obj[key] === undefined || obj[key] === null || typeof obj[key] !== 'object') {
        obj[key] = {};
      }
      return obj[key];
    }, this.settings);
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

  deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  getDefaults() {
    return { ...DEFAULT_SETTINGS };
  }
}
