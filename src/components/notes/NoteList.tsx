"use client";

import { NoteCard } from "./NoteCard";
import { type Note } from "@/types";

interface NoteListProps {
  notes: Note[];
  onDelete?: (noteId: string) => void;
}

export function NoteList({ notes, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">还没有笔记</p>
        <p className="text-sm text-muted-foreground mt-2">点击右上角的「新建笔记」开始创建</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={onDelete} />
      ))}
    </div>
  );
}

