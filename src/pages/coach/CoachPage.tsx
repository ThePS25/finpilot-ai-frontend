import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialApi } from '@/api/financial.api';
import { Button, Card, Loader } from '@/components/ui';
import type { Conversation } from '@/types';
import styles from './CoachPage.module.scss';

export function CoachPage() {
  const queryClient = useQueryClient();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['coach-conversations'],
    queryFn: async () => (await financialApi.getConversations()).data.data.conversations,
  });

  const loadMutation = useMutation({
    mutationFn: (id: string) => financialApi.getConversation(id),
    onSuccess: (res) => setConversation(res.data.data.conversation),
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) =>
      financialApi.sendMessage(message, conversation?._id),
    onSuccess: (res) => {
      setConversation(res.data.data.conversation);
      queryClient.invalidateQueries({ queryKey: ['coach-conversations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deleteConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['coach-conversations'] });
      if (conversation?._id === id) setConversation(null);
    },
  });

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMutation.mutate(input);
    setInput('');
  };

  const handleNewChat = () => setConversation(null);

  const suggestions = [
    'Can I afford a 15 lakh car?',
    'How much should I invest every month?',
    'How long will it take to reach my goal?',
  ];

  if (isLoading) return <Loader fullPage />;

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 180px)' }}>
      <div style={{ width: 260, flexShrink: 0 }}>
      <Card title="Conversations">
        <Button fullWidth onClick={handleNewChat} style={{ marginBottom: 12 }}>+ New Chat</Button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {(conversations || []).map((c) => (
            <div
              key={c._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                background: conversation?._id === c._id ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              }}
            >
              <span
                style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                onClick={() => loadMutation.mutate(c._id)}
              >
                {c.title || 'Untitled'}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(c._id); }}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 16 }}
                title="Delete"
              >×</button>
            </div>
          ))}
          {!conversations?.length && (
            <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', padding: 12 }}>No conversations yet</p>
          )}
        </div>
      </Card>
      </div>

      <div style={{ flex: 1 }}>
      <Card title="AI Financial Coach" subtitle="Ask anything about your finances — answers use your real data">
        <div className={styles.chat}>
          <div className={styles.messages}>
            {!conversation?.messages.length && (
              <div className={styles.welcome}>
                <div className={styles.welcomeIcon}>🤖</div>
                <h3>Hi! I'm your FinPilot AI Coach</h3>
                <p>I have access to your income, expenses, investments, and goals.</p>
                <div className={styles.suggestions}>
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => { setInput(s); sendMutation.mutate(s); }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {conversation?.messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.bubble}>{msg.content}</div>
              </div>
            ))}
            {sendMutation.isPending && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.bubble}><span className={styles.typing}>Thinking...</span></div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>
          <div className={styles.inputArea}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your finances..."
              disabled={sendMutation.isPending}
            />
            <Button onClick={handleSend} disabled={sendMutation.isPending || !input.trim()}>Send</Button>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
