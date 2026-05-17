'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X } from 'lucide-react';

interface ZoomGalleryProps {
  images: string[];
  title: string;
}

export default function ZoomGallery({ images, title }: ZoomGalleryProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [fsIndex, setFsIndex] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);

  const ZOOM = 2.5;
  const LENS = 140; // lens diameter px
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (fullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [fullScreen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = Math.min(Math.max(x / rect.width, 0), 1);
    const yPct = Math.min(Math.max(y / rect.height, 0), 1);
    setLensPos({ x: xPct, y: yPct });
  };

  const openFullScreen = (idx: number) => {
    setFsIndex(idx);
    setFullScreen(true);
  };

  return (
    <>
      <div>
        {/* Main image */}
        <div
          ref={imgRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-surface)', marginBottom: '1rem', cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
          onClick={() => openFullScreen(activeImg)}
        >
          <motion.img
            key={activeImg}
            src={images[activeImg] || 'https://placehold.co/600x800?text=Wearixa'}
            alt={title}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Hover Zoom Lens */}
          <AnimatePresence>
            {isHovering && (
              <>
                {/* Lens circle */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    width: `${LENS}px`,
                    height: `${LENS}px`,
                    border: '2px solid rgba(201,168,76,0.7)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.25)',
                    left: `calc(${lensPos.x * 100}% - ${LENS / 2}px)`,
                    top: `calc(${lensPos.y * 100}% - ${LENS / 2}px)`,
                    backgroundImage: `url(${images[activeImg] || 'https://placehold.co/600x800?text=Wearixa'})`,
                    backgroundSize: `${ZOOM * 100}%`,
                    backgroundPosition: `${lensPos.x * 100}% ${lensPos.y * 100}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Zoom hint */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isHovering ? 0 : 1, scale: isHovering ? 0.9 : 1 }}
            style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', pointerEvents: 'none' }}
          >
            <ZoomIn size={13} /> {isTouch ? 'Tap to expand' : 'Hover to zoom'}
          </motion.div>

          {/* Image counter */}
          {images.length > 1 && (
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
              {activeImg + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {images.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveImg(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                style={{ width: '72px', height: '96px', borderRadius: '8px', overflow: 'hidden', padding: 0, border: '2px solid', borderColor: activeImg === i ? 'var(--color-accent)' : 'transparent', cursor: 'pointer', transition: 'border-color 0.2s', flexShrink: 0, position: 'relative' }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {activeImg === i && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(201,168,76,0.15)' }} />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen Lightbox ── */}
      <AnimatePresence>
        {fullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullScreen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          >
            {/* Close */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setFullScreen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10 }}
            >
              <X size={20} />
            </motion.button>

            <motion.img
              key={fsIndex}
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.35 }}
              src={images[fsIndex]}
              alt={title}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
            />

            {/* Thumbnail strip in lightbox */}
            {images.length > 1 && (
              <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                {images.map((img, i) => (
                  <motion.button key={i} onClick={e => { e.stopPropagation(); setFsIndex(i); }} whileHover={{ scale: 1.1 }}
                    style={{ width: '56px', height: '72px', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${fsIndex === i ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)'}`, padding: 0, cursor: 'pointer' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
