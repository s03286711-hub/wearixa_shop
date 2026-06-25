'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import SocialChatWidget from './SocialChatWidget';
import PageTransition from './PageTransition';
import MaintenanceWrapper from './MaintenanceWrapper';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminOrAuth = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');

  if (isAdminOrAuth) {
    return (
      <main style={{ minHeight: '100vh' }}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '72px' }}>
        <PageTransition>
          <MaintenanceWrapper>
            {children}
          </MaintenanceWrapper>
        </PageTransition>
      </main>
      <Footer />
      <SocialChatWidget />
    </>
  );
}
