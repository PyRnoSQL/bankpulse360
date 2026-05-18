import { useEffect, useRef } from 'react'

interface Node { id: string; label: string; type: string; city: string; riskTier: string }
interface Link { source: string; target: string; amount: number; typology: string; riskTier: string }

export default function AMLNetworkGraph({ nodes, links, height = 400 }: { nodes: Node[]; links: Link[]; height?: number }) {
  const svgRef = useRef<SVGSVGElement>(null)

  const TIER_COLOR: Record<string, string> = { Red: '#F87171', Amber: '#F59E0B', Green: '#34D399' }
  const W = 600

  if (!nodes.length) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,26,40,0.85)', borderRadius: 12, color: '#475569', fontSize: 13 }}>
      No high-risk network edges to display
    </div>
  )

  const positions: Record<string, { x: number; y: number }> = {}
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI
    const r = Math.min(W, height) * 0.35
    positions[n.id] = {
      x: W / 2 + r * Math.cos(angle),
      y: height / 2 + r * Math.sin(angle),
    }
  })

  return (
    <div style={{ background: 'rgba(15,26,40,0.85)', borderRadius: 12, padding: 12, overflow: 'hidden' }}>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + height} style={{ display: 'block' }}>
        <defs>
          <marker id="aml-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
          </marker>
        </defs>
        {links.map((l, i) => {
          const s = positions[l.source]; const t = positions[l.target]
          if (!s || !t) return null
          return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={TIER_COLOR[l.riskTier] || '#475569'} strokeWidth={1} strokeOpacity={0.4} markerEnd="url(#aml-arrow)" />
        })}
        {nodes.map(n => {
          const p = positions[n.id]; if (!p) return null
          const color = TIER_COLOR[n.riskTier] || '#60A5FA'
          const r = n.type === 'account' ? 10 : 7
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r={r} fill={color + '33'} stroke={color} strokeWidth={1.5} />
              <text x={p.x} y={p.y + r + 12} textAnchor="middle" fill="#94A3B8" fontSize={9}>{n.label?.slice(0, 12)}</text>
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
        {[['#F87171','Red — High risk'],['#F59E0B','Amber — Medium'],['#34D399','Green — Low']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#64748B' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c as string, display: 'inline-block' }} />{l}
          </div>
        ))}
      </div>
    </div>
  )
}
