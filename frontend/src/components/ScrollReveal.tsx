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
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.05, // Trigger earlier
        rootMargin: '0px 0px 50px 0px' // Start animation slightly before it enters
      });

      const elements = document.querySelectorAll('.reveal, .reveal-stagger');
      elements.forEach((el) => {
        // If it's already active, don't observe
        if (el.classList.contains('active')) return;
        observer.observe(el);
      });
    };

    // Run multiple times to catch dynamic data loading
    revealElements();
    const t1 = setTimeout(revealElements, 500);
    const t2 = setTimeout(revealElements, 1500);
    const t3 = setTimeout(revealElements, 3000); // Final check for slow images
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  return null;
}
