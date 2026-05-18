import { useEffect, useRef, useState } from 'react'

interface Node { id: string; label: string; type: string; city: string; riskTier: string }
interface Link { source: string; target: string; amount: number; typology: string; riskTier: string; sarFlag?: any; sanctionsFlag?: any }

const TIER_COLOR: Record<string, string> = { Red: '#F87171', Amber: '#F59E0B', Green: '#34D399' }
const TYPE_RADIUS: Record<string, number> = { account: 14, counterparty: 10 }

export default function AMLNetworkGraph({ nodes, links, height = 420 }: { nodes: Node[]; links: Link[]; height?: number }) {
  const [positions, setPositions] = useState<Record<string, {x:number;y:number}>>({})
  const [selected,  setSelected]  = useState<string | null>(null)
  const [tooltip,   setTooltip]   = useState<{x:number;y:number;node:Node} | null>(null)
  const W = 600
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!nodes.length) return
    const pos: Record<string, {x:number;y:number;vx:number;vy:number}> = {}

    // Initialize in a circle
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2
      const r = Math.min(W, height) * 0.30
      pos[n.id] = {
        x: W / 2 + r * Math.cos(angle),
        y: height / 2 + r * Math.sin(angle),
        vx: 0, vy: 0,
      }
    })

    let tick = 0
    const simulate = () => {
      tick++
      if (tick > 200) return

      const alpha = Math.max(0.01, 1 - tick / 200)

      // Repulsion between all nodes
      nodes.forEach(a => {
        nodes.forEach(b => {
          if (a.id === b.id) return
          const dx = pos[a.id].x - pos[b.id].x
          const dy = pos[a.id].y - pos[b.id].y
          const dist = Math.sqrt(dx*dx + dy*dy) || 1
          const force = (60 * 60) / (dist * dist) * alpha
          pos[a.id].vx += (dx / dist) * force
          pos[a.id].vy += (dy / dist) * force
        })
      })

      // Attraction along links
      links.forEach(l => {
        const s = pos[l.source]; const t = pos[l.target]
        if (!s || !t) return
        const dx = t.x - s.x; const dy = t.y - s.y
        const dist = Math.sqrt(dx*dx + dy*dy) || 1
        const target = 120
        const force = (dist - target) * 0.04 * alpha
        const fx = (dx / dist) * force; const fy = (dy / dist) * force
        s.vx += fx; s.vy += fy
        t.vx -= fx; t.vy -= fy
      })

      // Centering force
      nodes.forEach(n => {
        pos[n.id].vx += (W/2 - pos[n.id].x) * 0.01 * alpha
        pos[n.id].vy += (height/2 - pos[n.id].y) * 0.01 * alpha
      })

      // Apply velocity + damping + clamp to bounds
      nodes.forEach(n => {
        pos[n.id].vx *= 0.7; pos[n.id].vy *= 0.7
        pos[n.id].x = Math.max(24, Math.min(W - 24, pos[n.id].x + pos[n.id].vx))
        pos[n.id].y = Math.max(24, Math.min(height - 24, pos[n.id].y + pos[n.id].vy))
      })

      const snap: Record<string, {x:number;y:number}> = {}
      nodes.forEach(n => { snap[n.id] = { x: pos[n.id].x, y: pos[n.id].y } })
      setPositions({ ...snap })
      animRef.current = requestAnimationFrame(simulate)
    }

    animRef.current = requestAnimationFrame(simulate)
    return () => cancelAnimationFrame(animRef.current)
  }, [nodes, links])

  if (!nodes.length) return (
    <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,26,40,0.85)', borderRadius: 12, color: '#475569', fontSize: 13, gap: 10 }}>
      <span style={{ fontSize: 40 }}>🕸</span>
      <span>No high-risk transaction network edges in current data</span>
      <span style={{ fontSize: 11, color: '#334155' }}>Only High/Critical fraud band alerts generate network edges</span>
    </div>
  )

  const selNode = selected ? nodes.find(n => n.id === selected) : null
  const selLinks = selected ? links.filter(l => l.source === selected || l.target === selected) : []

  return (
    <div style={{ background: 'rgba(15,26,40,0.85)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(129,140,248,0.2)' }}>
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transaction network</span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '0.5px solid rgba(248,113,113,0.3)' }}>{nodes.length} nodes · {links.length} edges</span>
        </div>
        <span style={{ fontSize: 10, color: '#475569' }}>Click a node to inspect</span>
      </div>
      <svg width="100%" viewBox={"0 0 " + W + " " + height} style={{ display: 'block' }}>
        <defs>
          <marker id="ah-red"    viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L9 5L1 8" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round"/></marker>
          <marker id="ah-amber"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L9 5L1 8" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/></marker>
          <marker id="ah-green"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L9 5L1 8" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round"/></marker>
          <filter id="glow-red"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {links.map((l, i) => {
          const s = positions[l.source]; const t = positions[l.target]
          if (!s || !t) return null
          const col = TIER_COLOR[l.riskTier] || '#64748B'
          const markerId = 'ah-' + (l.riskTier === 'Red' ? 'red' : l.riskTier === 'Amber' ? 'amber' : 'green')
          const dx = t.x - s.x; const dy = t.y - s.y
          const len = Math.sqrt(dx*dx+dy*dy) || 1
          const pad = (TYPE_RADIUS[nodes.find(n=>n.id===l.target)?.type||''] || 10) + 2
          const tx = t.x - (dx/len)*pad; const ty = t.y - (dy/len)*pad
          const isHighlighted = selected === l.source || selected === l.target
          const amt = (l.amount / 1000000).toFixed(1)
          return (
            <g key={i}>
              <line
                x1={s.x} y1={s.y} x2={tx} y2={ty}
                stroke={col}
                strokeWidth={isHighlighted ? 2.5 : l.riskTier === 'Red' ? 1.8 : 1.2}
                strokeOpacity={selected && !isHighlighted ? 0.15 : 0.7}
                markerEnd={"url(#" + markerId + ")"}
              />
              {isHighlighted && (
                <text x={(s.x+t.x)/2} y={(s.y+t.y)/2 - 6} textAnchor="middle" fill={col} fontSize={9} fontWeight="600">{amt}M FCFA</text>
              )}
            </g>
          )
        })}

        {nodes.map(n => {
          const p = positions[n.id]; if (!p) return null
          const col = TIER_COLOR[n.riskTier] || '#60A5FA'
          const r = TYPE_RADIUS[n.type] || 10
          const isSelected = selected === n.id
          const isConnected = selected ? links.some(l => (l.source === selected && l.target === n.id) || (l.target === selected && l.source === n.id)) : false
          const dim = selected && !isSelected && !isConnected
          return (
            <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(s => s === n.id ? null : n.id)}>
              {isSelected && <circle cx={p.x} cy={p.y} r={r+8} fill={col + '20'} stroke={col} strokeWidth={1} strokeDasharray="3 2" />}
              <circle cx={p.x} cy={p.y} r={r} fill={col + (isSelected ? '35' : '18')} stroke={col} strokeWidth={isSelected ? 2 : 1.2} opacity={dim ? 0.25 : 1} filter={n.riskTier === 'Red' ? 'url(#glow-red)' : undefined} />
              <circle cx={p.x} cy={p.y} r={r/3} fill={col} opacity={dim ? 0.25 : 1} />
              {n.type === 'account' && (
                <text x={p.x} y={p.y - r - 5} textAnchor="middle" fill={dim ? '#334155' : '#CBD5E1'} fontSize={8.5} fontWeight="500">{String(n.label||'').slice(0,12)}</text>
              )}
              <text x={p.x} y={p.y + r + 11} textAnchor="middle" fill={dim ? '#1e3a5f' : n.riskTier === 'Red' ? '#F87171' : '#64748B'} fontSize={7.5}>{n.city?.slice(0,10)}</text>
            </g>
          )
        })}
      </svg>

      {selNode && (
        <div style={{ padding: '12px 14px', borderTop: '0.5px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: TIER_COLOR[selNode.riskTier] || '#60A5FA' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9' }}>{selNode.label || selNode.id}</span>
            <span style={{ fontSize: 10, color: '#64748B' }}>{selNode.city} · {selNode.type}</span>
            <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 6, background: (TIER_COLOR[selNode.riskTier] || '#64748B') + '18', color: TIER_COLOR[selNode.riskTier] || '#64748B', border: '0.5px solid ' + (TIER_COLOR[selNode.riskTier] || '#64748B') + '40' }}>{selNode.riskTier} Risk</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {selLinks.map((l, i) => {
              const other = l.source === selNode.id ? nodes.find(n => n.id === l.target) : nodes.find(n => n.id === l.source)
              const isOut = l.source === selNode.id
              return (
                <div key={i} style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: isOut ? '#F59E0B' : '#60A5FA' }}>{isOut ? '→' : '←'}</span>
                  <span>{other?.city || other?.id}</span>
                  <span style={{ color: '#475569' }}>·</span>
                  <span style={{ color: '#F1F5F9', fontWeight: 500 }}>{(l.amount/1000000).toFixed(1)}M</span>
                  <span style={{ color: '#475569' }}>·</span>
                  <span>{l.typology}</span>
                  {l.sarFlag === true && <span style={{ color: '#F87171', fontSize: 9 }}>SAR</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ padding: '8px 14px', borderTop: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[['#F87171','Red — High risk'],['#F59E0B','Amber — Medium'],['#34D399','Green — Low']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#64748B' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c as string, display: 'inline-block' }} />{l}
          </div>
        ))}
        <div style={{ fontSize: 10, color: '#334155', marginLeft: 'auto' }}>Large circle = account · Small = counterparty</div>
      </div>
    </div>
  )
}
