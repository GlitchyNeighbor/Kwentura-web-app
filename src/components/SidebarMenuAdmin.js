import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Nav, Navbar, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import {
  Home,
  Shield,
  GraduationCap,
  User,
  Laptop,
  BarChart2,
  Settings,
  LogOut,
  UserCheck,
  Users,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutConfirmation from "./LogoutConfirmation";
import { useAuth } from "../context/AuthContext.js";


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
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  user: "User"
};

const NAVIGATION_ITEMS = {
  dashboard: [
    { 
      id: 'home',
      path: '/admin/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'View your dashboard overview'
    },
    { 
      id: 'users',
      label: 'User Management', 
      icon: Users,
      description: 'Manage users and accounts',
      subItems: [
        { path: '/admin/manage/admins', label: 'Admins', icon: Shield, roleRequired: ['superAdmin'] },
        { path: '/admin/manage/teachers', label: 'Teachers', icon: Laptop },
        { path: '/admin/manage/students', label: 'Students', icon: GraduationCap },
        { path: '/admin/account-list', label: 'All Accounts', icon: User },
      ]
    },
    { 
      id: 'approvals',
      path: '/admin/approve-teachers', 
      label: 'Approve Teachers', 
      icon: UserCheck,
      description: 'Approve pending teacher registrations',
      roleRequired: ['superAdmin', 'admin']
    },
    { 
      id: 'analytics',
      path: '/admin/charts', 
      label: 'Analytics', 
      icon: BarChart2,
      description: 'View charts and reports'
    }
  ],
  others: [
    { 
      id: 'settings',
      path: '/admin/settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'Account and preferences'
    }
  ]
};




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
                onError={(e) => {
                  e.target.src = require("../assets/images/profile.png");
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

const NavigationItem = React.memo(({ 
  item, 
  isActive, 
  isExpanded, 
  onToggleExpand, 
  onNavigate,
  userRole,
  isVisible,
  checkRolePermission
}) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const location = useLocation();
  
  const isSubItemActive = useMemo(() => {
    if (!hasSubItems) return false;
    return item.subItems.some(subItem => location.pathname === subItem.path);
  }, [hasSubItems, item.subItems, location.pathname]);

  const ItemIcon = item.icon;

  if (!isVisible) return null;

  if (hasSubItems) {
    return (
      <div className="nav-item-group">
        <Nav.Item>
          <div
            className={`sidebar-link d-flex align-items-center justify-content-between ${
              isSubItemActive ? 'active' : ''
            }`}
            onClick={() => onToggleExpand(item.id)}
            style={{ 
              cursor: 'pointer', 
              padding: '14px 20px',
              borderRadius: '12px',
              margin: '0',
              transition: 'all 0.3s ease'
            }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onToggleExpand(item.id)}
          >
            <div className="d-flex align-items-center">
              <ItemIcon className="me-4" size={20} />
              <span className="fw-medium">{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown size={16} className="expand-icon" />
            ) : (
              <ChevronRight size={16} className="expand-icon" />
            )}
          </div>
        </Nav.Item>
        
        {isExpanded && (
          <div className="sub-nav-items ms-4 ps-4 mt-2" style={{ borderLeft: `2px solid ${COLORS.lightPink}` }}>
            {item.subItems
              .filter(subItem => checkRolePermission(subItem.roleRequired))
              .map((subItem, subIndex) => {
              const SubIcon = subItem.icon;
              const isSubActive = location.pathname === subItem.path;
              
              return (
                <Nav.Item key={subItem.path} style={{ marginBottom: subIndex < item.subItems.length - 1 ? '6px' : '0' }}>
                  <Nav.Link
                    href={subItem.path}
                    className={`sidebar-link sub-item ${isSubActive ? 'active' : ''}`}
                    onClick={(e) => onNavigate(e, subItem.path)}
                    style={{ 
                      padding: '12px 16px',
                      borderRadius: '10px',
                      margin: '0',
                      fontSize: '0.9rem'
                    }}
                  >
                    <SubIcon className="me-3" size={18} />
                    <span>{subItem.label}</span>
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Nav.Item>
      <OverlayTrigger
        placement="right"
        overlay={<Tooltip>{item.description}</Tooltip>}
      >
        <Nav.Link
          href={item.path}
          className={`sidebar-link ${isActive ? 'active' : ''}`}
          onClick={(e) => onNavigate(e, item.path)}
          style={{ 
            padding: '14px 20px',
            borderRadius: '12px',
            margin: '0',
            transition: 'all 0.3s ease'
          }}
        >
          <ItemIcon className="me-4" size={20} />
          <span className="fw-medium">{item.label}</span>
        </Nav.Link>
      </OverlayTrigger>
    </Nav.Item>
  );
});

const NavigationSection = React.memo(({ 
  title, 
  items, 
  expandedItems, 
  onToggleExpand, 
  onNavigate,
  currentPath,
  userRole
}) => {
  const checkRolePermission = useCallback((roleRequired) => {
    if (!roleRequired) return true;
    if (!userRole) return false;
    return roleRequired.some((role) => role.toLowerCase() === userRole.toLowerCase());
  }, [userRole]);

  const visibleItems = useMemo(() => {
    return items.filter(item => checkRolePermission(item.roleRequired));
  }, [items, checkRolePermission]);

  if (visibleItems.length === 0) return null;

  return (
    <div className="sidebar-section mb-5">
      <div 
        className="sidebar-heading text-uppercase fw-bold small mb-4"
        style={{ 
          paddingLeft: '20px', 
          letterSpacing: '0.08em',
          color: COLORS.muted,
          fontSize: '0.75rem'
        }}
      >
        {title}
      </div>
      <div style={{ paddingLeft: '8px', paddingRight: '8px' }}>
        {visibleItems.map((item, index) => (
          <div key={item.id} style={{ marginBottom: index < visibleItems.length - 1 ? '8px' : '0' }}>
            <NavigationItem
              item={item}
              isActive={currentPath === item.path}
              isExpanded={expandedItems.has(item.id)}
              onToggleExpand={onToggleExpand}
              onNavigate={onNavigate}
              userRole={userRole}
              isVisible={checkRolePermission(item.roleRequired)}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

const SidebarMenuAdmin = ({ isOpen, toggleSidebar }) => {
  const [expandedItems, setExpandedItems] = useState(new Set(['users']));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { userData, loading, error, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getAllNavigationItems = useCallback(() => {
    const allItems = [];
    NAVIGATION_ITEMS.dashboard.forEach(item => {
      if (item.subItems) {
        item.subItems.forEach(subItem => {
          allItems.push({
            ...subItem,
            parentLabel: item.label,
            description: `${item.label} - ${subItem.label}`
          });
        });
      } else {
        allItems.push(item);
      }
    });
    NAVIGATION_ITEMS.others.forEach(item => {
      allItems.push(item);
    });
    return allItems;
  }, []);

  const checkRolePermission = useCallback((roleRequired) => {
    if (!roleRequired) return true;
    if (!userData?.role) return false;
    return roleRequired.some((role) => role.toLowerCase() === userData.role.toLowerCase());
  }, [userData]);

  const handleToggleExpand = useCallback((itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

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
      await logout();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 500);
    } catch (error) {
      console.error("SidebarMenuAdmin: Error signing out:", error);
      setIsLoggingOut(false);
    }
  }, [navigate, logout]);

  if (error) {
    return (
      <Navbar 
        className={`sidebar flex-column p-4 ${isOpen ? "show" : "collapsed"}`}
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.danger}, ${COLORS.lightPink})`,
          color: COLORS.white,
          width: isOpen ? "320px" : "80px"
        }}
      >
        <div className="text-center">
          <div className="mb-2 fs-2">⚠️</div>
          {isOpen && <div className="small fw-medium">{error}</div>}
        </div>
      </Navbar>
    );
  }

  return (
    <>
      <Navbar
        className={`sidebar flex-column p-0 ${isOpen ? "show" : "collapsed"}`}
        style={{
          width: isOpen ? "280px" : "70px",
          minWidth: isOpen ? "250px" : "60px",
          maxWidth: isOpen ? "250px" : "60px",
          flexShrink: 0,
          background: COLORS.white,
          borderRight: `1px solid ${COLORS.border}`,
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          zIndex: 99,
        }}
      >

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
              userName={userData?.fullName || 'Admin User'}
              profileImageUrl={userData?.profileImageUrl}
              userRole={userData?.role}
              loading={loading}
            />
          ) : (
            <div className="d-flex justify-content-center">
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="collapsed-profile-tooltip">
                    <div className="text-start p-2">
                      <div className="fw-semibold mb-1">{userData?.fullName || 'Admin User'}</div>
                      {userData?.role && (
                        <div className="text-light small"><strong>Role:</strong> {ROLE_DISPLAY_NAMES[userData.role] || userData.role.replace(/([A-Z])/g, ' $1').trim()}</div>
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
                  {userData?.profileImageUrl ? (
                    <img
                      src={userData.profileImageUrl}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: "36px",
                        height: "36px",
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.target.src = require("../assets/images/profile.png");
                      }}
                    />
                  ) : (
                    <span className="text-white fw-bold" style={{ fontSize: '1rem' }}>
                      {(userData?.fullName || 'A').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </OverlayTrigger>
            </div>
          )}
        </div>

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
            <div className="d-flex flex-column h-100">
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
                  Dashboard
                </div>
                <div style={{ paddingLeft: '6px', paddingRight: '6px' }}>
                  {NAVIGATION_ITEMS.dashboard
                    .filter(item => checkRolePermission(item.roleRequired))
                    .map((item, index) => (
                      <div key={item.id} style={{ marginBottom: '6px' }}>
                        <NavigationItem
                          item={item}
                          isActive={location.pathname === item.path}
                          isExpanded={expandedItems.has(item.id)}
                          onToggleExpand={handleToggleExpand}
                          onNavigate={handleNavigate}
                          userRole={userData?.role}
                          isVisible={checkRolePermission(item.roleRequired)}
                          checkRolePermission={checkRolePermission}
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div style={{ 
                height: expandedItems.has('users') ? '20px' : '40px',
                transition: 'height 0.3s ease'
              }}></div>

              <div className="sidebar-section">
                <div 
                  className="sidebar-heading text-uppercase fw-bold small mb-2"
                  style={{ 
                    paddingLeft: '16px',
                    letterSpacing: '0.08em',
                    color: COLORS.muted,
                    fontSize: '0.7rem'
                  }}
                >
                  Account
                </div>
                <div style={{ paddingLeft: '6px', paddingRight: '6px' }}>
                  {NAVIGATION_ITEMS.others
                    .filter(item => checkRolePermission(item.roleRequired))
                    .map((item, index) => (
                      <div key={item.id}>
                        <NavigationItem
                          item={item}
                          isActive={location.pathname === item.path}
                          isExpanded={expandedItems.has(item.id)}
                          onToggleExpand={handleToggleExpand}
                          onNavigate={handleNavigate}
                        userRole={userData?.role}
                          isVisible={checkRolePermission(item.roleRequired)}
                        />
                      </div>
                    ))}
                </div>
              </div>

              {!expandedItems.has('users') && <div className="flex-grow-1"></div>}
            </div>
          ) : (
            <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ gap: '8px' }}>
              {getAllNavigationItems()
                .filter(item => checkRolePermission(item.roleRequired))
                .map((item, index) => {
                  const ItemIcon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <OverlayTrigger
                      key={`${item.path}-${index}`}
                      placement="right"
                      overlay={<Tooltip>{item.parentLabel ? `${item.parentLabel} - ${item.label}` : item.label}</Tooltip>}
                    >
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
          .sidebar-link.sub-item {
            font-size: 0.85rem;
            font-weight: 400;
            padding: 8px 12px !important;
          }
          .sidebar-link.sub-item:hover {
            background: linear-gradient(135deg, ${COLORS.softPink}, ${COLORS.lightPink}) !important;
          }
          .sidebar-link.sub-item.active {
            background: linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.lightPink}) !important;
            color: ${COLORS.dark} !important;
            font-weight: 500;
          }
          .nav-item-group .sidebar-link:not(.sub-item) {
            background-color: transparent;
          }
          .user-profile-section:hover {
            background: linear-gradient(135deg, ${COLORS.softPink}, ${COLORS.lightPink}) !important;
            transform: translateY(-2px);
            transition: all 0.3s ease;
            border-radius: 12px;
          }
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
          .expand-icon {
            color: ${COLORS.muted};
            transition: all 0.3s ease;
          }
          .sidebar-link:hover .expand-icon {
            color: ${COLORS.primary};
          }
          .sidebar-link.active .expand-icon {
            color: ${COLORS.white};
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
          @media (max-width: 768px) {
            .sidebar-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0, 0, 0, 0.5);
              z-index: 999;
              opacity: 0;
              visibility: hidden;
              transition: all 0.3s ease;
            }
            .sidebar-overlay.show {
              opacity: 1;
              visibility: visible;
            }
          }
        `}</style>
      </Navbar>

      {typeof window !== 'undefined' && window.innerWidth <= 768 && (
        <div 
          className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
          onClick={toggleSidebar}
        />
      )}

      <LogoutConfirmation
        show={showLogoutModal}
        onHide={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        userName={userData?.fullName || 'Admin'}
        userType="admin"
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

export default React.memo(SidebarMenuAdmin);