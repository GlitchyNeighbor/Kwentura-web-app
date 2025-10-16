import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import { Container, Row, Col } from "react-bootstrap";
import "../scss/custom.scss";

const AboutUsNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    // Add fade out effect
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-out';
    
    setTimeout(() => {
      navigate(path);
      // Fade back in after navigation
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 50);
    }, 300);
  };

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
          <button 
            onClick={() => handleNavigation('/')}
            className="nav-link-custom"
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              textDecoration: 'none',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
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
          </button>
          <button 
            onClick={() => handleNavigation('/about')}
            className="nav-link-custom"
            style={{
              background: 'rgba(255, 84, 154, 0.05)',
              border: 'none',
              color: '#FF549A',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            About Us
          </button>
          <button 
            onClick={() => handleNavigation('/contact')}
            className="nav-link-custom"
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              textDecoration: 'none',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
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
          </button>
          <button 
            onClick={() => handleNavigation('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF549A',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 84, 154, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            Login
          </button>
          <button 
            onClick={() => handleNavigation('/signup')}
            style={{
              background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
              color: 'white',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer'
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
          </button>
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
            <button onClick={() => handleNavigation('/')} style={{background: 'none', border: 'none', color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease', textAlign: 'left', cursor: 'pointer'}} className="mobile-nav-link">Home</button>
            <button onClick={() => handleNavigation('/about')} style={{background: 'rgba(255, 84, 154, 0.05)', border: 'none', color: '#FF549A', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease', textAlign: 'left', cursor: 'pointer'}} className="mobile-nav-link">About Us</button>
            <button onClick={() => handleNavigation('/contact')} style={{background: 'none', border: 'none', color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease', textAlign: 'left', cursor: 'pointer'}} className="mobile-nav-link">Contact</button>
            <button onClick={() => handleNavigation('/login')} style={{background: 'none', border: 'none', color: '#FF549A', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease', textAlign: 'left', cursor: 'pointer'}} className="mobile-nav-link">Login</button>
            <button onClick={() => handleNavigation('/signup')} style={{background: 'linear-gradient(135deg, #FF549A, #FF8CC8)', color: 'white', textDecoration: 'none', padding: '0.75rem', borderRadius: '15px', textAlign: 'center', marginTop: '0.5rem', border: 'none', cursor: 'pointer'}}>Sign Up</button>
          </div>
        </div>
      )}
    </header>
  );
};

const AboutUs = () => {
  useEffect(() => {
    // FontAwesome is imported centrally in src/index.js
  }, []);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <AboutUsNavbar />
      
      {/* Hero Section */}
      <section 
        style={{
          background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
          paddingTop: '160px',
          paddingBottom: '4rem'
        }}
      >
        <Container style={{ maxWidth: '1200px' }}>
          <div className="text-center mb-5">
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
                backdropFilter: 'blur(10px)'
              }}
            >
              <i className="fas fa-info-circle me-2"></i>
              About Our Platform
            </div>
            
            <h1 
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '800',
                lineHeight: '1.1',
                background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '1.5rem'
              }}
            >
              Empowering Education Through
              <br />
              Filipino Cultural Stories
            </h1>
            
            <p 
              style={{
                fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
                color: '#666',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              Discover how Kwentura transforms the way teachers share Filipino culture 
              with young learners through our innovative web-based platform.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section style={{ padding: '4rem 0', backgroundColor: 'white' }}>
        <Container style={{ maxWidth: '1200px' }}>
          <Row className="g-4">
            {/* System Overview */}
            <Col lg={6} className="mb-4">
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '2.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 84, 154, 0.1)',
                  height: '100%',
                  boxShadow: '0 8px 25px rgba(255, 84, 154, 0.08)',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
              >
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    color: 'white',
                    fontSize: '1.5rem'
                  }}
                >
                  <i className="fas fa-globe-asia"></i>
                </div>
                <h3 style={{ color: '#FF549A', fontWeight: '700', marginBottom: '1rem', fontSize: '1.4rem' }}>
                  System Overview
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Kwentura is a comprehensive web-based platform designed to support teachers and school 
                  administrators in promoting Filipino culture among Kindergarten to Grade 1 students. 
                  It serves as a digital hub for accessing, organizing, and sharing animated Filipino 
                  storybooks while tracking student engagement and learning outcomes.
                </p>
              </div>
            </Col>

            {/* Target Users */}
            <Col lg={6} className="mb-4">
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '2.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 84, 154, 0.1)',
                  height: '100%',
                  boxShadow: '0 8px 25px rgba(255, 84, 154, 0.08)',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
              >
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    color: 'white',
                    fontSize: '1.5rem'
                  }}
                >
                  <i className="fas fa-users"></i>
                </div>
                <h3 style={{ color: '#FF549A', fontWeight: '700', marginBottom: '1rem', fontSize: '1.4rem' }}>
                  Our Community
                </h3>
                <div style={{ color: '#666', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#FF549A' }}>Primary Users:</strong> Teachers of Kindergarten 
                    to Grade 1 students and school administrators who are passionate about cultural education.
                  </p>
                  <p style={{ marginBottom: '0' }}>
                    Our platform is designed with educators in mind, providing intuitive tools that make 
                    it easy to integrate Filipino cultural content into daily learning activities.
                  </p>
                </div>
              </div>
            </Col>
          </Row>

          {/* Key Features */}
          <Row className="mt-5">
            <Col xs={12}>
              <div className="text-center mb-4">
                <h2 
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: '700',
                    color: '#FF549A',
                    marginBottom: '1rem'
                  }}
                >
                  Key Features
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                  Everything you need to bring Filipino culture to life in your classroom
                </p>
              </div>
              
              <Row className="g-4 mt-2">
                <Col md={4}>
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, #FFF5F8, #FFE8F1)',
                      padding: '2rem',
                      borderRadius: '20px',
                      textAlign: 'center',
                      height: '100%',
                      border: '1px solid rgba(255, 84, 154, 0.1)',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                  >
                    <div 
                      style={{
                        width: '60px',
                        height: '60px',
                        background: '#FF549A',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}
                    >
                      <i className="fas fa-search"></i>
                    </div>
                    <h4 style={{ color: '#FF549A', fontWeight: '700', marginBottom: '1rem', fontSize: '1.2rem' }}>
                      Story Management
                    </h4>
                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                      Access and manage culturally themed Filipino storybooks with easy search and organization tools
                    </p>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, #FFF5F8, #FFE8F1)',
                      padding: '2rem',
                      borderRadius: '20px',
                      textAlign: 'center',
                      height: '100%',
                      border: '1px solid rgba(255, 84, 154, 0.1)',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                  >
                    <div 
                      style={{
                        width: '60px',
                        height: '60px',
                        background: '#FF549A',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}
                    >
                      <i className="fas fa-chalkboard-teacher"></i>
                    </div>
                    <h4 style={{ color: '#FF549A', fontWeight: '700', marginBottom: '1rem', fontSize: '1.2rem' }}>
                      Classroom Integration
                    </h4>
                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                      Share stories and educational resources directly with students through seamless classroom integration
                    </p>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, #FFF5F8, #FFE8F1)',
                      padding: '2rem',
                      borderRadius: '20px',
                      textAlign: 'center',
                      height: '100%',
                      border: '1px solid rgba(255, 84, 154, 0.1)',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                  >
                    <div 
                      style={{
                        width: '60px',
                        height: '60px',
                        background: '#FF549A',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}
                    >
                      <i className="fas fa-user-shield"></i>
                    </div>
                    <h4 style={{ color: '#FF549A', fontWeight: '700', marginBottom: '1rem', fontSize: '1.2rem' }}>
                      Admin Controls
                    </h4>
                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                      Administrative controls for content organization and user access management across your institution
                    </p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Goals & Tech Stack */}
          <Row className="g-4 mt-5">
            <Col lg={6}>
              <div 
                style={{
                  background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                  padding: '2.5rem',
                  borderRadius: '20px',
                  color: 'white',
                  height: '100%'
                }}
              >
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  <i className="fas fa-bullseye" style={{color: 'white'}}></i>
                </div>
                <h3 style={{ fontWeight: '700', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                  Our Mission
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start' }}>
                    <i className="fas fa-heart me-3 mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}></i>
                    <span>Promote Filipino culture through engaging, age-appropriate storybooks</span>
                  </li>
                  <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start' }}>
                    <i className="fas fa-rocket me-3 mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}></i>
                    <span>Empower educators with modern digital tools to enhance student learning</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <i className="fas fa-flag me-3 mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}></i>
                    <span>Foster cultural appreciation and national identity among young learners</span>
                  </li>
                </ul>
              </div>
            </Col>

            <Col lg={6}>
              <div 
                style={{
                  background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                  padding: '2.5rem',
                  borderRadius: '20px',
                  color: 'white',
                  height: '100%'
                }}
              >
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '1.5rem'
                  }}
                >
                  <i className="fas fa-code"></i>
                </div>
                <h3 style={{ fontWeight: '700', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                  Technology Stack
                </h3>
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Frontend:</strong> React, React Bootstrap, React Router
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Backend:</strong> Firebase Services
                  </div>
                  <div>
                    <strong>Database:</strong> Cloud Firestore
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Developer Info */}
          <Row className="mt-5">
            <Col xs={12}>
              <div 
                style={{
                  background: 'linear-gradient(135deg, #FFF5F8, #FFE8F1)',
                  padding: '3rem',
                  borderRadius: '20px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 84, 154, 0.1)'
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
                    fontSize: '2rem'
                  }}
                >
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 style={{ color: '#FF549A', fontWeight: '700', marginBottom: '1rem', fontSize: '1.4rem' }}>
                  About the Developers
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                  <strong>Developed by:</strong> I.Think Team - BSIT-MWA Students of NU-MOA
                </p>
                <div 
                  style={{
                    background: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '15px',
                    display: 'inline-block',
                    boxShadow: '0 4px 15px rgba(255, 84, 154, 0.1)'
                  }}
                >
                  <i className="fas fa-envelope me-2" style={{ color: '#FF549A' }}></i>
                  <a 
                    href="mailto:kwenturaproject@gmail.com"
                    style={{
                      color: '#FF549A',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    kwenturaproject@gmail.com
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
      
      {/* FontAwesome is loaded from local package via import in src/index.js */}
      
      <style jsx>{`
        .mobile-nav-link:hover {
          background: rgba(255, 84, 154, 0.05) !important;
          color: #FF549A !important;
        }

        html {
          scroll-behavior: smooth;
        }

        /* Page transition styles */
        body {
          transition: opacity 0.3s ease-out;
        }
        
        .page-enter {
          opacity: 0;
          transform: translateY(20px);
        }
        
        .page-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }

        @media (max-width: 768px) {
          .hero {
            padding-top: 180px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;