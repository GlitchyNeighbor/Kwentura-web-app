import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Navbar, Dropdown, Container } from "react-bootstrap";
import { Menu, X } from "lucide-react";
import { User, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import LogoutConfirmation from "./LogoutConfirmation.js";
import NotificationsModal from "./NotificationsModal.js"; // This will be updated next
import "../css/TopNavbar.css";
import "../css/custom.css";
// Removed unused Firestore imports (collection, query, where, getDocs) and db

const USER_ROLES = {
  SUPERADMIN: "superAdmin",
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  USER: "user"
};

const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.SUPERADMIN]: "Super Admin",
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  user: "User"
};

// Custom Toggle Component for Profile Dropdown
const ProfileToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    className="profile-toggle d-flex align-items-center"
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    }}
    aria-label="Open profile menu"
  >
    {children}
  </div>
));

const TopNavbar = ({ toggleSidebar, isSidebarOpen = false }) => {
  const { userData, loading, error, logout, pendingStudents, fetchPendingStudents, pendingTeachers, fetchPendingTeachers } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (userData) {
      fetchPendingStudents();
      fetchPendingTeachers();
    }
  }, [userData, fetchPendingStudents, fetchPendingTeachers]);

  const displayName = useMemo(() => {
    if (loading) return "Loading...";
    if (!userData) return "User";
    if (userData.fullName?.trim()) return userData.fullName;
    if (userData.firstName?.trim()) return userData.firstName;
    // Use the role directly without lowercasing it for lookup
    return ROLE_DISPLAY_NAMES[userData.role] || ROLE_DISPLAY_NAMES[USER_ROLES.USER];
  }, [userData, loading]);

  const profileImageSrc = useMemo(() => {
    return userData?.profileImageUrl || require("../assets/images/profile.png");
  }, [userData]);

  // Build notifications array depending on role
  const notifications = useMemo(() => {
    if (!userData) return [];
    if (userData.role === 'teacher') {
      return pendingStudents.map(s => ({
        id: s.id,
        type: 'student_pending',
        title: `${s.studentFirstName || s.firstName || ''} ${s.studentLastName || s.lastName || ''}`.trim(),
        message: `Student ${s.studentFirstName || s.firstName || ''} ${s.studentLastName || s.lastName || ''} requires approval for section ${s.section || ''}`,
        data: s,
      }));
    }

    if (userData.role === 'admin' || userData.role === 'superAdmin') {
      return pendingTeachers.map(t => ({
        id: t.id,
        type: 'teacher_pending',
        title: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        message: `Teacher ${t.firstName || ''} ${t.lastName || ''} has requested account approval.`,
        data: t,
      }));
    }

    return [];
  }, [userData, pendingStudents, pendingTeachers]);

  const handleToggleSidebar = useCallback((event) => {
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    toggleSidebar();
  }, [toggleSidebar]);

  const handleProfileClick = useCallback(() => {
    // Route to the correct settings/profile page depending on role
    // Debug: log resolved role to help diagnose navigation issues
    const role = userData?.role;
  // debug removed

    // Navigate based on role
    if (role === 'admin' || role === 'superAdmin') {
      navigate('/admin/settings');
    } else if (role === 'teacher') {
      navigate('/teacher/settings');
    } else {
      navigate('/teacher/settings');
    }
  }, [navigate, userData]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 300);
    } catch (error) {
      console.error("TopNavbar: Error during logout:", error);
      setIsLoggingOut(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Extra handling if needed
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Navbar
        expand="lg"
        className="top-navbar shadow-sm sticky-top bg-white py-2"
        role="navigation"
        aria-label="Top navigation"
        style={{ minHeight: "74px", boxShadow: "0 4px 12px rgba(255,84,154,0.05)" }}
      >
        <Container fluid className="mx-4 mx-lg-2">
          <div className="d-flex justify-content-between align-items-center w-100">
            {/* Left Section - Sidebar toggle button and logo/brand */}
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="burger-menu d-flex align-items-center justify-content-center me-3"
                onClick={handleToggleSidebar}
                onKeyDown={handleToggleSidebar}
                aria-label={isSidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
                aria-expanded={isSidebarOpen}
                style={{
                  border: "2px solid transparent",
                  padding: "12px",
                  borderRadius: "12px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  width: "44px",
                  height: "44px",
                  position: "relative",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)",
                  backdropFilter: "blur(10px)"
                }}
              >
                <div
                  style={{
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isSidebarOpen ? "rotate(180deg) scale(0.9)" : "rotate(0deg) scale(1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                  }}
                >
                  {isSidebarOpen ? (
                    <X
                      size={20}
                      color="currentColor"
                      style={{
                        transition: "all 0.3s ease",
                        strokeWidth: 2.5
                      }}
                    />
                  ) : (
                    <Menu
                      size={20}
                      color="currentColor"
                      style={{
                        transition: "all 0.3s ease",
                        strokeWidth: 2.5
                      }}
                    />
                  )}
                </div>
                <div
                  className="hover-indicator"
                  style={{
                    position: "absolute",
                    inset: "-2px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #FF549A, #FF8BA7)",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    zIndex: -1,
                    filter: "blur(6px)"
                  }}
                />
              </button>

              {/* Logo and Brand Section */}
              <div className="d-flex align-items-center">
                <Navbar.Brand className="me-2 p-0 logo-hover-parent">
                  <div
                    className="logo-hover-block"
                    style={{
                      width: "54px",
                      height: "54px",
                      borderRadius: "16px",
                      background: "white",
                      boxShadow: "0 6px 16px 0px rgba(255,84,154,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "5px",
                      transition: "transform 0.3s",
                    }}
                  >
                    <img
                      src={require("../assets/images/KLogo.png")}
                      alt="Kwentura Logo"
                      style={{
                        width: "38px",
                        height: "38px",
                        objectFit: "contain",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(255,84,154,0.05)",
                        transition: "transform 0.3s, box-shadow 0.3s"
                      }}
                      onError={e => {
                        e.target.src = require("../assets/images/logo.png");
                      }}
                      loading="lazy"
                    />
                  </div>
                </Navbar.Brand>
                <div className="d-flex flex-column justify-content-center">
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "1.5rem",
                      background: "linear-gradient(135deg, #FF549A, #FF8CC8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      margin: 0,
                      paddingBottom: "0px",
                      lineHeight: 1.1,
                      letterSpacing: "-2px"
                    }}
                  >
                    Kwentura
                  </span>
                  <span
                    style={{
                      color: "#888",
                      fontSize: "1rem",
                      fontWeight: 500,
                      marginTop: "-2px",
                      marginLeft: "2px",
                      letterSpacing: "-1px"
                    }}
                  >
                    Filipino Stories for Young Minds
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - User info with dropdown */}
            <div className="d-flex align-items-center">
              {error && (
                <div className="alert alert-sm alert-danger me-3 mb-0 py-1 px-2">
                  <small>Error loading profile</small>
                </div>
              )}

              {!loading && userData && <div className="user-section d-flex align-items-center">
                <div className="user-greeting me-3 text-end d-none d-md-block">
                  <div className="greeting-text fw-medium text-dark">
                    Hi, {displayName}
                  </div>
                  <div className="role-text text-muted small">
                    {ROLE_DISPLAY_NAMES[userData.role] || "User"}
                  </div>
                </div>

                {/* Profile Dropdown */}
                <Dropdown ref={dropdownRef} align="end">
                  <Dropdown.Toggle as={ProfileToggle}>
                    <div className="profile-avatar">
                      <img
                        key={profileImageSrc}
                        src={profileImageSrc}
                        alt={`${displayName} profile`}
                        className="profile-image"
                        onError={(e) => {
                          e.target.src = require("../assets/images/profile.png");
                        }}
                        loading="lazy"
                      />
                      {notifications.length > 0 && (
                        <span className="notification-ping-indicator">
                          <span className="notification-ping-animation"></span>
                          <span className="notification-ping-dot"></span>
                        </span>
                      )}
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="profile-dropdown-menu">
                    <div className="dropdown-menu-items" style={{ padding: "8px 0" }}>
                      <Dropdown.Item
                        onClick={handleProfileClick}
                        className="dropdown-menu-item"
                        style={{
                          padding: "14px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          border: "none",
                          background: "none",
                          color: "#374151",
                          borderRadius: "12px",
                          fontWeight: 500,
                          fontSize: "1rem",
                          transition: "background 0.18s, color 0.18s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#E3F0FF";
                          e.currentTarget.style.color = "#1976F2";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "none";
                          e.currentTarget.style.color = "#374151";
                        }}
                      >
                        <User size={20} style={{ opacity: 0.8 }} />
                        <span>View Profile</span>
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => setShowNotificationsModal(true)}
                        className="dropdown-menu-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 20px",
                          gap: "12px",
                          border: "none",
                          background: "none",
                          color: "#374151",
                          borderRadius: "12px",
                          fontWeight: 500,
                          fontSize: "1rem",
                          transition: "background 0.18s, color 0.18s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#E3F0FF";
                          e.currentTarget.style.color = "#1976F2";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "none";
                          e.currentTarget.style.color = "#374151";
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} aria-hidden>
                              <Bell size={20} style={{ opacity: 0.8 }} />
                              {notifications.length > 0 && (
                                <span aria-label={`${notifications.length} new notifications`} role="status" style={{
                                  position: 'absolute',
                                  top: -6,
                                  right: -8,
                                  minWidth: 18,
                                  height: 18,
                                  padding: '0 5px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  borderRadius: 18,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                  lineHeight: 1
                                }}>{notifications.length}</span>
                              )}
                            </div>
                            <span>Notifications</span>
                          </div>
                      </Dropdown.Item>

                      <div style={{
                        margin: "10px 20px",
                        height: "1px",
                        backgroundColor: "#f3e6ee",
                        borderRadius: "2px"
                      }}></div>

                      <Dropdown.Item
                        onClick={handleLogoutClick}
                        className="dropdown-menu-item logout-item"
                        style={{
                          padding: "14px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          border: "none",
                          background: "none",
                          color: "#dc3545",
                          borderRadius: "12px",
                          fontWeight: 500,
                          fontSize: "1rem",
                          transition: "background 0.18s, color 0.18s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#FFE4E6";
                          e.currentTarget.style.color = "#dc3545";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "none";
                          e.currentTarget.style.color = "#dc3545";
                        }}
                      >
                        <LogOut size={20} style={{ opacity: 0.8 }} />
                        <span>Sign Out</span>
                      </Dropdown.Item>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>}
            </div>
          </div>
        </Container>
      </Navbar>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        show={showLogoutModal}
        onHide={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        userName={displayName}
        userType="admin"
        isLoggingOut={isLoggingOut}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        show={showNotificationsModal}
        onHide={() => setShowNotificationsModal(false)}
        notifications={notifications}
      />

      {/* Add style for logo shadow and brand block and logo hover effect */}
      <style jsx>{`
        .top-navbar {
          box-shadow: 0 4px 12px rgba(255,84,154,0.05);
        }
        .logo-hover-parent .logo-hover-block:hover {
          transform: scale(1.1) rotate(-3deg);
          box-shadow: 0 12px 32px 0px rgba(255,84,154,0.32);
        }
        .logo-hover-parent .logo-hover-block:hover img {
          box-shadow: 0 6px 16px rgba(255,84,154,0.18);
          transform: scale(1.09) rotate(-3deg);
        }
      `}</style>

      {/* Styles for Notification Ping */}
      <style jsx>{`
        .notification-ping-indicator {
          position: absolute;
          top: 0;
          right: 0;
          transform: translate(25%, -25%);
          width: 16px;
          height: 16px;
        }
        .notification-ping-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .notification-ping-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #ef4444;
          border-radius: 50%;
          animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default React.memo(TopNavbar);