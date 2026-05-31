# Mindmap PPT Editor Project

思维导图PPT编辑器项目，基于 agegr/mindmap-ppt 模板构建，提供可视化编辑和AI生成功能。

## Project Overview

这是一个静态前端项目，用于创建和编辑思维导图PPT演示。

- 纯 HTML/CSS/JS 实现，无构建步骤，无运行时依赖
- 提供可视化编辑器界面，支持节点树形结构编辑
- 支持AI生成思维导图内容
- 支持全屏放映演示功能
- 项目数据使用JSON格式存储，支持本地存储和文件导入导出

## 核心功能模块

### 编辑器功能
- **NodeTree组件**：树形结构视图，支持节点选择、添加、删除
- **NodeEditor组件**：节点属性编辑，支持标题、副标题、图片编辑
- **Preview组件**：思维导图预览，实时显示编辑效果
- **SettingsPanel组件**：设置面板，支持配色方案、样式配置

### AI生成功能
- 支持Mimo和通义千问两种AI服务商
- 根据主题自动生成思维导图内容
- 支持API Key配置和模型选择

### 存储管理功能
- 浏览器本地存储（localStorage）
- 文件导入导出（.mindmap格式）
- 自动保存和手动保存

### 放映功能
- 全屏放映模式
- 前序遍历导航
- 键盘和鼠标交互
- 控制栏自动隐藏

## 核心文件结构

```
├── index.html                 # 页面入口和顶部控件
├── project/
│   ├── source.js             # 示例Markdown数据（未使用）
│   └── assets/               # 项目图片素材目录
├── src/
│   ├── main.js               # 应用入口，导入App类
│   ├── app.js                # 主应用类，管理状态和组件
│   ├── components/           # UI组件
│   │   ├── NodeTree.js       # 树形结构组件
│   │   ├── NodeEditor.js     # 节点编辑组件
│   │   ├── Preview.js        # 预览组件
│   │   ├── Presentation.js   # 放映组件
│   │   ├── SettingsPanel.js  # 设置面板组件
│   │   ├── SettingsGroup.js  # 设置分组组件
│   │   └── SettingsItem.js   # 设置项组件
│   ├── core/                 # 核心模块
│   │   ├── MindmapRenderer.js # 思维导图渲染器
│   │   ├── ai.js             # AI调用封装
│   │   ├── storage.js        # 存储管理
│   │   ├── exporter.js       # 导出功能
│   │   └── settings.js       # 设置管理
│   ├── config/               # 配置文件
│   │   └── settings-config.js # 设置配置
│   ├── styles/               # 样式文件
│   │   ├── main.css          # 主样式
│   │   ├── editor.css        # 编辑器样式
│   │   ├── player.css        # 播放器样式
│   │   ├── presentation.css  # 放映样式
│   │   └── settings.css      # 设置样式
│   └── utils/                # 工具函数
│       └── escapeHtml.js     # HTML转义
├── scripts/
│   └── dev-server.js         # 开发服务器
└── docs/                     # 文档目录
```

## 运行与检查

- 启动本地开发服务器: `npm run dev`
- 语法检查: `npm run check`
- 开发地址: `http://127.0.0.1:5173/`

## 交互规则

### 编辑器模式
- 左侧树形结构显示节点层级关系
- 点击节点选中并显示编辑面板
- 支持添加、删除节点操作
- 右侧预览区实时显示思维导图效果

### 放映模式
- 左右方向键或点击按钮切换节点
- 前序遍历顺序导航
- 控制栏3秒无操作自动隐藏
- ESC键退出放映

### 设置配置
- 支持多种配色方案（默认、商务、简约、活力）
- 可自定义节点样式、连线样式、动画效果
- 支持文字样式配置

## 布局规则

- 思维导图使用水平布局，从左到右展开
- 节点使用HTML元素渲染，连线使用SVG贝塞尔曲线
- 支持缩放和平移操作
- 响应式设计，适配不同屏幕尺寸

## 动画规则

- 节点进入/离开动画
- 连线绘制动画
- 摄像机平滑过渡
- 控制栏淡入淡出效果

## 配色方案

默认配色方案：
- 背景: `#fcfcf8`（暖白）
- 选中节点: `#183a4a`（深青）
- 强调色: `#d8894f`（橙色）
- 完成节点: `#eef7f3`（浅绿）
- 路径节点: `#fffdf8`（近白）
- 卡片和按钮使用 `8px` 圆角

## Memory (约束——必须遵守)

### 主动维护 MEMORY.md
- 每次会话结束时，将重要决策、发现、进度写入 `MEMORY.md`
- 格式参照 `~/.config/opencode/framework/project-memory-framework.md`

### Memory 内容要求
- 决策日志：记录为什么选择某个方案
- 进度追踪：记录已完成和待完成的任务
- 调试经验：记录遇到的问题和解决方案
- 技术发现：记录项目特有的约束和易错点

## Development Notes

- 保持项目零依赖，除非有明确理由添加工具
- 编辑时优先使用 `apply_patch`
- 浏览器缓存可能保留旧的 `src/main.js`，如需硬刷新请使用 Ctrl+Shift+R
- 组件更新后调用 `updateComponents()` 同步所有视图
- 使用CSS变量保持样式一致性，避免硬编码值

## Git 同步流程

### 触发词
用户说"整理提交"、"同步到云端"、"git sync"时执行此流程。

### 执行步骤

**第1步：检查状态**
```bash
git status
git log --oneline -5
```

**第2步：分析变更**
```bash
git diff --stat
git diff --cached --stat
```

**第3步：AI分类（交互式）**
根据变更内容，AI 分析并建议分组：
- 按功能模块分类（auth、api、ui 等）
- 按变更类型分类（feat、fix、docs 等）
- 显示预览，等待用户确认

**第4步：执行提交**
- 按分组依次 `git add` + `git commit`
- 最后统一 `git push origin main`

**第5步：报告结果**
显示提交历史和 push 结果。

### 提交规范
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式调整（不影响逻辑）
- `refactor`: 重构（非新功能、非修复）
- `chore`: 构建/工具变更
- `test`: 测试相关