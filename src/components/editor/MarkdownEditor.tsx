"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { MarkdownPreview } from "./MarkdownPreview";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

interface MarkdownEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
}

export function MarkdownEditor({ noteId, initialTitle, initialContent }: MarkdownEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 防抖，2 秒后自动保存
  const debouncedContent = useDebounce(content, 2000);
  const debouncedTitle = useDebounce(title, 2000);

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
          body: JSON.stringify({ title, content }),
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b px-4 py-3">
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

