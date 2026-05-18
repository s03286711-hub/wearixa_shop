'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

interface QuickViewModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  
  const wishlisted = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setQty(1);
      setActiveImg(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      title: product.title,
      price: product.discountPrice || product.price,
      image: product.images[0],
      qty,
      stock: product.stock,
      shippingCharges: product.shippingCharges || 0,
      applyShippingCharges: product.applyShippingCharges || false,
      isCodAvailable: product.isCodAvailable !== undefined ? product.isCodAvailable : true,
    });
    setAdded(true);
    showToast(`${product.title} added to cart`, 'success', product.images[0]);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{ 
              position: 'relative', width: '100%', maxWidth: '900px', maxHeight: '90vh',
              background: 'var(--color-surface)', borderRadius: '20px', overflow: 'hidden',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid var(--color-border)'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              style={{ 
                position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10,
                background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {/* Left: Images */}
            <div style={{ position: 'relative', background: 'var(--color-surface-2)', aspectRatio: '1/1' }}>
              <img 
                src={product.images[activeImg]} 
                alt={product.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {product.images.length > 1 && (
                <div style={{ position: 'absolute', bottom: '1rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {product.images.map((_: any, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImg(i)}
                      style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', padding: 0, border: 'none',
                        background: activeImg === i ? 'var(--color-accent)' : 'rgba(255,255,255,0.3)',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{product.brand || 'Premium'}</p>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem' }}>{product.title}</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= product.rating ? '#c9a84c' : 'none'} color={s <= product.rating ? '#c9a84c' : '#444'} />)}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>({product.numReviews} reviews)</span>
                </div>

                <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="text-gold">${(product.discountPrice || product.price).toFixed(2)}</span>
                  {product.discountPrice && (
                    <span style={{ fontSize: '1rem', color: 'var(--color-muted)', textDecoration: 'line-through' }}>${product.price.toFixed(2)}</span>
                  )}
                </div>

                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                  {product.description.slice(0, 160)}...
                </p>

                {/* Qty */}
                {product.stock > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>−</button>
                      <span style={{ width: '40px', textAlign: 'center', fontSize: '0.9rem' }}>{qty}</span>
                      <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: '36px', height: '36px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>+</button>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: product.stock < 5 ? '#f87171' : '#4ade80' }}>
                      {product.stock < 5 ? `Only ${product.stock} left!` : 'In Stock'}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: added ? '#4ade80' : undefined }}
                >
                  <ShoppingBag size={18} />
                  {added ? 'Added!' : 'Add to Cart'}
                </button>
                <button 
                  onClick={() => toggleWishlist(product)}
                  className="btn-outline" 
                  style={{ padding: '0.75rem', color: wishlisted ? '#f87171' : undefined, borderColor: wishlisted ? '#f87171' : undefined }}
                >
                  <Heart size={18} fill={wishlisted ? '#f87171' : 'none'} />
                </button>
              </div>
              
              <Link href={`/product/${product._id}`} onClick={onClose} style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-muted)', textDecoration: 'underline' }}>
                View Full Details
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
