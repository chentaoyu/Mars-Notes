"use client";

import { useState, useEffect, useRef } from "react";
import { Notebook, Tag } from "@/types";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Folder, FolderOpen, Plus, Trash2, Edit2, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinderSidebarProps {
  selectedNotebookId?: string | null;
  selectedTagIds?: string[];
  onSelectNotebook: (notebookId: string | null) => void;
  onSelectTags: (tagIds: string[]) => void;
}

// macOS 风格的标签颜色
const TAG_COLORS = [
  { name: "红色", value: "#FF3B30", label: "Red" },
  { name: "橙色", value: "#FF9500", label: "Orange" },
  { name: "黄色", value: "#FFCC00", label: "Yellow" },
  { name: "绿色", value: "#34C759", label: "Green" },
  { name: "蓝色", value: "#007AFF", label: "Blue" },
  { name: "紫色", value: "#AF52DE", label: "Purple" },
  { name: "灰色", value: "#8E8E93", label: "Gray" },
];

export function FinderSidebar({
  selectedNotebookId,
  selectedTagIds = [],
  onSelectNotebook,
  onSelectTags,
}: FinderSidebarProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [hoveredNotebookId, setHoveredNotebookId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingNotebookId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingNotebookId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notebooksRes, tagsRes] = await Promise.all([
        fetch("/api/notebooks"),
        fetch("/api/tags"),
      ]);

      if (notebooksRes.ok) {
        const notebooksResult = await notebooksRes.json();
        setNotebooks(notebooksResult.data || []);
      }

      if (tagsRes.ok) {
        const tagsResult = await tagsRes.json();
        setTags(tagsResult.data || []);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async (
    name: string,
    description?: string,
    color?: string,
    icon?: string
  ) => {
    try {
      const response = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, color, icon }),
      });

      if (response.ok) {
        const result = await response.json();
        setNotebooks([...notebooks, result.data]);
        setCreateDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || "创建笔记本失败");
      }
    } catch (error) {
      console.error("创建笔记本失败:", error);
      alert("创建笔记本失败");
    }
  };

  const handleUpdateNotebook = async (
    id: string,
    name: string,
    description?: string,
    color?: string,
    icon?: string
  ) => {
    try {
      const response = await fetch(`/api/notebooks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, color, icon }),
      });

      if (response.ok) {
        const result = await response.json();
        setNotebooks(notebooks.map((nb) => (nb.id === id ? result.data : nb)));
        setEditDialogOpen(false);
        setEditingNotebook(null);
        setEditingNotebookId(null);
      } else {
        const error = await response.json();
        alert(error.error || "更新笔记本失败");
      }
    } catch (error) {
      console.error("更新笔记本失败:", error);
      alert("更新笔记本失败");
    }
  };

  const handleDeleteNotebook = (notebookId: string) => {
    setNotebookToDelete(notebookId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!notebookToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/notebooks/${notebookToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotebooks(notebooks.filter((nb) => nb.id !== notebookToDelete));
        if (selectedNotebookId === notebookToDelete) {
          onSelectNotebook(null);
        }
        setDeleteDialogOpen(false);
        setNotebookToDelete(null);
      } else {
        const error = await response.json();
        alert(error.error || "删除笔记本失败");
      }
    } catch (error) {
      console.error("删除笔记本失败:", error);
      alert("删除笔记本失败");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInlineEdit = (notebook: Notebook) => {
    setEditingNotebookId(notebook.id);
    setEditingName(notebook.name);
  };

  const handleInlineEditSubmit = async (notebookId: string) => {
    if (!editingName.trim()) {
      setEditingNotebookId(null);
      return;
    }

    const notebook = notebooks.find((nb) => nb.id === notebookId);
    if (notebook && editingName.trim() !== notebook.name) {
      await handleUpdateNotebook(notebookId, editingName.trim(), notebook.description || undefined);
    }
    setEditingNotebookId(null);
    setEditingName("");
  };

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onSelectTags(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onSelectTags([...selectedTagIds, tagId]);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">加载中...</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800">
      {/* 笔记本部分 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
              笔记本
            </h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={() => setCreateDialogOpen(true)}
              title="新建笔记本"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* 所有笔记 */}
          <button
            onClick={() => onSelectNotebook(null)}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 group",
              !selectedNotebookId
                ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            )}
          >
            <Folder className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">所有笔记</span>
          </button>

          {/* 笔记本列表 */}
          <div className="mt-1 space-y-0.5">
            {notebooks.map((notebook) => {
              const isSelected = selectedNotebookId === notebook.id;
              const isEditing = editingNotebookId === notebook.id;
              const isHovered = hoveredNotebookId === notebook.id;

              return (
                <div
                  key={notebook.id}
                  className={cn(
                    "group relative px-2 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2",
                    isSelected
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  )}
                  onMouseEnter={() => setHoveredNotebookId(notebook.id)}
                  onMouseLeave={() => setHoveredNotebookId(null)}
                  onClick={() => !isEditing && onSelectNotebook(notebook.id)}
                >
                  {isEditing ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleInlineEditSubmit(notebook.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleInlineEditSubmit(notebook.id);
                        } else if (e.key === "Escape") {
                          setEditingNotebookId(null);
                          setEditingName("");
                        }
                      }}
                      className="flex-1 px-1 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {notebook.icon ? (
                          <span className="text-base">{notebook.icon}</span>
                        ) : isSelected ? (
                          <FolderOpen className="h-4 w-4" />
                        ) : (
                          <Folder className="h-4 w-4" />
                        )}
                        {notebook.color && (
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: notebook.color }}
                            title="标记"
                          />
                        )}
                      </div>
                      <span className="flex-1 truncate">{notebook.name}</span>
                      {notebook._count && notebook._count.notes > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                          {notebook._count.notes}
                        </span>
                      )}
                      {isHovered && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNotebook(notebook);
                              setEditDialogOpen(true);
                            }}
                            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="编辑"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotebook(notebook.id);
                            }}
                            className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                            title="删除"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="border-t border-gray-200 dark:border-gray-800 my-2" />

        {/* 标签部分 */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
              标签
            </h3>
          </div>

          <div className="space-y-1">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2",
                    isSelected
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <TagIcon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">#{tag.name}</span>
                  {tag.color && (
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                </button>
              );
            })}
            {tags.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">暂无标签</p>
            )}
          </div>
        </div>
      </div>

      {/* 创建笔记本对话框 */}
      <CreateNotebookDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateNotebook}
      />

      {/* 编辑笔记本对话框 */}
      {editingNotebook && (
        <EditNotebookDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingNotebook(null);
          }}
          notebook={editingNotebook}
          onSubmit={(name, description, color, icon) =>
            handleUpdateNotebook(editingNotebook.id, name, description, color, icon)
          }
        />
      )}

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="确认删除笔记本"
        description="确定要删除这个笔记本吗？笔记本中还有笔记时将无法删除。"
      />
    </div>
  );
}

// 创建笔记本对话框
interface CreateNotebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description?: string, color?: string, icon?: string) => void;
}

function CreateNotebookDialog({ open, onOpenChange, onSubmit }: CreateNotebookDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState("📓");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(
        name.trim(),
        description.trim() || undefined,
        selectedColor || undefined,
        selectedIcon
      );
      setName("");
      setDescription("");
      setSelectedColor(null);
      setSelectedIcon("📓");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建笔记本</DialogTitle>
          <DialogDescription>创建一个新的笔记本来组织你的笔记</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="笔记本名称"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              autoFocus
              maxLength={100}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">描述（可选）</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="笔记本描述"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              maxLength={500}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">图标</label>
            <div className="flex gap-2 flex-wrap">
              {["📓", "📔", "📕", "📗", "📘", "📙", "📚", "📝", "📄", "📑"].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    "w-10 h-10 text-xl rounded-lg border-2 transition-all",
                    selectedIcon === icon
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">标记颜色（可选）</label>
            <div className="flex gap-2 flex-wrap">
              {TAG_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setSelectedColor(selectedColor === color.value ? null : color.value)
                  }
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    selectedColor === color.value
                      ? "border-gray-900 dark:border-gray-100 scale-110"
                      : "border-gray-300 dark:border-gray-600 hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">创建</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 编辑笔记本对话框
interface EditNotebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebook: Notebook;
  onSubmit: (name: string, description?: string, color?: string, icon?: string) => void;
}

function EditNotebookDialog({ open, onOpenChange, notebook, onSubmit }: EditNotebookDialogProps) {
  const [name, setName] = useState(notebook.name);
  const [description, setDescription] = useState(notebook.description || "");
  const [selectedColor, setSelectedColor] = useState<string | null>(notebook.color || null);
  const [selectedIcon, setSelectedIcon] = useState(notebook.icon || "📓");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(
        name.trim(),
        description.trim() || undefined,
        selectedColor || undefined,
        selectedIcon
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑笔记本</DialogTitle>
          <DialogDescription>修改笔记本的名称、描述、图标和标记</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="笔记本名称"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              autoFocus
              maxLength={100}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">描述（可选）</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="笔记本描述"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              maxLength={500}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">图标</label>
            <div className="flex gap-2 flex-wrap">
              {["📓", "📔", "📕", "📗", "📘", "📙", "📚", "📝", "📄", "📑"].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    "w-10 h-10 text-xl rounded-lg border-2 transition-all",
                    selectedIcon === icon
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">标记颜色（可选）</label>
            <div className="flex gap-2 flex-wrap">
              {TAG_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setSelectedColor(selectedColor === color.value ? null : color.value)
                  }
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    selectedColor === color.value
                      ? "border-gray-900 dark:border-gray-100 scale-110"
                      : "border-gray-300 dark:border-gray-600 hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
