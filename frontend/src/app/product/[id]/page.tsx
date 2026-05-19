'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '@/services';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { ProductDetailsSkeleton } from '@/components/Skeleton';
import ZoomGallery from '@/components/ZoomGallery';
import UploadZone from '@/components/UploadZone';
import { ShoppingBag, Heart, Star, Truck, Shield, RefreshCw, Image as ImageIcon, X } from 'lucide-react';
import { calculateShippingCharge } from '@/utils/shippingUtils';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const wishlisted = product ? isInWishlist(product._id) : false;
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'reviews'>('description');
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [review, setReview] = useState<{rating: number; comment: string; images: File[]}>({ rating: 5, comment: '', images: [] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    productService.getById(id as string)
      .then((data) => setProduct(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart.');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color before adding to cart.');
      return;
    }
    addToCart({ 
      _id: product._id, 
      title: product.title, 
      price: product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price, 
      image: product.images[0], 
      qty, 
      stock: product.stock, 
      shippingCharges: product.shippingCharges || 0,
      applyShippingCharges: product.applyShippingCharges || false,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      isCodAvailable: product.isCodAvailable !== undefined ? product.isCodAvailable : true,
    });
    setAdded(true);
    showToast(`${product.title} added to cart`, 'success', product.images[0]);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;
    toggleWishlist({
      _id: product._id,
      title: product.title,
      price: product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price,
      image: product.images[0],
      brand: product.brand || '',
      isCodAvailable: product.isCodAvailable,
    });
    showToast(wishlisted ? 'Removed from favorites' : 'Added to favorites', 'success', product.images[0]);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth/login'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rating', review.rating.toString());
      formData.append('comment', review.comment);
      review.images.forEach((file) => {
        formData.append('images', file);
      });

      await productService.createReview(product._id, formData);
      const updated = await productService.getById(product._id);
      setProduct(updated);
      setReview({ rating: 5, comment: '', images: [] });
      showToast('Review submitted successfully!', 'success');
    } catch (err: any) { 
      console.error(err); 
      showToast(err?.response?.data?.message || 'Failed to submit review', 'error');
    }
    finally { setSubmitting(false); }
  };

  if (loading) return <ProductDetailsSkeleton />;
  if (!product) return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-muted)' }}>Product not found.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="container" 
      style={{ padding: '3rem 1.5rem' }}
    >
      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

        {/* ── Images ── */}
        <ZoomGallery images={product.images} title={product.title} />

        {/* ── Info ── */}
        <div>
          {product.brand && (
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {product.brand} // LUX_BRAND
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: '600', marginBottom: '1rem', lineHeight: '1.2' }}>
            {product.title}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= product.rating ? '#c9a84c' : 'none'} color={s <= product.rating ? '#c9a84c' : '#444'} />)}
            </div>
            <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem', fontFamily: 'monospace' }}>[{product.numReviews} VERIFIED_REVIEWS]</span>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {product.discountPrice && product.discountPrice > 0 ? (
              <>
                <span className="text-gold" style={{ filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.3))' }}>${product.discountPrice.toFixed(2)}</span>
                <span style={{ fontSize: '1.25rem', color: 'var(--color-muted)', textDecoration: 'line-through', fontWeight: '500' }}>
                  ${product.price.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--color-accent)', color: '#0d0d0d', borderRadius: '4px', fontWeight: '800', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                  SAVE {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-gold" style={{ filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.3))' }}>${product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Live Inventory Telemetry Pulse */}
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: product.stock > 5 ? '#4ade80' : product.stock > 0 ? '#fbbf24' : '#ef4444',
                boxShadow: product.stock > 5 
                  ? '0 0 8px #4ade80, 0 0 4px #4ade80' 
                  : product.stock > 0 
                    ? '0 0 8px #fbbf24, 0 0 4px #fbbf24' 
                    : '0 0 8px #ef4444, 0 0 4px #ef4444',
                animation: 'pulse 2s infinite alternate'
              }} 
            />
            <span style={{
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              letterSpacing: '0.08em',
              color: product.stock > 5 ? '#4ade80' : product.stock > 0 ? '#fbbf24' : '#ef4444',
              textTransform: 'uppercase'
            }}>
              {product.stock > 5 
                ? `LIVE_INVENTORY // ${product.stock} UNITS_READY` 
                : product.stock > 0 
                  ? `LIMITED_OFFER // ONLY ${product.stock} UNITS_LEFTOVER` 
                  : 'INVENTORY_LOCKED // OUT_OF_STOCK'}
            </span>
          </div>

          {/* Sizes Swatches */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
                Size Selector <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>{selectedSize && `[${selectedSize}]`}</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size === selectedSize ? '' : size)}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(201,168,76,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '6px',
                      border: selectedSize === size ? '2px solid var(--color-accent)' : '2px solid rgba(255,255,255,0.06)',
                      background: selectedSize === size ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.02)',
                      color: selectedSize === size ? 'var(--color-accent)' : '#fff',
                      fontWeight: selectedSize === size ? '700' : '400',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      minWidth: '54px',
                      textAlign: 'center',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '0.5rem', fontFamily: 'monospace' }}>* SIZE_CHOICE_REQUIRED</p>
              )}
            </div>
          )}

          {/* Colors Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
                Color Way <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>{selectedColor && `[${selectedColor}]`}</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {product.colors.map((color: string) => {
                  const colorMap: {[key: string]: string} = {
                    'Black': '#000000', 'White': '#FFFFFF', 'Red': '#FF0000', 
                    'Blue': '#0000FF', 'Green': '#008000', 'Gray': '#808080', 
                    'Beige': '#F5F5DC', 'Gold': '#D4AF37'
                  };
                  const hex = colorMap[color] || '#333';
                  const isWhite = color === 'White';
                  
                  return (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      onClick={() => setSelectedColor(color === selectedColor ? '' : color)}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: hex,
                        border: selectedColor === color ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: selectedColor === color ? '0 0 0 2px #0f0f0f, 0 0 0 4px var(--color-accent)' : 'none',
                      }}
                    >
                      {isWhite && !selectedColor && <div style={{ width: '100%', height: '100%', border: '1px solid #ddd', borderRadius: '50%' }} />}
                    </button>
                  );
                })}
              </div>
              {!selectedColor && (
                <p style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '0.5rem', fontFamily: 'monospace' }}>* COLOR_WAY_REQUIRED</p>
              )}
            </div>
          )}

          {/* Luxury Glassmorphic Technical Specs Grid */}
          {(() => {
            const userAddress = { city: user?.city || '', country: user?.country || '' };
            const shipping = calculateShippingCharge(userAddress, { 
              applyShippingCharges: product.applyShippingCharges, 
              shippingCharges: product.shippingCharges 
            });

            return (
              <div className="glass" style={{
                borderRadius: '12px',
                padding: '1.25rem',
                background: 'rgba(13, 13, 13, 0.4)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                marginBottom: '2rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>SHIPPING_PROTOCOL</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: !product.applyShippingCharges ? '#4ade80' : 'var(--color-accent)', textTransform: 'uppercase' }}>
                    {!product.applyShippingCharges ? 'COMPLIMENTARY' : `$${shipping.toFixed(2)} FLAT_RATE`}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>DELIVERY_TIMELINE</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>3 - 5 BUSINESS DAYS</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>PAYMENT_ENCRYPT</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4ade80', textTransform: 'uppercase' }}>SECURED_SSL // 100%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>COD_PROTOCOL</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: product.isCodAvailable !== false ? '#4ade80' : '#f87171', textTransform: 'uppercase' }}>
                    {product.isCodAvailable !== false ? 'COD_SUPPORTED' : 'PREPAID_ONLY'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Qty selector */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.8rem', letterSpacing: '0.15em', color: 'var(--color-muted)', textTransform: 'uppercase', fontFamily: 'monospace' }}>Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: '40px', height: '40px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>−</button>
                <span style={{ width: '48px', textAlign: 'center', fontSize: '0.95rem', fontWeight: '600', fontFamily: 'monospace' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  style={{ width: '40px', height: '40px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>+</button>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={handleAddToCart} 
              disabled={product.stock === 0} 
              className="btn-primary hover-btn"
              style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                opacity: product.stock === 0 ? 0.5 : 1, 
                background: added ? 'linear-gradient(135deg,#4ade80,#22c55e)' : undefined,
                boxShadow: '0 4px 15px rgba(201, 168, 76, 0.2)'
              }}
            >
              <ShoppingBag size={18} />
              {added ? 'ADDED TO BAG ✓' : 'ADD TO SHOPPING BAG'}
            </button>
            <button 
              onClick={handleWishlist}
              className="btn-outline" 
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1.25rem',
                color: wishlisted ? '#f87171' : undefined,
                borderColor: wishlisted ? '#f87171' : 'rgba(255,255,255,0.1)',
                background: wishlisted ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; if(!wishlisted) e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; if(!wishlisted) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <Heart size={18} fill={wishlisted ? '#f87171' : 'none'} />
            </button>
          </div>

          {/* Premium trust badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { Icon: Truck, text: 'Complimentary Shipping' },
              { Icon: Shield, text: 'Enforced Encryption' },
              { Icon: RefreshCw, text: 'Flex Return Scheme' },
            ].map(({ Icon, text }) => (
              <div 
                key={text} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  textAlign: 'center',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.02)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.02)'; }}
              >
                <Icon size={18} style={{ color: 'var(--color-accent)', filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.4))' }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--color-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs: Description / Reviews ── */}
      <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '3rem' }}>
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {(['description', 'reviews'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.75rem 2rem', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--color-accent)' : 'transparent'}`,
              color: tab === t ? 'var(--color-accent)' : 'var(--color-muted)',
              cursor: 'pointer', fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'capitalize',
              fontWeight: tab === t ? '600' : '400', transition: 'all 0.3s', marginBottom: '-1px',
            }}>
              {t} {t === 'reviews' && `(${product.numReviews})`}
            </button>
          ))}
        </div>

        {tab === 'description' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            style={{ color: 'var(--color-muted)', lineHeight: '1.8', maxWidth: '680px', fontSize: '0.95rem' }}
          >
            {product.description}
          </motion.div>
        )}

        {tab === 'reviews' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            style={{ maxWidth: '680px' }}
          >
            {product.reviews.length === 0 ? (
              <p style={{ color: 'var(--color-muted)' }}>No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {product.reviews.map((r: any) => (
                  <div key={r._id} className="glass" style={{ padding: '1.25rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{r.name}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= r.rating ? '#c9a84c' : 'none'} color={s <= r.rating ? '#c9a84c' : '#444'} />)}
                      </div>
                    </div>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: r.images && r.images.length > 0 ? '1rem' : '0' }}>{r.comment}</p>
                    
                    {/* Review Images */}
                    {r.images && r.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {r.images.map((img: string, idx: number) => (
                          <div key={idx} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                            <img src={img} alt={`Review photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Write a review */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Write a Review</h3>
              {!user ? (
                <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                  <a href="/auth/login" style={{ color: 'var(--color-accent)' }}>Login</a> to write a review.
                </p>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Rating</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                          <Star size={22} fill={s <= review.rating ? '#c9a84c' : 'none'} color={s <= review.rating ? '#c9a84c' : '#444'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Comment</label>
                    <textarea className="input-field" rows={4} value={review.comment} onChange={(e) => setReview(r => ({ ...r, comment: e.target.value }))}
                      placeholder="Share your thoughts..." required />
                  </div>
                  
                  {/* Image Upload */}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ImageIcon size={14} /> Add Photos (up to 3)
                    </label>
                    {review.images.length < 3 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <UploadZone 
                          onFilesSelected={(files) => {
                            const newFiles = [...review.images, ...files].slice(0, 3);
                            setReview(r => ({ ...r, images: newFiles }));
                          }} 
                          maxFiles={3 - review.images.length} 
                          title="Drag & drop or click to upload" 
                        />
                      </div>
                    )}
                    
                    {/* Image Previews */}
                    {review.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {review.images.map((file, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                            <img src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                              type="button" 
                              onClick={() => setReview(r => ({ ...r, images: r.images.filter((_, i) => i !== idx) }))}
                              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── You May Also Like ── */}
      <YouMayAlsoLike currentId={product._id} categoryId={product.category?._id || product.category} />

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 1; }
        }
        @media (max-width: 768px) {
          .product-grid { 
            grid-template-columns: 1fr !important; 
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

function YouMayAlsoLike({ currentId, categoryId }: { currentId: string; categoryId: string }) {
  const [recs, setRecs] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!categoryId) return;
    productService.getAll({ category: categoryId, pageSize: 5 })
      .then(data => setRecs((data.products || []).filter((p: any) => p._id !== currentId).slice(0, 4)))
      .catch(console.error);
  }, [categoryId, currentId]);

  if (recs.length === 0) return null;

  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
      style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        <p style={{ color: 'var(--color-accent)', letterSpacing: '0.35em', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>You May Also Like</p>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {recs.map((p, i) => (
          <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            style={{ background: 'var(--color-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', transition: 'all 0.3s' }}>
            <Link href={`/product/${p._id}`} style={{ display: 'block' }}>
              <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
              </div>
              <div style={{ padding: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</p>
                <p className="text-gold" style={{ fontWeight: '700', fontSize: '1rem' }}>${(p.discountPrice > 0 ? p.discountPrice : p.price).toFixed(2)}</p>
              </div>
            </Link>
            <button onClick={() => { addToCart({ _id: p._id, title: p.title, price: p.discountPrice > 0 ? p.discountPrice : p.price, image: p.images[0], qty: 1, stock: p.stock, shippingCharges: p.shippingCharges || 0, applyShippingCharges: p.applyShippingCharges || false, isCodAvailable: p.isCodAvailable !== undefined ? p.isCodAvailable : true }); showToast(`${p.title} added to cart`, 'success', p.images[0]); }}
              className="btn-primary" style={{ width: 'calc(100% - 2rem)', margin: '0 1rem 1rem', padding: '0.5rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <ShoppingBag size={14} /> Add to Cart
            </button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
