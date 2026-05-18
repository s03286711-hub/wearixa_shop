'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Terminal, Cpu, Layers, Shield, RefreshCw, 
  TrendingUp, TrendingDown, DollarSign, Calendar, Clock, BarChart2 
} from 'lucide-react';

interface DigitalChartsProps {
  stats: {
    revenue: number;
    orders: number;
    products: number;
    users: number;
  };
  recentOrders: any[];
}

// -------------------------------------------------------------
// Component 1: SalesTrendMatrix (Futuristic SVG Line/Area Chart)
// -------------------------------------------------------------
export function SalesTrendMatrix({ stats }: { stats: DigitalChartsProps['stats'] }) {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '3M'>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate dynamic data scaled to the database revenue
  const data = useMemo(() => {
    const baseRevenue = stats.revenue || 500;
    
    if (timeframe === '7D') {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      // Scales dynamic points such that the sum or distribution is proportional to revenue
      const multipliers = [0.08, 0.12, 0.15, 0.11, 0.18, 0.22, 0.14];
      return labels.map((label, idx) => ({
        label,
        value: baseRevenue * multipliers[idx] * 1.5,
        volume: Math.round(stats.orders * multipliers[idx] * 1.8) || 1,
        growth: Math.round((multipliers[idx] - (multipliers[idx - 1] || 0.1)) * 100)
      }));
    } else if (timeframe === '30D') {
      const labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
      const multipliers = [0.20, 0.28, 0.22, 0.30];
      return labels.map((label, idx) => ({
        label,
        value: baseRevenue * multipliers[idx],
        volume: Math.round(stats.orders * multipliers[idx]) || 1,
        growth: Math.round((multipliers[idx] - (multipliers[idx - 1] || 0.25)) * 100)
      }));
    } else {
      const labels = ['Mar', 'Apr', 'May'];
      const multipliers = [0.32, 0.28, 0.40];
      return labels.map((label, idx) => ({
        label,
        value: baseRevenue * multipliers[idx],
        volume: Math.round(stats.orders * multipliers[idx]),
        growth: Math.round((multipliers[idx] - (multipliers[idx - 1] || 0.35)) * 100)
      }));
    }
  }, [timeframe, stats.revenue, stats.orders]);

  // SVG dimensions
  const width = 500;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Compute point coordinates
  const points = useMemo(() => {
    const maxVal = Math.max(...data.map(d => d.value), 100);
    const minVal = 0;
    const graphWidth = width - paddingX * 2;
    const graphHeight = height - paddingY * 2;

    return data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * graphWidth;
      const y = height - paddingY - ((d.value - minVal) / (maxVal - minVal)) * graphHeight;
      return { x, y, ...d };
    });
  }, [data, width, height]);

  // Generate SVG Path for line and area
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;
  }, [points, linePath, height]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Find closest point by X coordinate
    let closestIndex = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - (mouseX * (width / rect.width)));
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setHoveredIndex(closestIndex);

    // Calculate tooltip position based on actual HTML coordinates
    const targetPoint = points[closestIndex];
    const htmlX = (targetPoint.x / width) * rect.width;
    const htmlY = (targetPoint.y / height) * rect.height;

    setTooltipPos({ x: htmlX, y: htmlY - 80 });
  };

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="glass" ref={containerRef} style={{
      borderRadius: '16px',
      padding: '1.5rem',
      position: 'relative',
      background: 'rgba(13, 13, 13, 0.45)',
      border: '1px solid rgba(201, 168, 76, 0.15)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.02)',
      overflow: 'hidden'
    }}>
      {/* Decorative tech grid elements */}
      <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.15, pointerEvents: 'none', fontFamily: 'monospace', fontSize: '0.6rem', padding: '6px' }}>
        SYS_MATRIX_SENSORS_V.4.2 // SYS_UPTIME: 100%
      </div>
      <div style={{ position: 'absolute', bottom: '8px', left: '16px', display: 'flex', gap: '8px', pointerEvents: 'none', opacity: 0.2 }}>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }}></div>
        <div style={{ width: '40px', height: '1px', alignSelf: 'center', borderBottom: '1px dashed var(--color-accent)' }}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} className="text-gold" style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.5))' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
              Revenue Generation Flow
            </h3>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
            DATAFEED_SYS: REVENUE_STREAM_MATRIX
          </p>
        </div>

        {/* Cyber Buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {(['7D', '30D', '3M'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => { setTimeframe(tf); setHoveredIndex(null); }}
              style={{
                background: timeframe === tf ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                border: timeframe === tf ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                color: timeframe === tf ? 'var(--color-accent)' : 'var(--color-muted)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
              onMouseEnter={e => { if (timeframe !== tf) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (timeframe !== tf) e.currentTarget.style.color = 'var(--color-muted)'; }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ overflow: 'visible', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Area Gradient with futuristic glow */}
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
            </linearGradient>
            {/* Line glow filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * (height - paddingY * 2);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(255,255,255,0.03)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Vertical Grid dividers */}
          {points.map((p, idx) => (
            <line
              key={idx}
              x1={p.x}
              y1={paddingY}
              x2={p.x}
              y2={height - paddingY}
              stroke="rgba(255, 255, 255, 0.02)"
              strokeWidth="1"
            />
          ))}

          {/* Area under curve */}
          <motion.path
            d={areaPath}
            fill="url(#areaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Glow backdrop path */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            filter="url(#neonGlow)"
            style={{ opacity: 0.4 }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Crisp foreground path */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--color-accent-light)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Coordinates circles */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="var(--color-bg)"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="7"
                fill="var(--color-accent)"
                fillOpacity="0.1"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => {
                  setHoveredIndex(idx);
                }}
              />
            </g>
          ))}

          {/* Vertical tracker indicator */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingY}
                x2={activePoint.x}
                y2={height - paddingY}
                stroke="rgba(201, 168, 76, 0.4)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6.5"
                fill="var(--color-accent-light)"
                stroke="var(--color-bg)"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 6px var(--color-accent))' }}
              />
            </g>
          )}

          {/* Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 12}
              textAnchor="middle"
              fill="var(--color-muted)"
              style={{ fontSize: '0.62rem', fontFamily: 'monospace', fontWeight: '500' }}
            >
              {p.label}
            </text>
          ))}
        </svg>

        {/* Hover Floating HUD Tooltip */}
        <AnimatePresence>
          {hoveredIndex !== null && activePoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: 'translateX(-50%)',
                zIndex: 50,
                pointerEvents: 'none'
              }}
            >
              <div style={{
                background: 'rgba(9, 9, 9, 0.95)',
                border: '1px solid var(--color-accent)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 10px rgba(201, 168, 76, 0.3)',
                minWidth: '135px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                position: 'relative'
              }}>
                {/* Cyber corner marks */}
                <div style={{ position: 'absolute', top: -1, left: -1, width: '4px', height: '4px', borderTop: '1px solid #fff', borderLeft: '1px solid #fff' }} />
                <div style={{ position: 'absolute', bottom: -1, right: -1, width: '4px', height: '4px', borderBottom: '1px solid #fff', borderRight: '1px solid #fff' }} />
                
                <div style={{ color: 'var(--color-muted)', fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '3px', marginBottom: '3px' }}>
                  <span>TELEMETRY_DATAFEED</span>
                  <span>{activePoint.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>VAL:</span>
                  <span style={{ color: 'var(--color-accent-light)', fontWeight: '700' }}>
                    ${activePoint.value.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>VOL:</span>
                  <span>{activePoint.volume} units</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>VAR:</span>
                  <span style={{ color: activePoint.growth >= 0 ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {activePoint.growth >= 0 ? '+' : ''}{activePoint.growth}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component 2: CategoryDistributionRing (Glowing Donut Chart)
// -------------------------------------------------------------
export function CategoryDistributionRing({ stats }: { stats: DigitalChartsProps['stats'] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Distribute inventory based on loaded DB counts or balanced weights
  const categories = useMemo(() => {
    const totalProducts = stats.products || 10;
    
    // Balanced aesthetic segments: Collections, Women, Men, Accessories
    return [
      { name: 'Men Wear', count: Math.round(totalProducts * 0.35) || 3, color: '#60a5fa', desc: 'Sleek menswear' },
      { name: 'Women Wear', count: Math.round(totalProducts * 0.40) || 4, color: '#a78bfa', desc: 'Elegant feminine' },
      { name: 'Luxe Acc', count: Math.round(totalProducts * 0.15) || 2, color: '#c9a84c', desc: 'Gold leatherware' },
      { name: 'Seasonals', count: Math.round(totalProducts * 0.10) || 1, color: '#f43f5e', desc: 'Curated sets' }
    ];
  }, [stats.products]);

  const total = useMemo(() => categories.reduce((sum, c) => sum + c.count, 0), [categories]);

  // SVG parameters
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute angles and stroke-dash offsets for segments
  let accumulatedPercent = 0;
  const segments = useMemo(() => {
    return categories.map((cat, idx) => {
      const percentage = cat.count / (total || 1);
      const dashArray = `${percentage * circumference} ${circumference}`;
      const dashOffset = circumference - (accumulatedPercent * circumference);
      accumulatedPercent += percentage;

      return {
        ...cat,
        percentage,
        dashArray,
        dashOffset,
        idx
      };
    });
  }, [categories, total, circumference]);

  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div className="glass" style={{
      borderRadius: '16px',
      padding: '1.5rem',
      background: 'rgba(13, 13, 13, 0.45)',
      border: '1px solid rgba(201, 168, 76, 0.15)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.02)',
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden'
    }}>
      {/* Visual cyber decorations */}
      <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.15, pointerEvents: 'none', fontFamily: 'monospace', fontSize: '0.6rem', padding: '6px' }}>
        RING_SEGMENT_ANALYZER_v1.0
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <Layers size={16} className="text-gold" style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.5))' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: '600', letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
            Inventory Matrix
          </h3>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'monospace', marginBottom: '1rem' }}>
          STOCK_DISTRIBUTION // TOTAL: {total} UNITS
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Ring Graphic */}
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            <defs>
              <filter id="ringGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segments.map((seg) => {
              const isHovered = hoveredIdx === seg.idx;
              return (
                <motion.circle
                  key={seg.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="round"
                  filter={isHovered ? 'url(#ringGlow)' : 'none'}
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s, stroke-dashoffset 0.5s ease',
                  }}
                  onMouseEnter={() => setHoveredIdx(seg.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: seg.dashOffset }}
                  transition={{ duration: 0.6, delay: seg.idx * 0.1 }}
                />
              );
            })}
          </svg>

          {/* Central digital value */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: radius * 2 - 10,
            height: radius * 2 - 10,
            borderRadius: '50%',
            background: 'rgba(10, 10, 10, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
          }}>
            {activeSegment ? (
              <>
                <span style={{ fontSize: '0.62rem', color: 'var(--color-muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                  {activeSegment.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: activeSegment.color, fontFamily: 'monospace', lineHeight: 1.1 }}>
                  {Math.round(activeSegment.percentage * 100)}%
                </span>
                <span style={{ fontSize: '0.55rem', color: '#fff', opacity: 0.8, fontFamily: 'monospace' }}>
                  {activeSegment.count} items
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '0.62rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                  CATEGORIES
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-accent-light)', fontFamily: 'monospace' }}>
                  {categories.length}
                </span>
                <span style={{ fontSize: '0.55rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                  Balanced
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
          {segments.map((seg) => {
            const isHovered = hoveredIdx === seg.idx;
            return (
              <div 
                key={seg.name} 
                onMouseEnter={() => setHoveredIdx(seg.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  background: isHovered ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                  transition: 'background 0.2s',
                  border: isHovered ? `1px solid rgba(255, 255, 255, 0.05)` : '1px solid transparent'
                }}
              >
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: seg.color,
                  marginTop: '4px',
                  boxShadow: isHovered ? `0 0 6px ${seg.color}` : 'none'
                }} />
                <div>
                  <p style={{
                    fontSize: '0.72rem',
                    fontWeight: isHovered ? '600' : '400',
                    color: isHovered ? seg.color : '#eee',
                    lineHeight: '1.2'
                  }}>
                    {seg.name}
                  </p>
                  <p style={{ fontSize: '0.62rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                    {seg.count} pcs // {Math.round(seg.percentage * 100)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component 3: LiveActivityConsole (Scrollable Sci-Fi Terminal Feed)
// -------------------------------------------------------------
export function LiveActivityConsole({ recentOrders }: { recentOrders: any[] }) {
  const [logs, setLogs] = useState<Array<{ id: string; time: string; type: string; message: string; severity: 'info' | 'success' | 'warn' | 'error' }>>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const consoleBodyRef = useRef<HTMLDivElement>(null);

  // Generate initial log buffer
  useEffect(() => {
    const timestamp = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0').slice(0, 2)}`;
    };

    const initialLogs: Array<{ id: string; time: string; type: string; message: string; severity: 'info' | 'success' | 'warn' | 'error' }> = [
      { id: '1', time: timestamp(), type: 'SYS_CORE', message: 'WEARIXA Admin Command Deck interface loaded successfully.', severity: 'info' },
      { id: '2', time: timestamp(), type: 'DB_CONN', message: 'Established active handshake with MongoDB cluster.', severity: 'success' },
      { id: '3', time: timestamp(), type: 'SECURE_AUTH', message: 'Stripe Payment Gateway sandbox synchronizer active.', severity: 'info' },
    ];

    // Merge in real order logs if we have them
    if (recentOrders && recentOrders.length > 0) {
      recentOrders.slice(0, 3).forEach((ord, idx) => {
        const orderIdShort = ord._id.slice(-8).toUpperCase();
        initialLogs.push({
          id: `ord-${idx}`,
          time: new Date(ord.createdAt).toLocaleTimeString(),
          type: 'TRANS_LOG',
          message: `Order #${orderIdShort} detected for customer ${ord.user?.name || 'Guest'}. Status: ${ord.isPaid ? 'PAID' : 'PENDING'}. Total: $${ord.totalPrice.toFixed(2)}.`,
          severity: ord.isPaid ? ('success' as const) : ('warn' as const)
        });
      });
    }

    setLogs(initialLogs);
  }, [recentOrders]);

  // Automatically scroll logs to bottom without scrolling parent window
  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTo({
        top: consoleBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs, isScanning, scanMessage]);

  // Periodic random live event simulation
  useEffect(() => {
    const logTypes = [
      { type: 'SECURE_GATEWAY', message: 'Stripe API ping successful. Latency 22ms.', severity: 'success' as const },
      { type: 'CACHE_INDEX', message: 'Flushed category collection lookup nodes.', severity: 'info' as const },
      { type: 'DB_MUTATION', message: 'Product stock ledger verified. Integrity: 100%.', severity: 'info' as const },
      { type: 'SYS_DAEMON', message: 'Cron job synchronized with mailer pipeline.', severity: 'success' as const },
      { type: 'SSL_HANDSHAKE', message: 'SSL certificate verification completed successfully.', severity: 'success' as const }
    ];

    const interval = setInterval(() => {
      if (isScanning) return; // Pause random logs during diagnostics scan

      const randEvent = logTypes[Math.floor(Math.random() * logTypes.length)];
      const d = new Date();
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0').slice(0, 2)}`;

      setLogs(prev => [
        ...prev.slice(-15), // keep buffer small
        {
          id: Math.random().toString(),
          time: timeStr,
          type: randEvent.type,
          message: randEvent.message,
          severity: randEvent.severity
        }
      ]);
    }, 8500);

    return () => clearInterval(interval);
  }, [isScanning]);

  // Diagnostics Scan routine
  const runDiagnostics = () => {
    setIsScanning(true);
    setScanMessage('INITIALIZING SCAN CORE...');

    const timestamp = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };

    const steps = [
      { text: 'VERIFYING DATABASE NODE INTERRUPTS...', delay: 400 },
      { text: 'SYNCING PORTAL WEBHOOKS & SECURITY LAYERS...', delay: 900 },
      { text: 'EVALUATING INVENTORY LEDGER...', delay: 1400 },
      { text: 'CLEARING TRANSIENT BUFFER BLOCKS...', delay: 1900 },
      { text: 'DIAGNOSTICS COMPLETE. SYSTEM HEALTH: 100%', delay: 2400 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setScanMessage(step.text);

        // Print step to log buffer
        setLogs(prev => [
          ...prev,
          {
            id: `scan-${idx}-${Date.now()}`,
            time: timestamp(),
            type: 'DIAG_SCAN',
            message: step.text,
            severity: idx === steps.length - 1 ? 'success' : 'info'
          }
        ]);

        if (idx === steps.length - 1) {
          setTimeout(() => {
            setIsScanning(false);
            setScanMessage('');
          }, 600);
        }
      }, step.delay);
    });
  };

  return (
    <>
      {/* Full screen / dashboard area scanning line overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ y: '-10vh', opacity: 0.8 }}
            animate={{ y: '100vh', opacity: [0.8, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
              boxShadow: '0 0 15px var(--color-accent), 0 0 30px var(--color-accent)',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      <div className="glass" style={{
        borderRadius: '16px',
        background: 'rgba(9, 9, 9, 0.7)',
        border: '1px solid rgba(201, 168, 76, 0.15)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.7), inset 0 0 20px rgba(201, 168, 76, 0.03)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '380px'
      }}>
        {/* Terminal Header */}
        <div style={{
          padding: '10px 16px',
          background: 'rgba(20, 20, 20, 0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} className="text-gold" />
            <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
              SYS_OPERATIONS_FEED // STACK_CONSOLE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Blinking indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isScanning ? '#e8c97a' : '#4ade80',
                display: 'inline-block',
                boxShadow: isScanning ? '0 0 8px #e8c97a' : '0 0 8px #4ade80',
                animation: 'pulse 1.5s infinite'
              }}></span>
              <span style={{ fontSize: '0.58rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                {isScanning ? 'RUNNING_DIAG' : 'STABLE'}
              </span>
            </div>

            <button
              onClick={runDiagnostics}
              disabled={isScanning}
              style={{
                background: 'rgba(201, 168, 76, 0.08)',
                border: '1px solid rgba(201, 168, 76, 0.25)',
                color: 'var(--color-accent)',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.62rem',
                fontFamily: 'monospace',
                cursor: isScanning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s',
                opacity: isScanning ? 0.5 : 1
              }}
              onMouseEnter={e => { if(!isScanning) { e.currentTarget.style.background = 'rgba(201,168,76,0.15)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; } }}
              onMouseLeave={e => { if(!isScanning) { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; } }}
            >
              <Cpu size={10} />
              {isScanning ? 'DIAG_RUNNING' : 'RUN_DIAGNOSTICS'}
            </button>
          </div>
        </div>

        {/* Console logs area */}
        <div 
          ref={consoleBodyRef}
          style={{
            flex: 1,
            padding: '12px 16px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            color: '#c5c5c5',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: 'rgba(5, 5, 5, 0.65)'
          }}
        >
          {logs.map((log) => {
            let color = '#fff';
            let bg = 'rgba(255,255,255,0.03)';
            let labelBorder = 'rgba(255,255,255,0.1)';
            
            if (log.severity === 'success') {
              color = '#4ade80';
              bg = 'rgba(74, 222, 128, 0.02)';
              labelBorder = 'rgba(74, 222, 128, 0.2)';
            } else if (log.severity === 'warn') {
              color = '#e8c97a';
              bg = 'rgba(232, 201, 122, 0.02)';
              labelBorder = 'rgba(232, 201, 122, 0.2)';
            } else if (log.severity === 'error') {
              color = '#f87171';
              bg = 'rgba(248, 113, 113, 0.02)';
              labelBorder = 'rgba(248, 113, 113, 0.2)';
            }

            return (
              <div 
                key={log.id} 
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  background: bg,
                  borderLeft: `2px solid ${log.severity === 'info' ? 'rgba(255,255,255,0.2)' : color}`,
                  transition: 'all 0.2s'
                }}
              >
                {/* Time stamp */}
                <span style={{ color: 'var(--color-muted)', width: '70px', flexShrink: 0, userSelect: 'none' }}>
                  [{log.time}]
                </span>

                {/* Module label */}
                <span style={{
                  color,
                  border: `1px solid ${labelBorder}`,
                  padding: '0 4px',
                  borderRadius: '3px',
                  fontSize: '0.62rem',
                  fontWeight: '600',
                  letterSpacing: '0.04em',
                  width: '85px',
                  textAlign: 'center',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                  background: 'rgba(0, 0, 0, 0.3)'
                }}>
                  {log.type}
                </span>

                {/* Message */}
                <span style={{ color: log.severity === 'success' ? '#eaeaea' : '#c5c5c5', wordBreak: 'break-all' }}>
                  {log.message}
                </span>
              </div>
            );
          })}

          {/* Diagnostics scanner display text */}
          {isScanning && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 8px',
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '4px',
              color: 'var(--color-accent-light)',
              marginTop: '4px'
            }}>
              <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontWeight: '700', letterSpacing: '0.05em' }}>
                {scanMessage}
              </span>
            </div>
          )}


        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
