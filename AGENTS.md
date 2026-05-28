# Mindmap PPT Project

思维导图式PPT演示项目，基于 agegr/mindmap-ppt 模板构建。

## Project Overview

这是一个静态前端项目，用于创建可播放的思维导图PPT演示。

- 项目数据存放在 `project/source.js`，导出 Markdown 树结构
- 节点按前序遍历顺序展示
- 节点渲染为 HTML 元素，连线使用 SVG 曲线
- 纯 HTML/CSS/JS 实现，无构建步骤，无运行时依赖

## Markdown 数据规则

- 每个树节点是一个无序列表项
- 支持缩进续行实现两行标签：

```md
- 副标题
  主标题
    - 子节点标题
      子节点描述
```

- 第一行是副标题/分类标签，第二行是主标题
- 节点可选附加一张图片，使用 `@image` 元数据行：

```md
- 展示设计
  画布布局与动画策略
  @image layout.svg
```

- `@image` 行不显示为节点文本
- 图片路径相对于 `project/` 目录

## 核心文件

- `index.html`: 页面入口和顶部控件
- `project/source.js`: 项目 Markdown 数据，替换此文件可更改思维导图内容
- `project/assets/`: 项目图片素材目录
- `src/main.js`: 导入项目数据，解析 Markdown，处理前序导航、布局模型、HTML节点同步、SVG连线同步
- `src/styles.css`: 页面样式、节点/连线样式、滑条样式、动画

## 运行与检查

- 启动本地开发服务器: `npm run dev`
- 语法检查: `npm run check`
- 开发地址: `http://127.0.0.1:5173/`

## 交互规则

- 上/下方向键移动到上/下一个前序节点
- 顶部箭头按钮执行相同操作
- 范围滑条直接跳转到指定前序索引
- 缩放滑条控制摄像机距离，整体缩放约 70%-140%，默认 100%
- 点击可见节点移动摄像机到该节点位置，不改变选中状态

## 布局规则

- 当前从根节点到选中节点的路径是水平的
- 已访问但不在路径上的分支出现在其父节点上方
- 未访问节点完全隐藏，不占布局空间
- 节点和字体大小使用 CSS 像素，除非用户改变缩放滑条

## 动画规则

- 节点内容使用 CSS transitions:
  - 进入状态: `scale(0.58)`, `opacity: 0`
  - 选中状态: `scale(1.15)`, `opacity: 1`
  - 普通状态: `scale(1)`
- 节点移动/大小过渡约 820-860ms
- 节点内容变换过渡约 920ms
- 连线显示动画使用 keyframe-based `link-draw`

## 配色方案

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
