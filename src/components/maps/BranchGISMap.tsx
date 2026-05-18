interface BranchPoint {
  branchId: string; branchName: string; region: string; city: string
  sigmaLevel: number; spcFlag: string; slaCompliance: number
  efficiencyScore: number; latitude: number; longitude: number
}

const SPC_COLOR: Record<string, string> = { 'In Control': '#34D399', 'Watch': '#F59E0B', 'Out of Control': '#F87171' }

export default function BranchGISMap({ branches, lookerMapUrl, height = 400 }: { branches: BranchPoint[]; lookerMapUrl?: string; height?: number }) {
  if (lookerMapUrl) {
    return <iframe src={lookerMapUrl} width="100%" height={height} style={{ border: 'none', borderRadius: 12 }} title="Branch GIS Map" />
  }

  const LAT_MIN = 2.0, LAT_MAX = 13.0, LON_MIN = 8.5, LON_MAX = 16.5
  const W = 600

  function toX(lon: number) { return ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (W - 60) + 30 }
  function toY(lat: number) { return ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (height - 60) + 30 }

  return (
    <div style={{ background: 'rgba(15,26,40,0.85)', borderRadius: 12, padding: 12, overflow: 'hidden' }}>
      <svg width="100%" viewBox={"0 0 " + W + " " + height} style={{ display: 'block' }}>
        <rect x={0} y={0} width={W} height={height} fill="rgba(6,15,26,0.8)" rx={8} />
        {branches.map(b => {
          const x = toX(b.longitude); const y = toY(b.latitude)
          const color = SPC_COLOR[b.spcFlag] || '#60A5FA'
          return (
            <g key={b.branchId}>
              <circle cx={x} cy={y} r={8} fill={color + '33'} stroke={color} strokeWidth={1.5} />
              <circle cx={x} cy={y} r={3} fill={color} />
              <text x={x} y={y - 12} textAnchor="middle" fill="#94A3B8" fontSize={8}>{b.branchName?.split(' ')[0]}</text>
            </g>
          )
        })}
        <text x={W / 2} y={height - 8} textAnchor="middle" fill="#334155" fontSize={9}>Cameroon — Branch Network</text>
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
        {[['#34D399','In Control'],['#F59E0B','Watch'],['#F87171','Out of Control']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#64748B' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c as string, display: 'inline-block' }} />{l}
          </div>
        ))}
      </div>
    </div>
  )
}
