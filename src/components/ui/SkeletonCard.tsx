import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function KPISkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <SkeletonTheme baseColor="#0F1A2E" highlightColor="#1D2E47">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 28 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ background: 'rgba(15,26,40,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ marginBottom: 10 }}>
              <Skeleton width={80} height={10} />
            </div>
            <Skeleton width={100} height={32} style={{ marginBottom: 6 }} />
            <Skeleton width={120} height={10} />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <SkeletonTheme baseColor="#0F1A2E" highlightColor="#1D2E47">
      <div style={{ background: 'rgba(15,26,40,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <Skeleton width={300} height={12} />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', gap: 16 }}>
            <Skeleton width={140} height={12} />
            <Skeleton width={80} height={12} />
            <Skeleton width={60} height={12} />
            <Skeleton width={60} height={12} />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  )
}

export function MapSkeleton() {
  return (
    <SkeletonTheme baseColor="#0F1A2E" highlightColor="#1D2E47">
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Skeleton height={480} style={{ display: 'block' }} />
      </div>
    </SkeletonTheme>
  )
}

export function NetworkSkeleton() {
  return (
    <SkeletonTheme baseColor="#0F1A2E" highlightColor="#1D2E47">
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Skeleton height={420} style={{ display: 'block' }} />
      </div>
    </SkeletonTheme>
  )
}
