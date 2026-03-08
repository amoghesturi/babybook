'use client';

import { useState } from 'react';
import { THEMES } from '@babybook/shared';
import type { ThemeId } from '@babybook/shared';
import { updateTheme, inviteMember } from '@/app/actions/pages';
import { updateFamilyName, updateChildDetails, updateCoverPage, updateMemberRole, toggleSharing, regenerateShareToken } from '@/app/actions/settings';
import { useTheme } from '@/lib/hooks/useTheme';

interface Family {
  id: string;
  name: string;
  theme_id: string;
  share_token: string;
  sharing_enabled: boolean;
}

interface Member {
  id: string;
  email: string;
  role: string;
  invite_status: string;
  user_id?: string | null;
}

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string | null;
}

interface Cover {
  id: string;
  content: Record<string, unknown>;
}

interface Props {
  family: Family;
  members: Member[];
  currentUserId: string;
  child: Child | null;
  cover: Cover | null;
}

export function SettingsClient({ family, members, currentUserId, child, cover }: Props) {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(family.theme_id as ThemeId);
  const { applyTheme } = useTheme();

  // Family name
  const [familyName, setFamilyName] = useState(family.name);
  const [savingFamily, setSavingFamily] = useState(false);
  const [familyStatus, setFamilyStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // Child details
  const [childName, setChildName] = useState(child?.name ?? '');
  const [childDob, setChildDob] = useState(child?.date_of_birth ?? '');
  const [childGender, setChildGender] = useState<'male' | 'female' | 'other' | ''>(
    (child?.gender as 'male' | 'female' | 'other' | '') ?? ''
  );
  const [savingChild, setSavingChild] = useState(false);
  const [childStatus, setChildStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // Cover / book title
  const [bookTitle, setBookTitle] = useState(
    (cover?.content?.book_title as string) ?? ''
  );
  const [bookSubtitle, setBookSubtitle] = useState(
    (cover?.content?.subtitle as string) ?? ''
  );
  const [savingCover, setSavingCover] = useState(false);
  const [coverStatus, setCoverStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // Sharing
  const [sharingEnabled, setSharingEnabled] = useState(family.sharing_enabled);
  const [shareToken, setShareToken] = useState(family.share_token);
  const [togglingShare, setTogglingShare] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${shareToken}`
    : `/share/${shareToken}`;

  async function handleToggleSharing(enabled: boolean) {
    setTogglingShare(true);
    try {
      await toggleSharing(enabled);
      setSharingEnabled(enabled);
    } finally {
      setTogglingShare(false);
    }
  }

  async function handleRegenerate() {
    if (!confirm('This will invalidate the current link. Anyone with the old link will lose access. Continue?')) return;
    setRegenerating(true);
    try {
      await regenerateShareToken();
      // Reload to get the new token from the server
      window.location.reload();
    } finally {
      setRegenerating(false);
    }
  }

  function handleCopyShareUrl() {
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }

  // Invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'owner'>('viewer');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ url: string } | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [memberList, setMemberList] = useState<Member[]>(members);
  // Per-member role-change state: memberId → 'saving' | 'error' | null
  const [roleChangeState, setRoleChangeState] = useState<Record<string, 'saving' | 'error' | null>>({});

  async function handleThemeChange(themeId: ThemeId) {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    await updateTheme(themeId);
  }

  async function handleSaveFamily() {
    if (!familyName.trim()) return;
    setSavingFamily(true);
    setFamilyStatus('idle');
    try {
      await updateFamilyName(familyName.trim());
      setFamilyStatus('saved');
    } catch {
      setFamilyStatus('error');
    } finally {
      setSavingFamily(false);
    }
  }

  async function handleSaveChild() {
    if (!childName.trim() || !childDob) return;
    setSavingChild(true);
    setChildStatus('idle');
    try {
      await updateChildDetails({ name: childName.trim(), dateOfBirth: childDob, gender: childGender || null });
      setChildStatus('saved');
    } catch {
      setChildStatus('error');
    } finally {
      setSavingChild(false);
    }
  }

  async function handleSaveCover() {
    if (!bookTitle.trim()) return;
    setSavingCover(true);
    setCoverStatus('idle');
    try {
      await updateCoverPage({ bookTitle: bookTitle.trim(), subtitle: bookSubtitle.trim() });
      setCoverStatus('saved');
    } catch {
      setCoverStatus('error');
    } finally {
      setSavingCover(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    setInviteResult(null);

    try {
      const result = await inviteMember(inviteEmail.trim(), inviteRole);
      setInviteResult({ url: result.inviteUrl });
      setMemberList((prev) => [
        ...prev,
        { id: Date.now().toString(), email: inviteEmail.trim(), role: inviteRole, invite_status: 'pending' },
      ]);
      setInviteEmail('');
    } catch (e) {
      setInviteError(e instanceof Error ? e.message : 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(memberId: string, newRole: 'owner' | 'viewer') {
    setRoleChangeState((s) => ({ ...s, [memberId]: 'saving' }));
    try {
      await updateMemberRole(memberId, newRole);
      setMemberList((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      setRoleChangeState((s) => ({ ...s, [memberId]: null }));
    } catch {
      setRoleChangeState((s) => ({ ...s, [memberId]: 'error' }));
    }
  }

  return (
    <div className="space-y-8">

      {/* Family name */}
      <section className="bg-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--color-text-primary)' }}>
          👨‍👩‍👧 Family Name
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            value={familyName}
            onChange={(e) => { setFamilyName(e.target.value); setFamilyStatus('idle'); }}
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveFamily}
              disabled={savingFamily || !familyName.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
              style={{ background: 'var(--color-primary)' }}
            >
              {savingFamily ? 'Saving…' : 'Save'}
            </button>
            {familyStatus === 'saved' && <span className="text-sm text-green-600">✓ Saved</span>}
            {familyStatus === 'error' && <span className="text-sm text-red-600">Error saving</span>}
          </div>
        </div>
      </section>

      {/* Child details */}
      {child && (
        <section className="bg-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--color-text-primary)' }}>
            👶 Baby Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Name
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => { setChildName(e.target.value); setChildStatus('idle'); }}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={childDob}
                onChange={(e) => { setChildDob(e.target.value); setChildStatus('idle'); }}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Gender (optional)
              </label>
              <div className="flex gap-3">
                {(['male', 'female', 'other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setChildGender(g === childGender ? '' : g); setChildStatus('idle'); }}
                    className="flex-1 py-2 rounded-xl border text-sm font-medium transition capitalize"
                    style={{
                      borderColor: childGender === g ? 'var(--color-primary)' : 'var(--color-border)',
                      background: childGender === g ? 'var(--color-primary-light)' : undefined,
                      color: childGender === g ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {g === 'male' ? '👦' : g === 'female' ? '👧' : '🌈'} {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveChild}
                disabled={savingChild || !childName.trim() || !childDob}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
                style={{ background: 'var(--color-primary)' }}
              >
                {savingChild ? 'Saving…' : 'Save'}
              </button>
              {childStatus === 'saved' && <span className="text-sm text-green-600">✓ Saved</span>}
              {childStatus === 'error' && <span className="text-sm text-red-600">Error saving</span>}
            </div>
          </div>
        </section>
      )}

      {/* Book cover */}
      {cover && (
        <section className="bg-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--color-text-primary)' }}>
            📖 Book Cover
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Book Title
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => { setBookTitle(e.target.value); setCoverStatus('idle'); }}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Subtitle (optional)
              </label>
              <input
                type="text"
                value={bookSubtitle}
                onChange={(e) => { setBookSubtitle(e.target.value); setCoverStatus('idle'); }}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveCover}
                disabled={savingCover || !bookTitle.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
                style={{ background: 'var(--color-primary)' }}
              >
                {savingCover ? 'Saving…' : 'Save'}
              </button>
              {coverStatus === 'saved' && <span className="text-sm text-green-600">✓ Saved</span>}
              {coverStatus === 'error' && <span className="text-sm text-red-600">Error saving</span>}
            </div>
          </div>
        </section>
      )}

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

      {/* Public sharing */}
      <section className="bg-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display font-bold text-xl mb-1" style={{ color: 'var(--color-text-primary)' }}>
          🔗 Share Book
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Generate a read-only link so friends and family can view published pages without an account.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border mb-4" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {sharingEnabled ? 'Sharing is on' : 'Sharing is off'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {sharingEnabled
                ? 'Anyone with the link can view published pages.'
                : 'The link exists but is currently blocked — no one can view the book.'}
            </p>
          </div>
          <button
            onClick={() => handleToggleSharing(!sharingEnabled)}
            disabled={togglingShare}
            className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            style={{ background: sharingEnabled ? 'var(--color-primary)' : 'var(--color-border)' }}
            role="switch"
            aria-checked={sharingEnabled}
          >
            <span
              className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
              style={{ transform: sharingEnabled ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
        </div>

        {/* Link row — always shown so owner can copy/revoke even when disabled */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono truncate focus:outline-none"
              style={{
                borderColor: 'var(--color-border)',
                background: sharingEnabled ? 'var(--color-background)' : 'var(--color-border)',
                color: sharingEnabled ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}
            />
            <button
              onClick={handleCopyShareUrl}
              className="px-3 py-2 rounded-xl text-sm font-medium transition flex-shrink-0"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}
            >
              {shareCopied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="text-xs underline disabled:opacity-60 transition"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {regenerating ? 'Regenerating…' : 'Revoke & generate new link'}
          </button>
        </div>
      </section>

      {/* Family members */}
      <section className="bg-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--color-text-primary)' }}>
          👨‍👩‍👧 Family Members
        </h2>

        {/* Member list */}
        <div className="space-y-2 mb-6">
          {memberList.map((m) => {
            const isSelf = m.user_id === currentUserId;
            const saving = roleChangeState[m.id] === 'saving';
            const roleError = roleChangeState[m.id] === 'error';
            return (
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {m.email}
                    </span>
                    {isSelf && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        you
                      </span>
                    )}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {m.invite_status === 'pending' ? 'Invite pending' : 'Active'}
                    {roleError && <span className="ml-2 text-red-500">· Failed to update</span>}
                  </div>
                </div>

                {/* Role selector — disabled for self */}
                {isSelf ? (
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      background: m.role === 'owner' ? 'var(--color-primary-light)' : 'var(--color-secondary-light)',
                      color: m.role === 'owner' ? 'var(--color-primary-dark)' : '#4a3520',
                    }}
                  >
                    {m.role}
                  </span>
                ) : (
                  <select
                    value={m.role}
                    disabled={saving}
                    onChange={(e) => handleRoleChange(m.id, e.target.value as 'owner' | 'viewer')}
                    className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: 'var(--color-background)',
                      color: 'var(--color-text-primary)',
                    }}
                    title="Change role"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="owner">Owner</option>
                  </select>
                )}
                {saving && (
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                    Saving…
                  </span>
                )}
              </div>
            );
          })}
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
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'viewer' | 'owner')}
              className="px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)' }}
            >
              <option value="viewer">Viewer</option>
              <option value="owner">Owner</option>
            </select>
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition disabled:opacity-60 flex-shrink-0"
              style={{ background: 'var(--color-primary)' }}
            >
              {inviting ? 'Sending…' : 'Invite'}
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <strong>Viewer</strong> — can read the book. <strong>Owner</strong> — can add pages, invite others, and edit settings.
          </p>

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
    </div>
  );
}
