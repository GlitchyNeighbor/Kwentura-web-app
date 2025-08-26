import React from "react";

const Footer = () => {
  return (
    <footer 
      style={{
        background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
        color: '#666',
        padding: '3rem 0 3rem',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 84, 154, 0.1)'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1', minWidth: '300px', marginBottom: '2rem' }}>
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
              {/* Replace the gradient div with actual logo */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={require("../assets/images/KLogo.png")}
                  alt="Kwentura Logo"
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}
                  onError={(e) => {
                    console.error("KLogo failed to load in footer:", e);
                    // Fallback to the original gradient design
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={(e) => {
                    // Hide fallback if logo loads successfully
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'none';
                    }
                  }}
                />
                {/* Fallback gradient logo (hidden by default) */}
                <div 
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                    borderRadius: '16px',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)'
                  }}
                >
                  <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>K</span>
                </div>
              </div>
              <div>
                <h3 
                  style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0
                  }}
                >
                  Kwentura
                </h3>
                <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                  Filipino Stories for Young Minds
                </p>
              </div>
            </div>
            <p 
              style={{
                color: '#888',
                fontSize: '0.9rem',
                margin: 0
              }}
            >
              &copy; 2025 Kwentura. All rights reserved.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '120px' }}>
              <h5 
                style={{
                  color: '#FF549A',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: '1.1rem'
                }}
              >
                About
              </h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  <a 
                    href="/about"
                    style={{
                      color: '#666',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FF549A'}
                    onMouseLeave={(e) => e.target.style.color = '#666'}
                  >
                    About System
                  </a>
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <a 
                    href="/contact"
                    style={{
                      color: '#666',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FF549A'}
                    onMouseLeave={(e) => e.target.style.color = '#666'}
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            
            <div style={{ minWidth: '120px' }}>
              <h5 
                style={{
                  color: '#FF549A',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: '1.1rem'
                }}
              >
                Resources
              </h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  <a 
                    href="/terms"
                    style={{
                      color: '#666',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FF549A'}
                    onMouseLeave={(e) => e.target.style.color = '#666'}
                  >
                    Terms
                  </a>
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <a 
                    href="/privacy"
                    style={{
                      color: '#666',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FF549A'}
                    onMouseLeave={(e) => e.target.style.color = '#666'}
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;