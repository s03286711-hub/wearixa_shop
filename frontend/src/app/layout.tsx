import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/context/ToastContext';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata: Metadata = {
  title: 'Wearixa – Premium Fashion House',
  description: 'Discover curated fashion collections crafted with elegance. Shop premium clothing, accessories, and more at Wearixa.',
  keywords: 'fashion, clothing, premium, luxury, style, Wearixa',
  openGraph: {
    title: 'Wearixa – Premium Fashion House',
    description: 'Curated fashion for the modern individual.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <GoogleAuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <ClientLayoutWrapper>
                    {children}
                  </ClientLayoutWrapper>
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </GoogleAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
