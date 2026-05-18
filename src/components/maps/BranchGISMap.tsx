import { useEffect, useRef } from 'react'

interface BranchPoint {
  branchId: string; branchName: string; region: string; city: string
  sigmaLevel: number; spcFlag: string; slaCompliance: number
  efficiencyScore: number; latitude: number; longitude: number
}

export default function BranchGISMap({ branches, lookerMapUrl, height = 460 }: { branches: BranchPoint[]; lookerMapUrl?: string; height?: number }) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)

  useEffect(() => {
    if (lookerMapUrl || !mapRef.current || !branches.length) return
    if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null }

    const L = (window as any).L
    if (!L) return

    const map = L.map(mapRef.current, { center: [5.5, 12.3], zoom: 6, zoomControl: true, attributionControl: false })
    leafletRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'CartoDB',
      maxZoom: 18,
    }).addTo(map)

    const SPC_COLOR: Record<string,string> = { 'In Control': '#34D399', 'Watch': '#F59E0B', 'Out of Control': '#F87171' }

    branches.forEach(b => {
      if (!b.latitude || !b.longitude) return
      const color = SPC_COLOR[b.spcFlag] || '#60A5FA'
      const sigma = Number(b.sigmaLevel || 0)
      const r     = 10 + sigma * 2

      const icon = L.divIcon({
        className: '',
        html: '<div style="width:' + (r*2) + 'px;height:' + (r*2) + 'px;border-radius:50%;background:' + color + '22;border:2px solid ' + color + ';display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px ' + color + '55;"><div style="width:6px;height:6px;border-radius:50%;background:' + color + '"></div></div>',
        iconSize: [r*2, r*2],
        iconAnchor: [r, r],
      })

      const marker = L.marker([b.latitude, b.longitude], { icon })
      marker.bindPopup(
        '<div style="font-family:sans-serif;min-width:180px">' +
        '<div style="font-weight:600;font-size:13px;margin-bottom:4px">' + b.branchName + '</div>' +
        '<div style="font-size:11px;color:#666;margin-bottom:6px">' + b.city + ' · ' + b.region + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px">' +
        '<div><span style="color:#888">Sigma</span><br/><strong style="color:' + color + '">' + b.sigmaLevel + '</strong></div>' +
        '<div><span style="color:#888">SLA</span><br/><strong>' + b.slaCompliance + '%</strong></div>' +
        '<div><span style="color:#888">Status</span><br/><strong style="color:' + color + '">' + b.spcFlag + '</strong></div>' +
        '<div><span style="color:#888">Efficiency</span><br/><strong>' + (b.efficiencyScore || '--') + '</strong></div>' +
        '</div></div>',
        { maxWidth: 220 }
      )
      marker.addTo(map)
    })

    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null } }
  }, [branches, lookerMapUrl])

  if (lookerMapUrl) {
    return <iframe src={lookerMapUrl} width="100%" height={height} style={{ border: 'none', borderRadius: 12 }} title="Branch GIS Map" />
  }

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(96,165,250,0.2)' }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
      <LeafletLoader />
      <div ref={mapRef} style={{ height, width: '100%', background: '#060F1A' }} />
      <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 10, background: 'rgba(6,15,26,0.85)', borderRadius: 8, padding: '6px 10px', backdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
        {[['#34D399','In Control'],['#F59E0B','Watch'],['#F87171','Out of Control']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#94A3B8' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c as string, display: 'inline-block' }} />{l}
          </div>
        ))}
      </div>
    </div>
  )
}

function LeafletLoader() {
  useEffect(() => {
    if ((window as any).L) return
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    document.head.appendChild(s)
  }, [])
  return null
}
