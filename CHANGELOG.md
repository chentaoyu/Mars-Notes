# 更新日志

## [1.3.0] - 2025-01-27

### 我的页面 - 个人信息管理

#### ✨ 新增功能
- ✨ **我的页面** (`/profile`)
  - 个人信息管理界面
  - 集成头像、昵称、密码、账户注销功能
- ✨ **头像管理**
  - 支持上传头像（JPG、PNG、GIF，最大2MB）
  - 支持删除头像（恢复默认）
  - 实时预览上传的头像
- ✨ **昵称修改**
  - 支持修改用户昵称（1-20个字符）
  - 实时保存和更新
- ✨ **密码重置**
  - 需要验证当前密码
  - 新密码强度检查（至少8位，包含字母和数字）
  - 修改成功后自动登出
- ✨ **账户注销**
  - 密码确认机制
  - 明确的警告提示（数据将永久删除）
  - 级联删除所有用户数据（笔记、笔记本、标签等）

#### 🔧 API 新增
- 🔧 `/api/user/name` - 修改昵称
- 🔧 `/api/user/password` - 修改密码
- 🔧 `/api/user/avatar` - 更新/删除头像
- 🔧 `/api/user/upload` - 上传头像文件
- 🔧 `/api/user/delete` - 注销账户

#### 📝 文档更新
- 📚 更新 PRD.md - 添加"我的页面"功能需求
- 📚 更新 API.md - 添加用户管理 API 文档
- 📚 更新 CHANGELOG.md - 记录新功能

#### 🎨 UI 改进
- 🎨 在 Header 中添加"我的页面"入口按钮（设置图标）
- 🎨 我的页面采用卡片式布局，清晰分区
- 🎨 账户注销区域使用警告颜色，突出重要性

---

## [1.2.0] - 2025-11-04

### UI 组件库升级 - shadcn/ui

#### 🎨 主题系统
- ✨ 全新紫葡萄色主题配色方案
  - 主色：紫葡萄色 `hsl(280, 60%, 55%)`
  - 背景：纯白色
  - 完整的紫葡萄色阶（grape-50 到 grape-950）
  - 完善的暗色模式支持
- ✨ 自定义 CSS 变量系统
- ✨ 紫色渐变背景支持
- ✨ 主题配色完整文档

#### 📦 新增 UI 组件
- ✨ Avatar（头像组件）
- ✨ Badge（徽章组件，6 种变体）
- ✨ Dialog（对话框组件）
- ✨ Dropdown Menu（下拉菜单组件）
- ✨ Select（选择器组件）
- ✨ Separator（分隔线组件）
- ✨ Switch（开关组件）
- ✨ Textarea（文本域组件）
- ✨ Toast（提示通知组件）
- ✨ Tooltip（工具提示组件）
- ✨ Toaster（通知管理器）

#### ✨ 功能优化
- 🎯 全面优化删除功能，使用 Dialog 模态框替代原生 confirm 弹窗
  - ✅ 笔记列表页删除功能优化
  - ✅ 编辑器页删除功能优化
  - ✅ 标签删除功能优化
  - ✅ 笔记本删除功能优化
  - 更好的用户体验和视觉效果
  - 删除过程中显示加载状态
  - 防止重复提交和误操作
- ♻️ 代码重构：提取可复用的删除确认对话框组件 `DeleteConfirmDialog`
  - 统一管理删除确认逻辑
  - 提高代码复用性和可维护性
  - 减少重复代码
  - 4 个模块共享同一组件

#### 🎯 实用类名
- `.grape-gradient` - 紫色渐变背景
- `.text-gradient-grape` - 渐变文字效果
- `.grape-glow` - 紫色光晕效果
- `.grape-border` - 紫色边框
- `.card-hover-grape` - 卡片悬停效果
- `.pulse-grape` - 脉冲动画
- `.focus-grape` - 焦点状态增强
- `.sidebar-accent` - 侧边栏装饰
- `.spinner-grape` - 加载动画
- `.page-title-grape` - 页面标题装饰
- `.tag-grape` - 标签样式
- `.notification-dot` - 通知点

#### 🔧 技术改进
- 📦 安装 Radix UI 组件库依赖
  - @radix-ui/react-avatar
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-select
  - @radix-ui/react-separator
  - @radix-ui/react-slot
  - @radix-ui/react-switch
  - @radix-ui/react-toast
  - @radix-ui/react-tooltip
- 🔧 完善 Tailwind CSS 配置
  - 新增紫葡萄色阶
  - 新增自定义动画
  - 新增渐变背景工具
- 🔧 创建 `use-toast` hook
- 🔧 优化滚动条样式
- 🔧 优化选中状态样式

#### 📝 文档更新
- 📚 新增 `src/components/ui/README.md` - UI 组件使用文档
- 📚 新增 `docs/THEME_GUIDE.md` - 完整主题使用指南
- 📚 新增 `components.json` - shadcn/ui 配置文件
- 📚 新增 `src/components/ui/index.ts` - 统一导出文件
- 📚 所有组件包含完整的使用示例

#### 🎨 视觉增强
- 优化按钮交互效果
- 优化卡片悬停动画
- 优化表单元素样式
- 优化对话框和弹出层样式
- 统一圆角和阴影效果
- 改进无障碍访问支持

---

## [1.1.0] - 2025-11-04

### 新增功能

#### 笔记本管理
- ✨ 新增笔记本创建和管理功能
- ✨ 支持笔记本分类组织笔记
- ✨ 笔记本可自定义图标、颜色和描述
- ✨ 笔记本列表侧边栏，方便快速切换
- ✨ 删除保护：包含笔记的笔记本不能删除

#### 标签系统
- ✨ 新增标签创建和管理功能
- ✨ 支持为笔记添加多个标签
- ✨ 标签可自定义颜色
- ✨ 多标签筛选功能
- ✨ 标签使用计数显示

#### 高级搜索和筛选
- ✨ 支持按笔记本筛选笔记
- ✨ 支持按标签筛选笔记（多选）
- ✨ 搜索功能支持标题和内容
- ✨ 多维度组合筛选

#### 笔记排序
- ✨ 新增多种排序方式：
  - 最近更新（默认）
  - 最早更新
  - 最新创建
  - 最早创建
  - 标题 A-Z
  - 标题 Z-A

#### UI/UX 改进
- 🎨 笔记卡片显示所属笔记本和标签
- 🎨 编辑器新增笔记本和标签选择工具栏
- 🎨 侧边栏支持折叠/展开
- 🎨 筛选条件可视化显示，支持快速清除
- 🎨 悬停显示操作按钮，减少视觉干扰

### 技术改进

#### 数据库
- 📦 新增 `notebooks` 表
- 📦 新增 `tags` 表
- 📦 新增 `note_tags` 关联表
- 📦 `notes` 表新增 `notebook_id` 外键
- 📦 优化索引结构，提升查询性能

#### API
- 🔧 新增笔记本 CRUD API (`/api/notebooks`)
- 🔧 新增标签 CRUD API (`/api/tags`)
- 🔧 笔记 API 支持笔记本和标签关联
- 🔧 GET /api/notes 支持高级筛选和排序参数
- 🔧 完善错误处理和数据验证

#### 前端
- 💅 新增 `NotebookList` 组件
- 💅 新增 `TagList` 组件
- 💅 新增 `TagSelector` 组件
- 💅 重构笔记列表页面为客户端组件
- 💅 编辑器组件支持笔记本和标签编辑
- 💅 优化组件性能和用户体验

### 文档更新
- 📝 更新 README.md
- 📝 更新路线图
- 📝 新增 CHANGELOG.md

---

## [1.0.0] - 2025-11-03

### 首次发布

#### 核心功能
- ✨ 用户注册和登录
- ✨ Markdown 编辑器（左右分屏实时预览）
- ✨ 笔记 CRUD 操作
- ✨ 笔记搜索功能
- ✨ 代码高亮（100+ 语言支持）
- ✨ 自动保存（2 秒防抖）
- ✨ 响应式设计

#### 技术栈
- Next.js 14 (App Router)
- React 18
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js v5
- Tailwind CSS
- react-markdown
- react-syntax-highlighter

#### 部署支持
- Vercel 部署支持
- VPS 部署支持

