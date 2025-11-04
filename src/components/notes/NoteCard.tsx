"use client";

import Link from "next/link";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Note } from "@/types";
import { FileText, Trash2 } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onDelete?: (noteId: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  // 提取内容的前100个字符作为摘要
  const excerpt = truncate(note.content.replace(/[#*\->\[\]`]/g, "").trim(), 100);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(note.id);
    }
  };

  return (
    <Link href={`/editor/${note.id}`} className="block h-full">
      <Card className="note-card cursor-pointer group relative h-[280px] flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <CardTitle className="text-lg truncate">{note.title}</CardTitle>
            </div>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                title="删除笔记"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {excerpt || "无内容"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between space-y-2 min-h-0 pt-0">
          <div className="space-y-2 flex-shrink-0">
            {/* 笔记本标签 */}
            {note.notebook && (
              <div className="flex items-center gap-1 text-xs">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md truncate">
                  {note.notebook.icon || '📓'} {note.notebook.name}
                </span>
              </div>
            )}

            {/* 标签列表 */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 max-h-[56px] overflow-hidden">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 truncate max-w-[120px]"
                    style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : {}}
                  >
                    #{tag.name}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground flex-shrink-0">
            更新于 {formatRelativeTime(note.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

