'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import HardBreak from '@tiptap/extension-hard-break';
import History from '@tiptap/extension-history';
import type { JSONContent } from '@tiptap/core';

interface Props {
  value?: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function TiptapEditor({ value, onChange, placeholder = 'Start writing…', minHeight = '150px', className }: Props) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      HardBreak,
      History,
    ],
    content: value ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content outline-none',
        style: `min-height: ${minHeight}; padding: 8px 0;`,
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={`border rounded-xl overflow-hidden ${className ?? ''}`}
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 px-2 py-1.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
          { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
          { label: 'U', action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), title: 'Underline' },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="w-7 h-7 text-xs font-bold rounded transition"
            style={{
              background: btn.active ? 'var(--color-primary-light)' : undefined,
              color: btn.active ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
            }}
          >
            {btn.label}
          </button>
        ))}
        <div className="w-px mx-1 self-stretch" style={{ background: 'var(--color-border)' }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="px-2 h-7 text-xs rounded transition"
          style={{
            background: editor.isActive('heading', { level: 2 }) ? 'var(--color-primary-light)' : undefined,
            color: editor.isActive('heading', { level: 2 }) ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
          }}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="px-2 h-7 text-xs rounded transition"
          style={{
            background: editor.isActive('bulletList') ? 'var(--color-primary-light)' : undefined,
            color: editor.isActive('bulletList') ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
          }}
        >
          • List
        </button>
      </div>

      {/* Editor area */}
      <div className="px-3 py-2">
        {!editor.getText() && (
          <div className="absolute pointer-events-none text-sm" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}>
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
