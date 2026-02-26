'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg'];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export type MediaFileType = 'image' | 'video' | 'audio';

export function getMediaFileType(file: File): MediaFileType | null {
  // Strip codec params (e.g. "audio/webm;codecs=opus" → "audio/webm") for matching
  const baseType = file.type.split(';')[0].trim();
  if (ALLOWED_IMAGE_TYPES.includes(baseType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(baseType)) return 'video';
  if (ALLOWED_AUDIO_TYPES.includes(baseType)) return 'audio';
  return null;
}

export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  const type = getMediaFileType(file);
  if (!type) {
    return { valid: false, error: `Unsupported file type: ${file.type}` };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: `File too large (max 50 MB)` };
  }
  return { valid: true };
}

export async function uploadMediaFile(
  supabase: SupabaseClient,
  file: File,
  familyId: string,
  options?: { compress?: boolean }
): Promise<{ storage_path: string; public_url: string }> {
  const validation = validateMediaFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const mediaType = getMediaFileType(file)!;
  const baseType = file.type.split(';')[0].trim();
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${familyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  let uploadFile: File | Blob = file;

  if (mediaType === 'image' && options?.compress !== false) {
    uploadFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
  }

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, uploadFile, { contentType: baseType });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);

  return { storage_path: path, public_url: urlData.publicUrl };
}
