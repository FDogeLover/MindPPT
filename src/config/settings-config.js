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
      { key: 'fontFamily', label: '字体', type: 'select', options: FONT_FAMILIES },
      { key: 'fontSize.title', label: '标题字号', type: 'slider', min: 12, max: 32, unit: 'px' },
      { key: 'fontSize.subtitle', label: '副标题字号', type: 'slider', min: 10, max: 24, unit: 'px' },
      { key: 'fontSize.desc', label: '描述字号', type: 'slider', min: 8, max: 20, unit: 'px' },
      { key: 'fontWeight', label: '字重', type: 'select', options: FONT_WEIGHTS },
      { key: 'color', label: '文字颜色', type: 'color' },
      { key: 'align', label: '对齐方式', type: 'select', options: TEXT_ALIGNMENTS }
    ]
  },
  {
    group: 'ai',
    label: 'AI设置',
    icon: '🤖',
    items: [
      { key: 'provider', label: '服务商', type: 'select', options: AI_PROVIDERS }
    ]
  }
];
