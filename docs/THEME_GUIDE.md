# 🎨 紫葡萄色主题指南

Mars-Notes 采用**白色和紫葡萄色**作为主色调，打造优雅而现代的视觉体验。

## 📋 目录

- [主题配色](#主题配色)
- [组件样式](#组件样式)
- [实用类名](#实用类名)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)

---

## 🎨 主题配色

### 亮色模式

| 颜色名称 | HSL 值 | 预览 | 用途 |
|---------|--------|------|------|
| **主色（Primary）** | `280, 60%, 55%` | 🟣 紫葡萄色 | 主要按钮、链接、强调元素 |
| **背景（Background）** | `0, 0%, 100%` | ⚪ 纯白色 | 页面背景 |
| **次要色（Secondary）** | `270, 40%, 96%` | 🟪 浅紫色 | 次要按钮、卡片背景 |
| **柔和色（Muted）** | `270, 30%, 96%` | 💜 很浅的紫色 | 禁用状态、占位符 |
| **强调色（Accent）** | `275, 50%, 92%` | 💟 中等紫色 | 悬停状态、活跃元素 |
| **边框（Border）** | `270, 20%, 88%` | ⬜ 浅紫灰色 | 边框、分隔线 |
| **前景（Foreground）** | `270, 15%, 15%` | ⬛ 深灰色 | 主要文字 |

### 暗色模式

| 颜色名称 | HSL 值 | 预览 | 用途 |
|---------|--------|------|------|
| **主色（Primary）** | `280, 65%, 65%` | 🟣 亮紫色 | 主要按钮、链接、强调元素 |
| **背景（Background）** | `270, 25%, 8%` | ⬛ 深紫黑色 | 页面背景 |
| **次要色（Secondary）** | `270, 25%, 18%` | 🟪 深紫色 | 次要按钮、卡片背景 |
| **柔和色（Muted）** | `270, 20%, 20%` | 💜 暗紫色 | 禁用状态、占位符 |
| **强调色（Accent）** | `275, 30%, 22%` | 💟 深紫色 | 悬停状态、活跃元素 |
| **边框（Border）** | `270, 20%, 25%` | ⬜ 深紫灰色 | 边框、分隔线 |
| **前景（Foreground）** | `270, 10%, 95%` | ⚪ 浅灰色 | 主要文字 |

### 紫葡萄色阶

完整的紫葡萄色调色板（`grape-50` 到 `grape-950`）：

```tsx
// 使用示例
<div className="bg-grape-100 text-grape-900">
  浅紫色背景 + 深紫色文字
</div>

<div className="bg-grape-600 hover:bg-grape-700">
  紫葡萄色按钮
</div>
```

| 等级 | 颜色 | 用途 |
|------|------|------|
| `grape-50` | #faf5ff | 极浅背景 |
| `grape-100` | #f3e8ff | 浅背景 |
| `grape-200` | #e9d5ff | 悬停背景 |
| `grape-300` | #d8b4fe | 边框、分隔线 |
| `grape-400` | #c084fc | 图标 |
| `grape-500` | #a855f7 | 主要紫色 |
| `grape-600` | #9333ea | 按钮 |
| `grape-700` | #7e22ce | 深色按钮 |
| `grape-800` | #6b21a8 | 文字 |
| `grape-900` | #581c87 | 深色文字 |
| `grape-950` | #3b0764 | 极深色 |

---

## 🎯 组件样式

### Button 按钮

```tsx
import { Button } from "@/components/ui/button";

// 主要按钮 - 紫葡萄色
<Button variant="default">主要操作</Button>

// 次要按钮 - 浅紫色
<Button variant="secondary">次要操作</Button>

// 轮廓按钮
<Button variant="outline">轮廓按钮</Button>

// 幽灵按钮
<Button variant="ghost">幽灵按钮</Button>

// 自定义紫葡萄色
<Button className="bg-grape-600 hover:bg-grape-700">
  深紫色按钮
</Button>
```

### Badge 徽章

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>默认</Badge>
<Badge variant="secondary">次要</Badge>
<Badge variant="success">成功</Badge>
<Badge variant="warning">警告</Badge>

// 自定义紫葡萄色徽章
<Badge className="bg-grape-100 text-grape-800 border-grape-300">
  紫色标签
</Badge>
```

### Card 卡片

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// 基础卡片
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
  </CardHeader>
  <CardContent>
    卡片内容
  </CardContent>
</Card>

// 紫色主题卡片
<Card className="border-grape-200 hover:border-grape-400 card-hover-grape">
  <CardHeader>
    <CardTitle className="text-primary">紫色卡片</CardTitle>
  </CardHeader>
  <CardContent>
    带有紫色边框和悬停效果
  </CardContent>
</Card>
```

---

## 💡 实用类名

### 紫葡萄色主题专用类

#### 1. 渐变背景

```tsx
// 紫色渐变背景
<div className="grape-gradient p-6 text-white rounded-lg">
  紫色渐变背景内容
</div>

// 或使用 Tailwind 类
<div className="bg-gradient-purple p-6 text-white rounded-lg">
  紫色渐变背景内容
</div>
```

#### 2. 渐变文字

```tsx
<h1 className="text-4xl font-bold text-gradient-grape">
  紫色渐变标题
</h1>
```

#### 3. 光晕效果

```tsx
<div className="grape-glow p-6 rounded-lg">
  带紫色光晕的容器
</div>
```

#### 4. 紫色边框

```tsx
<div className="grape-border border rounded-lg p-4">
  带紫色边框的内容
</div>
```

#### 5. 卡片悬停效果

```tsx
<div className="card-hover-grape border rounded-lg p-6">
  悬停时有紫色阴影和上升效果
</div>
```

#### 6. 脉冲动画

```tsx
<div className="pulse-grape">
  脉冲动画效果（淡入淡出）
</div>
```

#### 7. 焦点状态

```tsx
<input className="focus-grape px-3 py-2 border rounded" />
```

#### 8. 侧边栏装饰

```tsx
<div className="sidebar-accent p-4">
  左边框装饰，悬停时变亮
</div>
```

#### 9. 加载动画

```tsx
<div className="spinner-grape"></div>
```

#### 10. 页面标题装饰

```tsx
<h1 className="page-title-grape text-3xl font-bold">
  带下划线装饰的标题
</h1>
```

#### 11. 标签样式

```tsx
<span className="tag-grape">
  紫色标签
</span>
```

#### 12. 通知点

```tsx
<button className="notification-dot relative">
  通知按钮
  {/* 右上角会显示一个脉冲的紫色点 */}
</button>
```

---

## 📚 使用示例

### 示例 1: 登录页面

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-purple">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gradient-grape">
            欢迎回来
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" className="focus-grape" />
          </div>
          <div>
            <Label htmlFor="password">密码</Label>
            <Input id="password" type="password" className="focus-grape" />
          </div>
          <Button className="w-full">登录</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 示例 2: 笔记卡片

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function NoteCard({ title, content, tags }) {
  return (
    <Card className="card-hover-grape">
      <CardHeader>
        <CardTitle className="page-title-grape">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{content}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} className="bg-grape-100 text-grape-800">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 示例 3: 导航栏

```tsx
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  return (
    <nav className="grape-gradient shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Mars-Notes
        </h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-white hover:bg-white/20">
            笔记
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20">
            设置
          </Button>
          <Avatar className="notification-dot">
            <AvatarImage src="/avatar.jpg" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
```

### 示例 4: 加载状态

```tsx
export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="spinner-grape mb-4"></div>
      <p className="text-muted-foreground">加载中...</p>
    </div>
  );
}
```

---

## 🎯 最佳实践

### 1. 颜色使用建议

- **主色（Primary）**: 用于最重要的操作按钮、链接和需要吸引注意力的元素
- **次要色（Secondary）**: 用于次要操作、背景区域
- **强调色（Accent）**: 用于悬停状态、选中状态
- **柔和色（Muted）**: 用于不太重要的信息、禁用状态

### 2. 对比度注意事项

确保文字和背景有足够的对比度：

```tsx
// ✅ 好的对比度
<div className="bg-grape-100 text-grape-900">
  深色文字在浅色背景上
</div>

// ✅ 好的对比度
<div className="bg-grape-800 text-white">
  白色文字在深色背景上
</div>

// ❌ 避免低对比度
<div className="bg-grape-300 text-grape-400">
  对比度不足
</div>
```

### 3. 渐变使用建议

渐变适合用于：
- 页面头部/Hero 区域
- 卡片背景
- 按钮（谨慎使用）
- 装饰性元素

```tsx
// Hero 区域
<section className="grape-gradient min-h-[50vh] flex items-center justify-center">
  <h1 className="text-5xl font-bold text-white">
    欢迎使用 Mars-Notes
  </h1>
</section>

// 装饰性标题
<h2 className="text-3xl font-bold text-gradient-grape">
  功能特点
</h2>
```

### 4. 交互状态

为交互元素添加适当的状态变化：

```tsx
<Button 
  className="
    bg-grape-600 
    hover:bg-grape-700 
    active:bg-grape-800
    focus:ring-2 
    focus:ring-grape-500 
    focus:ring-offset-2
    transition-all
    duration-200
  "
>
  交互按钮
</Button>
```

### 5. 暗色模式支持

使用 Tailwind 的暗色模式前缀：

```tsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
">
  支持暗色模式的内容
</div>
```

### 6. 响应式设计

结合紫色主题和响应式设计：

```tsx
<Card className="
  card-hover-grape
  w-full
  sm:w-96
  md:w-[28rem]
  lg:w-[32rem]
">
  响应式卡片
</Card>
```

### 7. 无障碍访问

- 确保足够的颜色对比度（WCAG AA 标准最低 4.5:1）
- 不要仅依赖颜色传递信息
- 为交互元素提供清晰的焦点指示器

```tsx
<button 
  className="
    bg-primary 
    text-primary-foreground
    focus-grape
    hover:bg-primary/90
  "
  aria-label="删除笔记"
>
  删除
</button>
```

---

## 🔧 自定义主题

如果需要调整紫葡萄色主题，可以修改 `src/app/globals.css` 中的 CSS 变量：

```css
:root {
  /* 调整主色 */
  --primary: 280 60% 55%; /* 改变色相、饱和度或亮度 */
  
  /* 调整渐变色 */
  --gradient-from: 280 70% 60%;
  --gradient-to: 290 65% 50%;
}
```

## 📞 支持

如有问题或建议，欢迎提交 Issue 或 PR。

---

**享受紫葡萄色的优雅体验！** 🍇✨

