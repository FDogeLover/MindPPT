# Project Memory

## Session Log

| 日期 | 内容 |
|------|------|
| 2026-05-28 | 项目初始化：基于 agegr/mindmap-ppt 模板创建新项目 |
| 2026-05-28 | Task 1: 项目基础设置 - 重构为编辑器 MVP |
| 2026-05-28 | Task 2: App 类实现 |
| 2026-05-28 | Task 3: NodeTree 树形结构组件 |
| 2026-05-28 | Task 4: NodeEditor 节点编辑组件 |
| 2026-05-28 | Task 6: AI调用封装模块 |
| 2026-05-28 | Task 7: 存储管理模块 |
| 2026-05-29 | Task 6: 创建Settings CSS（代码质量修复） |
| 2026-05-29 | Task 9: 测试设置面板 - 修复key path解析bug |
| 2026-05-29 | 修复 Settings 深拷贝问题 - 防止 DEFAULT_SETTINGS 被污染 |
| 2026-05-29 | 项目探索 - 全面了解项目架构和功能 |
| 2026-05-29 | 修复文字样式颜色设置不生效 - 选中节点使用错误CSS变量 |

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

### 2026-05-28: Task 7 - 存储管理模块
- **决策**: 创建 Storage 类封装浏览器本地存储和文件导入导出功能
- **原因**: 需要支持项目保存、加载、导入导出，提供数据持久化能力
- **方案**: 创建 src/core/storage.js，提供 saveProject、loadProject、clearProject、exportToFile、importFromFile 方法
- **变更**: 新增 src/core/storage.js，修改 app.js 导入 Storage 类并添加按钮事件处理

### 2026-05-29: Task 6 - Settings CSS 代码质量修复
- **决策**: 移除未使用的CSS规则，提取硬编码值为CSS变量
- **原因**: 
  1. `.main-content.panel-open` 规则从未被JavaScript应用，属于死代码
  2. 面板宽度 `300px` 在两处硬编码，违反DRY原则
- **方案**: 
  1. 删除未使用的 `.main-content.panel-open` 规则
  2. 在 `:root` 中定义 `--settings-panel-width: 300px` 变量
  3. 将 `.settings-panel` 的 `width` 改为使用该变量
- **变更**: 修改 `src/styles/main.css` 和 `src/styles/settings.css`

### 2026-05-29: Task 9 - 修复设置面板key path解析bug
- **决策**: 统一config key为相对路径，由createGroupContent自动拼接group前缀
- **原因**: 
  1. PPT风格组的key是相对路径（如 `nodeStyle.borderRadius`），需要拼接 `pptStyle.` 前缀
  2. 文字样式和AI组的key已经包含了完整路径（如 `textStyle.fontSize.title`）
  3. 这种不一致导致文字样式组的slider显示 `undefinedpx`
- **方案**: 
  1. 修改 `settings-config.js`，统一所有config key为相对路径
  2. 修改 `SettingsPanel.createGroupContent()`，自动拼接group key前缀
  3. 修改回调中的key，也使用完整路径
- **变更**: 修改 `src/config/settings-config.js` 和 `src/components/SettingsPanel.js`

### 2026-05-30: 项目框架检查与修复
- **决策**: 全面更新AGENTS.md，反映项目实际状态
- **原因**: AGENTS.md描述的是"思维导图PPT演示"项目，但实际是"思维导图PPT编辑器"，文档与实现严重不符
- **方案**:
  1. 更新项目描述：从演示器改为编辑器
  2. 补充编辑器功能模块文档（NodeTree、NodeEditor、Preview等）
  3. 更新核心文件结构：反映实际的src/styles/目录
  4. 修复配置一致性：移除不存在的build脚本
  5. 保留source.js作为示例数据参考
- **变更**: 修改 `AGENTS.md`、`package.json`，更新 `MEMORY.md`

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

### Storage存储管理模块特点
- 浏览器本地存储：使用 localStorage 保存项目数据
- 文件导入导出：支持 .mindmap 格式的 JSON 文件
- 错误处理：所有操作都有 try-catch，返回成功/失败状态
- 自动加载：初始化时尝试从本地存储加载项目
- 按钮集成：新建项目、打开文件、保存项目、导出HTML 按钮已绑定事件

### Markdown解析器特点
- 实现在 `src/core/MindmapRenderer.js` 的 `parseMarkdownTree` 方法中
- 支持解析 `- 副标题` + 缩进`主标题` 的两行标签格式
- 支持 `@image` 元数据行解析图片路径
- 使用栈结构处理嵌套层级，支持任意深度
- 生成带id、label、children、depth等属性的节点树

### Settings CSS 代码质量修复
- 移除了未使用的CSS规则（`.main-content.panel-open`），该规则从未被JavaScript应用
- 提取了重复的硬编码值为CSS变量（`--settings-panel-width`），便于统一维护
- CSS变量定义在 `:root` 伪类中，确保全局可用
- 使用 `var(--variable-name)` 引用变量，保持样式一致性

### 2026-05-29: localStorage 数据格式不兼容导致颜色设置报错
- 错误：`Cannot create property 'title' on string '#183533'`
- 根本原因：旧版代码将 `textStyle.color` 存为字符串，新版期望 `{ title, subtitle }` 对象。`deepMerge` 用字符串覆盖对象，`setNestedValue` 在字符串上创建属性失败
- 修复：`settings.js` 添加 `migrateData()` 和 `load()` 中的格式兼容转换
- 教训：localStorage 数据格式变更时必须做向前兼容迁移

### 2026-05-29: 节点文字颜色变量隔离
- 问题：`applySettings` 直接设置 `--text-color`，该变量被 `main.css` 中的 `body`、`.btn` 等 UI 元素共用，导致文字样式颜色设置影响了整个界面（按钮、设置标签等）
- 修复：将节点文字颜色拆分为独立变量
  - `--text-color` / `--text-color-subtitle` → 固定值，仅用于 UI 元素（`main.css :root`）
  - `--node-text-color` / `--node-text-color-subtitle` → 动态值，由文字样式设置控制（`app.js` + `presentation.css`）

### Settings 深拷贝问题
- JavaScript 的 `{ ...obj }` 只做浅拷贝，嵌套对象仍是引用
- `DEFAULT_SETTINGS` 包含嵌套对象（pptStyle.bgStyle, textStyle.fontSize 等）
- 浅拷贝后修改嵌套属性会污染原始 DEFAULT_SETTINGS
- 使用 `JSON.parse(JSON.stringify(obj))` 做深拷贝
- SettingsPanel 的 tempSettings 需要独立副本，避免取消操作无法恢复

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
- [x] Task 7: 存储管理模块

### 待完成
- [ ] 添加示例图片资源到 project/assets/

## 调试经验

### 2026-05-28: AI模块测试
- 开发服务器启动后，通过curl验证了ai.js和app.js文件可以正常访问
- 语法检查通过，无JS错误
- AI模块初始化测试代码在控制台输出正确信息

### 2026-05-28: Storage模块测试
- 语法检查通过，无JS错误
- 开发服务器启动正常，页面可访问
- Storage类方法逻辑正确，错误处理完善
- 集成代码在app.js中正确导入和使用

### 2026-05-29: Settings CSS 代码质量修复
- 使用 grep 搜索确认 `.main-content.panel-open` 未被JavaScript使用
- 在 `:root` 中定义CSS变量，确保全局可用
- 修改后语法检查通过，开发服务器正常运行
- Git提交成功，提交信息清晰描述修复内容

### 2026-05-29: 设置面板key path解析bug
- 通过 scrapling_fetch 获取HTML验证slider值显示为 `undefinedpx`
- 使用 grep 追踪 SettingsPanel.js 中 getNestedValue 调用链
- 发现config key不一致：pptStyle组用相对路径，其他组用完整路径
- 修复后重新获取HTML验证slider值正确显示（8px, 16px等）
- 使用 browser session 验证修复

### 2026-05-29: Settings 深拷贝问题修复
- 浅拷贝 `{ ...obj }` 只复制顶层属性，嵌套对象仍是引用
- `reset()`、`load()`、`getAll()`、`getDefaults()` 都需要深拷贝
- 使用 `JSON.parse(JSON.stringify(obj))` 实现深拷贝
- SettingsPanel 的 tempSettings 通过 getAll() 获取，修复后自动获得独立副本
- `applyTheme()` 也修复了主题对象的浅拷贝问题

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

### Session 5: 2026-05-28 (Task 7)
- 创建存储管理模块 src/core/storage.js
- 支持浏览器本地存储和文件导入导出
- 修改 app.js 导入 Storage 类并添加按钮事件处理
- 语法检查通过，开发服务器测试通过
- 代码已提交

### Session 6: 2026-05-29 (Task 6 代码质量修复)
- 修复了 Settings CSS 的两个代码质量问题
- 移除了未使用的 `.main-content.panel-open` 规则
- 提取了硬编码的面板宽度为CSS变量
- 语法检查通过，开发服务器正常运行
- 代码已提交

### Session 7: 2026-05-29 (项目探索 + 颜色设置修复 x3)
- 全面探索项目结构和功能
- 修复 1：选中节点使用错误 CSS 变量（`--active-node-text` → `--text-color`）
- 修复 2：localStorage 数据格式不兼容（字符串 vs 对象 color）导致 `setNestedValue` 报错
- 修复 3：节点文字颜色变量隔离（`--text-color` → `--node-text-color`），防止影响 UI 元素
- 验证开发服务器正常运行

### Session 8: 2026-05-30 (项目框架检查与修复)
- 全面检查项目框架符合性
- 发现AGENTS.md与实际项目状态严重不符
- 更新AGENTS.md：从"思维导图PPT演示"改为"思维导图PPT编辑器"
- 补充编辑器功能模块文档（NodeTree、NodeEditor、Preview等）
- 修复配置一致性：移除不存在的build脚本
- 保留source.js作为示例数据参考
