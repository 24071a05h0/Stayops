import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer 
      style={{ 
        textAlign: 'center', 
        padding: '2rem 1rem 1.5rem', 
        marginTop: 'auto',
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(226,232,248,0.1)'
      }}
    >
      <div className="container">
        <span style={{ 
          color: '#718EBF', 
          fontSize: '0.82rem', 
          fontWeight: 500,
          letterSpacing: '0.5px'
        }}>
          &copy; {year} StayOps Hostel Management System. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
