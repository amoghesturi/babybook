'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createPage } from '@/app/actions/pages';
import { uploadMediaFile, validateMediaFile } from '@/lib/uploadMedia';
import { MILESTONE_TYPES, MILESTONE_CATEGORIES } from '@babybook/shared';
import type { MilestoneCategory } from '@babybook/shared';

interface Props {
  onClose: () => void;
  templateVariant?: string;
  sectionId?: string;
}

export function MilestoneEditor({ onClose, templateVariant, sectionId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory | 'all'>('all');
  const [customName, setCustomName] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const [form, setForm] = useState({
    milestone_name: '',
    category: 'physical' as MilestoneCategory,
    achieved_at: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Video state
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [videoLocalUrl, setVideoLocalUrl] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function selectMilestone(name: string, category: MilestoneCategory) {
    setForm((f) => ({ ...f, milestone_name: name, category }));
    setIsCustom(false);
  }

  const filteredMilestones = selectedCategory === 'all'
    ? MILESTONE_TYPES
    : MILESTONE_TYPES.filter((m) => m.category === selectedCategory);

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.valid) { setError(validation.error ?? 'Invalid file'); return; }

    setUploadingVideo(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: member } = await supabase
        .from('family_members').select('family_id').eq('user_id', user.id).single();
      if (!member) throw new Error('No family found');

      const localUrl = URL.createObjectURL(file);
      setVideoLocalUrl(localUrl);

      const { storage_path } = await uploadMediaFile(supabase, file, member.family_id, { compress: false });
      setVideoPath(storage_path);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Video upload failed');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  }

  function removeVideo() {
    if (videoLocalUrl) URL.revokeObjectURL(videoLocalUrl);
    setVideoPath(null);
    setVideoLocalUrl(null);
  }

  async function handleSave() {
    const milestoneName = isCustom ? customName : form.milestone_name;
    if (!milestoneName || !form.achieved_at) {
      setError('Please select a milestone and achieved date.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const page = await createPage('milestone', form.achieved_at, {
        milestone_name: milestoneName,
        category: form.category,
        achieved_at: form.achieved_at,
        notes: form.notes || undefined,
        video_storage_path: videoPath ?? undefined,
      }, templateVariant, sectionId);
      onClose();
      router.push(`/book/${page.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              selectedCategory === 'all' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary'
            }`}
            style={{ borderColor: selectedCategory === 'all' ? 'var(--color-primary)' : 'var(--color-border)' }}
          >
            All
          </button>
          {MILESTONE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                selectedCategory === cat.id ? 'text-white' : ''
              }`}
              style={{
                borderColor: selectedCategory === cat.id ? 'var(--color-primary)' : 'var(--color-border)',
                background: selectedCategory === cat.id ? 'var(--color-primary)' : undefined,
                color: selectedCategory === cat.id ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Milestone grid */}
      <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-2">
        {filteredMilestones.map((m) => (
          <button
            key={m.id}
            onClick={() => selectMilestone(m.name, m.category)}
            className="flex items-center gap-2 p-2.5 rounded-xl border text-left transition text-sm"
            style={{
              borderColor: form.milestone_name === m.name && !isCustom
                ? 'var(--color-primary)'
                : 'var(--color-border)',
              background: form.milestone_name === m.name && !isCustom
                ? 'var(--color-primary-light)'
                : undefined,
            }}
          >
            <span className="text-lg">{m.emoji}</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{m.name}</span>
          </button>
        ))}
        <button
          onClick={() => { setIsCustom(true); setForm((f) => ({ ...f, milestone_name: '' })); }}
          className="flex items-center gap-2 p-2.5 rounded-xl border text-left transition text-sm"
          style={{
            borderColor: isCustom ? 'var(--color-primary)' : 'var(--color-border)',
            background: isCustom ? 'var(--color-primary-light)' : undefined,
          }}
        >
          <span className="text-lg">✏️</span>
          <span style={{ color: 'var(--color-text-primary)' }}>Custom…</span>
        </button>
      </div>

      {/* Custom name input */}
      {isCustom && (
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="e.g., First Haircut"
          autoFocus
          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
        />
      )}

      {/* Date + notes */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Achieved On *
          </label>
          <input
            type="date"
            value={form.achieved_at}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => set('achieved_at', e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Category (custom)
          </label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value as MilestoneCategory)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          >
            {MILESTONE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Notes (optional)
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={2}
          placeholder="Add a note about this moment…"
          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
        />
      </div>

      {/* Video clip */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Video Clip (optional)
        </label>
        {videoPath ? (
          <div
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          >
            <video
              src={videoLocalUrl ?? undefined}
              className="w-20 h-14 object-cover rounded-lg bg-black flex-shrink-0"
              muted
              playsInline
            />
            <span className="flex-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Video attached
            </span>
            <button
              onClick={removeVideo}
              className="text-xs flex-shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ✕ Remove
            </button>
          </div>
        ) : (
          <>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={handleVideoChange}
            />
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingVideo}
              className="w-full py-3 border-2 border-dashed rounded-xl text-sm transition disabled:opacity-60"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              {uploadingVideo ? '⏳ Uploading…' : '🎥 Attach Video Clip'}
              <div className="text-xs mt-0.5 opacity-60">MP4 or WebM · max 50 MB</div>
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onClose}
          className="flex-1 py-2.5 border rounded-xl text-sm font-medium transition hover:bg-border/30"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving || uploadingVideo}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
          style={{ background: 'var(--color-primary)' }}>
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
      </div>
    </div>
  );
}
