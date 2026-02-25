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
import { deleteSection, renameSection, movePageToSection } from '@/app/actions/sections';
import { PAGE_TEMPLATES } from '@babybook/shared';
import type { BookPage, BookSection } from '@babybook/shared';
import { AddSectionModal } from './AddSectionModal';

interface Props {
  initialPages: BookPage[];
  initialSections: BookSection[];
}

// ── Page card ─────────────────────────────────────────────────────────────────

function SortablePageCard({
  page, sections, onPublish, onDelete, onMoved,
}: {
  page: BookPage;
  sections: BookSection[];
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  onMoved: (pageId: string, sectionId: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  const [movingTo, setMovingTo] = useState(false);

  const template = PAGE_TEMPLATES.find((t) => t.type === page.page_type);
  const dateStr = new Date(page.page_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  async function handleMove(sectionId: string) {
    if (sectionId === (page.section_id ?? '')) return;
    setMovingTo(true);
    try {
      await movePageToSection(page.id, sectionId || null);
      onMoved(page.id, sectionId || null);
    } finally {
      setMovingTo(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-3 p-4 bg-surface border rounded-2xl shadow-sm hover:shadow-md transition group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-text-secondary hover:text-text-primary"
      >
        ⠿
      </div>

      {/* Emoji */}
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
              style={{ background: '#fef3c7', color: '#92400e' }}>Draft</span>
          )}
          {page.status === 'published' && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: '#d1fae5', color: '#065f46' }}>Published</span>
          )}
        </div>
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{dateStr}</span>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        {/* Move to section dropdown */}
        {sections.length > 0 && (
          <select
            value={page.section_id ?? ''}
            onChange={(e) => handleMove(e.target.value)}
            disabled={movingTo}
            className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-secondary)' }}
            title="Move to section"
          >
            <option value="">No section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}

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

// ── Section group ─────────────────────────────────────────────────────────────

function SectionGroup({
  section, pages, allSections, onPublish, onDelete, onMoved, onRenamed, onDeleted,
}: {
  section: BookSection | null; // null = unsectioned
  pages: BookPage[];
  allSections: BookSection[];
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  onMoved: (pageId: string, sectionId: string | null) => void;
  onRenamed: (sectionId: string, name: string) => void;
  onDeleted: (sectionId: string) => void;
}) {
  const [groupPages, setGroupPages] = useState(pages);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(section?.name ?? '');

  // Keep in sync when parent pages prop changes
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = groupPages.findIndex((p) => p.id === active.id);
    const newIndex = groupPages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(groupPages, oldIndex, newIndex);
    setGroupPages(reordered);

    setSaving(true);
    try {
      await updateSortOrder(
        reordered.map((p, i) => ({ id: p.id, sort_order: i, section_id: p.section_id ?? null }))
      );
    } catch {
      setGroupPages(groupPages);
    } finally {
      setSaving(false);
    }
  }, [groupPages]);

  async function handleRename() {
    if (!section || !editName.trim()) return;
    await renameSection(section.id, editName);
    onRenamed(section.id, editName.trim());
    setEditing(false);
  }

  async function handleDeleteSection() {
    if (!section) return;
    if (!confirm(`Delete section "${section.name}"? Pages will move to unsectioned.`)) return;
    await deleteSection(section.id);
    onDeleted(section.id);
  }

  // Sync groupPages when parent tells us a page moved out
  const currentIds = pages.map((p) => p.id).join(',');
  const groupIds = groupPages.map((p) => p.id).join(',');
  if (currentIds !== groupIds) {
    setGroupPages(pages);
  }

  return (
    <div className="space-y-2">
      {/* Section header */}
      {section && (
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-xl"
          style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-light)' }}
        >
          {editing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
              className="flex-1 px-2 py-0.5 rounded-lg text-sm font-semibold focus:outline-none"
              style={{ background: 'white', color: 'var(--color-primary-dark)' }}
            />
          ) : (
            <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
              {section.name}
              <span className="ml-2 font-normal opacity-60 text-xs">({groupPages.length} page{groupPages.length !== 1 ? 's' : ''})</span>
            </span>
          )}

          {editing ? (
            <>
              <button onClick={handleRename} className="text-xs px-2 py-1 rounded-lg text-white" style={{ background: 'var(--color-primary)' }}>Save</button>
              <button onClick={() => setEditing(false)} className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--color-text-secondary)' }}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditing(true); setEditName(section.name); }}
                className="text-xs opacity-60 hover:opacity-100 transition" style={{ color: 'var(--color-primary-dark)' }}
                title="Rename section">✏️</button>
              <button onClick={handleDeleteSection}
                className="text-xs opacity-60 hover:opacity-100 transition hover:text-red-600" style={{ color: 'var(--color-primary-dark)' }}
                title="Delete section">🗑️</button>
            </>
          )}
          {saving && <span className="text-xs opacity-60" style={{ color: 'var(--color-primary-dark)' }}>Saving…</span>}
        </div>
      )}

      {/* Pages in this section */}
      {groupPages.length === 0 ? (
        <div
          className="text-center py-6 rounded-xl border-2 border-dashed text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          {section ? 'No pages in this section yet.' : 'No unsectioned pages.'}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={groupPages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {groupPages.map((page) => (
                <SortablePageCard
                  key={page.id}
                  page={page}
                  sections={allSections}
                  onPublish={onPublish}
                  onDelete={onDelete}
                  onMoved={onMoved}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ManagePages({ initialPages, initialSections }: Props) {
  const [pages, setPages] = useState<BookPage[]>(initialPages);
  const [sections, setSections] = useState<BookSection[]>(initialSections);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [showAddSection, setShowAddSection] = useState(false);

  const filtered = filter === 'all' ? pages : pages.filter((p) => p.status === filter);

  const draftCount = pages.filter((p) => p.status === 'draft').length;
  const publishedCount = pages.filter((p) => p.status === 'published').length;

  async function handlePublish(id: string) {
    await publishPage(id);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'published' as const } : p)));
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? This page will be soft-deleted (recoverable).')) return;
    await deletePage(id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  function handleMoved(pageId: string, sectionId: string | null) {
    setPages((prev) => prev.map((p) => p.id === pageId ? { ...p, section_id: sectionId } : p));
  }

  function handleSectionRenamed(sectionId: string, name: string) {
    setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, name } : s));
  }

  function handleSectionDeleted(sectionId: string) {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    setPages((prev) => prev.map((p) => p.section_id === sectionId ? { ...p, section_id: null } : p));
  }

  // Group filtered pages
  const sectionGroups = sections.map((section) => ({
    section,
    pages: filtered.filter((p) => p.section_id === section.id),
  }));
  const unsectioned = filtered.filter((p) => !p.section_id);

  return (
    <div className="space-y-6">
      {/* Growth chart link */}
      <a
        href="/book/growth"
        className="flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition hover:border-primary/40"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
      >
        <span>📈</span>
        <span>View Growth Chart</span>
        <span className="ml-auto opacity-50">→</span>
      </a>

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
            <div className="font-bold text-2xl" style={{ color: 'var(--color-text-primary)' }}>{stat.value}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs + Add Section */}
      <div className="flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
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
        <button
          onClick={() => setShowAddSection(true)}
          className="ml-auto mb-1 px-3 py-1.5 rounded-xl text-xs font-medium text-white transition"
          style={{ background: 'var(--color-primary)' }}
        >
          + Add Section
        </button>
      </div>

      {/* Page list — grouped by section */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <div className="text-4xl mb-3">📭</div>
          <p>No {filter === 'all' ? '' : filter} pages yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Named sections */}
          {sectionGroups.map(({ section, pages: sPages }) => (
            <SectionGroup
              key={section.id}
              section={section}
              pages={sPages}
              allSections={sections}
              onPublish={handlePublish}
              onDelete={handleDelete}
              onMoved={handleMoved}
              onRenamed={handleSectionRenamed}
              onDeleted={handleSectionDeleted}
            />
          ))}

          {/* Unsectioned pages */}
          {(unsectioned.length > 0 || sections.length === 0) && (
            <SectionGroup
              section={null}
              pages={unsectioned}
              allSections={sections}
              onPublish={handlePublish}
              onDelete={handleDelete}
              onMoved={handleMoved}
              onRenamed={() => {}}
              onDeleted={() => {}}
            />
          )}
        </div>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
        Drag ⠿ to reorder within a section · Use the section dropdown to move pages
      </p>

      {showAddSection && (
        <AddSectionModal
          onClose={() => setShowAddSection(false)}
          onCreated={() => { window.location.reload(); }}
        />
      )}
    </div>
  );
}
