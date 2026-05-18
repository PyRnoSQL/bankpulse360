import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  table?: Row[]
  loading?: boolean
}
interface Row { [key: string]: string | number }

const SYSTEM = `You are BankPulse 360 AI Copilot for Cameroonian banking. You help analyse customers, loans, fraud alerts and branch performance. Keep answers under 3 sentences. If a table is needed output ONLY this JSON block after your text:
\`\`\`json-table
{"columns":["Col1","Col2"],"rows":[["v1","v2"]]}
\`\`\`
Use FCFA for currency. Reply in the same language the user writes in.`

function parseMsg(raw: string): { text: string; table: Row[] | null } {
  const m = raw.match(/```json-table\n([\s\S]*?)\n```/)
  if (!m) return { text: raw.trim(), table: null }
  try {
    const { columns, rows } = JSON.parse(m[1])
    return {
      text: raw.replace(/```json-table[\s\S]*?```/, '').trim(),
      table: rows.map((r: string[]) => Object.fromEntries(columns.map((c: string, i: number) => [c, r[i] ?? ''])))
    }
  } catch { return { text: raw.trim(), table: null } }
}

function TableView({ rows }: { rows: Row[] }) {
  const cols = Object.keys(rows[0] || {})
  if (!cols.length) return null
  return (
    <div style={{ overflowX: 'auto', marginTop: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>{cols.map(c => <th key={c} style={{ padding: '5px 9px', textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '0.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
              {cols.map(c => <td key={c} style={{ padding: '6px 9px', fontSize: 11, color: '#E2E8F0', whiteSpace: 'nowrap' }}>{String(row[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const HINTS = [
  'Show loans overdue in Bafoussam',
  'Customers with churn risk above 70%?',
  'List critical fraud alerts',
  'Which branches are out of control?',
  'Montrez les prets agricoles a risque',
]

export default function AICopilot() {
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [msgs, setMsgs]       = useState<Message[]>([{
    role: 'assistant',
    content: "Hello! I am your BankPulse 360 AI Copilot. Ask me anything about your portfolio, customers, fraud or branches in English or French.",
  }])
  const endRef = useRef<HTMLDivElement>(null)
  const inRef  = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) setTimeout(() => inRef.current?.focus(), 80) }, [open])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')
    const next: Message[] = [...msgs, { role: 'user', content: q }, { role: 'assistant', content: '', loading: true }]
    setMsgs(next)
    setLoading(true)
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey
      const history = next.slice(1, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }]
      }))
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents: [...history, { role: 'user', parts: [{ text: q }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.3 }
        }),
      })
      const data = await res.json()
      const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that request.'
      const { text: txt, table } = parseMsg(raw)
      setMsgs(prev => [...prev.slice(0, -1), { role: 'assistant', content: txt, table: table ?? undefined }])
    } catch {
      setMsgs(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Connection error - please try again.' }])
    } finally { setLoading(false) }
  }

  return (
    <>
      <button onClick={() => setOpen(o => !o)} title="AI Copilot" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, width: 52, height: 52, borderRadius: '50%', background: open ? '#0A1628' : 'linear-gradient(135deg,#1D9E75,#0F6E56)', border: '1px solid rgba(29,158,117,0.5)', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', transition: 'all 0.2s' }}>
        {open ? 'x' : '✦'}
      </button>

      {open && (
        <div style={{ position: 'fixed', bottom: 88, right: 24, zIndex: 999, width: 400, maxHeight: '72vh', background: '#0A1628', border: '0.5px solid rgba(29,158,117,0.3)', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          <div style={{ padding: '11px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(29,158,117,0.08)' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>✦</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9' }}>AI Copilot</div>
              <div style={{ fontSize: 10, color: '#34D399' }}>● ONLINE · Powered by Gemini AI</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#475569' }}>EN / FR</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: 9, minHeight: 0 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: m.table ? '100%' : '86%', width: m.table ? '100%' : undefined, padding: '8px 11px', borderRadius: m.role === 'user' ? '11px 11px 3px 11px' : '11px 11px 11px 3px', background: m.role === 'user' ? 'rgba(29,158,117,0.18)' : 'rgba(255,255,255,0.05)', border: '0.5px solid', borderColor: m.role === 'user' ? 'rgba(29,158,117,0.35)' : 'rgba(255,255,255,0.08)', fontSize: 12, color: '#E2E8F0', lineHeight: 1.55 }}>
                  {m.loading
                    ? <div style={{ display: 'flex', gap: 4, padding: '2px 0' }}>{[0,1,2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', display: 'inline-block', animation: 'bp-bounce 1s ease-in-out ' + (j*0.15) + 's infinite' }} />)}</div>
                    : <>{m.content && <div>{m.content}</div>}{m.table && <TableView rows={m.table} />}</>
                  }
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {msgs.length === 1 && (
            <div style={{ padding: '0 13px 9px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {HINTS.map(h => <button key={h} onClick={() => send(h)} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 10, background: 'rgba(29,158,117,0.08)', border: '0.5px solid rgba(29,158,117,0.22)', color: '#94A3B8', cursor: 'pointer' }}>{h}</button>)}
            </div>
          )}

          <div style={{ padding: '9px 11px', borderTop: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', gap: 7 }}>
            <input ref={inRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about loans, customers, fraud..." disabled={loading} style={{ flex: 1, padding: '7px 11px', fontSize: 12, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F1F5F9', outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={() => send()} disabled={loading || !input.trim()} style={{ width: 32, height: 32, borderRadius: 8, background: input.trim() ? 'linear-gradient(135deg,#1D9E75,#0F6E56)' : 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(29,158,117,0.3)', cursor: input.trim() ? 'pointer' : 'not-allowed', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>↑</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: '@keyframes bp-bounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-4px);opacity:1}}' }} />
    </>
  )
}
