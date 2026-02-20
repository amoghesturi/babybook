import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📖</div>
          <h1 className="text-3xl font-display text-primary font-bold">Baby Book</h1>
          <p className="text-text-secondary mt-1">Sign in to your family's book</p>
        </div>
        <div className="bg-surface rounded-2xl shadow-page p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
