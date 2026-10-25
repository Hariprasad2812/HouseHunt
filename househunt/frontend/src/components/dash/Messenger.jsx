import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/useAuth';
import { atWidth } from '../../lib/img';
import { initials, timeAgo } from '../../lib/format';
import { EmptyRow } from './Shell';
import { Spinner } from '../ui';

export default function Messenger() {
  const { user } = useAuth();
  const [threads, setThreads] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [msgs, setMsgs] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const [refresh, setRefresh] = useState(0);

  const loadThreads = useCallback(() => {
    api.get('/messages').then(setThreads).catch(() => setThreads([]));
  }, []);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  useEffect(() => {
    if (!peerId) { setMsgs(null); return; }
    api.get(`/messages/with/${peerId}`).then(setMsgs).catch(() => setMsgs([]));
    loadThreads();
  }, [peerId, loadThreads, refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs?.length, peerId]);

  const send = async () => {
    if (!draft.trim() || !peerId) return;
    setSending(true);
    try {
      await api.post('/messages', { recipientId: peerId, body: draft.trim() });
      setDraft('');
      setRefresh((x) => x + 1);
    } finally { setSending(false); }
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const activeThread = threads?.find((t) => t.peerId === peerId);

  return (
    <div className="grid min-h-[480px] overflow-hidden rounded-[6px] border border-black/10 bg-white lg:grid-cols-[320px_1fr]">
      {/* threads */}
      <aside className="border-b border-black/10 bg-paper/50 lg:border-b-0 lg:border-r">
        <div className="border-b border-black/[0.07] px-5 py-4">
          <h3 className="text-sm font-bold text-ink">Conversations</h3>
          <p className="text-[12px] text-stone">With owners and tenants, all in one place</p>
        </div>
        <div className="max-h-[420px] overflow-y-auto lg:max-h-[560px]">
          {!threads ? (
            <div className="grid place-items-center py-16"><Spinner className="h-5 w-5 text-clay" /></div>
          ) : threads.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-stone">No conversations yet.<br />Start one from any property page.</p>
          ) : (
            threads.map((t) => (
              <button
                key={t.peerId}
                onClick={() => setPeerId(t.peerId)}
                className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors ${peerId === t.peerId ? 'bg-white' : 'hover:bg-white/70'}`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-clay text-[12px] font-bold text-white">{initials(t.peerName)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13.5px] font-semibold text-ink">{t.peerName}</span>
                    <span className="shrink-0 text-[10.5px] text-stone-light">{timeAgo(t.lastAt)}</span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-[12.5px] text-stone">{t.lastBody}</span>
                </span>
                {t.unread > 0 && <span className="mt-1 grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">{t.unread}</span>}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* conversation */}
      <section className="flex flex-col">
        {!peerId ? (
          <div className="grid flex-1 place-items-center bg-sand/40 px-6 py-20 text-center text-sm text-stone">
            <div>
              <MessageSquare className="mx-auto mb-3 text-stone-light" size={30} strokeWidth={1.3} />
              Pick a conversation to start reading — or message an owner from any property page.
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-black/[0.07] px-5 py-3.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-clay text-[11px] font-bold text-white">{initials(activeThread?.peerName || '')}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{activeThread?.peerName}</p>
                <p className="text-[11px] capitalize text-stone-light">{user?.role === 'OWNER' ? 'Tenant' : 'Owner'}</p>
              </div>
            </div>
            <div className="max-h-[420px] flex-1 space-y-3 overflow-y-auto px-5 py-5 lg:max-h-[500px]">
              {!msgs ? <Spinner className="mx-auto mt-10 block" /> : msgs.length === 0 ? <p className="text-center text-sm text-stone">Say hello 👋</p> : msgs.map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-[4px] px-4 py-2.5 text-[13.5px] leading-relaxed ${mine ? 'bg-ink text-paper' : 'bg-sand text-coal'}`}>
                      {m.body}
                      <p className={`mt-1 text-right text-[10px] ${mine ? 'text-paper/45' : 'text-stone-light'}`}>{timeAgo(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex items-end gap-2 border-t border-black/[0.07] p-3">
              <textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type a message — Enter to send"
                className="u-input min-h-[44px] max-h-28 flex-1 resize-none rounded-[4px] px-3.5 py-2.5 text-[14px]"
              />
              <button
                onClick={send}
                disabled={sending || !draft.trim()}
                aria-label="Send"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[4px] bg-ink text-paper transition-colors hover:bg-clay disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
