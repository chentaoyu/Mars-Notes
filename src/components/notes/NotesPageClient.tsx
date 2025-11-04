"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Note, NoteSortBy, NoteSortOrder } from "@/types";
import { NoteList } from "@/components/notes/NoteList";
import { SortSelector } from "@/components/notes/SortSelector";
import { NotebookList } from "@/components/notebooks/NotebookList";
import { TagList } from "@/components/tags/TagList";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { Menu, X } from "lucide-react";

export function NotesPageClient() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<NoteSortBy>("updatedAt");
  const [sortOrder, setSortOrder] = useState<NoteSortOrder>("desc");
  const [showSidebar, setShowSidebar] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [search, selectedNotebookId, selectedTagIds, sortBy, sortOrder]);

  const fetchNotes = async () => {
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
        setNotes(result.data || []);
      }
    } catch (error) {
      console.error("获取笔记列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "未命名笔记",
          content: "",
          notebookId: selectedNotebookId,
        }),
      });

      if (response.ok) {
        const note = await response.json();
        router.push(`/editor/${note.id}`);
      }
    } catch (error) {
      console.error("创建笔记失败:", error);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/notes/${noteToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== noteToDelete));
        setDeleteDialogOpen(false);
        setNoteToDelete(null);
      }
    } catch (error) {
      console.error("删除笔记失败:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full relative">
      {/* 移动端遮罩层 */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-64 border-r bg-gray-50 dark:bg-gray-900 
          flex flex-col h-full
          transform transition-all duration-300 ease-in-out
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          ${showSidebar ? "lg:w-64" : "lg:w-0 lg:border-0 lg:overflow-hidden"}
          ${!showSidebar ? "lg:pointer-events-none" : ""}
        `}
      >
        {/* 移动端关闭按钮 */}
        <div className="lg:hidden flex justify-end p-4 pb-0">
          <button
            onClick={() => setShowSidebar(false)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            <NotebookList
              selectedNotebookId={selectedNotebookId}
              onSelectNotebook={(id) => {
                setSelectedNotebookId(id);
                // 移动端选择后自动关闭侧边栏
                if (window.innerWidth < 1024) {
                  setShowSidebar(false);
                }
              }}
            />
            <TagList
              selectedTagIds={selectedTagIds}
              onSelectTags={(ids) => {
                setSelectedTagIds(ids);
                // 移动端选择后自动关闭侧边栏
                if (window.innerWidth < 1024) {
                  setShowSidebar(false);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto h-full w-full">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          {/* 顶部工具栏 */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 flex items-center gap-1 sm:gap-2"
                >
                  <Menu className="h-5 w-5" />
                  <span className="text-sm sm:text-base">菜单</span>
                </button>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {selectedNotebookId ? "笔记本" : "我的笔记"}
                </h2>
              </div>
              <Button onClick={handleCreateNote} className="w-full sm:w-auto">
                新建笔记
              </Button>
            </div>

            {/* 搜索和排序 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索笔记..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 text-sm sm:text-base"
              />
              <SortSelector
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(newSortBy, newSortOrder) => {
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
              />
            </div>

            {/* 活动筛选标签 */}
            {(selectedNotebookId || selectedTagIds.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-400">筛选条件：</span>
                {selectedNotebookId && (
                  <button
                    onClick={() => setSelectedNotebookId(null)}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 whitespace-nowrap"
                  >
                    笔记本 ×
                  </button>
                )}
                {selectedTagIds.length > 0 && (
                  <button
                    onClick={() => setSelectedTagIds([])}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 whitespace-nowrap"
                  >
                    {selectedTagIds.length} 个标签 ×
                  </button>
                )}
              </div>
            )}

            <p className="text-muted-foreground text-xs sm:text-sm">共 {notes.length} 篇笔记</p>
          </div>

          {/* 笔记列表 */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {search || selectedNotebookId || selectedTagIds.length > 0
                  ? "没有找到匹配的笔记"
                  : '还没有笔记，点击"新建笔记"开始写作'}
              </p>
              {!search && !selectedNotebookId && selectedTagIds.length === 0 && (
                <Button onClick={handleCreateNote}>创建第一篇笔记</Button>
              )}
            </div>
          ) : (
            <NoteList notes={notes} onDelete={handleDeleteNote} />
          )}
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
