# AI Chat 功能使用指南

## 功能概述

Mars Notes 集成了 AI 聊天助手功能，支持与 DeepSeek AI 进行对话。主要特性包括：

- ✅ 多会话管理
- ✅ 实时对话
- ✅ Markdown 渲染
- ✅ Token 使用统计
- ✅ 自定义模型选择

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 数据库迁移

运行数据库迁移以创建 AI 相关的表：

```bash
pnpm db:migrate
# 或
pnpm db:push
```

### 3. 配置 API Key

1. 访问 [DeepSeek 控制台](https://platform.deepseek.com/api_keys)
2. 创建并复制 API Key
3. 在应用侧边栏的 "AI 助手" 部分点击设置图标
4. 输入 API Key 并选择模型
5. 点击"保存配置"

## 功能使用

### 创建对话

在侧边栏的 "AI 助手" 部分：
1. 点击 ➕ 按钮创建新对话
2. 输入消息并发送
3. AI 会自动生成回复

### 管理对话

- **查看对话列表**：侧边栏显示最近 5 个对话
- **打开对话**：点击对话标题即可打开
- **删除对话**：鼠标悬停在对话上，点击删除图标

### 查看 Token 统计

点击 📊 图标查看：
- 输入/输出 Token 数量
- 按模型分组的使用情况
- 按天统计的使用趋势
- 支持查看最近 7/30/90 天的数据

## API 端点

### AI 配置
- `GET /api/ai/config` - 获取配置
- `POST /api/ai/config` - 更新配置
- `DELETE /api/ai/config` - 删除配置

### 聊天会话
- `GET /api/ai/sessions` - 获取会话列表
- `POST /api/ai/sessions` - 创建新会话
- `GET /api/ai/sessions/[id]` - 获取会话详情
- `PUT /api/ai/sessions/[id]` - 更新会话
- `DELETE /api/ai/sessions/[id]` - 删除会话

### 聊天消息
- `POST /api/ai/chat` - 发送消息

### Token 统计
- `GET /api/ai/tokens?days=30` - 获取统计数据

## 数据模型

### AIConfig
- `provider`: 提供商（默认 deepseek）
- `apiKey`: API 密钥
- `model`: 模型名称

### ChatSession
- `title`: 会话标题
- `messages`: 关联的消息列表

### ChatMessage
- `role`: 角色（user/assistant/system）
- `content`: 消息内容
- `tokens`: Token 数量

### TokenUsage
- `model`: 使用的模型
- `promptTokens`: 输入 tokens
- `completionTokens`: 输出 tokens
- `totalTokens`: 总 tokens

## 支持的模型

### DeepSeek
- `deepseek-chat`: 通用对话模型
- `deepseek-coder`: 代码专用模型

## 注意事项

1. **API Key 安全**：当前 API Key 存储在数据库中，建议在生产环境中使用加密存储
2. **Token 限制**：请注意 DeepSeek API 的使用限制和费用
3. **上下文限制**：每次对话最多携带最近 20 条消息作为上下文

## 开发扩展

### 添加新的 AI 提供商

1. 在 `AISettings` 组件中添加新的提供商选项
2. 在 `/api/ai/chat` 中添加相应的 API 调用逻辑
3. 更新数据库模型（如需要）

### 自定义 UI

主要组件位于：
- `src/components/ai/AIChat.tsx` - 聊天界面
- `src/components/ai/AISettings.tsx` - 设置界面
- `src/components/ai/TokenStats.tsx` - 统计界面

## 故障排查

### 无法发送消息
- 检查是否已配置 API Key
- 检查网络连接
- 查看浏览器控制台错误信息

### Token 统计不显示
- 确认已发送过消息
- 检查数据库中是否有 `token_usages` 记录

### 会话列表为空
- 创建新对话
- 刷新页面

