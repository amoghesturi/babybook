'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { publishPage, deletePage, updateSortOrder } from '@/app/actions/pages';
import { PAGE_TEMPLATES } from '@babybook/shared';
import type { BookPage } from '@babybook/shared';

interface Props {
  initialPages: BookPage[];
}

function SortablePageCard({ page, onPublish, onDelete }: {
  page: BookPage;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const template = PAGE_TEMPLATES.find((t) => t.type === page.page_type);
  const dateStr = new Date(page.page_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-surface border rounded-2xl shadow-sm hover:shadow-md transition group"
      {...(page.status === 'draft' ? {} : {})}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-text-secondary hover:text-text-primary"
      >
        ⠿
      </div>

      {/* Emoji + type */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-xl"
        style={{ background: 'var(--color-primary-light)' }}>
        {template?.emoji ?? '📄'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
            {template?.label ?? page.page_type}
          </span>
          {page.status === 'draft' && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium animate-pulse"
              style={{ background: '#fef3c7', color: '#92400e' }}>
              Draft
            </span>
          )}
          {page.status === 'published' && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: '#d1fae5', color: '#065f46' }}>
              Published
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{dateStr}</span>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <a
          href={`/book/${page.id}`}
          className="px-3 py-1.5 text-xs rounded-lg border transition hover:bg-border/30"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          View
        </a>
        {page.status === 'draft' && (
          <button
            onClick={() => onPublish(page.id)}
            className="px-3 py-1.5 text-xs rounded-lg text-white font-medium transition"
            style={{ background: 'var(--color-primary)' }}
          >
            Publish
          </button>
        )}
        <button
          onClick={() => onDelete(page.id)}
          className="px-3 py-1.5 text-xs rounded-lg border transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function ManagePages({ initialPages }: Props) {
  const [pages, setPages] = useState<BookPage[]>(initialPages);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);
      const newPages = arrayMove(pages, oldIndex, newIndex);
      setPages(newPages);

      setSaving(true);
      try {
        await updateSortOrder(newPages.map((p) => p.id));
      } catch {
        // Revert on error
        setPages(pages);
      } finally {
        setSaving(false);
      }
    },
    [pages]
  );

  async function handlePublish(id: string) {
    await publishPage(id);
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'published' } : p))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? This page will be soft-deleted (recoverable).')) return;
    await deletePage(id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  const filtered = filter === 'all'
    ? pages
    : pages.filter((p) => p.status === filter);

  const draftCount = pages.filter((p) => p.status === 'draft').length;
  const publishedCount = pages.filter((p) => p.status === 'published').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Pages', value: pages.length, emoji: '📖' },
          { label: 'Published', value: publishedCount, emoji: '✅' },
          { label: 'Drafts', value: draftCount, emoji: '📝' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-2xl p-4 text-center border"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-2xl mb-1">{stat.emoji}</div>
            <div className="font-bold text-2xl" style={{ color: 'var(--color-text-primary)' }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px"
            style={{
              borderBottomColor: filter === f ? 'var(--color-primary)' : 'transparent',
              color: filter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {f}
          </button>
        ))}
        {saving && (
          <span className="ml-auto self-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Saving order…
          </span>
        )}
      </div>

      {/* Drag-to-reorder list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <div className="text-4xl mb-3">📭</div>
          <p>No {filter === 'all' ? '' : filter} pages yet.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.map((page) => (
                <SortablePageCard
                  key={page.id}
                  page={page}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Tip */}
      <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
        Drag ⠿ to reorder pages. Viewers only see published pages.
      </p>
    </div>
  );
}
