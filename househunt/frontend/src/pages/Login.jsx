import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthFrame from '../components/auth/AuthFrame';
import { Button, CheckBox, Field, Input } from '../components/ui';
import { useAuth } from '../lib/useAuth';

const DEMO = [
  { label: 'Tenant', email: 'tenant@househunt.in', desc: 'explore, save & apply' },
  { label: 'Owner', email: 'aditi@househunt.in', desc: 'manage your listings' },
  { label: 'Admin', email: 'admin@househunt.in', desc: 'verify & moderate' },
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const go = (u) => {
    const roleHome = u.role === 'ADMIN' ? '/admin' : u.role === 'OWNER' ? '/owner' : '/tenant';
    const from = loc.state?.from;
    // honour a guarded deep-link / sign-in-gate origin so the user returns where they were
    const dest = typeof from === 'string' && from.startsWith('/')
      && !from.startsWith('/login') && !from.startsWith('/register') && from !== '/'
        ? from : roleHome;
    nav(dest, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const u = await login(email, password);
      go(u);
    } catch (er) {
      setErr(er.message);
    } finally { setBusy(false); }
  };

  return (
    <AuthFrame subtitle="Welcome back.">
      <p className="mt-2 text-sm text-stone">Sign in to continue to your dashboard.</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="Email" required>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </Field>
        <Field label="Password" required>
          <div className="relative">
            <Input type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-12" required />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-light hover:text-ink" aria-label="Toggle password">
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <CheckBox label="Remember me" checked={remember} onChange={setRemember} />
          <button type="button" onClick={() => setErr('A reset link has been sent if that email exists. (Demo)')} className="text-[13px] font-medium text-clay underline-offset-4 hover:underline">
            Forgot password?
          </button>
        </div>

        {err && <p className="rounded-[3px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">{err}</p>}

        <Button type="submit" full size="lg" variant="solid" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>

        <div className="relative py-2 text-center">
          <span className="relative z-10 bg-paper px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-light">or</span>
          <span className="absolute inset-x-0 top-1/2 h-px bg-black/10" />
        </div>

        <Button type="button" full variant="light" size="lg" onClick={() => setErr('Google sign-in is wired to your backend auth flow — connect OAuth2 in production.')}>
          <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
          Continue with Google
        </Button>

        <p className="text-center text-[14px] text-stone">
          New to HouseHunt? <Link to="/register" state={loc.state} className="font-semibold text-ink underline-offset-4 hover:underline">Create an account</Link>
        </p>
      </form>

      {/* demo helpers */}
      <div className="mt-8 rounded-[4px] border border-dashed border-clay/40 bg-clay-tint/60 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-clay-deep">Demo accounts — one tap to explore</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={async () => {
                setBusy(true); setErr('');
                try { go(await login(d.email, 'HouseHunt@123')); } catch (e2) { setErr(e2.message); setBusy(false); }
              }}
              disabled={busy}
              className="rounded-[3px] border border-clay/25 bg-white px-2 py-2 text-left transition-colors hover:border-clay"
            >
              <span className="block text-[12px] font-bold text-ink">{d.label}</span>
              <span className="block text-[10px] leading-tight text-stone">{d.desc}</span>
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-[11px] text-stone">Password for all: HouseHunt@123</p>
      </div>
    </AuthFrame>
  );
}
