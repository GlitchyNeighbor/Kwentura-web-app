import React, { useState, useCallback, useMemo } from "react";
import { Nav, Navbar, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Settings, Shield, Info, Mail } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import LogoutConfirmation from "./LogoutConfirmation";

// Constants - Matching SidebarMenuAdmin
const COLORS = {
  primary: "#FF69B4",
  secondary: "#FFB6C1", 
  success: "#98FB98",
  danger: "#dc3545",
  warning: "#FFB6C1",
  info: "#FF69B4",
  light: "#FFF0F5",
  dark: "#2D2D2D",
  pink: "#FF69B4",
  lightPink: "#FFE4E1",
  softPink: "#FFF0F5",
  white: "#FFFFFF",
  muted: "#6C757D",
  border: "#E9ECEF"
};

const USER_ROLES = {
  SUPERADMIN: "superAdmin",
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  USER: "user"
};

const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.SUPERADMIN]: "Super Admin",
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.TEACHER]: "Teacher",
  [USER_ROLES.STUDENT]: "Student",
  [USER_ROLES.USER]: "User"
};

// Navigation items for settings
const SETTINGS_NAVIGATION = [
  { 
    id: 'account',
    path: '/admin/settings', 
    label: 'Account', 
    icon: Settings,
    description: 'Account settings and preferences'
  },
  { 
    id: 'privacy',
    path: '/privacy', 
    label: 'Privacy', 
    icon: Shield,
    description: 'Privacy policy and data protection',
    external: true
  },
  { 
    id: 'about',
    path: '/about', 
    label: 'About System', 
    icon: Info,
    description: 'System information and version details',
    external: true
  },
  { 
    id: 'contact',
    path: '/contact', 
    label: 'Contact Us', 
    icon: Mail,
    description: 'Get support and contact information',
    external: true
  }
];

// User Profile Component
const UserProfile = React.memo(({ userName, profileImageUrl, userRole, loading }) => {
  const displayRole = useMemo(() => {
    if (!userRole) return "User";
    return ROLE_DISPLAY_NAMES[userRole] || userRole.replace(/([A-Z])/g, ' $1').trim();
  }, [userRole]);

  const profileTooltip = (
    <Tooltip id="settings-profile-tooltip" className="custom-profile-tooltip">
      <div className="text-start p-2">
        <div className="fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>{userName || 'Admin User'}</div>
        {userRole && (
          <div className="text-light small">
            <strong>Role:</strong> {displayRole}
          </div>
        )}
      </div>
    </Tooltip>
  );

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80px" }}>
        <div className="text-center">
          <div className="spinner-border spinner-border-sm mb-2" role="status" style={{ color: COLORS.primary }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="text-muted small">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <OverlayTrigger placement="right" overlay={profileTooltip}>
      <div 
        className="d-flex flex-column align-items-center text-center user-profile-section"
        style={{ cursor: 'pointer' }}
      >
        {/* Added space above the profile image */}
        <div style={{ height: "14px" }}></div>
        <div className="position-relative mb-3">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "64px",
              height: "64px",
              border: `3px solid ${COLORS.white}`,
              boxShadow: `0 4px 12px rgba(255, 105, 180, 0.3)`
            }}
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="rounded-circle"
                style={{
                  width: "58px",
                  height: "58px",
                  objectFit: "cover"
                }}
              />
            ) : (
              <span className="text-white fw-bold" style={{ fontSize: '1.5rem' }}>
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
        </div>
        <div className="w-100">
          <div 
            className="fw-semibold mb-2"
            style={{ 
              fontSize: "1.1rem", 
              color: COLORS.dark,
              lineHeight: "1.3"
            }}
          >
            {userName || 'Admin User'}
          </div>
          {userRole && (
            <div className="d-flex justify-content-center">
              <Badge 
                className="text-center" 
                style={{ 
                  backgroundColor: userRole === USER_ROLES.SUPERADMIN ? COLORS.warning : COLORS.primary,
                  color: COLORS.white,
                  fontSize: "0.75rem",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontWeight: "500"
                }}
              >
                {displayRole}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </OverlayTrigger>
  );
});

// Navigation Item Component
const NavigationItem = React.memo(({ item, isActive, onNavigate }) => {
  const ItemIcon = item.icon;

  return (
    <Nav.Item>
      <OverlayTrigger
        placement="right"
        overlay={<Tooltip>{item.description}</Tooltip>}
      >
        {item.external ? (
          <Nav.Link
            as={Link}
            to={item.path}
            target="_blank"
            rel="noopener noreferrer"
            className={`sidebar-link ${isActive ? 'active' : ''}`}
            style={{ 
              padding: '10px 14px',
              borderRadius: '8px',
              margin: '0',
              transition: 'all 0.3s ease'
            }}
          >
            <ItemIcon className="me-4" size={20} />
            <span className="fw-medium">{item.label}</span>
          </Nav.Link>
        ) : (
          <Nav.Link
            href={item.path}
            className={`sidebar-link ${isActive ? 'active' : ''}`}
            onClick={(e) => onNavigate(e, item.path)}
            style={{ 
              padding: '10px 14px',
              borderRadius: '8px',
              margin: '0',
              transition: 'all 0.3s ease'
            }}
          >
            <ItemIcon className="me-4" size={20} />
            <span className="fw-medium">{item.label}</span>
          </Nav.Link>
        )}
      </OverlayTrigger>
    </Nav.Item>
  );
});

// Main Component
const SidebarSettingsAdmin = ({ isOpen, toggleSidebar, profileImageUrl, userName, userRole }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const displayRole = useMemo(() => {
    if (!userRole) return "User";
    return ROLE_DISPLAY_NAMES[userRole] || userRole.replace(/([A-Z])/g, ' $1').trim();
  }, [userRole]);

  const handleNavigate = useCallback((e, path) => {
    e.preventDefault();
    navigate(path);
  }, [navigate]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const auth = getAuth();
      await signOut(auth);
      sessionStorage.clear();
      localStorage.removeItem("user");
      
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 500);
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  }, [navigate]);

  return (
    <>
      <Navbar
        className={`sidebar flex-column p-0 ${isOpen ? "show" : "collapsed"}`}
        style={{
          width: isOpen ? "280px" : "70px",
          minWidth: isOpen ? "250px" : "60px",
          maxWidth: isOpen ? "250px" : "60px",
          flexShrink: 0,
          overflow: "hidden",
          background: COLORS.white,
          borderRight: `1px solid ${COLORS.border}`,
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          zIndex: 99,
        }}
      >
        {/* User Profile Section */}
        <div 
          className="w-100 border-bottom"
          style={{ 
            borderColor: `${COLORS.lightPink} !important`,
            background: COLORS.white,
            padding: isOpen ? "20px 16px" : "16px 6px"
          }}
        >
          {isOpen ? (
            <UserProfile
              userName={userName || 'Admin User'}
              profileImageUrl={profileImageUrl}
              userRole={userRole}
              loading={false}
            />
          ) : (
            // Collapsed profile - just show avatar
            <div className="d-flex justify-content-center">
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="collapsed-profile-tooltip">
                    <div className="text-start p-2">
                      <div className="fw-semibold mb-1">{userName || 'Admin User'}</div>
                      {userRole && (
                        <div className="text-light small">
                          <strong>Role:</strong> {displayRole}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                }
              >
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    border: `2px solid ${COLORS.white}`,
                    boxShadow: `0 4px 12px rgba(255, 105, 180, 0.3)`,
                    cursor: 'pointer'
                  }}
                >
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: "36px",
                        height: "36px",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <span className="text-white fw-bold" style={{ fontSize: '1rem' }}>
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
              </OverlayTrigger>
            </div>
          )}
        </div>

        {/* Navigation */}
        <Nav 
          className="flex-column w-100 flex-grow-1" 
          style={{ 
            overflow: "visible",
            padding: isOpen ? "20px 0" : "16px 0",
            display: "flex",
            justifyContent: "space-evenly"
          }}
        >
          {isOpen ? (
            // Full navigation when expanded
            <div className="d-flex flex-column h-100">
              {/* Settings Section */}
              <div className="sidebar-section">
                <div 
                  className="sidebar-heading text-uppercase fw-bold small mb-3"
                  style={{ 
                    paddingLeft: '16px',
                    letterSpacing: '0.08em',
                    color: COLORS.muted,
                    fontSize: '0.7rem'
                  }}
                >
                  Settings
                </div>
                <div style={{ paddingLeft: '6px', paddingRight: '6px' }}>
                  {SETTINGS_NAVIGATION.map((item, index) => (
                    <div key={item.id} style={{ marginBottom: '6px' }}>
                      <NavigationItem
                        item={item}
                        isActive={location.pathname === item.path}
                        onNavigate={handleNavigate}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-grow-1"></div>
            </div>
          ) : (
            // Collapsed navigation - compact icons
            <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ gap: '8px' }}>
              {SETTINGS_NAVIGATION.map((item, index) => {
                const ItemIcon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <OverlayTrigger
                    key={`${item.path}-${index}`}
                    placement="right"
                    overlay={<Tooltip>{item.label}</Tooltip>}
                  >
                    {item.external ? (
                      <Nav.Link
                        as={Link}
                        to={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`collapsed-nav-item ${isActive ? 'active' : ''}`}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0',
                          padding: '0',
                          transition: 'all 0.3s ease',
                          backgroundColor: isActive ? COLORS.primary : 'transparent',
                          color: isActive ? COLORS.white : COLORS.dark
                        }}
                      >
                        <ItemIcon size={16} />
                      </Nav.Link>
                    ) : (
                      <Nav.Link
                        href={item.path}
                        className={`collapsed-nav-item ${isActive ? 'active' : ''}`}
                        onClick={(e) => handleNavigate(e, item.path)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0',
                          padding: '0',
                          transition: 'all 0.3s ease',
                          backgroundColor: isActive ? COLORS.primary : 'transparent',
                          color: isActive ? COLORS.white : COLORS.dark
                        }}
                      >
                        <ItemIcon size={16} />
                      </Nav.Link>
                    )}
                  </OverlayTrigger>
                );
              })}
            </div>
          )}
        </Nav>

      
        <style jsx>{`
          .sidebar-link {
            color: ${COLORS.dark} !important;
            text-decoration: none !important;
            transition: all 0.3s ease;
            position: relative;
            display: flex;
            align-items: center;
            padding: 10px 14px !important;
            borderRadius: 8px !important;
            margin: 0 !important;
          }

          .sidebar-link:hover {
            background: linear-gradient(135deg, ${COLORS.lightPink}, ${COLORS.softPink}) !important;
            color: ${COLORS.primary} !important;
            transform: translateX(4px);
            box-shadow: 0 4px 15px rgba(255, 105, 180, 0.2);
          }

          .sidebar-link.active {
            background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary}) !important;
            color: ${COLORS.white} !important;
            font-weight: 600;
            box-shadow: 0 6px 20px rgba(255, 105, 180, 0.3);
          }

          .sidebar-link.active::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 50%;
            background: ${COLORS.white};
            border-radius: 2px;
            box-shadow: 0 2px 6px rgba(255, 255, 255, 0.3);
          }

          .user-profile-section:hover {
            background: linear-gradient(135deg, ${COLORS.softPink}, ${COLORS.lightPink}) !important;
            transform: translateY(-2px);
            transition: all 0.3s ease;
            border-radius: 12px;
          }

          /* Enhanced Logout Button Styles */
          .logout-link:hover {
            background: linear-gradient(135deg, ${COLORS.danger}, #c62828) !important;
            color: ${COLORS.white} !important;
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
            border-color: ${COLORS.danger} !important;
          }

          .logout-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }

          .logout-link:hover::before {
            left: 100%;
          }

          .logout-link:active {
            transform: translateY(-1px) scale(1.01);
          }

          .custom-profile-tooltip .tooltip-inner {
            background: linear-gradient(135deg, ${COLORS.dark}, #1a1a1a) !important;
            color: ${COLORS.white} !important;
            max-width: 300px !important;
            text-align: left !important;
            border-radius: 10px !important;
            padding: 12px 16px !important;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          }

          .custom-profile-tooltip .tooltip-arrow::before {
            border-right-color: ${COLORS.dark} !important;
          }

          /* Custom scrollbar */
          .sidebar .nav::-webkit-scrollbar {
            width: 8px;
          }

          .sidebar .nav::-webkit-scrollbar-track {
            background: ${COLORS.softPink};
            border-radius: 4px;
          }

          .sidebar .nav::-webkit-scrollbar-thumb {
            background: ${COLORS.secondary};
            border-radius: 4px;
          }

          .sidebar .nav::-webkit-scrollbar-thumb:hover {
            background: ${COLORS.primary};
          }

          /* Collapsed Navigation Styles */
          .collapsed-nav-item {
            color: ${COLORS.dark} !important;
            text-decoration: none !important;
            transition: all 0.3s ease;
          }

          .collapsed-nav-item:hover {
            background: linear-gradient(135deg, ${COLORS.lightPink}, ${COLORS.softPink}) !important;
            color: ${COLORS.primary} !important;
            transform: scale(1.05);
            box-shadow: 0 3px 10px rgba(255, 105, 180, 0.2);
          }

          .collapsed-nav-item.active {
            background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary}) !important;
            color: ${COLORS.white} !important;
            box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
          }

          .collapsed-logout-btn:hover {
            background: linear-gradient(135deg, ${COLORS.danger}, #c62828) !important;
            color: ${COLORS.white} !important;
            transform: scale(1.05);
            box-shadow: 0 3px 10px rgba(220, 53, 69, 0.3);
            border-color: ${COLORS.danger} !important;
          }

          /* Mobile Styles */
          @media (max-width: 768px) {
            .sidebar {
              position: fixed !important;
              top: 0;
              left: -100%;
              z-index: 1050;
              transition: all 0.3s ease;
            }
            
            .sidebar.show {
              width: 280px !important;
              box-shadow: 6px 0 25px rgba(0, 0, 0, 0.15);
            }

            .sidebar.collapsed {
              left: -100%;
            }
            
            .sidebar.collapsed.show {
              left: 0;
              width: 70px !important;
            }
          }

          /* Desktop Styles */
          @media (min-width: 769px) {
            .sidebar {
              position: relative !important;
              transition: width 0.3s ease;
            }
            
            .sidebar.show {
              width: 280px !important;
            }
            
            .sidebar.collapsed {
              width: 70px !important;
            }
          }

          @media (min-width: 1200px) {
            .sidebar.show {
              width: 300px !important;
            }
          }
        `}</style>
      </Navbar>

      {/* Mobile Overlay */}
      {typeof window !== 'undefined' && window.innerWidth <= 768 && (
        <div 
          className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transition: 'all 0.3s ease'
          }}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        show={showLogoutModal}
        onHide={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        userName={userName}
        userType="admin"
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

export default React.memo(SidebarSettingsAdmin);