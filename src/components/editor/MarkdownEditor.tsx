"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { MarkdownPreview } from "./MarkdownPreview";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, Book, Tag as TagIcon } from "lucide-react";
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
  initialTags = []
}: MarkdownEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [notebookId, setNotebookId] = useState<string | undefined>(initialNotebookId);
  const [tagIds, setTagIds] = useState<string[]>(initialTags.map(t => t.id));
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNotebookSelect, setShowNotebookSelect] = useState(false);
  const [showTagSelect, setShowTagSelect] = useState(false);

  // 防抖，2 秒后自动保存
  const debouncedContent = useDebounce(content, 2000);
  const debouncedTitle = useDebounce(title, 2000);

  // 加载笔记本列表
  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const response = await fetch('/api/notebooks');
        const result = await response.json();
        if (response.ok) {
          setNotebooks(result.data || []);
        }
      } catch (error) {
        console.error('获取笔记本列表失败:', error);
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
            tagIds 
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
            tagIds 
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
    if (notebookId !== initialNotebookId || JSON.stringify(tagIds) !== JSON.stringify(initialTags.map(t => t.id))) {
      saveMetadata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId, tagIds]);

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇笔记吗？此操作不可撤销。")) {
      return;
    }

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
    }
  };

  const selectedNotebook = notebooks.find(nb => nb.id === notebookId);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* 工具栏 */}
      <div className="border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/notes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-md border-none shadow-none focus-visible:ring-0"
              placeholder="笔记标题"
            />
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "删除中..." : "删除"}
          </Button>
        </div>

        {/* 元数据工具栏 */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900">
          {/* 笔记本选择 */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotebookSelect(!showNotebookSelect)}
            >
              <Book className="h-4 w-4 mr-2" />
              {selectedNotebook ? selectedNotebook.name : '选择笔记本'}
            </Button>
            {showNotebookSelect && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10 w-64 max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setNotebookId(undefined);
                    setShowNotebookSelect(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
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
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                      notebookId === notebook.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    {notebook.icon || '📓'} {notebook.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 标签选择 */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagSelect(!showTagSelect)}
            >
              <TagIcon className="h-4 w-4 mr-2" />
              标签 {tagIds.length > 0 && `(${tagIds.length})`}
            </Button>
            {showTagSelect && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10 p-4 w-96">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm font-medium">选择标签</span>
                  <button
                    onClick={() => setShowTagSelect(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
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
        {/* 编辑器部分 */}
        <div className="flex w-1/2 flex-col border-r">
          <div className="flex-1 overflow-auto">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-full w-full resize-none p-6 font-mono text-sm focus:outline-none"
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

        {/* 预览部分 */}
        <div className="w-1/2 overflow-auto bg-muted/30">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
}

