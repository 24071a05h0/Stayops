import React, { useEffect } from 'react';

const CursorEffect = () => {
  useEffect(() => {
    const handleClick = (e) => {
      const ripple = document.createElement('div');
      
      const size = 24;
      const x = e.clientX - size / 2;
      const y = e.clientY - size / 2;
      
      ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid rgba(67, 24, 255, 0.35);
        pointer-events: none;
        z-index: 9999;
        transform: scale(1);
        opacity: 0.6;
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      `;
      
      document.body.appendChild(ripple);
      
      // Trigger animation
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(1.8)';
        ripple.style.opacity = '0';
      });
      
      // Cleanup
      setTimeout(() => {
        ripple.remove();
      }, 350);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return null;
};

export default CursorEffect;
