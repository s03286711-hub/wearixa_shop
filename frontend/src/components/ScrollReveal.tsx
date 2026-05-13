'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const revealElements = () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Once it's active, we can stop observing it
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px' // Slightly offset trigger point
      });

      const elements = document.querySelectorAll('.reveal, .reveal-stagger');
      elements.forEach((el) => observer.observe(el));
    };

    // Run on initial load and whenever the path changes
    revealElements();
    
    // Fallback for dynamic content changes
    const timeout = setTimeout(revealElements, 1000);
    
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null; // This component doesn't render anything
}
