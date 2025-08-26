import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Nav, Navbar, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import { 
  Home, 
  Book, 
  GraduationCap, 
  Settings, 
  LogOut, 
  BarChart3,
  UserCheck,
  Users,
  BookOpen,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"; 
import { db } from "../config/FirebaseConfig.js";
import LogoutConfirmation from "./LogoutConfirmation.js";

// Constants - Updated to match pink theme like admin sidebar
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

const NAVIGATION_ITEMS = {
  dashboard: [
    { 
      id: 'home',
      path: '/teacher/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'View your dashboard overview'
    },
    { 
      id: 'stories',
      label: 'Stories', 
      icon: Book,
      description: 'Manage story content',
      subItems: [
        { path: '/manage/stories', label: 'Manage Stories', icon: BookOpen },
        { path: '/teacher/stories', label: 'View Stories', icon: Book }
      ]
    },
    { 
      id: 'students',
      label: 'Students', 
      icon: GraduationCap,
      description: 'Student management',
      subItems: [
        { path: '/teacher/student-list', label: 'Student List', icon: Users },
        { path: '/teacher/approve-students', label: 'Approve Students', icon: UserCheck }
      ]
    },
    { 
      id: 'analytics',
      path: '/teacher/charts', 
      label: 'Analytics', 
      icon: BarChart3,
      description: 'View charts and reports'
    }
  ],
  others: [
    { 
      id: 'settings',
      path: '/teacher/settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'Account and preferences'
    }
  ]
};

// Custom hooks
const useTeacherAuth = () => {
  const [state, setState] = useState({
    userName: "",
    userRole: null,
    teacherData: null,
    profileImageUrl: "",
    loading: true,
    error: null
  });
  const navigate = useNavigate();

  const fetchTeacherData = useCallback(async (email) => {
    try {
      console.log("Fetching teacher data for:", email);
      
      const q = query(collection(db, "teachers"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const teacherData = docSnap.data();

        const fullName = [teacherData.firstName, teacherData.lastName]
          .filter(Boolean)
          .join(' ') || 'Teacher';

        return {
          id: docSnap.id,
          ...teacherData,
          fullName,
          role: teacherData.role || "teacher",
          profileImageUrl: teacherData.profileImageUrl || "",
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      throw error;
    }
  }, []);

  const updateTeacherState = useCallback((teacherInfo) => {
    setState(prev => ({
      ...prev,
      userName: teacherInfo?.fullName || "Teacher",
      userRole: teacherInfo?.role || "teacher",
      teacherData: teacherInfo,
      profileImageUrl: teacherInfo?.profileImageUrl || "",
      loading: false,
      error: null
    }));
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const teacherInfo = await fetchTeacherData(user.email);
          updateTeacherState(teacherInfo);
        } catch (error) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: "Failed to load teacher data"
          }));
        }
      } else {
        navigate("/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate, fetchTeacherData, updateTeacherState]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const teacherInfo = await fetchTeacherData(user.email);
          updateTeacherState(teacherInfo);
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    };

    window.addEventListener("profileImageUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileImageUpdated", handleProfileUpdate);
  }, [fetchTeacherData, updateTeacherState]);

  return state;
};

// UI Components
const UserProfile = React.memo(({ userName, profileImageUrl, teacherData, loading }) => {
  const profileTooltip = (
    <Tooltip id="profile-tooltip" className="custom-profile-tooltip">
      <div className="text-start p-2">
        <div className="fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>{userName}</div>
        {teacherData?.section && (
          <div className="text-light small mb-1">
            <strong>Section:</strong> {teacherData.section}
          </div>
        )}
        {teacherData?.email && (
          <div className="text-light small mb-1" style={{ wordBreak: 'break-word' }}>
            <strong>Email:</strong> {teacherData.email}
          </div>
        )}
        {teacherData?.role && (
          <div className="text-light small">
            <strong>Role:</strong> {teacherData.role.charAt(0).toUpperCase() + teacherData.role.slice(1)}
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
              />
            ) : (
              <span className="text-white fw-bold" style={{ fontSize: '1.5rem' }}>
                {userName.charAt(0).toUpperCase()}
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
            {userName}
          </div>
          {teacherData?.section && (
            <div className="d-flex justify-content-center mb-2">
              <Badge 
                className="text-center" 
                style={{ 
                  backgroundColor: COLORS.warning,
                  color: COLORS.white,
                  fontSize: "0.75rem",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontWeight: "500"
                }}
              >
                {teacherData.section}
              </Badge>
            </div>
          )}
          {teacherData?.role && (
            <div className="d-flex justify-content-center">
              <Badge 
                className="text-center" 
                style={{ 
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  fontSize: "0.75rem",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontWeight: "500"
                }}
              >
                {teacherData.role.charAt(0).toUpperCase() + teacherData.role.slice(1)}
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
  isVisible
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
              padding: '12px 16px',
              borderRadius: '10px',
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
          <div className="sub-nav-items ms-3 ps-3 mt-1" style={{ borderLeft: `2px solid ${COLORS.lightPink}` }}>
            {item.subItems.map((subItem, subIndex) => {
              const SubIcon = subItem.icon;
              const isSubActive = location.pathname === subItem.path;
              
              return (
                <Nav.Item key={subItem.path} style={{ marginBottom: subIndex < item.subItems.length - 1 ? '4px' : '0' }}>
                  <Nav.Link
                    href={subItem.path}
                    className={`sidebar-link sub-item ${isSubActive ? 'active' : ''}`}
                    onClick={(e) => onNavigate(e, subItem.path)}
                    style={{ 
                      padding: '10px 14px',
                      borderRadius: '8px',
                      margin: '0',
                      fontSize: '0.85rem'
                    }}
                  >
                    <SubIcon className="me-3" size={16} />
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
            padding: '12px 16px',
            borderRadius: '10px',
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
  currentPath
}) => {
  if (items.length === 0) return null;

  return (
    <div className="sidebar-section mb-3">
      <div 
        className="sidebar-heading text-uppercase fw-bold small mb-3"
        style={{ 
          paddingLeft: '16px', 
          letterSpacing: '0.08em',
          color: COLORS.muted,
          fontSize: '0.7rem'
        }}
      >
        {title}
      </div>
      <div style={{ paddingLeft: '6px', paddingRight: '6px' }}>
        {items.map((item, index) => (
          <div key={item.id} style={{ marginBottom: index < items.length - 1 ? '6px' : '0' }}>
            <NavigationItem
              item={item}
              isActive={currentPath === item.path}
              isExpanded={expandedItems.has(item.id)}
              onToggleExpand={onToggleExpand}
              onNavigate={onNavigate}
              isVisible={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

// Main Component
const SideMenuTeacher = ({ isOpen, toggleSidebar }) => {
  const [expandedItems, setExpandedItems] = useState(new Set(['stories', 'students']));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { userName, userRole, teacherData, profileImageUrl, loading, error } = useTeacherAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get all navigation items for collapsed view
  const getAllNavigationItems = useCallback(() => {
    const allItems = [];
    
    // Add dashboard items
    NAVIGATION_ITEMS.dashboard.forEach(item => {
      if (item.subItems) {
        // For items with subItems, add the subitems directly
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
    
    // Add other items
    NAVIGATION_ITEMS.others.forEach(item => {
      allItems.push(item);
    });
    
    return allItems;
  }, []);

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
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const userDocRef = doc(db, "teachers", user.uid);
        await updateDoc(userDocRef, { activeSessionId: null });
      }
      
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

  if (error) {
    return (
      <Navbar 
        className={`sidebar flex-column p-4 ${isOpen ? "show" : "collapsed"}`}
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.danger}, ${COLORS.lightBlue})`,
          color: COLORS.white,
          width: isOpen ? "280px" : "70px"
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
            padding: isOpen ? "16px 12px" : "12px 6px"
          }}
        >
          {isOpen ? (
            <UserProfile
              userName={userName}
              profileImageUrl={profileImageUrl}
              teacherData={teacherData}
              loading={loading}
            />
          ) : (
            // Collapsed profile - just show avatar
            <div className="d-flex justify-content-center">
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="collapsed-profile-tooltip">
                    <div className="text-start p-2">
                      <div className="fw-semibold mb-1">{userName}</div>
                      {teacherData?.section && (
                        <div className="text-light small mb-1">
                          <strong>Section:</strong> {teacherData.section}
                        </div>
                      )}
                      {teacherData?.email && (
                        <div className="text-light small mb-1">
                          <strong>Email:</strong> {teacherData.email}
                        </div>
                      )}
                      {teacherData?.role && (
                        <div className="text-light small">
                          <strong>Role:</strong> {teacherData.role.charAt(0).toUpperCase() + teacherData.role.slice(1)}
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
                      {userName.charAt(0).toUpperCase()}
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
            overflowY: "auto",
            overflowX: "hidden",
            padding: isOpen ? "16px 0" : "12px 0",
            maxHeight: "calc(100vh - 200px)" // Reserve space for profile and logout
          }}
        >
          {isOpen ? (
            // Full navigation when expanded - with proper scrolling
            <div className="d-flex flex-column">
              {/* Dashboard Section */}
              <NavigationSection
                title="Dashboard"
                items={NAVIGATION_ITEMS.dashboard}
                expandedItems={expandedItems}
                onToggleExpand={handleToggleExpand}
                onNavigate={handleNavigate}
                currentPath={location.pathname}
              />

              {/* Reduced spacing to fit everything */}
              <div style={{ height: '16px' }}></div>

              {/* Account Section */}
              <NavigationSection
                title="Account"
                items={NAVIGATION_ITEMS.others}
                expandedItems={expandedItems}
                onToggleExpand={handleToggleExpand}
                onNavigate={handleNavigate}
                currentPath={location.pathname}
              />

              {/* Small bottom padding */}
              <div style={{ height: '16px' }}></div>
            </div>
          ) : (
            // Collapsed navigation - compact icons
            <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ gap: '8px' }}>
              {getAllNavigationItems().map((item, index) => {
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

          /* Mobile Styles - Keep fixed positioning only for mobile */
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

          /* Desktop Styles - Smaller widths to prevent overlap */
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

          /* Overlay for mobile when sidebar is open */
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

      {/* Mobile Overlay - Only show on mobile */}
      {typeof window !== 'undefined' && window.innerWidth <= 768 && (
        <div 
          className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
          onClick={toggleSidebar}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        show={showLogoutModal}
        onHide={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        userName={userName}
        userType="teacher"
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

export default React.memo(SideMenuTeacher);