'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createPage } from '@/app/actions/pages';
import { uploadMediaFile } from '@/lib/uploadMedia';
import { TiptapEditor } from './TiptapEditor';
import type { JSONContent } from '@tiptap/core';

interface Props {
  onClose: () => void;
  templateVariant?: string;
  sectionId?: string;
}

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'excited', emoji: '🤩', label: 'Excited' },
  { id: 'grateful', emoji: '🥹', label: 'Grateful' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'bittersweet', emoji: '🥲', label: 'Bittersweet' },
  { id: 'proud', emoji: '🥰', label: 'Proud' },
  { id: 'peaceful', emoji: '😌', label: 'Peaceful' },
];

export function JournalEditor({ onClose, templateVariant, sectionId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<JSONContent>({ type: 'doc', content: [{ type: 'paragraph' }] });
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    mood: '',
    tags: [] as string[],
    pageDate: new Date().toISOString().split('T')[0],
  });

  // Voice note state
  const [voiceNotePath, setVoiceNotePath] = useState<string | null>(null);
  const [voiceNoteLocalUrl, setVoiceNoteLocalUrl] = useState<string | null>(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    return () => {
      if (voiceNoteLocalUrl) URL.revokeObjectURL(voiceNoteLocalUrl);
    };
  }, [voiceNoteLocalUrl]);

  function set<K extends keyof typeof form>(field: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag]);
    }
    setTagInput('');
  }

  async function getFamilyId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data: member } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single();
    if (!member) throw new Error('No family found');
    return member.family_id;
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
        const file = new File([blob], `voice-note.${ext}`, { type: mimeType });
        await uploadVoiceNote(file);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError('Microphone access denied or not available.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setUploadingVoice(true);
  }

  async function uploadVoiceNote(file: File) {
    try {
      const familyId = await getFamilyId();
      const localUrl = URL.createObjectURL(file);
      setVoiceNoteLocalUrl(localUrl);

      // Get duration via Audio API
      const audio = new Audio(localUrl);
      audio.onloadedmetadata = () => setVoiceNoteDuration(Math.round(audio.duration));

      const { storage_path } = await uploadMediaFile(supabase, file, familyId, { compress: false });
      setVoiceNotePath(storage_path);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Voice upload failed');
    } finally {
      setUploadingVoice(false);
    }
  }

  async function handleAudioFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVoice(true);
    setError(null);
    await uploadVoiceNote(file);
    if (audioFileInputRef.current) audioFileInputRef.current.value = '';
  }

  function removeVoiceNote() {
    if (voiceNoteLocalUrl) URL.revokeObjectURL(voiceNoteLocalUrl);
    setVoiceNotePath(null);
    setVoiceNoteLocalUrl(null);
    setVoiceNoteDuration(null);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('Please add a title.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const page = await createPage('journal', form.pageDate, {
        title: form.title,
        content_tiptap: content,
        mood: form.mood || undefined,
        tags: form.tags.length ? form.tags : undefined,
        voice_note_storage_path: voiceNotePath ?? undefined,
        voice_note_duration_s: voiceNoteDuration ?? undefined,
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
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Title *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g., First time at the park"
          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
        />
      </div>

      {/* Mood */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Mood
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => set('mood', form.mood === m.id ? '' : m.id)}
              title={m.label}
              className="w-9 h-9 rounded-xl border text-xl transition hover:scale-110"
              style={{
                borderColor: form.mood === m.id ? 'var(--color-primary)' : 'var(--color-border)',
                background: form.mood === m.id ? 'var(--color-primary-light)' : undefined,
              }}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Rich text */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Entry
        </label>
        <TiptapEditor
          value={content}
          onChange={setContent}
          placeholder="Write about this moment…"
          minHeight="150px"
        />
      </div>

      {/* Voice note */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Voice Note
        </label>

        {voiceNotePath ? (
          <div
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          >
            <span className="text-xl">🎙</span>
            <audio
              controls
              src={voiceNoteLocalUrl ?? undefined}
              className="flex-1 h-8"
              style={{ minWidth: 0 }}
            />
            {voiceNoteDuration && (
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                {Math.floor(voiceNoteDuration / 60)}:{String(voiceNoteDuration % 60).padStart(2, '0')}
              </span>
            )}
            <button
              onClick={removeVoiceNote}
              className="text-xs flex-shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={uploadingVoice}
              className="flex-1 py-2 rounded-xl border text-sm font-medium transition"
              style={{
                borderColor: recording ? '#ef4444' : 'var(--color-border)',
                background: recording ? '#fef2f2' : undefined,
                color: recording ? '#ef4444' : 'var(--color-text-secondary)',
              }}
            >
              {recording ? '⏹ Stop Recording' : '🎙 Record'}
            </button>
            <button
              onClick={() => audioFileInputRef.current?.click()}
              disabled={recording || uploadingVoice}
              className="flex-1 py-2 rounded-xl border text-sm font-medium transition"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              {uploadingVoice ? '⏳ Uploading…' : '📎 Upload Audio'}
            </button>
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/mpeg,audio/mp4,audio/webm,audio/ogg"
              className="hidden"
              onChange={handleAudioFileChange}
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Tags
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="#milestone"
            className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          />
          <button onClick={addTag} className="px-3 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--color-primary)' }}>
            Add
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}
                onClick={() => set('tags', form.tags.filter((t) => t !== tag))}
              >
                #{tag} ×
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Date
        </label>
        <input
          type="date"
          value={form.pageDate}
          onChange={(e) => set('pageDate', e.target.value)}
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
        <button onClick={handleSave} disabled={saving || recording || uploadingVoice}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
          style={{ background: 'var(--color-primary)' }}>
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
      </div>
    </div>
  );
}
