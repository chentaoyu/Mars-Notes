'use client';

import { useState, useEffect } from 'react';
import { Tag } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TagListProps {
  selectedTagIds?: string[];
  onSelectTags: (tagIds: string[]) => void;
}

export function TagList({ selectedTagIds = [], onSelectTags }: TagListProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags');
      const result = await response.json();
      if (response.ok) {
        setTags(result.data || []);
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (name: string) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color: getRandomColor() }),
      });

      if (response.ok) {
        const result = await response.json();
        setTags([...tags, result.data]);
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || '创建标签失败');
      }
    } catch (error) {
      console.error('创建标签失败:', error);
      alert('创建标签失败');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('确定要删除这个标签吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTags(tags.filter((tag) => tag.id !== tagId));
        onSelectTags(selectedTagIds.filter((id) => id !== tagId));
      } else {
        const error = await response.json();
        alert(error.error || '删除标签失败');
      }
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('删除标签失败');
    }
  };

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onSelectTags(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onSelectTags([...selectedTagIds, tagId]);
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#ef4444', // red
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#06b6d4', // cyan
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">标签</h3>
        <Button
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-xs"
        >
          {showCreateForm ? '取消' : '新建'}
        </Button>
      </div>

      {showCreateForm && (
        <CreateTagForm
          onSubmit={handleCreateTag}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {selectedTagIds.length > 0 && (
        <button
          onClick={() => onSelectTags([])}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          清除筛选
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <div
              key={tag.id}
              className="group relative inline-flex items-center"
            >
              <button
                onClick={() => handleToggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                style={
                  isSelected && tag.color
                    ? { backgroundColor: tag.color }
                    : {}
                }
              >
                # {tag.name}
                {tag._count && tag._count.noteTags > 0 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({tag._count.noteTags})
                  </span>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTag(tag.id);
                }}
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs transition-opacity"
                title="删除标签"
              >
                ×
              </button>
            </div>
          );
        })}

        {tags.length === 0 && (
          <p className="text-gray-500 text-sm">暂无标签，点击"新建"创建第一个标签</p>
        )}
      </div>
    </div>
  );
}

interface CreateTagFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

function CreateTagForm({ onSubmit, onCancel }: CreateTagFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  return (
    <Card className="p-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="标签名称"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          autoFocus
          maxLength={50}
          required
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1 text-xs">
            创建
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="text-xs"
          >
            取消
          </Button>
        </div>
      </form>
    </Card>
  );
}

