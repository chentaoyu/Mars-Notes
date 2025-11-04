'use client';

import { useState, useEffect } from 'react';
import { Notebook } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';

interface NotebookListProps {
  selectedNotebookId?: string | null;
  onSelectNotebook: (notebookId: string | null) => void;
}

export function NotebookList({ selectedNotebookId, onSelectNotebook }: NotebookListProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notebooks');
      const result = await response.json();
      if (response.ok) {
        setNotebooks(result.data || []);
      }
    } catch (error) {
      console.error('获取笔记本列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const result = await response.json();
        setNotebooks([...notebooks, result.data]);
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || '创建笔记本失败');
      }
    } catch (error) {
      console.error('创建笔记本失败:', error);
      alert('创建笔记本失败');
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
        method: 'DELETE',
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
        alert(error.error || '删除笔记本失败');
      }
    } catch (error) {
      console.error('删除笔记本失败:', error);
      alert('删除笔记本失败');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">笔记本</h3>
        <Button
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-xs"
        >
          {showCreateForm ? '取消' : '新建'}
        </Button>
      </div>

      {showCreateForm && (
        <CreateNotebookForm
          onSubmit={handleCreateNotebook}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="space-y-2">
        <button
          onClick={() => onSelectNotebook(null)}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            !selectedNotebookId
              ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">📋 所有笔记</span>
          </div>
        </button>

        {notebooks.map((notebook) => (
          <div
            key={notebook.id}
            className={`group relative px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              selectedNotebookId === notebook.id
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => onSelectNotebook(notebook.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span>{notebook.icon || '📓'}</span>
                  <span className="font-medium truncate">{notebook.name}</span>
                  {notebook._count && (
                    <span className="text-xs text-gray-500">
                      ({notebook._count.notes})
                    </span>
                  )}
                </div>
                {notebook.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {notebook.description}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNotebook(notebook.id);
                }}
                className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 text-xs transition-opacity"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

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

interface CreateNotebookFormProps {
  onSubmit: (name: string, description?: string) => void;
  onCancel: () => void;
}

function CreateNotebookForm({ onSubmit, onCancel }: CreateNotebookFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="笔记本名称"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            maxLength={100}
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述（可选）"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={500}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1">
            创建
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </form>
    </Card>
  );
}

