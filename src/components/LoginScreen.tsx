import { useState } from 'react';
import { Account, ACCOUNTS, authenticate } from '@/lib/auth';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';

interface Props {
  onLogin: (account: Account) => void;
}

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  admin:      { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/30' },
  vendor:     { bg: 'bg-blue-500/10',   text: 'text-blue-600',   border: 'border-blue-500/30' },
  b2b:        { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  'end-user': { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30' },
};

const roleLabels: Record<string, string> = {
  admin: 'Quản trị viên',
  vendor: 'Thu ngân',
  b2b: 'Đối tác',
  'end-user': 'Người dùng',
};

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    // Fake delay for realism
    await new Promise((r) => setTimeout(r, 800));
    const account = authenticate(username, password);
    setLoading(false);
    if (!account) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
      return;
    }
    onLogin(account);
  };

  const quickLogin = async (acc: Account) => {
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    onLogin(acc);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-lg shadow-primary/25 mb-1">
            EV
          </div>
          <h1 className="text-2xl font-bold text-foreground">eVoucher Platform</h1>
          <p className="text-sm text-muted-foreground">Đăng nhập để tiếp tục</p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl bg-card border border-border shadow-xl shadow-black/5 p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Tên đăng nhập</label>
              <input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="admin / vendor / partner / user"
                autoComplete="username"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" /> Đăng nhập nhanh
              </span>
            </div>
          </div>

          {/* Quick login cards */}
          <div className="space-y-2">
            {ACCOUNTS.map((acc) => {
              const c = roleColors[acc.role];
              return (
                <button
                  key={acc.username}
                  onClick={() => quickLogin(acc)}
                  disabled={loading}
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm disabled:opacity-50 ${c.bg} ${c.border}`}
                >
                  <span className="text-2xl shrink-0">{acc.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${c.text}`}>{acc.displayName}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.bg} ${c.text} border ${c.border}`}>
                        {roleLabels[acc.role]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{acc.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground font-mono">{acc.username}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{acc.password}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Demo platform · Dữ liệu giả lập
        </p>
      </div>
    </div>
  );
}
