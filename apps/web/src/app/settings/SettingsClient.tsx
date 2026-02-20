'use client';

import { useState } from 'react';
import { THEMES } from '@babybook/shared';
import type { ThemeId } from '@babybook/shared';
import { updateTheme, inviteMember } from '@/app/actions/pages';
import { useTheme } from '@/lib/hooks/useTheme';

interface Family {
  id: string;
  name: string;
  theme_id: string;
}

interface Member {
  id: string;
  email: string;
  role: string;
  invite_status: string;
}

interface Props {
  family: Family;
  members: Member[];
  currentUserId: string;
}

export function SettingsClient({ family, members, currentUserId: _ }: Props) {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(family.theme_id as ThemeId);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ url: string } | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [memberList, setMemberList] = useState<Member[]>(members);
  const { applyTheme } = useTheme();

  async function handleThemeChange(themeId: ThemeId) {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    await updateTheme(themeId);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    setInviteResult(null);

    try {
      const result = await inviteMember(inviteEmail.trim());
      setInviteResult({ url: result.inviteUrl });
      setMemberList((prev) => [
        ...prev,
        { id: Date.now().toString(), email: inviteEmail.trim(), role: 'viewer', invite_status: 'pending' },
      ]);
      setInviteEmail('');
    } catch (e) {
      setInviteError(e instanceof Error ? e.message : 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Theme */}
      <section className="bg-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--color-text-primary)' }}>
          🎨 Book Theme
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className="p-4 rounded-2xl border text-left transition hover:shadow-md"
              style={{
                borderColor: currentTheme === theme.id ? 'var(--color-primary)' : 'var(--color-border)',
                borderWidth: currentTheme === theme.id ? '2px' : '1px',
                background: currentTheme === theme.id ? 'var(--color-primary-light)' : 'var(--color-surface)',
              }}
            >
              <div className="font-medium text-sm mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                {theme.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {theme.description}
              </div>
              {currentTheme === theme.id && (
                <div className="mt-1 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                  ✓ Active
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Family members */}
      <section className="bg-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--color-text-primary)' }}>
          👨‍👩‍👧 Family Members
        </h2>

        {/* Member list */}
        <div className="space-y-2 mb-6">
          {memberList.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                {m.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {m.email}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {m.role} · {m.invite_status}
                </div>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: m.role === 'owner' ? 'var(--color-primary-light)' : 'var(--color-secondary-light)',
                  color: m.role === 'owner' ? 'var(--color-primary-dark)' : '#4a3520',
                }}
              >
                {m.role}
              </span>
            </div>
          ))}
        </div>

        {/* Invite form */}
        <form onSubmit={handleInvite} className="space-y-3">
          <h3 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Invite a family member
          </h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="grandma@example.com"
              className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
            />
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
              style={{ background: 'var(--color-primary)' }}
            >
              {inviting ? 'Sending…' : 'Invite'}
            </button>
          </div>

          {inviteError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {inviteError}
            </div>
          )}

          {inviteResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-3 space-y-1">
              <p className="text-sm font-medium text-green-800">✅ Invite created!</p>
              <p className="text-xs text-green-700">Share this link with your family member:</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteResult.url}
                  className="flex-1 px-2 py-1 text-xs border border-green-300 rounded-lg bg-white text-green-900"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(inviteResult.url)}
                  className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-lg hover:bg-green-300 transition"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </form>
      </section>

      {/* About */}
      <section className="bg-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--color-text-primary)' }}>
          📖 {family.name}
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Your family's baby book — powered by BabyBook
        </p>
      </section>
    </div>
  );
}
