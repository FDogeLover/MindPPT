# 设置面板设计方案

## 概述

为思维导图PPT编辑器添加设置面板功能，支持PPT风格、文字样式、AI配置的自定义设置。

## 设计决策

| 决策项 | 选择 | 原因 |
|--------|------|------|
| 面板形式 | 侧边抽屉（左侧展开） | 实时预览，不遮挡预览区域 |
| 分组方式 | 按功能分组，可折叠 | 结构清晰，易于扩展 |
| 实现方案 | 混合方案（组件化+配置驱动） | 简单设置配置化，复杂设置组件化 |
| 视觉风格 | 毛玻璃效果 | 与预览区域风格一致 |
| 动画效果 | 平滑滑动（300ms） | 流畅自然 |
| 保存方式 | 实时预览+确认保存 | 防止误操作 |

## 架构设计

### 文件结构

```
src/
├── components/
│   ├── SettingsPanel.js      # 设置面板容器
│   ├── SettingsGroup.js      # 可折叠分组组件
│   └── SettingsItem.js       # 设置项组件（配置驱动）
├── core/
│   └── settings.js           # 设置管理器（读写localStorage）
└── config/
    └── settings-config.js    # 设置配置文件
```

### 数据流

```
用户调整设置
    ↓
SettingsPanel 更新临时状态
    ↓
实时预览（调用 updateComponents）
    ↓
关闭面板时询问是否保存
    ↓
保存 → settings.js 写入 localStorage
丢弃 → 恢复之前的设置
```

### 设置数据结构

```javascript
{
  pptStyle: {
    colorScheme: 'default',    // 配色方案
    bgStyle: { type: 'solid', color: '#fcfcf8' },
    nodeStyle: { borderRadius: 8, shadow: true },
    lineStyle: { type: 'curve', color: '#999', width: 2 },
    animation: { type: 'fade', duration: 300 }
  },
  textStyle: {
    fontFamily: 'system-ui',
    fontSize: { title: 16, subtitle: 14, desc: 12 },
    fontWeight: 'normal',
    color: '#172033',
    align: 'left'
  },
  ai: {
    provider: 'custom',
    customEndpoint: '',
    apiKey: '',
    model: ''
  }
}
```

## UI 组件设计

### 设置面板布局

```
┌─────────────────────────────────────────┐
│  设置              [重置] [×]           │
├─────────────────────────────────────────┤
│  ▼ PPT风格                              │
│  ┌─────────────────────────────────────┐│
│  │ 配色方案    [默认 ▾]                ││
│  │ 背景样式    [纯色] [#fcfcf8]        ││
│  │ 节点样式    圆角[8] 阴影[✓]        ││
│  │ 连线样式    [曲线] 颜色[#999]       ││
│  │ 动画效果    [淡入] 时长[300ms]      ││
│  └─────────────────────────────────────┘│
│                                         │
│  ▶ 文字样式                              │
│  ▶ AI设置                               │
├─────────────────────────────────────────┤
│  [恢复默认]              [保存] [取消]  │
└─────────────────────────────────────────┘
```

### 组件职责

| 组件 | 职责 |
|------|------|
| SettingsPanel | 容器，管理状态、保存/取消逻辑 |
| SettingsGroup | 可折叠分组，标题 + 展开/收起 |
| SettingsItem | 根据配置渲染：select、color、slider、checkbox |

### 交互流程

1. **点击齿轮按钮** → 面板从左侧滑入
2. **调整设置** → 实时更新预览
3. **点击保存** → 写入 localStorage，关闭面板
4. **点击取消** → 恢复之前的设置，关闭面板
5. **点击重置** → 恢复预设主题
6. **点击外部区域/再次点击齿轮** → 等同于取消

## 预设主题

| 主题名 | 配色方案 | 背景 | 节点样式 | 连线样式 |
|--------|----------|------|----------|----------|
| 默认 | 暖白+深青 | #fcfcf8 | 圆角8px | 曲线灰色 |
| 商务 | 蓝灰+深蓝 | #f5f7fa | 圆角4px | 直线深蓝 |
| 简约 | 纯白+黑 | #ffffff | 直角 | 曲线黑色 |
| 活力 | 渐变+橙 | #fff8f0 | 圆角12px | 曲线橙色 |

### 默认值

```javascript
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
```

## AI 设置 - 自定义接口

### AI 设置面板布局

```
┌─────────────────────────────────────────┐
│  ▼ AI设置                               │
│  ┌─────────────────────────────────────┐│
│  │ 服务商       [自定义 ▾]             ││
│  │                                      ││
│  │ ── 自定义接口配置 ──                 ││
│  │ API地址    [                    ]    ││
│  │ 请求格式   [OpenAI ▾]               ││
│  │ API Key    [                    ]    ││
│  │ 模型名称   [                    ]    ││
│  │                                      ││
│  │ [测试连接]  ✓ 连接成功              ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 服务商选项

| 服务商 | 说明 |
|--------|------|
| Mimo | 预设：endpoint + model 已填 |
| 通义千问 | 预设：endpoint + model 已填 |
| 自定义 | 用户填写所有字段 |

### 请求格式选项

| 格式 | 请求体结构 |
|------|-----------|
| OpenAI | `{ model, messages: [{role, content}] }` |
| 通义千问 | `{ model, input: { messages }, parameters }` |
| Ollama | `{ model, prompt, stream: false }` |

### 测试连接功能

1. 点击"测试连接"按钮
2. 发送测试请求（发送简单的 ping 或单条消息）
3. 显示结果：✓ 连接成功 / ✗ 连接失败（错误信息）
4. 测试期间禁用按钮，显示加载状态

## CSS 样式和动画

### 设置面板样式

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
```

### 布局调整

```css
/* 设置面板打开时，主内容区域右移 */
.main-content.panel-open {
  margin-left: 300px;
  transition: margin-left 0.3s ease;
}
```

### 分组折叠动画

```css
.settings-group-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.settings-group.collapsed .settings-group-content {
  max-height: 500px;
}
```

### 底部按钮栏

```css
.settings-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
}

.settings-footer .btn-save {
  flex: 1;
  background: var(--primary-color);
  color: white;
}

.settings-footer .btn-cancel {
  flex: 1;
}
```

### 未保存提醒

关闭面板时如果有未保存的修改：
```javascript
if (hasChanges) {
  const confirmed = confirm('有未保存的修改，确定关闭？');
  if (!confirmed) return;
}
```

## 实施计划

### 任务分解

| 阶段 | 任务 | 预计工作量 |
|------|------|-----------|
| 1. 基础设施 | 创建 settings.js 设置管理器 | 小 |
| 2. 基础设施 | 创建 settings-config.js 配置文件 | 小 |
| 3. 组件开发 | 创建 SettingsGroup.js 可折叠分组 | 小 |
| 4. 组件开发 | 创建 SettingsItem.js 配置驱动渲染 | 中 |
| 5. 组件开发 | 创建 SettingsPanel.js 面板容器 | 中 |
| 6. 集成 | 修改 app.js 集成设置面板 | 小 |
| 7. 样式 | 添加设置面板 CSS 样式 | 中 |
| 8. 功能 | 实现预设主题和重置功能 | 小 |
| 9. 功能 | 实现 AI 自定义接口配置 | 中 |
| 10. 测试 | 功能测试和 bug 修复 | 中 |

### 实施顺序

```
阶段1-2: 基础设施（无UI）
    ↓
阶段3-5: 组件开发（独立测试）
    ↓
阶段6: 集成到 app.js
    ↓
阶段7: 样式完善
    ↓
阶段8-9: 功能完善
    ↓
阶段10: 测试
```

### 成功标准

1. ✅ 点击齿轮按钮，设置面板从左侧滑入
2. ✅ 调整设置时，右侧预览实时更新
3. ✅ 点击保存，设置持久化到 localStorage
4. ✅ 刷新页面，设置自动恢复
5. ✅ 预设主题一键切换
6. ✅ AI 自定义接口可测试连接
7. ✅ 关闭面板时未保存修改有提醒
