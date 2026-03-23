import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

export default function NotFoundPage() {
    useSEO('Page Not Found - SnipShare', "We couldn't find the page or snippet you're looking for. The code may have expired or been deleted from our online snippet tool.");
    return (
        <div className="page fade-in">
            <div className="container text-center" style={{ paddingTop: '5rem' }}>
                <div style={{
                    fontSize: '5rem',
                    lineHeight: 1,
                    marginBottom: '1rem',
                    color: 'var(--accent)',
                }}>
                    404
                </div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page not found</h1>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                    The page you're looking for doesn't exist. Let's get you back on track.
                </p>
                <Link to="/" className="btn btn-primary">Go Home</Link>
            </div>
        </div>
    );
}
