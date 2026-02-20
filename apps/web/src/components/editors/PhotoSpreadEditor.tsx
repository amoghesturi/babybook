'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createPage } from '@/app/actions/pages';
import type { PhotoLayout, PhotoItem } from '@babybook/shared';
import imageCompression from 'browser-image-compression';

interface Props {
  onClose: () => void;
}

const LAYOUTS: { id: PhotoLayout; label: string; emoji: string; maxPhotos: number }[] = [
  { id: 'single', label: 'Single', emoji: '🖼️', maxPhotos: 1 },
  { id: 'grid', label: 'Grid', emoji: '▦', maxPhotos: 4 },
  { id: 'polaroid', label: 'Polaroid', emoji: '📸', maxPhotos: 4 },
];

export function PhotoSpreadEditor({ onClose }: Props) {
  const router = useRouter();
  const [layout, setLayout] = useState<PhotoLayout>('polaroid');
  const [photos, setPhotos] = useState<(PhotoItem & { file?: File; localUrl?: string })[]>([]);
  const [pageDate, setPageDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const maxPhotos = LAYOUTS.find((l) => l.id === layout)?.maxPhotos ?? 4;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = maxPhotos - photos.length;
    const toProcess = files.slice(0, remaining);

    setUploading(true);
    setError(null);

    try {
      // Get family context for storage path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: member } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (!member) throw new Error('No family found');

      const newPhotos: (PhotoItem & { localUrl?: string })[] = [];

      for (const file of toProcess) {
        // Compress image browser-side
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${member.family_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // Upload directly to Supabase Storage (browser → Storage, bypassing Vercel)
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, compressed, { contentType: compressed.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(path);

        newPhotos.push({
          storage_path: path,
          public_url: urlData.publicUrl,
          localUrl: URL.createObjectURL(compressed),
        });
      }

      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCaption(index: number, caption: string) {
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, caption } : p))
    );
  }

  async function handleSave() {
    if (!photos.length) {
      setError('Please add at least one photo.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const page = await createPage(
        'photo_spread',
        pageDate,
        {
          layout,
          photos: photos.map(({ storage_path, caption, public_url }) => ({
            storage_path,
            caption,
            public_url,
          })),
        },
        layout
      );
      onClose();
      router.push(`/book/${page.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Layout selector */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Layout
        </label>
        <div className="flex gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => { setLayout(l.id); setPhotos([]); }}
              className="flex-1 py-2 rounded-xl border text-sm font-medium transition"
              style={{
                borderColor: layout === l.id ? 'var(--color-primary)' : 'var(--color-border)',
                background: layout === l.id ? 'var(--color-primary-light)' : undefined,
                color: layout === l.id ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              }}
            >
              {l.emoji} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo upload area */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Photos ({photos.length}/{maxPhotos})
        </label>

        {/* Preview grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.localUrl ?? photo.public_url ?? photo.storage_path}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
                <input
                  type="text"
                  value={photo.caption ?? ''}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  placeholder="Caption…"
                  className="mt-1 w-full px-2 py-1 border rounded-lg text-xs focus:outline-none"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
                />
              </div>
            ))}
          </div>
        )}

        {photos.length < maxPhotos && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple={maxPhotos > 1}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-8 border-2 border-dashed rounded-xl text-sm transition hover:border-primary/50 disabled:opacity-60"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              {uploading ? '⏳ Uploading…' : '📷 Click to add photos'}
              <div className="text-xs mt-1 opacity-60">
                Compressed & uploaded directly to storage
              </div>
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
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
      </div>
    </div>
  );
}
