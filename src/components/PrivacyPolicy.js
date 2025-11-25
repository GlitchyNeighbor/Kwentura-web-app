import React, { useState, useEffect } from "react";

const HomeNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed-top transition-all ${isScrolled ? 'scrolled' : ''}`}
      style={{
        background: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 84, 154, 0.1)',
        padding: '1rem 0',
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 1000
      }}
    >
      <div 
        className="container-fluid"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >

        <div className="d-flex align-items-center" style={{gap: '1rem'}}>
          <div 
            className="logo"
            style={{
              width: '50px',
              height: '50px',
              background: 'white',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1) rotate(5deg)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1) rotate(0deg)'}
          >

            <div className="logo-container" >
              <img
                src={require("../assets/images/KLogo.png")}
                alt="Logo"
                className="navbar-logo"
                style={{
                  height: "40px",
                  width: "auto",
                  maxWidth: "100px",
                  objectFit: "contain",
                  transition: "opacity 0.2s ease"
                }}
                onError={(e) => {
                  console.error("Logo failed to load:", e);
                  e.target.style.display = "none";
                }}
                loading="lazy"
              />
            </div>
          </div>
          <div>
            <h1 
              style={{
                fontSize: '2rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                cursor: 'pointer'
              }}
            >
              Kwentura
            </h1>
            <p style={{color: '#666', fontSize: '0.9rem', margin: 0}}>
              Filipino Stories for Young Minds
            </p>
          </div>
        </div>
        
        <nav className="d-none d-lg-flex align-items-center" style={{gap: '2rem'}}>
          <a 
            href="/" 
            className="nav-link-custom"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#FF549A';
              e.target.style.background = 'rgba(255, 84, 154, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#666';
              e.target.style.background = 'transparent';
            }}
          >
            Home
          </a>
          <a 
            href="/about" 
            className="nav-link-custom"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#FF549A';
              e.target.style.background = 'rgba(255, 84, 154, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#666';
              e.target.style.background = 'transparent';
            }}
          >
            About Us
          </a>
          <a 
            href="/contact" 
            className="nav-link-custom"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#FF549A';
              e.target.style.background = 'rgba(255, 84, 154, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#666';
              e.target.style.background = 'transparent';
            }}
          >
            Contact
          </a>
          <a 
            href="/login" 
            style={{
              color: '#FF549A',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              background: 'rgba(255, 84, 154, 0.05)'
            }}
          >
            Login
          </a>
          <a 
            href="/signup" 
            style={{
              background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
              color: 'white',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 84, 154, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 84, 154, 0.3)';
            }}
          >
            Sign Up
          </a>
        </nav>
        
        <button 
          className="d-lg-none btn btn-link p-0"
          style={{
            background: 'none',
            border: 'none',
            color: '#FF549A',
            fontSize: '1.5rem'
          }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="d-lg-none"
          style={{
            background: 'white',
            borderTop: '1px solid rgba(255, 84, 154, 0.1)',
            padding: '1rem 2rem'
          }}
        >
          <div className="d-flex flex-column" style={{gap: '0.5rem'}}>
            <a href="/" style={{color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">Home</a>
            <a href="/about" style={{color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">About Us</a>
            <a href="/contact" style={{color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">Contact</a>
            <a href="/login" style={{color: '#FF549A', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease', background: 'rgba(255, 84, 154, 0.05)'}} className="mobile-nav-link">Login</a>
            <a href="/signup" style={{background: 'linear-gradient(135deg, #FF549A, #FF8CC8)', color: 'white', textDecoration: 'none', padding: '0.75rem', borderRadius: '15px', textAlign: 'center', marginTop: '0.5rem'}}>Sign Up</a>
          </div>
        </div>
      )}
    </header>
  );
};

const PrivacyPolicy = () => {
  const [, setActiveSection] = useState("");

  useEffect(() => {
    

    
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      const scrollPosition = window.scrollY + 150;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute('data-section');

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <HomeNavbar />
      <section 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
          minHeight: '50vh',
          paddingTop: '100px',
          paddingBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, #FF549A, #FF8CC8)',
            borderRadius: '50%',
            top: '20%',
            right: '10%',
            opacity: '0.1',
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #FFB6C1, #FFC0CB)',
            borderRadius: '50%',
            bottom: '15%',
            left: '5%',
            opacity: '0.1',
            animation: 'float 4s ease-in-out infinite reverse'
          }}
        ></div>

        <div 
          style={{ 
            maxWidth: '1200px', 
            position: 'relative', 
            zIndex: 10,
            textAlign: 'center',
            padding: '0 1rem'
          }}
        >
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: '1rem',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '0.75rem 1.5rem',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#FF549A',
              border: '2px solid rgba(255, 84, 154, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <i className="fas fa-shield-alt" style={{marginRight: '0.5rem'}}></i>
            Privacy Information
          </div>
          
          <h1 
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '800',
              lineHeight: '1.2',
              background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem'
            }}
          >
            Privacy Policy
          </h1>
          
          <p 
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              color: '#666',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Your privacy matters to us. Learn how we protect your data.
          </p>

          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginTop: '1rem',
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              fontSize: '0.85rem',
              color: '#666',
              backdropFilter: 'blur(10px)'
            }}
          >
            <i className="fas fa-calendar-alt" style={{marginRight: '0.5rem'}}></i>
            Effective Date: January 2026
          </div>
        </div>
      </section>

      <section 
        style={{ 
          backgroundColor: 'white',
          padding: '3rem 0',
        }}
      >
        <div 
          style={{     
            display: 'flex',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: 'white',
        }}>
          <div>
            <div>
              <div
                style={{
                  background: 'white',
                  padding: '3rem 2.5rem',
                  borderRadius: '20px',
                  boxShadow: '0 20px 50px rgba(255, 84, 154, 0.1)',
                  border: '1px solid rgba(255, 84, 154, 0.1)',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}
              >
                <div style={{marginBottom: '3rem'}}>
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 84, 154, 0.05), rgba(255, 140, 200, 0.05))',
                      padding: '2rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 84, 154, 0.1)',
                      marginBottom: '2rem'
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white'
                        }}
                      >
                        <i className="fas fa-info-circle"></i>
                      </div>
                      <h4 style={{ color: '#FF549A', fontWeight: '700', margin: 0 }}>
                        Important Notice
                      </h4>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', margin: 0 }}>
                      This Privacy Policy explains how we collect, use, disclose, and protect your 
                      personal information when you access and use the <strong>Kwentura</strong> website. 
                      By visiting or using the Website, you agree to the collection and use of your 
                      information in accordance with this Policy.
                    </p>
                    <p style={{ color: '#666', lineHeight: '1.7', margin: '1rem 0 0 0', fontWeight: '600' }}>
                      Please read this Privacy Policy carefully to understand our views and practices 
                      regarding your personal data.
                    </p>
                  </div>
                </div>

                <div className="privacy-content">
                  <section data-section="information" style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          width: '35px',
                          height: '35px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        1
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        INFORMATION WE COLLECT
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      We collect personal information when you register for and use the Website. 
                      This information may include:
                    </p>
                    <div 
                      style={{
                        background: 'rgba(255, 84, 154, 0.05)',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 84, 154, 0.1)',
                        marginBottom: '1rem'
                      }}
                    >
                      <strong style={{ color: '#FF549A', marginBottom: '0.5rem', display: 'block' }}>
                        Teacher Information:
                      </strong>
                      <ul style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', margin: 0, paddingLeft: '1.5rem' }}>
                        <li>First Name</li>
                        <li>Last Name</li>
                        <li>Email Address</li>
                        <li>Phone Number</li>
                        <li>Employee ID</li>
                        <li>Instructional Level</li>
                        <li>Section</li>
                      </ul>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      We may also collect additional information if you choose to provide it while 
                      using the Website.
                    </p>
                  </section>

                  <section data-section="usage" style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          width: '35px',
                          height: '35px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        2
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        HOW WE USE YOUR INFORMATION
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      The information we collect is used to:
                    </p>
                    <ul style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', paddingLeft: '1.5rem' }}>
                      <li style={{ marginBottom: '0.5rem' }}>Provide you with access to the Website and its features</li>
                      <li style={{ marginBottom: '0.5rem' }}>Verify your identity and eligibility to use the Website</li>
                      <li style={{ marginBottom: '0.5rem' }}>Communicate with you regarding updates, notices, and other important information</li>
                      <li style={{ marginBottom: '0.5rem' }}>Improve the functionality and services of the Website</li>
                      <li>Respond to your inquiries and requests</li>
                    </ul>
                  </section>

                  <section data-section="security" style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          width: '35px',
                          height: '35px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        3
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        DATA SECURITY
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      We are committed to protecting your information. We implement reasonable technical 
                      and organizational safeguards to prevent unauthorized access, disclosure, alteration, 
                      or destruction of your personal data. However, no method of online transmission or 
                      electronic storage is completely secure, and we cannot guarantee absolute security.
                    </p>
                  </section>

                  <section data-section="sharing" style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          width: '35px',
                          height: '35px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        4
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        SHARING YOUR INFORMATION
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      We do not share your personal information with third parties without your consent, 
                      except under the following circumstances:
                    </p>
                    <ul style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                      <li style={{ marginBottom: '0.75rem' }}>
                        <strong>Legal Requirements:</strong> If we are legally obligated to disclose your 
                        information, such as in response to a court order or to prevent fraud or illegal activities.
                      </li>
                      <li>
                        <strong>Service Providers:</strong> We may share your information with trusted 
                        third-party service providers who help us operate and maintain the Website. 
                        These providers are required to keep your data confidential.
                      </li>
                    </ul>
                    <div 
                      style={{
                        background: 'rgba(255, 84, 154, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', margin: 0 }}>
                        <strong style={{ color: '#FF549A' }}>Important:</strong> We will never sell or 
                        rent your personal information to third parties.
                      </p>
                    </div>
                  </section>

                  <section data-section="retention" style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          width: '35px',
                          height: '35px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        5
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        DATA RETENTION
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      We retain your personal information only for as long as necessary to fulfill the 
                      purposes described in this Policy. Once your data is no longer needed, we will 
                      securely delete or anonymize it in accordance with applicable laws and regulations.
                    </p>
                  </section>

                  <section data-section="rights" style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          width: '35px',
                          height: '35px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        6
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        YOUR RIGHTS AND CHOICES
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      You have the following rights regarding your personal data:
                    </p>
                    <ul style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                      <li style={{ marginBottom: '0.5rem' }}>
                        <strong>Access:</strong> You may request a copy of the personal data we hold about you.
                      </li>
                      <li style={{ marginBottom: '0.5rem' }}>
                        <strong>Correction:</strong> You may request corrections to inaccurate or incomplete information.
                      </li>
                      <li>
                        <strong>Deletion:</strong> You may request that we delete your personal data, 
                        subject to any legal requirements for its retention.
                      </li>
                    </ul>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      To exercise any of these rights, please contact us using the contact details provided below.
                    </p>
                  </section>

                  <section data-section="children" style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          width: '35px',
                          height: '35px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        7
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        CHILDREN'S PRIVACY
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      The Website is designed for educational use involving students aged 5 to 6 years old 
                      (Kinder to Grade 1), under the supervision of their parents or guardians. We do not 
                      collect personal information directly from children. All registration and data input 
                      must be completed by the parent or legal guardian.
                    </p>
                    <div 
                      style={{
                        background: 'rgba(255, 84, 154, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', margin: 0 }}>
                        <strong style={{ color: '#FF549A' }}>Child Protection:</strong> If we learn that 
                        we have collected personal information from a child without proper guardian consent, 
                        we will take steps to delete that information.
                      </p>
                    </div>
                  </section>

                  <section data-section="changes" style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          width: '35px',
                          height: '35px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        8
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        CHANGES TO THIS PRIVACY POLICY
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      We may update this Privacy Policy from time to time. Any updates will be posted on 
                      this page with the updated "Effective Date." You are encouraged to review this Policy 
                      periodically to stay informed of how we protect your personal information.
                    </p>
                  </section>

                  <section data-section="contact" style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          width: '35px',
                          height: '35px',
                          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        9
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        CONTACT US
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1.5rem' }}>
                      If you have any questions or concerns about this Privacy Policy or how your 
                      personal data is handled, please contact us at:
                    </p>
                    
                    <div 
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '20px',
                        padding: '30px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 84, 154, 0.1)'
                      }}
                    >
                      <div 
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '25px',
                          alignItems: 'center'
                        }}
                      >
                        <div 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '20px',
                            background: 'rgba(255, 105, 180, 0.05)',
                            borderRadius: '15px',
                            border: '2px solid rgba(255, 105, 180, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 105, 180, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div 
                            style={{
                              width: '50px',
                              height: '50px',
                              background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 4px 15px rgba(255, 105, 180, 0.3)'
                            }}
                          >
                            <i className="fas fa-envelope" style={{color: 'white', fontSize: '20px'}}></i>
                          </div>
                          <div style={{flex: 1}}>
                            <div 
                              style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#666',
                                marginBottom: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              Email
                            </div>
                            <div 
                              style={{
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#333',
                                lineHeight: '1.4'
                              }}
                            >
                              kwenturaproject@gmail.com
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '20px',
                            background: 'rgba(255, 105, 180, 0.05)',
                            borderRadius: '15px',
                            border: '2px solid rgba(255, 105, 180, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 105, 180, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div 
                            style={{
                              width: '50px',
                              height: '50px',
                              background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 4px 15px rgba(255, 105, 180, 0.3)'
                            }}
                          >
                            <i className="fas fa-phone" style={{color: 'white', fontSize: '20px'}}></i>
                          </div>
                          <div style={{flex: 1}}>
                            <div 
                              style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#666',
                                marginBottom: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              Phone
                            </div>
                            <div 
                              style={{
                                fontSize: '16px',
                                fontWeight: '500',
                                color: '#333',
                                lineHeight: '1.4'
                              }}
                            >
                              09686870844 | 09204109969
                            </div>
                          </div>
                        </div>
                        

                      </div>
                    </div>
                  </section>

                  <section style={{marginBottom: '3rem'}}>
                    <div 
                      style={{
                        background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                        borderRadius: '20px',
                        padding: '35px',
                        boxShadow: '0 20px 40px rgba(255, 105, 180, 0.3)',
                        textAlign: 'center',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div 
                        style={{
                          content: '',
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                          animation: 'float 6s ease-in-out infinite'
                        }}
                      ></div>
                      
                      <div 
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '20px'
                        }}
                      >
                        <div 
                          style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          <i className="fas fa-shield-alt" style={{color: 'white', fontSize: '32px'}}></i>
                        </div>
                        
                        <h1 
                          style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            margin: 0,
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          Privacy Commitment
                        </h1>
                        
                        <p style={{ lineHeight: '1.7', margin: 0, fontSize: '1rem' }}>
                          By using the Website, you consent to the terms of this Privacy Policy. 
                          Thank you for trusting <strong>Kwentura</strong> with your information.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '50px',
          height: '50px',
          background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
          border: 'none',
          borderRadius: '50%',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(255, 84, 154, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(255, 84, 154, 0.3)';
        }}
      >
        <i className="fas fa-arrow-up"></i>
      </button>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        html {
          scroll-behavior: smooth;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding-top: 100px !important;
            padding-bottom: 30px !important;
            min-height: 40vh !important;
          }
          
          .main-content {
            padding: 2rem 1.5rem !important;
          }

          .section-number {
            width: 30px !important;
            height: 30px !important;
            font-size: 0.8rem !important;
          }

          h3 {
            font-size: 1.2rem !important;
          }

          .back-to-top {
            bottom: 1rem !important;
            right: 1rem !important;
            width: 45px !important;
            height: 45px !important;
          }

          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 576px) {
          .contact-grid {
            flex-direction: column !important;
          }
          
          .contact-item {
            margin-bottom: 1rem !important;
          }
        }

        @media print {
          .sticky-top, .back-to-top, .mobile-nav {
            display: none !important;
          }
          
          .hero-section {
            min-height: auto !important;
            padding: 1rem 0 !important;
          }
          
          section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }

        button:focus, a:focus {
          outline: 2px solid #FF549A !important;
          outline-offset: 2px !important;
        }

        p, li {
          text-align: justify;
          hyphens: auto;
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;