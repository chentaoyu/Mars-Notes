"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { MarkdownPreview } from "./MarkdownPreview";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { ArrowLeft, Trash2, Book, Tag as TagIcon, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { Tag, Notebook } from "@/types";
import { TagSelector } from "@/components/tags/TagSelector";

interface MarkdownEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  initialNotebookId?: string;
  initialTags?: Tag[];
}

export function MarkdownEditor({
  noteId,
  initialTitle,
  initialContent,
  initialNotebookId,
  initialTags = [],
}: MarkdownEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [notebookId, setNotebookId] = useState<string | undefined>(initialNotebookId);
  const [tagIds, setTagIds] = useState<string[]>(initialTags.map((t) => t.id));
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNotebookSelect, setShowNotebookSelect] = useState(false);
  const [showTagSelect, setShowTagSelect] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit"); // 移动端视图切换
  const tagSelectButtonRef = useRef<HTMLButtonElement>(null);
  const tagSelectDropdownRef = useRef<HTMLDivElement>(null);
  const [tagSelectPosition, setTagSelectPosition] = useState({
    top: 0,
    left: 0,
    right: 0,
    width: 384,
  });

  // 防抖，2 秒后自动保存
  const debouncedContent = useDebounce(content, 2000);
  const debouncedTitle = useDebounce(title, 2000);

  // 加载笔记本列表
  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const response = await fetch("/api/notebooks");
        const result = await response.json();
        if (response.ok) {
          setNotebooks(result.data || []);
        }
      } catch (error) {
        console.error("获取笔记本列表失败:", error);
      }
    };
    fetchNotebooks();
  }, []);

  useEffect(() => {
    const saveNote = async () => {
      if (debouncedContent === initialContent && debouncedTitle === initialTitle) {
        return;
      }

      setSaving(true);
      try {
        await fetch(`/api/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            notebookId: notebookId || null,
            tagIds,
          }),
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("保存失败:", error);
      } finally {
        setSaving(false);
      }
    };

    if (debouncedContent !== undefined || debouncedTitle !== undefined) {
      saveNote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, debouncedTitle]);

  // 单独处理笔记本和标签的保存
  useEffect(() => {
    const saveMetadata = async () => {
      setSaving(true);
      try {
        await fetch(`/api/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notebookId: notebookId || null,
            tagIds,
          }),
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("保存失败:", error);
      } finally {
        setSaving(false);
      }
    };

    // 只有当笔记本或标签改变时才保存
    if (
      notebookId !== initialNotebookId ||
      JSON.stringify(tagIds) !== JSON.stringify(initialTags.map((t) => t.id))
    ) {
      saveMetadata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId, tagIds]);

  // 计算标签选择下拉菜单位置
  useEffect(() => {
    if (showTagSelect && tagSelectButtonRef.current) {
      const updatePosition = () => {
        const button = tagSelectButtonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 640;
        const dropdownWidth = isMobile ? Math.min(viewportWidth - 32, 384) : 384;
        const dropdownHeight = 300; // 估算高度

        let left = rect.left;
        let top = rect.bottom + 4;

        // 移动端：居中显示，留出边距
        if (isMobile) {
          left = Math.max(16, (viewportWidth - dropdownWidth) / 2);
        } else {
          // 桌面端：右对齐，但如果超出视口则左对齐
          left = rect.right - dropdownWidth;
          if (left < 16) {
            left = rect.left;
          }
          // 确保不超出右边界
          if (left + dropdownWidth > viewportWidth - 16) {
            left = viewportWidth - dropdownWidth - 16;
          }
        }

        // 确保不超出底部边界，如果超出则显示在上方
        if (top + dropdownHeight > viewportHeight - 16) {
          top = rect.top - dropdownHeight - 4;
          // 如果上方也没有空间，则固定在底部
          if (top < 16) {
            top = viewportHeight - dropdownHeight - 16;
          }
        }

        setTagSelectPosition({
          top,
          left,
          right: viewportWidth - left - dropdownWidth,
          width: dropdownWidth,
        });
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [showTagSelect]);

  // 点击外部区域关闭标签选择下拉菜单
  useEffect(() => {
    if (!showTagSelect) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagSelectButtonRef.current &&
        tagSelectDropdownRef.current &&
        !tagSelectButtonRef.current.contains(event.target as Node) &&
        !tagSelectDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTagSelect(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTagSelect]);

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      router.push("/notes");
      router.refresh();
    } catch (error) {
      console.error("删除失败:", error);
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const selectedNotebook = notebooks.find((nb) => nb.id === notebookId);

  return (
    <div className="flex h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)] flex-col">
      {/* 工具栏 */}
      <div className="border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-2 sm:py-3 gap-2">
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <Link href="/notes">
              <Button variant="ghost" size="sm" className="h-8 sm:h-9">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">返回</span>
              </Button>
            </Link>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 sm:max-w-md border-none shadow-none focus-visible:ring-0 text-sm sm:text-base px-2 sm:px-3"
              placeholder="笔记标题"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="self-end sm:self-auto h-8 sm:h-9"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isDeleting ? "删除中..." : "删除"}</span>
            <span className="sm:hidden">删除</span>
          </Button>
        </div>

        {/* 元数据工具栏 */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-50 dark:bg-gray-900">
          {/* 移动端视图切换 */}
          <div className="flex md:hidden gap-1">
            <Button
              variant={viewMode === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("edit")}
              className="h-7 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              编辑
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="h-7 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              预览
            </Button>
          </div>

          {/* 笔记本选择 */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotebookSelect(!showNotebookSelect)}
              className="h-7 sm:h-8 text-xs sm:text-sm"
            >
              <Book className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="max-w-[80px] sm:max-w-none truncate">
                {selectedNotebook ? selectedNotebook.name : "笔记本"}
              </span>
            </Button>
            {showNotebookSelect && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10 w-48 sm:w-64 max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setNotebookId(undefined);
                    setShowNotebookSelect(false);
                  }}
                  className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm"
                >
                  无笔记本
                </button>
                {notebooks.map((notebook) => (
                  <button
                    key={notebook.id}
                    onClick={() => {
                      setNotebookId(notebook.id);
                      setShowNotebookSelect(false);
                    }}
                    className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm ${
                      notebookId === notebook.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    {notebook.icon || "📓"} {notebook.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 标签选择 */}
          <div className="relative">
            <Button
              ref={tagSelectButtonRef}
              variant="outline"
              size="sm"
              onClick={() => setShowTagSelect(!showTagSelect)}
              className="h-7 sm:h-8 text-xs sm:text-sm"
            >
              <TagIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">标签</span>
              {tagIds.length > 0 && <span className="ml-1">({tagIds.length})</span>}
            </Button>
            {showTagSelect && (
              <div
                ref={tagSelectDropdownRef}
                className="fixed bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 p-3 sm:p-4 max-h-[70vh] overflow-y-auto"
                style={{
                  top: `${tagSelectPosition.top}px`,
                  left: `${tagSelectPosition.left}px`,
                  width: `${tagSelectPosition.width}px`,
                  maxWidth: "calc(100vw - 32px)",
                }}
              >
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium">选择标签</span>
                  <button
                    onClick={() => setShowTagSelect(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    完成
                  </button>
                </div>
                <TagSelector selectedTagIds={tagIds} onChange={setTagIds} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 编辑器和预览 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 编辑器部分 - 桌面端并排显示，移动端根据 viewMode 切换 */}
        <div
          className={`flex flex-col border-r md:w-1/2 ${viewMode === "edit" ? "w-full" : "hidden md:flex"}`}
        >
          <div className="flex-1 overflow-auto">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-full w-full resize-none p-3 sm:p-6 font-mono text-xs sm:text-sm focus:outline-none dark:bg-gray-950"
              placeholder="开始编写你的笔记...

支持 Markdown 语法：
# 标题
**粗体** *斜体*
- 列表
[链接](url)
```代码块```
"
            />
          </div>
          <AutoSaveIndicator saving={saving} lastSaved={lastSaved} />
        </div>

        {/* 预览部分 - 桌面端并排显示，移动端根据 viewMode 切换 */}
        <div
          className={`overflow-auto bg-muted/30 md:w-1/2 ${viewMode === "preview" ? "w-full" : "hidden md:block"}`}
        >
          <MarkdownPreview content={content} />
        </div>
      </div>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
