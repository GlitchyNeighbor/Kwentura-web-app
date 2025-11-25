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

const TermsAndConditions = () => {
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

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const tableOfContents = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'eligibility', title: '2. Eligibility for Registration' },
    { id: 'registration', title: '3. Account Registration' },
    { id: 'restrictions', title: '4. Restrictions on Use' },
    { id: 'privacy', title: '5. Data Privacy and Security' },
    { id: 'intellectual', title: '6. Intellectual Property' },
    { id: 'termination', title: '7. Account Suspension and Termination' },
    { id: 'modifications', title: '8. Modifications to Terms' },
    { id: 'liability', title: '9. Limitation of Liability' },
    { id: 'governing', title: '10. Governing Law and Dispute Resolution' },
    { id: 'contact', title: '11. Contact Information' }
  ];

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
            <i className="fas fa-file-contract" style={{marginRight: '0.5rem'}}></i>
            Legal Information
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
            Terms & Conditions
          </h1>
          
          <p 
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              color: '#666',
              lineHeight: '1.6',
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            Please read these terms carefully before using Kwentura
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
                      Welcome to the <strong>Kwentura</strong> website. The following Terms and Conditions 
                      govern your use of the Website, and by accessing or using the Website, 
                      you agree to comply with these Terms. If you do not agree to these 
                      Terms, please refrain from using the Website.
                    </p>
                    <p style={{ color: '#666', lineHeight: '1.7', margin: '1rem 0 0 0', fontWeight: '600' }}>
                      Please read these Terms carefully.
                    </p>
                  </div>
                </div>

                <div className="terms-content">
                  <section data-section="acceptance" style={{marginBottom: '3rem'}}>
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
                        ACCEPTANCE OF TERMS
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      By accessing or using the Website, you acknowledge that you have read, 
                      understood, and agree to be bound by these Terms and Conditions. If 
                      you do not agree with these Terms, you are not authorized to use the 
                      Website.
                    </p>
                  </section>

                  <section data-section="eligibility" style={{marginBottom: '3rem'}}>
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
                        ELIGIBILITY FOR REGISTRATION
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      You may only register for and use the Website if you meet the following criteria:
                    </p>
                    <ul style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', paddingLeft: '1.5rem' }}>
                      <li style={{ marginBottom: '0.5rem' }}>You are a teacher at Monlimar Development Academy.</li>
                      <li>You cannot use or register for the website if you are not a teacher at Monlimar Development Academy.</li>
                    </ul>
                  </section>

                  <section data-section="registration" style={{marginBottom: '3rem'}}>
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
                        ACCOUNT REGISTRATION
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      To use the Website, you must complete the registration process. You are required to provide the following information:
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
                      <strong style={{ color: '#FF549A' }}>Teacher Information:</strong> First Name, Last Name, Email Address, Phone Number, Employee ID, Instructional Level, and Section.
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      You agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
                    </p>
                  </section>

                  <section data-section="restrictions" style={{marginBottom: '3rem'}}>
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
                        RESTRICTIONS ON USE
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      You may not use the Website to:
                    </p>
                    <ul style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', paddingLeft: '1.5rem' }}>
                      <li style={{ marginBottom: '0.5rem' }}>Register if you're not a teacher at Monlimar Development Academy.</li>
                      <li style={{ marginBottom: '0.5rem' }}>Engage in illegal activities, including but not limited to fraud, data theft, or harassment.</li>
                      <li style={{ marginBottom: '0.5rem' }}>Violate any applicable local, state, or national laws or regulations.</li>
                    </ul>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      We reserve the right to suspend or terminate any account found in violation of these restrictions.
                    </p>
                  </section>

                  <section data-section="privacy" style={{marginBottom: '3rem'}}>
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
                        DATA PRIVACY AND SECURITY
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      We are committed to protecting your privacy. The personal information you provide during the registration process is collected and stored securely. We will use your data solely for the purposes of operating the Website and providing related services. We will not share your personal information with third parties without your consent, unless required by law.
                    </p>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      All data is handled in compliance with applicable data protection laws, including the <strong>Data Privacy Act of 2012 of the Republic of the Philippines</strong>.
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
                        For further details, please refer to our <strong style={{ color: '#FF549A' }}>Privacy Policy</strong>.
                      </p>
                    </div>
                  </section>

                  <section data-section="intellectual" style={{marginBottom: '3rem'}}>
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
                        INTELLECTUAL PROPERTY
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      The Website and all its contents, including but not limited to text, graphics, logos, images, software, and designs, are the exclusive intellectual property of the student developers of <strong>"I.Think"</strong> from the <strong>NU MOA Group</strong> and <strong>Monlimar Development Academy</strong>. You are granted a limited, non-transferable license to access and use the Website for personal, non-commercial purposes. Any unauthorized use or reproduction of the content is prohibited.
                    </p>
                  </section>

                  <section data-section="termination" style={{marginBottom: '3rem'}}>
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
                        ACCOUNT SUSPENSION AND TERMINATION
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      We reserve the right, at our sole discretion, to suspend or terminate your account and access to the Website at any time, with or without notice, for any reason, including without limitation if we believe that you have violated these Terms. Upon termination, you must immediately cease all use of the Website.
                    </p>
                  </section>

                  <section data-section="modifications" style={{marginBottom: '3rem'}}>
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
                        MODIFICATIONS TO THE TERMS AND CONDITIONS
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      We may update these Terms at any time, and such changes will be effective immediately upon posting the revised Terms on the Website. You are encouraged to review these Terms periodically. Your continued use of the Website after any changes constitutes your acceptance of the modified Terms.
                    </p>
                  </section>

                  <section data-section="liability" style={{marginBottom: '3rem'}}>
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
                        LIMITATION OF LIABILITY
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1rem' }}>
                      To the fullest extent permitted by law, <strong>Monlimar Development Academy</strong> and the developers of the Website shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or revenue arising out of your use or inability to use the Website.
                    </p>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      We are not liable for any technical issues, interruptions, or unauthorized access to your account, or for any losses that may result from such incidents.
                    </p>
                  </section>

                  <section data-section="governing" style={{marginBottom: '3rem'}}>
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
                        10
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        GOVERNING LAW AND DISPUTE RESOLUTION
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem' }}>
                      These Terms and Conditions are governed by and construed in accordance with the laws of the <strong>Republic of the Philippines</strong>. Any disputes arising from or in connection with these Terms shall be resolved through binding arbitration, in accordance with the rules of the <strong>Philippine Dispute Resolution Center, Inc. (PDRCI)</strong>.
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
                        11
                      </div>
                      <h3 style={{ color: '#333', fontWeight: '700', margin: 0, fontSize: '1.4rem' }}>
                        CONTACT INFORMATION
                      </h3>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1.5rem' }}>
                      If you have any questions or concerns about these Terms, please contact us at:
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
                          <i className="fas fa-handshake" style={{color: 'white', fontSize: '32px'}}></i>
                        </div>
                        
                        <h1 
                          style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            margin: 0,
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          Agreement Acknowledgment
                        </h1>
                        
                        <p style={{ lineHeight: '1.7', margin: 0, fontSize: '1rem' }}>
                          By registering and using the Website, you acknowledge that you have read, 
                          understood, and agreed to these Terms and Conditions. Thank you for using 
                          the <strong>Kwentura Website</strong>.
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

export default TermsAndConditions;