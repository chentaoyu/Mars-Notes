# UI 组件库 - shadcn/ui

本项目使用 shadcn/ui 组件库，采用**白色和紫葡萄色**作为主题色调。

## 🎨 主题配色

### 亮色模式
- **主色（Primary）**: 紫葡萄色 `hsl(280, 60%, 55%)` 
- **背景（Background）**: 纯白色 `hsl(0, 0%, 100%)`
- **次要色（Secondary）**: 浅紫色 `hsl(270, 40%, 96%)`
- **强调色（Accent）**: 中等紫色 `hsl(275, 50%, 92%)`
- **边框（Border）**: 浅紫灰色 `hsl(270, 20%, 88%)`

### 暗色模式
- **主色（Primary）**: 亮紫色 `hsl(280, 65%, 65%)`
- **背景（Background）**: 深紫黑色 `hsl(270, 25%, 8%)`
- **次要色（Secondary）**: 深紫色 `hsl(270, 25%, 18%)`
- **强调色（Accent）**: 深紫色 `hsl(275, 30%, 22%)`

### 紫葡萄色阶
项目提供了完整的紫葡萄色阶（`grape-50` 到 `grape-950`），可以在需要时使用：

```tsx
<div className="bg-grape-100 text-grape-800">
  紫葡萄色调内容
</div>
```

## 📦 可用组件

### 基础组件
- **Button** - 按钮组件，支持多种变体（default、destructive、outline、secondary、ghost、link）
- **Input** - 输入框组件
- **Label** - 标签组件
- **Textarea** - 文本域组件

### 数据展示
- **Card** - 卡片组件（CardHeader、CardTitle、CardDescription、CardContent、CardFooter）
- **Badge** - 徽章组件，支持多种变体（default、secondary、destructive、outline、success、warning）
- **Avatar** - 头像组件（Avatar、AvatarImage、AvatarFallback）
- **Separator** - 分隔线组件

### 表单组件
- **Select** - 选择器组件
- **Switch** - 开关组件

### 反馈组件
- **Dialog** - 对话框组件
- **Toast** - 提示通知组件（配合 useToast hook 使用）
- **Tooltip** - 工具提示组件

### 导航组件
- **Dropdown Menu** - 下拉菜单组件

## 🚀 使用示例

### Button 按钮

```tsx
import { Button } from "@/components/ui/button";

export function Demo() {
  return (
    <>
      <Button>默认按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="outline">轮廓按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="destructive">删除按钮</Button>
    </>
  );
}
```

### Badge 徽章

```tsx
import { Badge } from "@/components/ui/badge";

export function Demo() {
  return (
    <>
      <Badge>默认</Badge>
      <Badge variant="secondary">次要</Badge>
      <Badge variant="success">成功</Badge>
      <Badge variant="warning">警告</Badge>
      <Badge variant="destructive">危险</Badge>
    </>
  );
}
```

### Dialog 对话框

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>打开对话框</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>对话框标题</DialogTitle>
          <DialogDescription>
            这是对话框的描述内容。
          </DialogDescription>
        </DialogHeader>
        <div>对话框内容</div>
      </DialogContent>
    </Dialog>
  );
}
```

### Toast 提示

```tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function Demo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "提示标题",
          description: "这是一条提示消息",
        });
      }}
    >
      显示提示
    </Button>
  );
}
```

### Tooltip 工具提示

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function Demo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>悬停查看提示</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>这是工具提示内容</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

### Select 选择器

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Demo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="选择一个选项" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">选项 1</SelectItem>
        <SelectItem value="option2">选项 2</SelectItem>
        <SelectItem value="option3">选项 3</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Dropdown Menu 下拉菜单

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Demo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>打开菜单</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>我的账户</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>个人资料</DropdownMenuItem>
        <DropdownMenuItem>设置</DropdownMenuItem>
        <DropdownMenuItem>退出登录</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 🎯 自定义样式

所有组件都支持通过 `className` 属性进行自定义样式：

```tsx
<Button className="bg-grape-600 hover:bg-grape-700">
  自定义颜色按钮
</Button>
```

## 🌈 渐变效果

项目配置了紫色渐变效果，可以使用：

```tsx
<div className="bg-gradient-purple">
  紫色渐变背景
</div>
```

## 💡 使用建议

1. **保持一致性**: 使用主题色（primary）来强调主要操作
2. **合理使用变体**: 不同场景使用不同的按钮变体
3. **注意对比度**: 确保文字和背景有足够的对比度
4. **响应式设计**: 所有组件都支持响应式设计
5. **无障碍访问**: 组件遵循 ARIA 规范，支持键盘导航

## 📚 更多资源

- [shadcn/ui 官方文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Radix UI 文档](https://radix-ui.com)

