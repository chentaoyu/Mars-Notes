# 通用组件

这个目录包含了应用中可重用的通用组件。

## DeleteConfirmDialog

删除确认对话框组件，用于在用户执行删除操作前进行确认。

### 功能特性

- ✅ 可自定义标题和描述
- ✅ 支持加载状态显示
- ✅ 防止删除过程中重复点击
- ✅ 统一的视觉样式和交互体验

### 使用方法

```tsx
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';

function MyComponent() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // 执行删除操作
      await deleteItem();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button onClick={handleDelete}>删除</button>
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="确认删除" // 可选
        description="确定要删除吗？此操作无法撤销。" // 可选
      />
    </>
  );
}
```

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `open` | `boolean` | ✅ | - | 控制对话框的显示/隐藏 |
| `onOpenChange` | `(open: boolean) => void` | ✅ | - | 对话框状态变化的回调 |
| `onConfirm` | `() => void \| Promise<void>` | ✅ | - | 确认删除的回调函数 |
| `title` | `string` | ❌ | `"确认删除"` | 对话框标题 |
| `description` | `string` | ❌ | `"确定要删除这篇笔记吗？此操作无法撤销。"` | 对话框描述文本 |
| `isDeleting` | `boolean` | ❌ | `false` | 是否正在删除中 |

### 使用场景

目前在以下场景中使用：

- 📝 **笔记列表页** - 删除笔记
- ✏️ **编辑器页** - 删除笔记
- 🏷️ **标签管理** - 删除标签
- 📓 **笔记本管理** - 删除笔记本

### 设计原则

- **统一性**: 所有删除操作使用相同的确认对话框样式
- **安全性**: 防止误操作和重复提交
- **可复用性**: 通过 props 自定义标题和描述，适用于不同场景
- **用户体验**: 提供清晰的视觉反馈和加载状态

