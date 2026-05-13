'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '@/services';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, CheckCircle } from 'lucide-react';
import { calculateShippingCharge } from '@/utils/shippingUtils';

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
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<'description' | 'reviews'>('description');
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
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
      color: selectedColor || undefined
    });
    setAdded(true);
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
    });
    showToast(wishlisted ? 'Removed from favorites' : 'Added to favorites', 'success', product.images[0]);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth/login'); return; }
    setSubmitting(true);
    try {
      await productService.createReview(product._id, review);
      const updated = await productService.getById(product._id);
      setProduct(updated);
      setReview({ rating: 5, comment: '' });
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-muted)' }}>Product not found.</div>;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

        {/* ── Images ── */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', background: 'var(--color-surface)', marginBottom: '1rem' }}>
            <img src={product.images[activeImg] || 'https://placehold.co/600x800?text=Wearixa'} alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }} />
            {product.images.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + product.images.length) % product.images.length)}
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % product.images.length)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {product.images.map((img: string, i: number) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{
                width: '72px', height: '96px', borderRadius: '6px', overflow: 'hidden', padding: 0, border: '2px solid',
                borderColor: activeImg === i ? 'var(--color-accent)' : 'transparent', cursor: 'pointer',
              }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Info ── */}
        <div>
          {product.brand && (
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {product.brand}
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
            <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{product.numReviews} reviews</span>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {product.discountPrice && product.discountPrice > 0 ? (
              <>
                <span className="text-gold">${product.discountPrice.toFixed(2)}</span>
                <span style={{ fontSize: '1.25rem', color: 'var(--color-muted)', textDecoration: 'line-through', fontWeight: '500' }}>
                  ${product.price.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.9rem', padding: '4px 10px', background: 'var(--color-accent)', color: '#0d0d0d', borderRadius: '20px', fontWeight: '700', letterSpacing: '0.05em' }}>
                  -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-gold">${product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Stock */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600',
              background: product.stock > 0 ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
              color: product.stock > 0 ? '#4ade80' : '#f87171',
              border: `1px solid ${product.stock > 0 ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Shipping Info */}
          {(() => {
            const userAddress = { city: user?.city || '', country: user?.country || '' };
            const shipping = calculateShippingCharge(userAddress, { 
              applyShippingCharges: product.applyShippingCharges, 
              shippingCharges: product.shippingCharges 
            });

            return (
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  padding: '4px 10px', 
                  background: !product.applyShippingCharges ? 'rgba(34,197,94,0.1)' : 'rgba(201,168,76,0.1)', 
                  border: `1px solid ${!product.applyShippingCharges ? 'rgba(34,197,94,0.2)' : 'rgba(201,168,76,0.2)'}`, 
                  borderRadius: '4px', fontSize: '0.8rem', 
                  color: !product.applyShippingCharges ? '#4ade80' : 'var(--color-accent)', 
                  fontWeight: '600' 
                }}>
                  {!product.applyShippingCharges ? 'FREE SHIPPING' : `Shipping: $${shipping.toFixed(2)}`}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  {product.applyShippingCharges && !user ? 'Final cost calculated at checkout' : 'Estimated delivery: 3-5 business days'}
                </p>
              </div>
            );
          })()}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Size <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>{selectedSize && `— ${selectedSize}`}</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size === selectedSize ? '' : size)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '6px',
                      border: selectedSize === size ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                      background: selectedSize === size ? 'rgba(201,168,76,0.15)' : 'transparent',
                      color: selectedSize === size ? 'var(--color-accent)' : 'var(--color-text)',
                      fontWeight: selectedSize === size ? '700' : '400',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                      minWidth: '52px',
                      textAlign: 'center',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.5rem' }}>Please select a size</p>
              )}
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Color <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>{selectedColor && `— ${selectedColor}`}</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {product.colors.map((color: string) => {
                  // Map color names to hex codes for the UI
                  const colorMap: {[key: string]: string} = {
                    'Black': '#000000', 'White': '#FFFFFF', 'Red': '#FF0000', 
                    'Blue': '#0000FF', 'Green': '#008000', 'Gray': '#808080', 
                    'Beige': '#F5F5DC', 'Gold': '#D4AF37'
                  };
                  const hex = colorMap[color] || '#333';
                  
                  return (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      onClick={() => setSelectedColor(color === selectedColor ? '' : color)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: hex,
                        border: selectedColor === color ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: selectedColor === color ? '0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-accent)' : 'none',
                      }}
                    >
                      {color === 'White' && !selectedColor && <div style={{ width: '100%', height: '100%', border: '1px solid #ddd', borderRadius: '50%' }} />}
                    </button>
                  );
                })}
              </div>
              {!selectedColor && (
                <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.5rem' }}>Please select a color</p>
              )}
            </div>
          )}

          {/* Qty selector */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.85rem', letterSpacing: '0.1em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Qty</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: '40px', height: '40px', background: 'var(--color-surface)', border: 'none', color: 'var(--color-text)', cursor: 'pointer', fontSize: '1.2rem' }}>−</button>
                <span style={{ width: '48px', textAlign: 'center', fontSize: '0.95rem' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  style={{ width: '40px', height: '40px', background: 'var(--color-surface)', border: 'none', color: 'var(--color-text)', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: product.stock === 0 ? 0.5 : 1, background: added ? 'linear-gradient(135deg,#4ade80,#22c55e)' : undefined }}>
              <ShoppingBag size={18} />
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>
            <button 
              onClick={handleWishlist}
              className="btn-outline" 
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1.25rem',
                color: wishlisted ? '#f87171' : undefined,
                borderColor: wishlisted ? '#f87171' : undefined,
                background: wishlisted ? 'rgba(239,68,68,0.05)' : undefined
              }}
            >
              <Heart size={18} fill={wishlisted ? '#f87171' : 'none'} />
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            {[
              { Icon: Truck, text: 'Free Shipping' },
              { Icon: Shield, text: 'Secure Checkout' },
              { Icon: RefreshCw, text: 'Easy Returns' },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
                <Icon size={20} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs: Description / Reviews ── */}
      <div style={{ marginTop: '4rem', borderTop: '1px solid var(--color-border)', paddingTop: '3rem' }}>
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
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
          <div style={{ color: 'var(--color-muted)', lineHeight: '1.8', maxWidth: '680px', fontSize: '0.95rem' }}>
            {product.description}
          </div>
        )}

        {tab === 'reviews' && (
          <div style={{ maxWidth: '680px' }}>
            {product.reviews.length === 0 ? (
              <p style={{ color: 'var(--color-muted)' }}>No reviews yet. Be the first!</p>
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
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Write a review */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
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
                  <button type="submit" className="btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
