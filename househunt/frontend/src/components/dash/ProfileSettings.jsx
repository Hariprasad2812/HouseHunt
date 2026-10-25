import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/useAuth';
import { Button, Field, Input } from '../ui';
import { DashSection } from './Shell';

export default function ProfileSettings() {
  const { user, refresh } = useAuth();
  const [p, setP] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', city: user?.city || 'Bengaluru', avatarUrl: user?.avatarUrl || '' });
  const [saved, setSaved] = useState('');
  const [err, setErr] = useState('');

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  const saveProfile = async () => {
    setErr(''); setSaved('');
    try {
      await api.put('/auth/me', p);
      setSaved('Profile updated.');
      refresh();
    } catch (e) { setErr(e.message); }
  };

  const savePw = async () => {
    setPwErr(''); setPwMsg('');
    try {
      await api.put('/auth/me/password', pw);
      setPwMsg('Password changed successfully.');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (e) { setPwErr(e.message); }
  };

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <DashSection title="Profile details" sub="Shown to owners when you apply or message">
        <div className="space-y-4 rounded-[6px] border border-black/10 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input value={p.fullName} onChange={(e) => setP({ ...p, fullName: e.target.value })} /></Field>
            <Field label="Phone"><Input value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" hint="read-only"><Input value={user?.email} disabled className="bg-sand/60" /></Field>
            <Field label="City"><Input value={p.city} onChange={(e) => setP({ ...p, city: e.target.value })} /></Field>
          </div>
          {err && <p className="text-[13px] text-red-600">{err}</p>}
          {saved && <p className="text-[13px] text-moss">{saved}</p>}
          <Button onClick={saveProfile}>Save changes</Button>
        </div>
      </DashSection>

      <DashSection title="Security" sub="Change your password">
        <div className="space-y-4 rounded-[6px] border border-black/10 bg-white p-6">
          <Field label="Current password"><Input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
          <Field label="New password"><Input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
          {pwErr && <p className="text-[13px] text-red-600">{pwErr}</p>}
          {pwMsg && <p className="text-[13px] text-moss">{pwMsg}</p>}
          <Button onClick={savePw} disabled={!pw.currentPassword || pw.newPassword.length < 8}>Update password</Button>
        </div>
      </DashSection>
    </div>
  );
}
