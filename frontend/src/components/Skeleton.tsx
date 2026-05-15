import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export const ProductSkeleton = () => {
  return (
    <div className="glass" style={{ borderRadius: '12px', padding: '1rem', overflow: 'hidden' }}>
      <Skeleton height="300px" borderRadius="8px" style={{ marginBottom: '1rem' }} />
      <Skeleton width="40%" height="0.8rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="80%" height="1.2rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="30%" height="1rem" />
    </div>
  );
};

export const ProductDetailsSkeleton = () => {
  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
        <div>
          <Skeleton height="600px" borderRadius="12px" style={{ marginBottom: '1rem' }} />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Skeleton width="72px" height="96px" borderRadius="6px" />
            <Skeleton width="72px" height="96px" borderRadius="6px" />
            <Skeleton width="72px" height="96px" borderRadius="6px" />
          </div>
        </div>
        <div>
          <Skeleton width="100px" height="0.8rem" style={{ marginBottom: '1rem' }} />
          <Skeleton width="80%" height="3rem" style={{ marginBottom: '1.5rem' }} />
          <Skeleton width="200px" height="1.5rem" style={{ marginBottom: '2rem' }} />
          <Skeleton width="150px" height="2.5rem" style={{ marginBottom: '2rem' }} />
          <Skeleton width="100%" height="4rem" style={{ marginBottom: '1.5rem' }} />
          <Skeleton width="100%" height="3rem" style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Skeleton height="3.5rem" style={{ flex: 1 }} />
            <Skeleton width="60px" height="3.5rem" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const WalletSkeleton = () => {
  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
        <Skeleton width="120px" height="1.2rem" />
        <Skeleton width="200px" height="2.5rem" />
      </div>
      <div className="wallet-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        <div>
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <Skeleton width="200px" height="1.5rem" style={{ marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Skeleton width="40px" height="40px" borderRadius="50%" />
                    <div>
                      <Skeleton width="120px" height="1rem" style={{ marginBottom: '0.5rem' }} />
                      <Skeleton width="80px" height="0.8rem" />
                    </div>
                  </div>
                  <Skeleton width="60px" height="1.2rem" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Skeleton height="180px" borderRadius="16px" />
          <Skeleton height="300px" borderRadius="16px" />
        </div>
      </div>
    </div>
  );
};


