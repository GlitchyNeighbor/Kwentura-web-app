import React, { useState, useEffect } from 'react';
import Footer from "./Footer";
import "../scss/custom.scss";

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
        {/* Logo Section */}
        <div className="d-flex align-items-center" style={{gap: '1rem'}}>
          <div 
            className="logo"
            style={{
              width: '50px',
              height: '50px',
              background: "white",
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
            {/* Logo */}
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
        
        {/* Desktop Navigation */}
        <nav className="d-none d-lg-flex align-items-center" style={{gap: '2rem'}}>
          <a 
            href="/" 
            className="nav-link-custom"
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
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 84, 154, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
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
        
        {/* Mobile Menu Button */}
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
      
      {/* Mobile Menu */}
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
            <a href="/" style={{color: '#FF549A', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease', background: 'rgba(255, 84, 154, 0.05)'}} className="mobile-nav-link">Home</a>
            <a href="/about" style={{color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">About Us</a>
            <a href="/contact" style={{color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">Contact</a>
            <a href="/login" style={{color: '#FF549A', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">Login</a>
            <a href="/signup" style={{background: 'linear-gradient(135deg, #FF549A, #FF8CC8)', color: 'white', textDecoration: 'none', padding: '0.75rem', borderRadius: '15px', textAlign: 'center', marginTop: '0.5rem'}}>Sign Up</a>
          </div>
        </div>
      )}
    </header>
  );
};

const Home = () => {
  useEffect(() => {
    // Load FontAwesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
      link.integrity = 'sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==';
      link.crossOrigin = 'anonymous';
      link.referrerPolicy = 'no-referrer';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <HomeNavbar />
      
      {/* Hero Section */}
      <main 
        className="flex-grow-1 position-relative overflow-hidden d-flex align-items-center"
        style={{
          background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
          paddingTop: '160px',
          minHeight: '100vh'
        }}
      >
        {/* Background decorative elements */}
        <div 
          className="position-absolute floating-shape"
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #FF549A, #FF8CC8)',
            borderRadius: '50%',
            top: '10%',
            right: '10%',
            opacity: '0.6',
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="position-absolute floating-shape"
          style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #FFB6C1, #FFC0CB)',
            borderRadius: '50%',
            bottom: '20%',
            left: '5%',
            opacity: '0.6',
            animation: 'float 4s ease-in-out infinite reverse'
          }}
        ></div>
        <div 
          className="position-absolute floating-shape"
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, #FF69B4, #FF1493)',
            borderRadius: '50%',
            top: '60%',
            right: '20%',
            opacity: '0.6',
            animation: 'float 5s ease-in-out infinite'
          }}
        ></div>

        <div className="container" style={{maxWidth: '1200px', padding: '0 2rem', position: 'relative', zIndex: 10}}>
          <div className="text-center" style={{maxWidth: '800px', margin: '0 auto'}}>
            {/* Hero Badge */}
            <div 
              className="d-inline-flex align-items-center mb-4"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#FF549A',
                border: '2px solid rgba(255, 84, 154, 0.2)',
                backdropFilter: 'blur(10px)',
                animation: 'slideUp 0.8s ease-out'
              }}
            >
              Promoting Filipino Culture Through Education
            </div>
            
            {/* Hero Title */}
            <h1 
              className="mb-4"
              style={{
                fontSize: 'clamp(3rem, 6vw, 5rem)',
                fontWeight: '800',
                lineHeight: '1.1',
                background: 'linear-gradient(135deg, #FF549A, #FF8CC8, #FF549A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'slideUp 0.8s ease-out 0.2s both'
              }}
            >
              Empowering Teachers with
              <br />
              <span style={{color: '#FF549A'}}>Filipino Cultural Stories</span>
            </h1>
            
            {/* Hero Subtitle */}
            <p 
              className="mb-5 text-muted"
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                lineHeight: '1.6',
                animation: 'slideUp 0.8s ease-out 0.4s both'
              }}
            >
              A comprehensive web-based platform where teachers can easily access, organize, and share 
              engaging animated Filipino storybooks with their K-1 students while tracking learning progress.
            </p>
            
            {/* CTA Buttons */}
            <div 
              className="d-flex flex-column flex-sm-row justify-content-center mb-5"
              style={{
                gap: '1rem',
                animation: 'slideUp 0.8s ease-out 0.6s both'
              }}
            >
              <a 
                href="/login" 
                className="btn btn-lg"
                style={{
                  background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                  color: 'white',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 84, 154, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 84, 154, 0.3)';
                }}
              >
                Get Started Today
              </a>
              <a 
                href="/about" 
                className="btn btn-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#FF549A',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  border: '2px solid rgba(255, 84, 154, 0.3)',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#FF549A';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 84, 154, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.color = '#FF549A';
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Learn More
              </a>
            </div>
            
            {/* Features Grid */}
            <div 
              className="row g-4 mt-4 mb-5"
              style={{animation: 'slideUp 0.8s ease-out 0.8s both'}}
            >
              <div className="col-md-4">
                <div 
                  className="feature-card text-center h-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '2rem',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 84, 154, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-10px)';
                    e.target.style.boxShadow = '0 20px 40px rgba(255, 84, 154, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div 
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      color: 'white',
                      fontSize: '2rem',
                      boxShadow: '0 8px 25px rgba(255, 84, 154, 0.3)'
                    }}
                  >
                    <i className="fas fa-book-open"></i>
                  </div>
                  <h3 style={{fontSize: '1.3rem', fontWeight: '700', color: '#FF549A', marginBottom: '1rem'}}>
                    Digital Story Library
                  </h3>
                  <p style={{color: '#666', lineHeight: '1.6'}}>
                    Curate and organize Filipino cultural stories in a digital library that's easy to browse, search, and share with your students
                  </p>
                </div>
              </div>
              
              <div className="col-md-4">
                <div 
                  className="feature-card text-center h-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '2rem',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 84, 154, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-10px)';
                    e.target.style.boxShadow = '0 20px 40px rgba(255, 84, 154, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div 
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      color: 'white',
                      fontSize: '2rem',
                      boxShadow: '0 8px 25px rgba(255, 84, 154, 0.3)'
                    }}
                  >
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <h3 style={{fontSize: '1.3rem', fontWeight: '700', color: '#FF549A', marginBottom: '1rem'}}>
                    Classroom Integration
                  </h3>
                  <p style={{color: '#666', lineHeight: '1.6'}}>
                    Seamlessly share stories with your class and monitor student engagement and learning outcomes in real-time
                  </p>
                </div>
              </div>
              
              <div className="col-md-4">
                <div 
                  className="feature-card text-center h-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '2rem',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 84, 154, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-10px)';
                    e.target.style.boxShadow = '0 20px 40px rgba(255, 84, 154, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div 
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      color: 'white',
                      fontSize: '2rem',
                      boxShadow: '0 8px 25px rgba(255, 84, 154, 0.3)'
                    }}
                  >
                    <i className="fas fa-cloud"></i>
                  </div>
                  <h3 style={{fontSize: '1.3rem', fontWeight: '700', color: '#FF549A', marginBottom: '1rem'}}>
                    Web-Based Management
                  </h3>
                  <p style={{color: '#666', lineHeight: '1.6'}}>
                    Manage your digital classroom from anywhere with cloud-based tools for content organization and student administration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section style={{background: 'white', padding: '4rem 0', borderTop: '1px solid #f0f0f0'}}>
        <div className="container" style={{maxWidth: '1200px', padding: '0 2rem'}}>
          <div className="row text-center g-4">

            <div className="col-6 col-md-3">
              <div style={{fontSize: '3rem', fontWeight: '800', color: '#FF549A', marginBottom: '0.5rem'}}>K-1</div>
              <p style={{color: '#666', fontWeight: '600'}}>Target Grade Levels</p>
            </div>
            
            <div className="col-6 col-md-3">
              <div 
                style={{
                  fontSize: '3rem', 
                  fontWeight: '800', 
                  color: '#FF549A', 
                  marginBottom: '0.5rem',
                }}
              >
                <i className="fas fa-flag" style={{fontSize: '2.5rem'}}></i>
              </div>
              <p style={{color: '#666', fontWeight: '600'}}>Filipino Culture Focus</p>
            </div>

            <div className="col-6 col-md-3">
              <div 
                style={{
                  fontSize: '3rem', 
                  fontWeight: '800', 
                  color: '#FF549A', 
                  marginBottom: '0.5rem',
                }}
              >
                <i className="fas fa-mobile-alt" style={{fontSize: '2.5rem'}}></i>
              </div>
              <p style={{color: '#666', fontWeight: '600'}}>Mobile App Integration</p>
            </div>

            <div className="col-6 col-md-3">
              <div 
                style={{
                  fontSize: '3rem', 
                  fontWeight: '800', 
                  color: '#FF549A', 
                  marginBottom: '0.5rem',
                }}
              >
                <i className="fas fa-user-tie" style={{fontSize: '2.5rem'}}></i>
              </div>
              <p style={{color: '#666', fontWeight: '600'}}>For Educators</p>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{background: 'linear-gradient(135deg, #FF549A, #FF8CC8)', padding: '4rem 0', color: 'white'}}>
        <div className="container text-center" style={{maxWidth: '800px', padding: '0 2rem'}}>
          <h2 style={{fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '700', marginBottom: '1rem'}}>
            Ready to Start Your Cultural Journey?
          </h2>
          <p style={{fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9'}}>
            Join educators across the Philippines in promoting cultural awareness through engaging storytelling
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center" style={{gap: '1rem'}}>
            <a 
              href="/signup" 
              style={{
                background: 'white',
                color: '#FF549A',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '25px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }}
            >
              Create Account
            </a>
            <a 
              href="/contact" 
              style={{
                background: 'transparent',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: '2px solid white',
                borderRadius: '25px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#FF549A';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-nav-link:hover {
          background: rgba(255, 84, 154, 0.05) !important;
          color: #FF549A !important;
        }

        html {
          scroll-behavior: smooth;
        }

        @media (max-width: 768px) {
          .hero {
            padding-top: 180px !important;
          }
          
          .cta-buttons a {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;