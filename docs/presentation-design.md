# 放映功能设计文档

## 概述

为思维导图PPT编辑器添加全屏放映功能。逐节点放映，每次点击进入下一个节点（前序遍历），当前节点高亮，其他节点可见。导航逻辑完全复用现有 MindmapRenderer 的行为。

## 功能描述

### 入口

工具栏右侧添加 "放映" 按钮（在"导出项目"按钮左侧）。

### 全屏放映

- 调用 `requestFullscreen()` 进入全屏
- 复用现有 MindmapRenderer 渲染思维导图
- 复用现有导航逻辑（前序遍历、摄像机动画、节点可见性）
- 底部显示半透明控制栏（3秒无操作后自动隐藏）

### 导航控件

底部控制栏布局：

```
[◀ 上一步]   1 / 12   [下一步 ▶]        [✕ 退出]
```

- **上一步**：点击 / ← 键，回到前一个节点
- **下一步**：点击 / → 键 / 空格，进入下一个节点
- **退出**：点击 / ESC 键，退出全屏回到编辑器
- **进度显示**：中央显示 "当前 / 总数"

### 节点样式

完全复用现有 CSS 变量和规则，无额外样式。

## 架构

### 新增文件

| 文件 | 职责 |
|------|------|
| `src/components/Presentation.js` | 全屏容器、导航状态、键盘事件、退出逻辑 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/app.js` | 添加 `present()` 方法，创建 Presentation 实例 |
| `src/styles/main.css` | 添加 `.present-btn` 按钮样式 |
| `index.html` | 工具栏添加放映按钮 |

### 组件职责

| 组件 | 职责 |
|------|------|
| `App.present()` | 创建 Presentation，传递节点数据 |
| `Presentation` | 全屏管理、键盘事件、导航状态、退出逻辑 |
| `MindmapRenderer` | 渲染思维导图（复用现有） |

### 数据流

```
App.present()
  → new Presentation(container, { nodes: flattenedNodes })
  → requestFullscreen()
  → MindmapRenderer.render()
  → 用户导航 → setActiveIndex(index) → MindmapRenderer 更新
  → ESC / 退出按钮 → exitFullscreen() → 销毁 Presentation
```

### 键盘事件

| 按键 | 功能 |
|------|------|
| ← / ↑ | 上一步 |
| → / ↓ / 空格 | 下一步 |
| ESC | 退出放映 |

键盘事件监听在 Presentation 组件上，退出时移除。

### 控制栏自动隐藏

- 进入放映后 3 秒无操作，控制栏淡出
- 鼠标移动 / 按键时控制栏显示
- 使用 CSS transition 实现淡入淡出

## 实现要点

1. Presentation 构造函数接收 `container`（全屏挂载点）和 `options.nodes`（扁平化节点数组）
2. Presentation 内部创建 MindmapRenderer 实例
3. `setActiveIndex(index)` 更新 `activeIndex` 并调用 `MindmapRenderer.setActiveNode()`
4. `exitFullscreen()` 销毁 Presentation 并通知 App
5. 键盘事件在 Presentation 上绑定，退出时解绑
6. 控制栏使用 CSS `opacity` + `transition` 实现自动隐藏
