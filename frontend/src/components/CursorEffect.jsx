import React, { useEffect } from 'react';

const CursorEffect = () => {
  useEffect(() => {
    const handleClick = (e) => {
      const circle = document.createElement('div');
      
      const size = 60;
      const x = e.clientX - size / 2;
      const y = e.clientY - size / 2;
      
      circle.style.position = 'fixed';
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;
      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;
      circle.style.borderRadius = '50%';
      circle.style.background = 'rgba(67, 24, 255, 0.2)';
      circle.style.border = '2px solid rgba(67, 24, 255, 0.4)';
      circle.style.pointerEvents = 'none';
      circle.style.zIndex = '9999';
      circle.style.transform = 'scale(0)';
      circle.style.opacity = '1';
      circle.style.transition = 'transform 0.4s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.4s ease-out';
      
      document.body.appendChild(circle);
      
      // Trigger animation
      setTimeout(() => {
        circle.style.transform = 'scale(1.5)';
        circle.style.opacity = '0';
      }, 10);
      
      // Cleanup
      setTimeout(() => {
        circle.remove();
      }, 500);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return null;
};

export default CursorEffect;
