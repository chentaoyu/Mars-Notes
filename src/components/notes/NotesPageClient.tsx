"use client";

import { useState, useEffect, useCallback } from "react";
import { Note, NoteSortBy, NoteSortOrder } from "@/types";
import { FinderSidebar } from "@/components/sidebar/FinderSidebar";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";

export function NotesPageClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<NoteSortBy>("updatedAt");
  const [sortOrder, setSortOrder] = useState<NoteSortOrder>("desc");
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [hasCheckedFirstNote, setHasCheckedFirstNote] = useState(false);

  // 检查并自动创建/显示第一个笔记（仅在首次加载时，且没有任何筛选条件）
  useEffect(() => {
    // 如果已经检查过，直接返回（这是最重要的检查，确保只执行一次）
    if (hasCheckedFirstNote) {
      return;
    }

    // 如果正在加载，或者已有当前笔记，或者有筛选条件，不执行
    if (loading || currentNoteId || search || selectedNotebookId || selectedTagIds.length > 0) {
      return;
    }

    const checkAndShowFirstNote = async () => {
      // 如果没有笔记，自动创建第一个笔记
      if (notes.length === 0) {
        setHasCheckedFirstNote(true);
        try {
          const createResponse = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "欢迎使用 Mars-Notes",
              content: "# 欢迎使用 Mars-Notes\n\n这是你的第一篇笔记，开始记录你的想法吧！",
              notebookId: null,
            }),
          });

          if (createResponse.ok) {
            const newNote = await createResponse.json();
            setCurrentNoteId(newNote.id);
            setCurrentNote(newNote);
            await fetchNotes(); // 刷新笔记列表
          }
        } catch (error) {
          console.error("创建欢迎笔记失败:", error);
        }
      } else if (notes.length > 0) {
        // 如果有笔记，默认显示第一个笔记（仅首次加载）
        setHasCheckedFirstNote(true);
        const firstNote = notes[0];
        setCurrentNoteId(firstNote.id);
        setCurrentNote(firstNote);
      }
    };

    checkAndShowFirstNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    notes.length,
    hasCheckedFirstNote,
    loading,
    currentNoteId,
    search,
    selectedNotebookId,
    selectedTagIds.length,
  ]);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (selectedNotebookId) params.set("notebookId", selectedNotebookId);
      if (selectedTagIds.length > 0) params.set("tagIds", selectedTagIds.join(","));
      params.set("sort", sortBy);
      params.set("order", sortOrder);

      const response = await fetch(`/api/notes?${params}`);
      const result = await response.json();

      if (response.ok) {
        const fetchedNotes = result.data || [];
        setNotes(fetchedNotes);
      }
    } catch (error) {
      console.error("获取笔记列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedNotebookId, selectedTagIds, sortBy, sortOrder]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "未命名笔记",
          content: "",
          notebookId: selectedNotebookId ?? null,
        }),
      });

      if (response.ok) {
        const note = await response.json();
        setCurrentNoteId(note.id);
        setCurrentNote(note);
        await fetchNotes(); // 刷新笔记列表
      }
    } catch (error) {
      console.error("创建笔记失败:", error);
    }
  };

  const handleNoteSelect = async (noteId: string) => {
    // 先设置当前笔记ID，立即响应
    setCurrentNoteId(noteId);

    // 尝试从当前笔记列表中找到笔记
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setCurrentNote(note);
    } else {
      // 如果不在列表中，从API获取完整笔记数据
      try {
        const response = await fetch(`/api/notes/${noteId}`);
        if (response.ok) {
          const noteData = await response.json();
          setCurrentNote(noteData);
        } else {
          // 如果获取失败，清除当前笔记ID
          setCurrentNoteId(null);
          setCurrentNote(null);
        }
      } catch (error) {
        console.error("获取笔记失败:", error);
        setCurrentNoteId(null);
        setCurrentNote(null);
      }
    }
  };

  // 处理从AI聊天生成的笔记
  const handleNoteFromAIChat = async (noteId: string) => {
    try {
      // 获取笔记详情
      const response = await fetch(`/api/notes/${noteId}`);
      if (response.ok) {
        const noteData = await response.json();
        setCurrentNoteId(noteData.id);
        setCurrentNote(noteData);
        await fetchNotes(); // 刷新笔记列表
      }
    } catch (error) {
      console.error("获取生成的笔记失败:", error);
    }
  };

  return (
    <div className="flex h-full relative">
      {/* 侧边栏 */}
      <div className="w-64 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <FinderSidebar
            selectedNotebookId={selectedNotebookId}
            selectedTagIds={selectedTagIds}
            search={search}
            sortBy={sortBy}
            sortOrder={sortOrder}
            notes={notes}
            currentNoteId={currentNoteId}
            onSelectNotebook={setSelectedNotebookId}
            onSelectTags={setSelectedTagIds}
            onSelectNote={handleNoteSelect}
            onCreateNote={handleCreateNote}
            onSearchChange={setSearch}
            onSortChange={(newSortBy, newSortOrder) => {
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            onNoteFromAIChat={handleNoteFromAIChat}
          />
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 h-full w-full flex flex-col overflow-hidden">
        {loading && !currentNote ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">加载中...</div>
          </div>
        ) : currentNote ? (
          <div className="flex-1 h-full overflow-hidden">
            <MarkdownEditor
              noteId={currentNote.id}
              initialTitle={currentNote.title}
              initialContent={currentNote.content}
              initialNotebookId={currentNote.notebookId || undefined}
              initialTags={currentNote.tags || []}
              onDelete={() => {
                setCurrentNoteId(null);
                setCurrentNote(null);
                fetchNotes();
              }}
              onSave={() => {
                fetchNotes();
              }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                {search || selectedNotebookId || selectedTagIds.length > 0
                  ? "没有找到匹配的笔记"
                  : '还没有笔记，点击"新建笔记"开始写作'}
              </p>
              {!search && !selectedNotebookId && selectedTagIds.length === 0 && (
                <Button onClick={handleCreateNote}>创建第一篇笔记</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
