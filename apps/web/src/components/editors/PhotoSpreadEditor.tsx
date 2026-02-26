'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createPage, updatePage } from '@/app/actions/pages';
import { uploadMediaFile, validateMediaFile, getMediaFileType } from '@/lib/uploadMedia';
import type { PhotoLayout, MediaItem, PhotoSpreadContent } from '@babybook/shared';

interface Props {
  onClose: () => void;
  templateVariant?: string;
  sectionId?: string;
  pageId?: string;
  initialContent?: PhotoSpreadContent;
  initialPageDate?: string;
}

const LAYOUTS: { id: PhotoLayout; label: string; emoji: string; maxPhotos: number }[] = [
  { id: 'single', label: 'Single', emoji: '🖼️', maxPhotos: 1 },
  { id: 'grid', label: 'Grid', emoji: '▦', maxPhotos: 4 },
  { id: 'polaroid', label: 'Polaroid', emoji: '📸', maxPhotos: 4 },
];

type LocalMediaItem = MediaItem & { localUrl?: string };

export function PhotoSpreadEditor({ onClose, templateVariant, sectionId, pageId, initialContent, initialPageDate }: Props) {
  const router = useRouter();
  const [layout, setLayout] = useState<PhotoLayout>(
    (initialContent?.layout as PhotoLayout) ?? (templateVariant as PhotoLayout) ?? 'polaroid'
  );
  const effectiveLayout = (templateVariant as PhotoLayout) ?? layout;

  // Pre-populate media from initialContent when editing
  const [media, setMedia] = useState<LocalMediaItem[]>(() => {
    if (!initialContent) return [];
    const items = initialContent.media ?? initialContent.photos.map((p) => ({
      storage_path: p.storage_path,
      caption: p.caption,
      public_url: p.public_url,
      media_type: 'photo' as const,
    }));
    return items.map((item) => ({ ...item, localUrl: undefined }));
  });
  const [pageDate, setPageDate] = useState(initialPageDate ?? new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const maxItems = LAYOUTS.find((l) => l.id === effectiveLayout)?.maxPhotos ?? 4;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = maxItems - media.length;
    const toProcess = files.slice(0, remaining);

    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: member } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (!member) throw new Error('No family found');

      const newItems: LocalMediaItem[] = [];

      for (const file of toProcess) {
        const validation = validateMediaFile(file);
        if (!validation.valid) throw new Error(validation.error);

        const mediaType = getMediaFileType(file);
        const localUrl = URL.createObjectURL(file);

        const { storage_path, public_url } = await uploadMediaFile(
          supabase,
          file,
          member.family_id,
          { compress: mediaType === 'image' }
        );

        newItems.push({
          storage_path,
          public_url,
          localUrl,
          media_type: mediaType === 'video' ? 'video' : 'photo',
        });
      }

      setMedia((prev) => [...prev, ...newItems]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeItem(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCaption(index: number, caption: string) {
    setMedia((prev) => prev.map((p, i) => (i === index ? { ...p, caption } : p)));
  }

  async function handleSave() {
    if (!media.length) {
      setError('Please add at least one photo or video.');
      return;
    }
    setSaving(true);
    setError(null);
    const spreadContent = {
      layout: effectiveLayout,
      // backward-compat: populate photos with photo-only items
      photos: media
        .filter((m) => m.media_type === 'photo')
        .map(({ storage_path, caption, public_url }) => ({ storage_path, caption, public_url })),
      media: media.map(({ storage_path, caption, public_url, media_type }) => ({
        storage_path,
        caption,
        public_url,
        media_type,
      })),
    };
    try {
      if (pageId) {
        await updatePage(pageId, spreadContent, pageDate);
        router.refresh();
        onClose();
      } else {
        const page = await createPage('photo_spread', pageDate, spreadContent, templateVariant ?? effectiveLayout, sectionId);
        onClose();
        router.push(`/book/${page.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Layout selector — hidden when variant was pre-selected in the picker */}
      {!templateVariant && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Layout
          </label>
          <div className="flex gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                onClick={() => { setLayout(l.id); setMedia([]); }}
                className="flex-1 py-2 rounded-xl border text-sm font-medium transition"
                style={{
                  borderColor: effectiveLayout === l.id ? 'var(--color-primary)' : 'var(--color-border)',
                  background: effectiveLayout === l.id ? 'var(--color-primary-light)' : undefined,
                  color: effectiveLayout === l.id ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                }}
              >
                {l.emoji} {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Media upload area */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Photos &amp; Videos ({media.length}/{maxItems}) — {LAYOUTS.find(l => l.id === effectiveLayout)?.label} layout
        </label>

        {media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {media.map((item, i) => (
              <div key={i} className="relative group">
                {item.media_type === 'video' ? (
                  <video
                    src={item.localUrl ?? item.public_url}
                    className="w-full h-24 object-cover rounded-lg bg-black"
                    muted
                    playsInline
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.localUrl ?? item.public_url ?? item.storage_path}
                    alt={`Item ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                )}
                {item.media_type === 'video' && (
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    🎬
                  </div>
                )}
                <button
                  onClick={() => removeItem(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
                <input
                  type="text"
                  value={item.caption ?? ''}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  placeholder="Caption…"
                  className="mt-1 w-full px-2 py-1 border rounded-lg text-xs focus:outline-none"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
                />
              </div>
            ))}
          </div>
        )}

        {media.length < maxItems && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              multiple={maxItems > 1}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-8 border-2 border-dashed rounded-xl text-sm transition hover:border-primary/50 disabled:opacity-60"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              {uploading ? '⏳ Uploading…' : '📷 Click to add photos or videos'}
              <div className="text-xs mt-1 opacity-60">JPEG, PNG, WebP, MP4, WebM · max 50 MB</div>
            </button>
          </>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Date
        </label>
        <input
          type="date"
          value={pageDate}
          onChange={(e) => setPageDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
        />
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
        <button onClick={handleSave} disabled={saving || uploading}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
          style={{ background: 'var(--color-primary)' }}>
          {saving ? 'Saving…' : pageId ? 'Save Changes' : 'Save as Draft'}
        </button>
      </div>
    </div>
  );
}
