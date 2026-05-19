import { useState, useRef } from 'react'
import { Copy, Check } from 'lucide-react'

interface ColDef {
  key:    string
  label:  string
  width?: number
  render?: (val: any, row: any) => React.ReactNode
}

interface DataViewerProps {
  sheetName:   string
  description: string
  columns:     ColDef[]
  rows:        any[]
  accentColor?: string
}

export function DataViewer({ sheetName, description, columns, rows, accentColor = "#60A5FA" }: DataViewerProps) {
  const [copied, setCopied] = useState(false)
  const tbodyRef = useRef<HTMLDivElement>(null)

  function copyCSV() {
    const header = columns.map(c => c.label).join(",")
    const body   = rows.map(r =>
      columns.map(c => {
        const v = r[c.key]
        const s = v === null || v === undefined ? "" : String(v)
        return s.includes(",") || s.includes('"') ? '"' + s.replace(/"/g,'""') + '"' : s
      }).join(",")
    ).join("\n")
    navigator.clipboard.writeText(header + "\n" + body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ background:"rgba(15,26,40,0.92)", border:"1px solid " + accentColor + "22", borderRadius:14, overflow:"hidden", fontFamily:"inherit" }}>

      {/* Sheet metadata bar */}
      <div style={{ padding:"10px 16px", borderBottom:"0.5px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <div style={{ fontSize:12, color:"#94A3B8" }}>
          Sheet: <span style={{ fontWeight:700, color:"#F1F5F9" }}>{sheetName}</span>
        </div>
        <span style={{ color:"#334155" }}>·</span>
        <span style={{ fontSize:12, color:"#64748B" }}>{rows.length} rows</span>
        <span style={{ color:"#334155" }}>·</span>
        <span style={{ fontSize:12, color:"#64748B" }}>{columns.length} columns</span>
        <span style={{ color:"#334155" }}>·</span>
        <span style={{ fontSize:12, color:"#64748B" }}>{description}</span>
        <div style={{ marginLeft:"auto" }}>
          <button onClick={copyCSV} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#94A3B8", cursor:"pointer", fontSize:11, fontWeight:500, fontFamily:"inherit", transition:"all 0.15s" }}>
            {copied ? <Check size={12} color="#34D399" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy CSV"}
          </button>
        </div>
      </div>

      {/* Scrollable table */}
      <div ref={tbodyRef} style={{ overflowX:"auto", overflowY:"auto", maxHeight:440 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{
                  padding:"11px 14px",
                  textAlign:"left",
                  fontSize:10,
                  fontWeight:700,
                  color:"#64748B",
                  letterSpacing:"0.08em",
                  textTransform:"uppercase",
                  borderBottom:"1px solid rgba(255,255,255,0.1)",
                  whiteSpace:"nowrap",
                  minWidth: col.width || 100,
                  position:"sticky",
                  top:0,
                  background:"rgba(10,18,32,0.99)",
                  zIndex:2,
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}
                style={{ borderBottom:"0.5px solid rgba(255,255,255,0.04)", transition:"background 0.12s" }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding:"9px 14px", whiteSpace:"nowrap", verticalAlign:"middle" }}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : <span style={{ color:"#CBD5E1", fontSize:12 }}>{row[col.key] === null || row[col.key] === undefined ? "--" : String(row[col.key])}</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={columns.length} style={{ padding:"40px", textAlign:"center", color:"#334155", fontSize:13 }}>No data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ padding:"7px 16px", borderTop:"0.5px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, color:"#334155" }}>Scroll horizontally to see all {columns.length} columns · Scroll vertically for all {rows.length} rows</span>
        <span style={{ fontSize:10, color:"#1e3a5f" }}>BankPulse 360° · BigQuery Live</span>
      </div>
    </div>
  )
}
