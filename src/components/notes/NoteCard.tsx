"use client";

import Link from "next/link";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Note } from "@/types";
import { FileText } from "lucide-react";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  // 提取内容的前100个字符作为摘要
  const excerpt = truncate(note.content.replace(/[#*\->\[\]`]/g, "").trim(), 100);

  return (
    <Link href={`/editor/${note.id}`}>
      <Card className="note-card cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <CardTitle className="text-lg truncate">{note.title}</CardTitle>
            </div>
          </div>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {excerpt || "无内容"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            更新于 {formatRelativeTime(note.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

