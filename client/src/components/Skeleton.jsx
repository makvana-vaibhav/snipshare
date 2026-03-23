import './Skeleton.css';

export function SkeletonPaste() {
    return (
        <div className="skeleton-paste card card-sm">
            <div className="skeleton-title" />
            <div className="skeleton-meta">
                <div className="skeleton-badge" />
                <div className="skeleton-text" style={{ width: '100px' }} />
                <div className="skeleton-text" style={{ width: '80px' }} />
            </div>
        </div>
    );
}

export function SkeletonPasteFull() {
    return (
        <div className="skeleton-paste-full">
            <div className="skeleton-header card card-sm">
                <div className="skeleton-title" style={{ marginBottom: '0.5rem' }} />
                <div className="skeleton-meta" style={{ gap: '0.5rem' }}>
                    <div className="skeleton-badge" />
                    <div className="skeleton-text" style={{ width: '100px' }} />
                </div>
            </div>
            <div className="skeleton-code" />
        </div>
    );
}

export function SkeletonLoader() {
    return (
        <div style={{ padding: '2rem' }}>
            <SkeletonPaste />
            <SkeletonPaste />
            <SkeletonPaste />
        </div>
    );
}
