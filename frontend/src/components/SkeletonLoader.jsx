export function SkeletonCard({ height = 80 }) {
    return (
        <div className="skeleton" style={{ height, borderRadius: 'var(--radius-md)', marginBottom: 12 }} />
    )
}

export function SkeletonText({ lines = 3 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton"
                    style={{ height: 14, width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    )
}
