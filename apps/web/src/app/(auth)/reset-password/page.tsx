import { ResetPasswordForm } from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">📖</span>
            <span className="font-display font-bold text-xl" style={{ color: 'var(--color-primary)' }}>BabyBook</span>
          </div>
          <h2 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Set a new password
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Choose a strong password for your account.
          </p>
        </div>

        <div
          className="rounded-2xl p-6 shadow-sm border"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
