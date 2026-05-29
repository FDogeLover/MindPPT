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
