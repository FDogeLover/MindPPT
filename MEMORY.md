# Project Memory

## Session Log

| 日期 | 内容 |
|------|------|
| 2026-05-28 | 项目初始化：基于 agegr/mindmap-ppt 模板创建新项目 |
| 2026-05-28 | Task 1: 项目基础设置 - 重构为编辑器 MVP |
| 2026-05-28 | Task 2: App 类实现 |
| 2026-05-28 | Task 3: NodeTree 树形结构组件 |
| 2026-05-28 | Task 4: NodeEditor 节点编辑组件 |

## 决策日志

### 2026-05-28: 项目初始化
- **决策**: 使用 agegr/mindmap-ppt 作为模板创建新项目
- **原因**: 该项目功能完善，零依赖，适合快速启动
- **方案**: 复制核心文件，修改配置，创建项目文档

### 2026-05-28: Task 1 - 项目基础设置
- **决策**: 重构为编辑器 MVP，替换原有展示器代码
- **原因**: 目标是创建用户友好的编辑器，非展示器
- **方案**: 精简 index.html 为 shell 结构，创建新 CSS 基础样式，main.js 引用 app.js（待实现）
- **变更**: package.json 改名 mindmap-ppt-editor，添加 build 脚本

### 2026-05-28: Task 3 - NodeTree 树形结构组件
- **决策**: 创建独立的 NodeTree 组件用于编辑器左侧面板
- **原因**: 提供直观的树形结构视图，方便用户编辑思维导图节点
- **方案**: 使用递归渲染实现树形结构，事件委托处理交互，CSS 变量保持样式一致性
- **变更**: 新增 src/components/NodeTree.js、src/styles/editor.css，修改 app.js 和 index.html

### 2026-05-28: Task 4 - NodeEditor 节点编辑组件
- **决策**: 创建 NodeEditor 组件用于编辑器右侧面板下方区域
- **原因**: 用户选中节点后需要编辑节点属性（主标题、副标题、图片）
- **方案**: 表单式编辑器，支持实时输入更新；图片操作（上传、AI生成、移除）预留回调接口
- **变更**: 新增 src/components/NodeEditor.js，追加 editor.css 样式，重构 app.js 集成 NodeEditor

### 2026-05-28: Task 6 - AI调用封装模块
- **决策**: 创建 AI 类封装 Mimo 和通义千问 API 调用
- **原因**: 需要支持 AI 生成思维导图功能，统一 API 调用接口
- **方案**: 创建 src/core/ai.js，支持两种 AI 服务商，提供 generateMindmap 方法生成思维导图，parseResponse 解析响应
- **变更**: 新增 src/core/ai.js，修改 app.js 导入 AI 类并添加测试代码

## 技术发现

### 模板项目特点
- 零依赖：无 npm dependencies，纯原生 JS
- Markdown 数据格式：`- 副标题` + 缩进`主标题` = 两行标签
- 前序遍历：节点按前序顺序展示
- HTML 渲染：节点使用 DOM 元素，非 SVG
- SVG 连线：使用贝塞尔曲线连接节点

### 关键配置
- 开发服务器端口: 5173
- 缩放范围: 70%-140%
- 动画时长: 820-920ms
- 配色方案: 暖白背景 + 深青选中 + 橙色强调

### NodeTree 组件特点
- 递归渲染树形结构，支持任意深度嵌套
- 使用事件委托处理节点点击、添加、删除
- 通过 CSS 类 .active 高亮选中节点
- hover 时显示操作按钮（添加/删除）
- 支持 update() 方法更新节点数据和选中状态

### NodeEditor 组件特点
- 表单式编辑：主标题、副标题实时同步到数据模型
- 图片操作：上传、AI生成、移除，预留回调接口
- 空状态处理：未选中节点时显示提示
- 支持 update() 方法切换编辑目标节点

### AI调用封装模块特点
- 支持两种AI服务商：Mimo（OpenAI格式）和通义千问（DashScope格式）
- 统一的 AI 类接口，通过 provider 参数切换服务商
- generateMindmap 方法：根据主题生成思维导图 Markdown 格式
- parseResponse 方法：解析 AI 响应，提取节点数据
- 错误处理：API 调用失败时抛出明确错误信息

## 进度追踪

### 已完成
- [x] 创建项目目录结构
- [x] 复制核心文件 (index.html, src/, scripts/)
- [x] 创建 package.json
- [x] 创建项目 AGENTS.md
- [x] 创建项目 MEMORY.md
- [x] 创建示例 source.js 数据
- [x] 更新 index.html 标题
- [x] 验证项目语法检查通过
- [x] Task 1: 项目基础设置 - 重构为编辑器 MVP
- [x] Task 2: App 类实现
- [x] Task 3: NodeTree 树形结构组件
- [x] Task 4: NodeEditor 节点编辑组件
- [x] Task 6: AI调用封装模块

### 待完成
- [ ] Task 5: Markdown 解析器
- [ ] 添加示例图片资源到 project/assets/

## 调试经验

### 2026-05-28: AI模块测试
- 开发服务器启动后，通过curl验证了ai.js和app.js文件可以正常访问
- 语法检查通过，无JS错误
- AI模块初始化测试代码在控制台输出正确信息

## 会话记录

### Session 1: 2026-05-28
- 用户请求克隆 agegr/mindmap-ppt 项目
- 用户请求深入了解项目架构
- 用户请求以模板创建新项目并初始化
- 完成项目初始化，所有核心文件已创建

### Session 2: 2026-05-28 (Task 1)
- 实现项目基础设置
- 重构 package.json、index.html、src/main.js、src/styles/main.css
- 验证开发服务器能正常启动并返回正确 HTML
- 初始化 git 仓库并提交

### Session 3: 2026-05-28 (Task 4)
- 创建 NodeEditor 组件，支持节点标题/副标题/图片编辑
- 在 editor.css 追加编辑器表单样式
- 重构 app.js：提取 state.nodes、实现节点选择联动 NodeTree ↔ NodeEditor
- 添加 findNodeById、handleNodeChange 等辅助方法
- 语法检查通过，代码已提交

### Session 4: 2026-05-28 (Task 6)
- 创建 AI 调用封装模块 src/core/ai.js
- 支持 Mimo 和通义千问两种 AI 服务商
- 提供 generateMindmap 方法生成思维导图
- 修改 app.js 导入 AI 类并添加测试代码
- 语法检查通过，开发服务器测试通过
- 代码已提交
