'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

export default function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const clientId = "490246560862-pf7586lm813q9agq8vbhnrg6tsn88qol.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
