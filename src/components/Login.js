import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"; 
import { db } from "../config/FirebaseConfig.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut, 
} from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";

import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import "../css/custom.css";
import { Link } from "react-router-dom";

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

const Login = () => {
  const [formData, setFormData] = useState({
    schoolId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false); 
  const location = useLocation();

  useEffect(() => {
    
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const collectionsToSearch = [
            { name: "admins", defaultRole: "admin" },
            { name: "teachers", defaultRole: "teacher" },
          ];
          let userRole = null;
          const userEmail = user.email; 

          for (const {
            name: collectionName,
            defaultRole,
          } of collectionsToSearch) {
            const q = query(
              collection(db, collectionName),
              where("email", "==", userEmail) 
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const docSnap = querySnapshot.docs[0];
              const userData = docSnap.data();
              userRole = userData.role || defaultRole;
              break;
            }
          }

          if (userRole) {
            if (
              userRole === "admin" ||
              userRole === "superAdmin" ||
              userRole === "superadmin"
            ) {
              navigate("/admin/dashboard", { replace: true });
            } else if (userRole === "teacher") {
              navigate("/teacher/dashboard", { replace: true });
            } else {
              setAuthCheckLoading(false);
            } 
          } else {
            setAuthCheckLoading(false);
          } 
        } catch (err) {
          console.error("Error redirecting authenticated user:", err);
          setAuthCheckLoading(false); 
        }
      } else {
        setAuthCheckLoading(false);
      }
    });

    return () => unsubscribe(); 
  }, [navigate]);

  useEffect(() => {
    if (location.state?.signupSuccess && location.state?.message) {
      setInfoAlert(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { schoolId, password } = formData;
      if (!schoolId || !password) {
        setError("Please enter both School ID and Password");
        setLoading(false);
        return;
      }

      const collectionsToSearch = [
        { name: "admins", defaultRole: "admin" },
        { name: "teachers", defaultRole: "teacher" },
        { name: "pendingTeachers", defaultRole: "teacher" },
      ];

      let userData = null;
      let userRole = null;
      let userEmail = null;
      let userDbCollectionName = ""; 

      for (const { name: collectionName, defaultRole } of collectionsToSearch) {
        const q = query(
          collection(db, collectionName),
          where("schoolId", "==", schoolId)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          userData = docSnap.data();
          userRole = userData.role || defaultRole;
          userEmail = userData.email;
          userDbCollectionName = collectionName; 
          break;
        }
      }

      if (!userData || !userEmail) {
        setError("Wrong School ID or Password. Please try again.");
        setLoading(false);
        return;
      }

      if (userData.isArchived === true) {
        setError(
          "Your account is currently disabled or archived. Please contact an administrator."
        );
        setLoading(false);
        return;
      }

      if (userRole === "teacher") {
        if (userData.status !== "approved") {
          let statusMessage = "Your account is pending approval."; 
          if (userData.status === "rejected") {
            statusMessage = "Your account has been rejected.";
          } else if (userData.status === "pending_approval") {
            statusMessage = "Your account is pending approval.";
          } else if (userData.status) {
            statusMessage = `Your account status is "${userData.status}". You cannot log in.`;
          } else {
            statusMessage =
              "Your account status is undetermined. You cannot log in.";
          }
          setError(`${statusMessage} Please contact an administrator.`);
          setLoading(false);
          return; 
        }
      }

      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userEmail,
        password
      );

      if (!userCredential || !userCredential.user) {
        setError("Firebase Authentication failed. Please try again.");
        setLoading(false);
        return;
      }

      setIsRedirecting(true);

      const user = userCredential.user;
      const userDocRef = doc(db, userDbCollectionName, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().activeSessionId) {
        const confirmLogout = window.confirm("You are already logged in on another device. Do you want to log out the other session and continue here?");
        if (confirmLogout) {
          const sessionId = `${user.uid}-${Date.now()}`;
          await updateDoc(userDocRef, { activeSessionId: sessionId });
          sessionStorage.setItem('activeSessionId', sessionId);
        } else {
          await signOut(auth);
          setIsRedirecting(false);
          setLoading(false);
          return;
        }
      } else {
        const sessionId = `${user.uid}-${Date.now()}`;
        await updateDoc(userDocRef, { activeSessionId: sessionId });
        sessionStorage.setItem('activeSessionId', sessionId);
      }

      const isAdmin = ["admin", "superadmin"].includes(userRole?.toLowerCase());

      if (isAdmin) {
        navigate("/admin/dashboard");
      } else if (userRole?.toLowerCase() === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        setIsRedirecting(false); 
        setError(
          `Role '${userRole}' is not recognized. Please contact administrator.`
        );
        await signOut(auth); 
      }
    } catch (err) {
      setError("Wrong School ID or Password. Please try again.");
      setIsRedirecting(false); 
    } finally {
      setLoading(false);
    }
  };

  if (authCheckLoading) {
    return (
      <div 
        className="d-flex flex-column min-vh-100 justify-content-center align-items-center"
        style={{
          background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)'
        }}
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
            marginBottom: '1rem',
            color: 'white',
            fontSize: '1.5rem',
            boxShadow: '0 8px 25px rgba(255, 84, 154, 0.3)',
            animation: 'spin 1s linear infinite'
          }}
        >
          <i className="fas fa-spinner"></i>
        </div>
        <p style={{ color: '#666', fontSize: '1.1rem', fontWeight: '500' }}>
          Checking authentication...
        </p>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div 
        className="d-flex flex-column min-vh-100 justify-content-center align-items-center"
        style={{
          background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)'
        }}
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
            marginBottom: '1rem',
            color: 'white',
            fontSize: '1.5rem',
            boxShadow: '0 8px 25px rgba(255, 84, 154, 0.3)',
            animation: 'spin 1s linear infinite'
          }}
        >
          <i className="fas fa-spinner"></i>
        </div>
        <p style={{ color: '#666', fontSize: '1.1rem', fontWeight: '500' }}>
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

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

      <section 
        className="d-flex align-items-center justify-content-center"
        style={{
          background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
          height: '100vh',
          paddingTop: '80px',
          paddingBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div 
          className="position-absolute"
          style={{
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
          className="position-absolute"
          style={{
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
          className="position-absolute"
          style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #FF8CC8, #FFB6C1)',
            borderRadius: '50%',
            top: '60%',
            left: '15%',
            opacity: '0.08',
            animation: 'float 5s ease-in-out infinite'
          }}
        ></div>

        <Container 
          className="h-100 d-flex align-items-center justify-content-center"
          style={{ 
            maxWidth: '1200px', 
            position: 'relative', 
            zIndex: 10
          }}
        >
          <Row className="justify-content-center align-items-center w-100">
            <Col lg={6} className="text-center text-lg-start mb-4 mb-lg-0">
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
                <i className="fas fa-user-graduate me-2"></i>
                Welcome Back
              </div>
              
              <h1 
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: '800',
                  lineHeight: '1.2',
                  background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.8rem'
                }}
              >
                Welcome Monlimarian
              </h1>
              
              <p 
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                  color: '#666',
                  lineHeight: '1.6',
                  marginBottom: '0'
                }}
              >
                Discover, Imagine, and Grow with Filipino Stories!
              </p>
            </Col>

            <Col lg={6}>
              <div className="d-flex justify-content-center justify-content-lg-end">
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '2rem 1.8rem',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(255, 84, 154, 0.15)',
                    border: '1px solid rgba(255, 84, 154, 0.1)',
                    backdropFilter: 'blur(10px)',
                    width: '100%',
                    maxWidth: '420px'
                  }}
                >
                  {infoAlert && (
                    <Alert 
                      variant="info" 
                      onClose={() => setInfoAlert("")} 
                      dismissible 
                      className="mb-4"
                      style={{
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#E3F2FD',
                        color: '#1976D2',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <i className="fas fa-info-circle me-2"></i>
                        {infoAlert}
                      </div>
                    </Alert>
                  )}
                  
                  {error && (
                    <Alert 
                      variant="danger" 
                      className="mb-4"
                      style={{
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#FFEBEE',
                        color: '#C62828',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                      </div>
                    </Alert>
                  )}

                  <div className="text-center mb-3">
                    <div 
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'white',
                        fontSize: '1.3rem',
                        boxShadow: '0 8px 25px rgba(255, 84, 154, 0.3)'
                      }}
                    >
                      <i className="fas fa-sign-in-alt"></i>
                    </div>
                    <h3
                      style={{
                        color: '#FF549A',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        marginBottom: '0.3rem'
                      }}
                    >
                      Sign In to Your Account
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      Enter your credentials to access your dashboard
                    </p>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label 
                        style={{ 
                          color: '#333', 
                          fontWeight: '600', 
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        School ID
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="schoolId"
                        placeholder="Enter your School ID"
                        value={formData.schoolId}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          borderWidth: '2px',
                          borderColor: '#e9ecef',
                          borderRadius: '10px',
                          padding: '0.7rem 1rem',
                          fontSize: '0.95rem',
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
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label 
                        style={{ 
                          color: '#333', 
                          fontWeight: '600', 
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Password
                      </Form.Label>
                      <div style={{ position: "relative" }}>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          style={{
                            paddingRight: "3rem", 
                            borderWidth: '2px',
                            borderColor: '#e9ecef',
                            borderRadius: '10px',
                            padding: '0.7rem 1rem',
                            fontSize: '0.95rem',
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
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "0.75rem",
                            transform: "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            boxShadow: "none",
                            padding: 0,
                            zIndex: 2,
                          }}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff size={18} color="#FF549A" />
                          ) : (
                            <Eye size={18} color="#666" />
                          )}
                        </Button>
                      </div>
                    </Form.Group>

                    <Button
                      type="submit"
                      className="w-100 mb-3"
                      disabled={loading}
                      style={{
                        background: loading ? '#ccc' : 'linear-gradient(135deg, #FF549A, #FF8CC8)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.8rem 2rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: loading ? 'none' : '0 4px 15px rgba(255, 84, 154, 0.3)',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(255, 84, 154, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(0px)';
                          e.target.style.boxShadow = '0 4px 15px rgba(255, 84, 154, 0.3)';
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Login
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <Link
                        to="/forgot-password"
                        style={{
                          color: "#FF549A",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          display: "block",
                          marginBottom: "0.75rem",
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#FF8CC8';
                          e.target.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#FF549A';
                          e.target.style.textDecoration = 'none';
                        }}
                      >
                        <i className="fas fa-key me-2"></i>
                        Forgot your password?
                      </Link>
                      
                      <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                        Don't have an account?{" "}
                        <Link
                          to="/signup"
                          style={{
                            color: "#FF549A",
                            textDecoration: "none",
                            fontWeight: "600",
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#FF8CC8';
                            e.target.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#FF549A';
                            e.target.style.textDecoration = 'none';
                          }}
                        >
                          Sign up here
                        </Link>
                      </p>
                    </div>
                  </Form>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-control:focus {
          outline: none !important;
        }

        @media (max-width: 991.98px) {
          .login-section {
            height: 100vh !important;
            padding-top: 80px !important;
            padding-bottom: 20px !important;
          }
        }

        @media (max-width: 768px) {
          .login-section {
            height: 100vh !important;
            padding-top: 80px !important;
            padding-bottom: 20px !important;
          }
          
          .login-form-container {
            padding: 1.5rem 1.5rem !important;
            max-width: 100% !important;
            margin: 0 1rem !important;
          }
          
          .hero-content {
            margin-bottom: 1rem !important;
          }
        }

        body, html {
          height: 100%;
          overflow-x: hidden;
        }

        .min-vh-100 {
          height: 100vh;
          overflow: hidden;
        }

        html {
          scroll-behavior: smooth;
        }

        .mobile-nav-link:hover {
          background: rgba(255, 84, 154, 0.05) !important;
          color: #FF549A !important;
        }
      `}</style>
    </div>
  );
};

export default Login;