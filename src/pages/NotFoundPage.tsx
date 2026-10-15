import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <section className="section-spacing" style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div 
          style={{
            fontSize: 'var(--text-5xl)',
            fontWeight: 800,
            color: 'var(--color-brand-primary)',
            fontFamily: 'var(--font-heading)',
            marginBottom: 'var(--space-2)'
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
          The educational page or resource you are looking for does not exist or has been relocated.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            <span>Return to Homepage</span>
          </Link>
          <Link to="/programs" className="btn btn-secondary">
            <Compass size={18} />
            <span>Explore Programs</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
