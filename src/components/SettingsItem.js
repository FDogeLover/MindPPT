export class SettingsItem {
  constructor(config, value, onChange) {
    this.config = config;
    this.value = value;
    this.onChange = onChange;
    this.element = null;
    this.handlers = {};
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

    this.handlers.selectChange = (e) => {
      this.value = e.target.value;
      this.onChange(this.config.key, this.value);
    };
    select.addEventListener('change', this.handlers.selectChange);

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

    this.handlers.colorInput = (e) => {
      text.value = e.target.value;
      this.value = e.target.value;
      this.onChange(this.config.key, this.value);
    };
    input.addEventListener('input', this.handlers.colorInput);

    this.handlers.colorText = (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        input.value = e.target.value;
        this.value = e.target.value;
        this.onChange(this.config.key, this.value);
      }
    };
    text.addEventListener('change', this.handlers.colorText);

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

    this.handlers.sliderInput = (e) => {
      const val = Number(e.target.value);
      value.textContent = `${val}${this.config.unit || ''}`;
      this.value = val;
      this.onChange(this.config.key, val);
    };
    input.addEventListener('input', this.handlers.sliderInput);

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

    this.handlers.checkboxChange = (e) => {
      this.value = e.target.checked;
      this.onChange(this.config.key, this.value);
    };
    input.addEventListener('change', this.handlers.checkboxChange);

    wrapper.appendChild(input);

    return wrapper;
  }

  updateValue(value) {
    this.value = value;
    if (!this.element) return;
    
    switch (this.config.type) {
      case 'select':
        const select = this.element.querySelector('select');
        if (select) select.value = value;
        break;
      case 'color':
        const colorInput = this.element.querySelector('input[type="color"]');
        const colorText = this.element.querySelector('input[type="text"]');
        if (colorInput) colorInput.value = value;
        if (colorText) colorText.value = value;
        break;
      case 'slider':
        const sliderInput = this.element.querySelector('input[type="range"]');
        const sliderValue = this.element.querySelector('.settings-item-slider-value');
        if (sliderInput) sliderInput.value = value;
        if (sliderValue) sliderValue.textContent = `${value}${this.config.unit || ''}`;
        break;
      case 'checkbox':
        const checkbox = this.element.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = value;
        break;
    }
  }

  destroy() {
    if (!this.element) return;
    
    switch (this.config.type) {
      case 'select':
        const select = this.element.querySelector('select');
        if (select && this.handlers.selectChange) {
          select.removeEventListener('change', this.handlers.selectChange);
          this.handlers.selectChange = null;
        }
        break;
      case 'color':
        const colorInput = this.element.querySelector('input[type="color"]');
        const colorText = this.element.querySelector('input[type="text"]');
        if (colorInput && this.handlers.colorInput) {
          colorInput.removeEventListener('input', this.handlers.colorInput);
          this.handlers.colorInput = null;
        }
        if (colorText && this.handlers.colorText) {
          colorText.removeEventListener('change', this.handlers.colorText);
          this.handlers.colorText = null;
        }
        break;
      case 'slider':
        const sliderInput = this.element.querySelector('input[type="range"]');
        if (sliderInput && this.handlers.sliderInput) {
          sliderInput.removeEventListener('input', this.handlers.sliderInput);
          this.handlers.sliderInput = null;
        }
        break;
      case 'checkbox':
        const checkbox = this.element.querySelector('input[type="checkbox"]');
        if (checkbox && this.handlers.checkboxChange) {
          checkbox.removeEventListener('change', this.handlers.checkboxChange);
          this.handlers.checkboxChange = null;
        }
        break;
    }
    
    this.element = null;
  }
}
