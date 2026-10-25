import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthFrame from '../components/auth/AuthFrame';
import { Button, Field, Input } from '../components/ui';
import { useAuth } from '../lib/useAuth';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [sp] = useSearchParams();
  const [type, setType] = useState(sp.get('switch') === '1' ? 'OWNER' : 'TENANT');
  const [f, setF] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const u = await register({ ...f, accountType: type });
      const roleHome = u.role === 'ADMIN' ? '/admin' : u.role === 'OWNER' ? '/owner' : '/tenant';
      const from = loc.state?.from;
      const dest = typeof from === 'string' && from.startsWith('/')
        && !from.startsWith('/login') && !from.startsWith('/register') && from !== '/'
          ? from : roleHome;
      nav(dest, { replace: true });
    } catch (er) {
      setErr(er.fieldErrors ? Object.entries(er.fieldErrors).map(([k, v]) => `${k}: ${v}`).join(' · ') : er.message);
    } finally { setBusy(false); }
  };

  return (
    <AuthFrame subtitle="Create your account.">
      <p className="mt-2 text-sm text-stone">Free forever. No brokerage, no spam calls.</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        {/* account type */}
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-stone">I'm here as a…</p>
          <div className="grid grid-cols-2 gap-2 rounded-[4px] bg-sand p-1">
            {[["TENANT", "Tenant", "I'm looking for a home"], ["OWNER", "Owner", "I have a home to rent"]].map(([v, l, d]) => (
              <button
                type="button"
                key={v}
                onClick={() => setType(v)}
                className={`rounded-[3px] px-3 py-2.5 text-left transition-all ${type === v ? 'bg-white shadow-soft' : 'hover:bg-black/[0.03]'}`}
              >
                <span className={`block text-sm font-semibold ${type === v ? 'text-ink' : 'text-stone'}`}>{l}</span>
                <span className="block text-[11px] text-stone-light">{d}</span>
              </button>
            ))}
          </div>
        </div>

        <Field label="Full name" required>
          <Input value={f.fullName} onChange={set('fullName')} placeholder="e.g. Ananya Rao" autoComplete="name" required />
        </Field>
        <Field label="Email" required>
          <Input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" required />
        </Field>
        <Field label="Phone" required hint="We only call about your listing">
          <Input type="tel" value={f.phone} onChange={set('phone')} placeholder="+91 98XXX XXXXX" required />
        </Field>
        <Field label="Password" required hint="min 8 characters">
          <div className="relative">
            <Input type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} placeholder="Create a password" className="pr-12" required minLength={8} />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-light hover:text-ink" aria-label="Toggle">
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        {err && <p className="rounded-[3px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">{err}</p>}

        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? 'Creating account…' : type === 'OWNER' ? 'Create owner account' : 'Create tenant account'}
        </Button>

        <p className="text-center text-[13px] leading-relaxed text-stone">
          By creating an account you agree to our <Link to="/terms" className="underline underline-offset-2">Terms</Link> and{' '}
          <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>. Already registered?{' '}
          <Link to="/login" state={loc.state} className="font-semibold text-ink">Sign in</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
