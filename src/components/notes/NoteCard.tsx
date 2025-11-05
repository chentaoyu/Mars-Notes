"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Note } from "@/types";
import { FileText, Trash2 } from "lucide-react";
import { MarkdownPreview } from "@/components/editor/MarkdownPreview";

interface NoteCardProps {
  note: Note;
  onDelete?: (noteId: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  // 提取内容的前150个字符作为预览（保留 markdown 格式）
  const previewContent = truncate(note.content.trim(), 150);

  // 使用 useMemo 在客户端计算相对时间，避免 SSR/CSR 不匹配
  const relativeTime = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return formatRelativeTime(note.updatedAt);
  }, [note.updatedAt]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(note.id);
    }
  };

  return (
    <Link href={`/editor/${note.id}`} className="block h-full">
      <Card className="note-card cursor-pointer group relative h-[240px] sm:h-[280px] flex flex-col">
        <CardHeader className="flex-shrink-0 pb-2 sm:pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              <CardTitle className="text-base sm:text-lg truncate">{note.title}</CardTitle>
            </div>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                title="删除笔记"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between space-y-2 min-h-0 pt-0">
          {/* Markdown 预览 */}
          {note.content.trim() && (
            <div className="flex-1 min-h-0 overflow-hidden mb-2">
              <div className="markdown-preview-card h-full overflow-hidden">
                <MarkdownPreview content={previewContent} />
              </div>
            </div>
          )}
          <div className="space-y-1 sm:space-y-2 flex-shrink-0 mt-auto">
            {/* 笔记本标签 */}
            {note.notebook && (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 rounded-md truncate">
                  {note.notebook.icon || "📓"} {note.notebook.name}
                </span>
              </div>
            )}

            {/* 标签列表 */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 max-h-[40px] sm:max-h-[56px] overflow-hidden">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 truncate max-w-[80px] sm:max-w-[120px]"
                    style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : {}}
                  >
                    #{tag.name}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-gray-500">
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
            更新于 {relativeTime || "加载中..."}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
