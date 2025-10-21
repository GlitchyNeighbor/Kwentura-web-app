import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Modal,
} from "react-bootstrap";
import { auth, db } from '../config/FirebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { Eye, EyeOff, Mail, RefreshCw, Check, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Debounce utility function
const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

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
                  // Logo failed to load: hide the image silently (no console output)
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
            <a href="/contact" style={{color: '#666', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease'}} className="mobile-nav-link">Contact</a>
            <a href="/login" style={{color: '#FF549A', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', transition: 'all 0.3s ease', background: 'rgba(255, 84, 154, 0.05)'}} className="mobile-nav-link">Login</a>
            <a href="/signup" style={{background: 'linear-gradient(135deg, #FF549A, #FF8CC8)', color: 'white', textDecoration: 'none', padding: '0.75rem', borderRadius: '15px', textAlign: 'center', marginTop: '0.5rem'}}>Sign Up</a>
          </div>
        </div>
      )}
    </header>
  );
};

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();
  const [verificationSent, setVerificationSent] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [schoolIdStatus, setSchoolIdStatus] = useState('idle'); // 'idle', 'checking', 'available', 'taken'

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    schoolId: "",
    level: "",
    section: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    setPasswordRequirements(requirements);
    return requirements;
  };

  const checkSchoolIdExists = useCallback(
    debounce(async (schoolId) => {
      if (!schoolId) {
        setSchoolIdStatus('idle');
        return;
      }

      setSchoolIdStatus('checking');
      try {
        let isTaken = false;

        // Query admins (rules currently allow reads on admins)
        try {
          const adminsQuery = query(collection(db, "admins"), where("schoolId", "==", schoolId));
          const adminsSnapshot = await getDocs(adminsQuery);
          if (!adminsSnapshot.empty) isTaken = true;
        } catch (err) {
          // If admins query is denied for some reason, continue silently
          if (err.code && err.code !== 'permission-denied') throw err;
        }

        // Query teachers
                try {
          const teachersQuery = query(collection(db, "teachers"), where("schoolId", "==", schoolId));
          const teachersSnapshot = await getDocs(teachersQuery);
          if (!teachersSnapshot.empty) isTaken = true;
        } catch (err) {
          // If admins query is denied for some reason, continue silently
          if (err.code && err.code !== 'permission-denied') throw err;
        }

        // Query students (rules allow reads on students)
        try {
          const studentsQuery = query(collection(db, "students"), where("schoolId", "==", schoolId));
          const studentsSnapshot = await getDocs(studentsQuery);
          if (!studentsSnapshot.empty) isTaken = true;
        } catch (err) {
          // If students query is denied, continue silently
          if (err.code && err.code !== 'permission-denied') throw err;
        }

        // Query teachers only if there's an authenticated user. The `teachers` collection
        // is restricted in security rules and will throw permission errors for unauthenticated reads.
        if (auth && auth.currentUser) {
          try {
            const teachersQuery = query(collection(db, "teachers"), where("schoolId", "==", schoolId));
            const teachersSnapshot = await getDocs(teachersQuery);
            if (!teachersSnapshot.empty) isTaken = true;
          } catch (err) {
            // If teachers query fails (e.g., permission-denied), continue silently
            if (err.code && err.code !== 'permission-denied') throw err;
          }
        } else {
          // No signed-in user; skip teachers query to avoid expected permission-denied error.
        }

        setSchoolIdStatus(isTaken ? 'taken' : 'available');
      } catch (error) {
        // Error checking school ID; surface friendly message to UI but avoid console output
        // Provide a friendly message for permission issues and avoid spamming the console with uncaught errors
        if (error.code === 'permission-denied') {
          setError("Unable to verify school ID due to security rules. Please contact support if this persists.");
        } else {
          setError("Error checking school ID availability: " + (error.message || error));
        }
        setSchoolIdStatus('idle'); // Revert to idle on error
      }
    }, 500), // Debounce for 500ms
    []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") {
      validatePassword(value);
    }
    if (name === "schoolId") {
      if (value) {
        setSchoolIdStatus('checking');
      } else {
        setSchoolIdStatus('idle');
      }
      checkSchoolIdExists(value);
    }
    if (error) setError("");
  };

  const handleSendVerification = async () => {
    if (!formData.email) {
      setError("Please enter an email address first");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check password requirements
    const passwordReqs = validatePassword(formData.password);
    const allRequirementsMet = Object.values(passwordReqs).every(req => req);
    
    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }

    setVerificationLoading(true);
    setError("");

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      setTempUser(user);

      // Send verification email
      await sendEmailVerification(user);
      
      setVerificationSent(true);
      setShowVerificationModal(true);
      setSuccess("Verification email sent! Please check your inbox and click the verification link.");
      
      // Sign out the user so they can't access the app until verified
      await signOut(auth);
      
    } catch (error) {
      // Sending verification email failed; avoid logging to console
      let errorMessage = "Failed to send verification email.";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email address is already registered. Please try logging in instead.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Please choose a stronger password.";
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

  const checkEmailVerification = async () => {
    if (!tempUser) return;

    setVerificationLoading(true);
    try {
      // Reload the user to get updated emailVerified status
      await tempUser.reload();
      
      if (tempUser.emailVerified) {
        setIsEmailVerified(true);
        setShowVerificationModal(false);
        setSuccess("Email verified successfully! You can now complete your registration.");
        // Sign out again to keep user logged out until full registration is complete
        await signOut(auth);
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (error) {
      // Checking email verification failed; avoid console output
      setError("Error checking verification status. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEmailVerified) {
      setError("Please verify your email address first");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check if school ID is taken
    if (schoolIdStatus === 'taken') {
      setError("The School ID is already taken. Please use a different one.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Add user data to a "pendingTeachers" collection
      // The Firebase user (email/password) is created during email verification (handleSendVerification)
      // We just need to save the additional profile information here.
      // The uid is already stored in tempUser from handleSendVerification.
      if (!tempUser || !tempUser.uid) {
        throw new Error("User not found or UID missing after email verification.");
      }

      await setDoc(doc(db, "pendingTeachers", tempUser.uid), {
        uid: tempUser.uid,
        activeSessionId: null,
        contactNumber: formData.contactNumber,
        createdAt: new Date(),
        email: formData.email,
        firstName: formData.firstName,
        instructionalLevel: formData.level,
        isArchived: false,
        lastName: formData.lastName,
        level: formData.level,
        profileImageUrl: "",
        role: "teacher",
        schoolId: formData.schoolId,
        section: formData.section,
        status: "pending",
        updatedAt: new Date(),
      });

      setSuccess("Account created successfully! Your account is pending approval. You will be redirected to the login page.");

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        contactNumber: "",
        email: "",
        schoolId: "",
        level: "",
        section: "",
        password: "",
      });
      setConfirmPassword("");
      setAgreeToTerms(false);
      setIsEmailVerified(false);
      setVerificationSent(false);
      setTempUser(null);
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 5000); // 5 seconds delay
      
    } catch (error) {
      // Creating account failed; avoid console output
      setError("Failed to create account. Please try again: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className="d-flex align-items-center" style={{fontSize: '0.75rem', marginBottom: '0.25rem'}}>
      {met ? (
        <Check size={10} className="text-success me-1" />
      ) : (
        <X size={10} className="text-danger me-1" />
      )}
      <span className={met ? "text-success" : "text-muted"}>{text}</span>
    </div>
  );

  return (
    <div 
      className="min-vh-100 d-flex flex-column"
      style={{
        background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <HomeNavbar />

      {/* Animated Decorative Circles */}
      <div className="animated-bg-circle circle1"></div>
      <div className="animated-bg-circle circle2"></div>
      <div className="animated-bg-circle circle3"></div>

      {/* Email Verification Modal */}
      <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{color: '#FF549A'}}>
            <Mail className="me-2" size={24} />
            Verify Your Email
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div 
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white'
              }}
            >
              <Mail size={40} />
            </div>
            <h5 style={{color: '#333', marginBottom: '1rem'}}>Check Your Email</h5>
            <p style={{color: '#666', lineHeight: '1.6'}}>
              We've sent a verification link to <strong>{formData.email}</strong>. 
              Please click the link in the email to verify your account.
            </p>
            <div style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginTop: '1rem'}}>
              <small style={{color: '#666'}}>
                <strong>Note:</strong> Check your spam folder if you don't see the email in your inbox.
              </small>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button
            variant="outline-primary"
            onClick={checkEmailVerification}
            disabled={verificationLoading}
            style={{borderColor: '#FF549A', color: '#FF549A'}}
          >
            {verificationLoading ? (
              <>
                <RefreshCw className="me-2" size={16} style={{animation: 'spin 1s linear infinite'}} />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="me-2" size={16} />
                I've Verified My Email
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Content - Single Section */}
      <div 
        className="flex-grow-1 d-flex align-items-center justify-content-center"
        style={{ 
          paddingTop: '80px',
          paddingBottom: '1rem',
          padding: '80px 1rem 1rem',
          position: 'relative',
          zIndex: 2
        }}
      >
        <Container style={{ maxWidth: '1300px', height: '100%' }}>
          <Row className="h-100 align-items-center">
            {/* Left Column - Welcome Text */}
            <Col lg={5} className="d-none d-lg-block">
              <div style={{paddingRight: '2rem'}}>
                <div 
                  className="d-inline-flex align-items-center mb-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#FF549A',
                    border: '1px solid rgba(255, 84, 154, 0.2)',
                  }}
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Join Our Community
                </div>
                
                <h1 
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    lineHeight: '1.2',
                    background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '1rem'
                  }}
                >
                  Create Your Teacher Account
                </h1>
                
                <p 
                  style={{
                    fontSize: '1.1rem',
                    color: '#666',
                    lineHeight: '1.6',
                    marginBottom: '2rem'
                  }}
                >
                  Start your journey in Filipino storytelling education and inspire young minds with engaging content.
                </p>

                <div style={{opacity: 0.7}}>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    <span style={{color: '#666', fontSize: '0.9rem'}}>Interactive learning tools</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    <span style={{color: '#666', fontSize: '0.9rem'}}>Rich Filipino story collection</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    <span style={{color: '#666', fontSize: '0.9rem'}}>Student progress tracking</span>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Column - Form */}
            <Col lg={7} xs={12}>
              <div className="text-center d-lg-none mb-3">
                <h2 
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.5rem'
                  }}
                >
                  Teacher Registration
                </h2>
              </div>

              {/* Alerts */}
              {error && (
                <Alert variant="danger" className="mb-3" style={{borderRadius: '8px', padding: '0.75rem', fontSize: '0.9rem'}}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-3" style={{borderRadius: '8px', padding: '0.75rem', fontSize: '0.9rem'}}>
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </Alert>
              )}

              {/* Form Card */}
              <div
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(255, 84, 154, 0.1)',
                  border: '1px solid rgba(255, 84, 154, 0.1)',
                  maxHeight: 'calc(100vh - 160px)',
                  overflow: 'auto'
                }}
              >
                <div className="d-none d-lg-block text-center mb-3">
                  <div 
                    style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      color: 'white',
                      fontSize: '1.25rem',
                      boxShadow: '0 8px 25px rgba(255, 84, 154, 0.3)'
                    }}
                  >
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <h4 style={{color: '#FF549A', fontWeight: '600', marginBottom: '0.5rem'}}>
                    Teacher Registration
                  </h4>
                  <p style={{color: '#666', fontSize: '0.9rem', margin: 0}}>
                    Fill in your information to create your account
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* Name Fields */}
                  <Row className="mb-3">
                    <Col xs={6}>
                      <Form.Label style={{fontSize: '0.85rem', fontWeight: '600', color: '#333'}}>
                        First Name *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="First name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        style={{
                          borderRadius: '8px',
                          padding: '0.6rem',
                          fontSize: '0.9rem',
                          borderColor: '#e9ecef',
                          borderWidth: '1px'
                        }}
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Label style={{fontSize: '0.85rem', fontWeight: '600', color: '#333'}}>
                        Last Name *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Last name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        style={{
                          borderRadius: '8px',
                          padding: '0.6rem',
                          fontSize: '0.9rem',
                          borderColor: '#e9ecef',
                          borderWidth: '1px'
                        }}
                      />
                    </Col>
                  </Row>

                  {/* Contact and Email */}
                  <Row className="mb-3">
                    <Col xs={6}>
                      <Form.Label style={{fontSize: '0.85rem', fontWeight: '600', color: '#333'}}>
                        Contact Number
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Contact number"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        style={{
                          borderRadius: '8px',
                          padding: '0.6rem',
                          fontSize: '0.9rem',
                          borderColor: '#e9ecef',
                          borderWidth: '1px'
                        }}
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Label style={{fontSize: '0.85rem', fontWeight: '600', color: '#333'}}>
                        Email Address *
                      </Form.Label>
                      <div className="d-flex gap-1">
                        <Form.Control
                          type="email"
                          placeholder="Email address"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={verificationSent || isEmailVerified}
                          style={{
                            borderRadius: '8px',
                            padding: '0.6rem',
                            fontSize: '0.9rem',
                            borderColor: isEmailVerified ? '#28a745' : '#e9ecef',
                            borderWidth: '1px',
                            backgroundColor: (verificationSent || isEmailVerified) ? "#f8f9fa" : "white",
                          }}
                        />
                        <Button
                          variant={isEmailVerified ? "success" : "outline-primary"}
                          size="sm"
                          onClick={handleSendVerification}
                          disabled={verificationLoading || verificationSent || isEmailVerified}
                          style={{ 
                            minWidth: "80px",
                            fontSize: '0.8rem',
                            borderRadius: '6px',
                            borderColor: '#FF549A',
                            color: isEmailVerified ? 'white' : '#FF549A'
                          }}
                        >
                          {verificationLoading ? (
                            <RefreshCw size={12} style={{animation: 'spin 1s linear infinite'}} />
                          ) : isEmailVerified ? (
                            <>
                              <Check size={12} className="me-1" />
                              Verified
                            </>
                          ) : verificationSent ? (
                            "Sent"
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                      {verificationSent && !isEmailVerified && (
                        <small className="text-muted mt-1 d-block">
                          Check your email and click the verification link
                        </small>
                      )}
                    </Col>
                  </Row>

                  {/* School ID */}
                  <Form.Group className="mb-3">
                    <Form.Label style={{fontSize: '0.85rem', fontWeight: '600', color: '#333'}}>
                      School ID *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your School ID"
                      name="schoolId"
                      value={formData.schoolId}
                      onChange={handleInputChange}
                      required
                      style={{
                        borderRadius: '8px',
                        padding: '0.6rem',
                        fontSize: '0.9rem',
                        borderColor: schoolIdStatus === 'taken' ? '#dc3545' : '#e9ecef',
                        borderWidth: '1px'
                      }}
                    />
                    {schoolIdStatus === 'checking' && (
                      <small className="text-muted">Checking availability...</small>
                    )}
                    {schoolIdStatus === 'taken' && (
                      <small className="text-danger">This School ID is already taken.</small>
                    )}
                    {schoolIdStatus === 'available' && (
                      <small className="text-success">School ID is available.</small>
                    )}
                  </Form.Group>

                  {/* Level and Section */}
                  <Row className="mb-3">
                    <Col xs={6}>
                      <Form.Label style={{fontSize: '0.85rem', fontWeight: '600', color: '#333'}}>
                        Level
                      </Form.Label>
                      <Form.Select
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        style={{
                          borderRadius: '8px',
                          padding: '0.6rem',
                          fontSize: '0.9rem',
                          borderColor: '#e9ecef',
                          borderWidth: '1px'
                        }}
                      >
                        <option value="">Select Level</option>
                        <option value="Kinder 1">Kinder 1</option>
                        <option value="Kinder 2">Kinder 2</option>
                        <option value="Grade 1">Grade 1</option>
                      </Form.Select>
                    </Col>
                    <Col xs={6}>
                      <Form.Label style={{fontSize: '0.85rem', fontWeight: '600', color: '#333'}}>
                        Section *
                      </Form.Label>
                      <Form.Select
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        required
                        style={{
                          borderRadius: '8px',
                          padding: '0.6rem',
                          fontSize: '0.9rem',
                          borderColor: '#e9ecef',
                          borderWidth: '1px'
                        }}
                      >
                        <option value="">Select Section</option>
                        <option value="INF225">INF225</option>
                        <option value="INF226">INF226</option>
                        <option value="INF227">INF227</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  {/* Password Fields */}
                  <Row className="mb-3">
                    <Col xs={6}>
                      <Form.Label style={{fontSize: '0.85rem', fontWeight: '600', color: '#333'}}>
                        Password *
                      </Form.Label>
                      <div style={{ position: "relative" }}>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          style={{
                            paddingRight: "2.5rem",
                            borderRadius: '8px',
                            padding: '0.6rem',
                            fontSize: '0.9rem',
                            borderColor: '#e9ecef',
                            borderWidth: '1px',
                            backgroundColor: (!verificationSent && !isEmailVerified) ? "#f8f9fa" : "white"
                          }}
                        />
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "0.5rem",
                            transform: "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            padding: 0,
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={16} color="#FF549A" />
                          ) : (
                            <Eye size={16} color="#666" />
                          )}
                        </Button>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <Form.Label style={{fontSize: '0.85rem', fontWeight: '600', color: '#333'}}>
                        Confirm Password *
                      </Form.Label>
                      <div style={{ position: "relative" }}>
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          style={{
                            paddingRight: "2.5rem",
                            borderRadius: '8px',
                            padding: '0.6rem',
                            fontSize: '0.9rem',
                            borderColor: '#e9ecef',
                            borderWidth: '1px',
                            backgroundColor: (!verificationSent && !isEmailVerified) ? "#f8f9fa" : "white"
                          }}
                        />
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "0.5rem",
                            transform: "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            padding: 0,
                          }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} color="#FF549A" />
                          ) : (
                            <Eye size={16} color="#666" />
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {/* Password Requirements */}
                  {formData.password && (
                    <div
                      className="mb-3 p-2 border rounded"
                      style={{ 
                        backgroundColor: "#f8f9fa",
                        borderRadius: '6px !important',
                        borderColor: '#e9ecef'
                      }}
                    >
                      <div style={{fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: '#666'}}>
                        Password Requirements:
                      </div>
                      <Row>
                        <Col xs={6}>
                          <PasswordRequirement
                            met={passwordRequirements.minLength}
                            text="6+ characters"
                          />
                          <PasswordRequirement
                            met={passwordRequirements.hasUppercase}
                            text="Uppercase letter"
                          />
                        </Col>
                        <Col xs={6}>
                          <PasswordRequirement
                            met={passwordRequirements.hasNumber}
                            text="Number"
                          />
                          <PasswordRequirement
                            met={passwordRequirements.hasSymbol}
                            text="Symbol"
                          />
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className="mb-3">
                      <small className={formData.password === confirmPassword ? "text-success" : "text-danger"}>
                        <i className={`fas ${formData.password === confirmPassword ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                        {formData.password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                      </small>
                    </div>
                  )}

                  {/* Terms Checkbox */}
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="terms-checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      required
                      style={{ fontSize: '0.85rem' }}
                      label={
                        <>
                          I agree to the{" "}
                          <a href="/terms" style={{ color: "#FF549A", textDecoration: "none" }}>
                            Terms and Conditions
                          </a>{" "}
                          and{" "}
                          <a href="/privacy" style={{ color: "#FF549A", textDecoration: "none" }}>
                            Privacy Policy
                          </a>
                        </>
                      }
                    />
                  </Form.Group>

                  {/* Email Verification Notice */}
                  {!isEmailVerified && (
                    <div 
                      className="mb-3 p-3 border rounded"
                      style={{
                        backgroundColor: '#fff3cd',
                        borderColor: '#ffeaa7',
                        borderRadius: '8px'
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <Mail size={18} className="text-warning me-2" />
                        <div>
                          <small style={{fontWeight: '600', color: '#856404'}}>
                            Email Verification Required
                          </small>
                          <br />
                          <small style={{color: '#856404'}}>
                            Please verify your email address before completing registration
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      style={{
                        flex: 1,
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                      onClick={() => window.location.href = '/login'}
                    >
                      Back to Login
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading || !isEmailVerified || !agreeToTerms || schoolIdStatus === 'taken'}
                      style={{
                        flex: 1,
                        background: (loading || !isEmailVerified || !agreeToTerms) ? '#ccc' : 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-1"></i>
                          Creating Account...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Login Link */}
                <div className="text-center mt-3">
                  <small style={{ color: '#666' }}>
                    Already have an account?{" "}
                    <a href="/login" style={{ color: "#FF549A", textDecoration: "none", fontWeight: "600" }}>
                      Sign in here
                    </a>
                  </small>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      <style jsx>{`
        /* Animated circles for background */
        .animated-bg-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.13;
          z-index: 1;
        }
        .circle1 {
          width: 110px;
          height: 110px;
          top: 18%;
          right: 8%;
          background: linear-gradient(135deg, #FF549A, #FF8CC8);
          animation: floatCircle 6s ease-in-out infinite;
        }
        .circle2 {
          width: 85px;
          height: 85px;
          bottom: 12%;
          left: 5%;
          background: linear-gradient(135deg, #FFB6C1, #FFC0CB);
          animation: floatCircle 4.5s ease-in-out infinite reverse;
        }
        .circle3 {
          width: 65px;
          height: 65px;
          top: 66%;
          left: 15%;
          background: linear-gradient(135deg, #FF8CC8, #FFB6C1);
          opacity: 0.09;
          animation: floatCircle 5s ease-in-out infinite;
        }

        @keyframes floatCircle {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
          40% { transform: translateY(-18px) scale(1.08) rotate(15deg); }
          60% { transform: translateY(12px) scale(0.97) rotate(-10deg);}
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #FF549A !important;
          box-shadow: 0 0 0 0.2rem rgba(255, 84, 154, 0.25) !important;
          outline: none !important;
        }

        .form-check-input:checked {
          background-color: #FF549A !important;
          border-color: #FF549A !important;
        }

        .form-check-input:focus {
          border-color: #FF549A !important;
          box-shadow: 0 0 0 0.2rem rgba(255, 84, 154, 0.25) !important;
        }

        @media (max-width: 991px) {
          .container {
            padding: 0.5rem !important;
          }
        }

        @media (max-width: 576px) {
          .d-flex.gap-2 {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          .btn {
            width: 100% !important;
          }
        }

        body, html {
          overflow-x: hidden;
        }

        .fa-spin {
          animation: fa-spin 1s infinite linear;
        }

        @keyframes fa-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Signup;