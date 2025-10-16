import React, { useRef, useState, useEffect } from "react";
import emailjs from "emailjs-com";
import Footer from "./Footer";
import { Container, Button, Row, Col, Alert } from "react-bootstrap";
import "../scss/custom.scss";

const SERVICE_ID = "service_mdyi9bl";
const TEMPLATE_ID = "template_3g6gr9v";
const PUBLIC_KEY = "f-8NnHoqoAVbarJGE";

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
              color: '#FF549A',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              background: 'rgba(255, 84, 154, 0.05)'
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
            <a href="/" style={{color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">Home</a>
            <a href="/about" style={{color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">About Us</a>
            <a href="/contact" style={{color: '#FF549A', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease', background: 'rgba(255, 84, 154, 0.05)'}} className="mobile-nav-link">Contact</a>
            <a href="/login" style={{color: '#FF549A', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">Login</a>
            <a href="/signup" style={{background: 'linear-gradient(135deg, #FF549A, #FF8CC8)', color: 'white', textDecoration: 'none', padding: '0.75rem', borderRadius: '15px', textAlign: 'center', marginTop: '0.5rem'}}>Sign Up</a>
          </div>
        </div>
      )}
    </header>
  );
};

const Contact = () => {
  const formRef = useRef();
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: "", message: "" });

  useEffect(() => {
    // FontAwesome is imported centrally in src/index.js
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setAlert({ show: false, variant: "", message: "" });

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
      .then(
        (result) => {
          setAlert({ 
            show: true, 
            variant: "success", 
            message: "Message sent successfully! We'll get back to you soon." 
          });
          setSending(false);
          formRef.current.reset();
          
          setTimeout(() => {
            setAlert({ show: false, variant: "", message: "" });
          }, 5000);
        },
        (error) => {
          setAlert({ 
            show: true, 
            variant: "danger", 
            message: "Failed to send message. Please try again later." 
          });
          setSending(false);
        }
      );
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <HomeNavbar />

      {/* Hero Section */}
      <section 
        className="d-flex align-items-center justify-content-center"
        style={{
          background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
          minHeight: '50vh',
          paddingTop: '160px',
          paddingBottom: '80px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorative elements */}
        <div 
          className="position-absolute"
          style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, #FF549A, #FF8CC8)',
            borderRadius: '50%',
            top: '15%',
            right: '10%',
            opacity: '0.1',
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="position-absolute"
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #FFB6C1, #FFC0CB)',
            borderRadius: '50%',
            bottom: '10%',
            left: '5%',
            opacity: '0.1',
            animation: 'float 4s ease-in-out infinite reverse'
          }}
        ></div>

        <Container style={{ maxWidth: '1200px', position: 'relative', zIndex: 10 }}>
          <div className="text-center d-flex flex-column align-items-center justify-content-center">
            <div 
              className="d-inline-flex align-items-center mb-3"
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
              <i className="fas fa-envelope me-2"></i>
              Contact Us
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
                marginBottom: '1rem'
              }}
            >
              Get In Touch
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
              Have questions about Kwentura? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Contact Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'white' }}>
        <Container style={{ maxWidth: '1200px' }}>
          <Row className="g-5 align-items-start">
            {/* Contact Info Section */}
            <Col lg={5}>
              <div className="pe-lg-4">
                <h2 
                  style={{
                    color: '#FF549A',
                    fontWeight: '700',
                    fontSize: '2rem',
                    marginBottom: '1rem'
                  }}
                >
                  Let's Start a Conversation
                </h2>
                <p 
                  style={{
                    color: '#666',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    marginBottom: '2.5rem'
                  }}
                >
                  Whether you're a teacher interested in using Kwentura, a school administrator, 
                  or just curious about our platform, we're here to help answer your questions.
                </p>

                {/* Contact Details */}
                <div className="d-flex flex-column gap-4">
                  <div 
                    className="d-flex align-items-start p-3"
                    style={{
                      background: 'linear-gradient(135deg, #FFF5F8, #FFE8F1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 84, 154, 0.1)',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                        boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)'
                      }}
                    >
                      <i className="fas fa-envelope" style={{ color: 'white', fontSize: '1.2rem' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <p
                        className="fw-bold mb-1"
                        style={{
                          color: '#FF549A',
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Email Address
                      </p>
                      <p
                        className="mb-0"
                        style={{ 
                          color: '#333',
                          fontSize: '1rem',
                          fontWeight: '500'
                        }}
                      >
                        kwenturaproject@gmail.com
                      </p>
                      <p
                        className="mb-0"
                        style={{ 
                          color: '#666',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem'
                        }}
                      >
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </div>

                  <div 
                    className="d-flex align-items-start p-3"
                    style={{
                      background: 'linear-gradient(135deg, #FFF5F8, #FFE8F1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 84, 154, 0.1)',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                        boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)'
                      }}
                    >
                      <i className="fas fa-phone" style={{ color: 'white', fontSize: '1.2rem' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <p
                        className="fw-bold mb-1"
                        style={{
                          color: '#FF549A',
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Phone Numbers
                      </p>
                      <p className="mb-0" style={{ color: '#333', fontSize: '1rem', fontWeight: '500' }}>
                        09686870844
                      </p>
                      <p className="mb-0" style={{ color: '#333', fontSize: '1rem', fontWeight: '500' }}>
                        09204109969
                      </p>
                      <p
                        className="mb-0"
                        style={{ 
                          color: '#666',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem'
                        }}
                      >
                        Available Monday to Friday, 9AM-5PM
                      </p>
                    </div>
                  </div>

                  <div 
                    className="d-flex align-items-start p-3"
                    style={{
                      background: 'linear-gradient(135deg, #FFF5F8, #FFE8F1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 84, 154, 0.1)',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                        boxShadow: '0 4px 15px rgba(255, 84, 154, 0.3)'
                      }}
                    >
                      <i className="fas fa-graduation-cap" style={{ color: 'white', fontSize: '1.2rem' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <p
                        className="fw-bold mb-1"
                        style={{
                          color: '#FF549A',
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Development Team
                      </p>
                      <p className="mb-0" style={{ color: '#333', fontSize: '1rem', fontWeight: '500' }}>
                        I.Think Team
                      </p>
                      <p
                        className="mb-0"
                        style={{ 
                          color: '#666',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem'
                        }}
                      >
                        BSIT-MWA Students of NU-MOA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* Form Section */}
            <Col lg={7}>
              <div
                style={{
                  background: 'white',
                  padding: '3rem',
                  borderRadius: '20px',
                  boxShadow: '0 20px 50px rgba(255, 84, 154, 0.1)',
                  border: '1px solid rgba(255, 84, 154, 0.1)',
                  position: 'relative'
                }}
              >
                {/* Form Header */}
                <div className="text-center mb-4">
                  <div 
                    style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      color: 'white',
                      fontSize: '1.5rem',
                      boxShadow: '0 8px 25px rgba(255, 84, 154, 0.3)'
                    }}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <h3
                    style={{
                      color: '#FF549A',
                      fontSize: '1.8rem',
                      fontWeight: '700',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Send us a Message
                  </h3>
                  <p style={{ color: '#666', fontSize: '1rem' }}>
                    Fill out the form below and we'll get back to you soon
                  </p>
                </div>

                {alert.show && (
                  <Alert 
                    variant={alert.variant} 
                    onClose={() => setAlert({ show: false })} 
                    dismissible
                    style={{
                      borderRadius: '12px',
                      border: 'none',
                      marginBottom: '2rem'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <i className={`fas ${alert.variant === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                      {alert.message}
                    </div>
                  </Alert>
                )}

                <form ref={formRef} onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label 
                      htmlFor="fullName" 
                      className="form-label"
                      style={{ 
                        color: '#333', 
                        fontWeight: '600', 
                        fontSize: '0.95rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      name="fullName"
                      required
                      style={{ 
                        borderWidth: '2px',
                        borderColor: '#e9ecef',
                        borderRadius: '12px',
                        padding: '0.8rem 1rem',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF549A';
                        e.target.style.boxShadow = '0 0 0 0.2rem rgba(255, 84, 154, 0.25)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <label 
                        htmlFor="contactNumber" 
                        className="form-label"
                        style={{ 
                          color: '#333', 
                          fontWeight: '600', 
                          fontSize: '0.95rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="contactNumber"
                        name="contact_number"
                        required
                        style={{ 
                          borderWidth: '2px',
                          borderColor: '#e9ecef',
                          borderRadius: '12px',
                          padding: '0.8rem 1rem',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF549A';
                          e.target.style.boxShadow = '0 0 0 0.2rem rgba(255, 84, 154, 0.25)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </Col>
                    <Col md={6}>
                      <label 
                        htmlFor="email" 
                        className="form-label"
                        style={{ 
                          color: '#333', 
                          fontWeight: '600', 
                          fontSize: '0.95rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        required
                        style={{ 
                          borderWidth: '2px',
                          borderColor: '#e9ecef',
                          borderRadius: '12px',
                          padding: '0.8rem 1rem',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF549A';
                          e.target.style.boxShadow = '0 0 0 0.2rem rgba(255, 84, 154, 0.25)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </Col>
                  </Row>

                  <div className="mb-4">
                    <label 
                      htmlFor="subject" 
                      className="form-label"
                      style={{ 
                        color: '#333', 
                        fontWeight: '600', 
                        fontSize: '0.95rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      name="subject"
                      required
                      style={{ 
                        borderWidth: '2px',
                        borderColor: '#e9ecef',
                        borderRadius: '12px',
                        padding: '0.8rem 1rem',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF549A';
                        e.target.style.boxShadow = '0 0 0 0.2rem rgba(255, 84, 154, 0.25)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label 
                      htmlFor="message" 
                      className="form-label"
                      style={{ 
                        color: '#333', 
                        fontWeight: '600', 
                        fontSize: '0.95rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Message *
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows="5"
                      required
                      placeholder="Tell us how we can help you..."
                      style={{ 
                        borderWidth: '2px',
                        borderColor: '#e9ecef',
                        borderRadius: '12px',
                        padding: '0.8rem 1rem',
                        fontSize: '1rem',
                        resize: 'vertical',
                        minHeight: '120px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF549A';
                        e.target.style.boxShadow = '0 0 0 0.2rem rgba(255, 84, 154, 0.25)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.boxShadow = 'none';
                      }}
                    ></textarea>
                  </div>

                  <Button
                    type="submit"
                    className="w-100"
                    disabled={sending}
                    style={{
                      background: sending ? '#ccc' : 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '1rem 2rem',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      boxShadow: sending ? 'none' : '0 4px 15px rgba(255, 84, 154, 0.3)',
                      cursor: sending ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!sending) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(255, 84, 154, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!sending) {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = '0 4px 15px rgba(255, 84, 154, 0.3)';
                      }
                    }}
                  >
                    {sending ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />

      {/* FontAwesome is loaded from local package via import in src/index.js */}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .form-control:focus {
          outline: none !important;
        }

        @media (max-width: 768px) {
          .contact-hero {
            padding-top: 100px !important;
            padding-bottom: 60px !important;
            min-height: 45vh !important;
          }
        }

        .mobile-nav-link:hover {
          background: rgba(255, 84, 154, 0.05) !important;
          color: #FF549A !important;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default Contact;