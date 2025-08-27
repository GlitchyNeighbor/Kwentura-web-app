import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  InputGroup,
  FormControl,
  Modal,
  Alert,
  Badge,
  Spinner,
  ButtonGroup,
} from "react-bootstrap";
import {
  Search,
  ArrowLeftCircleFill,
  ThreeDotsVertical,
  PersonFill,
  Archive,
  ArrowCounterclockwise,
  TrashFill,
  Clock,
} from "react-bootstrap-icons";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Shield,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"; 
import { db, app } from "../config/FirebaseConfig.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import SidebarMenuAdmin from "./SidebarMenuAdmin";
import TopNavbar from "./TopNavbar";
import "../scss/custom.scss";

// Initialize Firebase Functions
const functions = getFunctions(app); 
const logAdminUiActionCallable = httpsCallable(functions, 'logAdminUiAction');

// Constants
const COLORS = {
  primary: "#FF69B4",
  secondary: "#FFB6C1", 
  success: "#98FB98",
  danger: "#FF69B4",
  warning: "#FFB6C1",
  info: "#FF69B4",
  light: "#FFF0F5",
  dark: "#2D2D2D",
  pink: "#FF69B4",
  lightPink: "#FFE4E1",
  softPink: "#FFF0F5",
};

const ACCOUNT_TYPES = {
  admin: { label: "Admin", icon: Shield, color: COLORS.pink },
  teacher: { label: "Teacher", icon: GraduationCap, color: COLORS.info },
  student: { label: "Student", icon: PersonFill, color: COLORS.info },
};

// Custom hooks
const useAccounts = (filterStatus, currentUser, authChecked) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAccountQuery = useCallback((collectionRef) => {
    if (filterStatus === "active") {
      return query(collectionRef, where("isArchived", "==", false));
    } else if (filterStatus === "archived") {
      return query(collectionRef, where("isArchived", "==", true));
    } else {
      return query(collectionRef);
    }
  }, [filterStatus]);

  const fetchAccounts = useCallback(async () => {
    if (!currentUser || !authChecked) { 
      setLoading(false);
      setAccounts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const allAccounts = [];

      // Fetch admins
      const adminsRef = collection(db, "admins");
      const adminsSnapshot = await getDocs(getAccountQuery(adminsRef));
      adminsSnapshot.forEach((doc) => {
        allAccounts.push({
          id: doc.id,
          ...doc.data(),
          accountType: "admin",
          displayName: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim(),
        });
      });

      // Fetch teachers
      const teachersRef = collection(db, "teachers");
      const teachersSnapshot = await getDocs(getAccountQuery(teachersRef));
      teachersSnapshot.forEach((doc) => {
        allAccounts.push({
          id: doc.id,
          ...doc.data(),
          accountType: "teacher",
          displayName: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim(),
        });
      });

      // Fetch students
      const studentsRef = collection(db, "students");
      const studentsSnapshot = await getDocs(getAccountQuery(studentsRef));
      studentsSnapshot.forEach((doc) => {
        const data = doc.data();
        allAccounts.push({
          id: doc.id,
          ...data,
          accountType: "student",
          firstName: data.studentFirstName,
          lastName: data.studentLastName,
          displayName: `${data.studentFirstName || ''} ${data.studentLastName || ''}`.trim(),
        });
      });

      setAccounts(allAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, authChecked, getAccountQuery]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, setAccounts, loading, error, refetch: fetchAccounts };
};

const useAlert = () => {
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  const showAlert = useCallback((message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, show: false }));
  }, []);

  return { alert, showAlert, hideAlert };
};

// Components
const StatCard = ({ title, value, icon: IconComponent, color, trend }) => (
  <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="text-muted mb-2 fs-6">{title}</div>
          <h3 className="mb-0 fw-bold text-dark">{value}</h3>
          {trend && (
            <small className={`text-${trend.type}`}>
              {trend.value}% from last month
            </small>
          )}
        </div>
        <div
          className="p-3 rounded-circle"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <IconComponent size={24} />
        </div>
      </div>
    </Card.Body>
  </Card>
);

const FilterButton = ({ active, onClick, children, variant = "outline" }) => (
  <Button
    variant={active ? "primary" : variant + "-primary"}
    size="sm"
    onClick={onClick}
    className="fw-semibold"
    style={{
      backgroundColor: active ? COLORS.pink : 'transparent',
      borderColor: COLORS.pink,
      color: active ? 'white' : COLORS.pink,
      borderRadius: "20px",
      padding: "8px 16px",
      transition: "all 0.2s ease",
    }}
  >
    {children}
  </Button>
);

const UnarchiveConfirmModal = ({ show, onHide, onConfirm, account, loading }) => (
  <Modal show={show} onHide={onHide} size="sm" centered>
    <Modal.Header 
      className="border-0 text-white"
      style={{ background: `linear-gradient(135deg, ${COLORS.success} 0%, #66BB6A 100%)` }}
    >
      <Modal.Title>Unarchive Account</Modal.Title>
      <Button
        variant="link"
        onClick={onHide}
        className="btn-close btn-close-white"
        disabled={loading}
      />
    </Modal.Header>
    <Modal.Body className="text-center p-4">
      <div className="mb-3">
        <ArrowCounterclockwise size={48} style={{ color: COLORS.success }} />
      </div>
      <h5 className="mb-3">Restore Account Access?</h5>
      <p className="text-muted mb-0">
        This will unarchive <strong>{account?.displayName || 'this account'}</strong> 
        and restore their system access.
      </p>
    </Modal.Body>
    <Modal.Footer className="border-0 justify-content-center">
      <Button
        variant="secondary"
        onClick={onHide}
        disabled={loading}
        style={{ borderRadius: "25px", minWidth: "100px" }}
      >
        Cancel
      </Button>
      <Button
        style={{
          backgroundColor: COLORS.success,
          border: "none",
          borderRadius: "25px", 
          minWidth: "100px",
          color: "white"
        }}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" />
            Restoring...
          </>
        ) : (
          "Unarchive"
        )}
      </Button>
    </Modal.Footer>
  </Modal>
);

const DeleteConfirmModal = ({ show, onHide, onConfirm, account, loading }) => (
  <Modal show={show} onHide={onHide} size="sm" centered>
    <Modal.Header 
      className="border-0 text-white"
      style={{ background: `linear-gradient(135deg, #DC3545 0%, #E57373 100%)` }}
    >
      <Modal.Title>Delete Account Permanently</Modal.Title>
      <Button
        variant="link"
        onClick={onHide}
        className="btn-close btn-close-white"
        disabled={loading}
      />
    </Modal.Header>
    <Modal.Body className="text-center p-4">
      <div className="mb-3">
        <TrashFill size={48} style={{ color: "#DC3545" }} />
      </div>
      <h5 className="mb-3">Permanently Delete Account?</h5>
      <p className="text-muted mb-2">
        This will permanently delete <strong>{account?.displayName || 'this account'}</strong> 
        from both the database and authentication system.
      </p>
      <div className="alert alert-danger" style={{ fontSize: "0.9rem" }}>
        <strong>⚠️ This action cannot be undone!</strong>
      </div>
    </Modal.Body>
    <Modal.Footer className="border-0 justify-content-center">
      <Button
        variant="secondary"
        onClick={onHide}
        disabled={loading}
        style={{ borderRadius: "25px", minWidth: "100px" }}
      >
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={onConfirm}
        disabled={loading}
        style={{ borderRadius: "25px", minWidth: "100px" }}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" />
            Deleting...
          </>
        ) : (
          "Delete Forever"
        )}
      </Button>
    </Modal.Footer>
  </Modal>
);

// Main Component
const AccountList = () => {
  const navigate = useNavigate();
  const { alert, showAlert, hideAlert } = useAlert();

  // Authentication state
  const [currentUser, setCurrentUser] = useState(null); 
  const [authChecked, setAuthChecked] = useState(false);

  // UI State
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false);
  const [selectedAccountToUnarchive, setSelectedAccountToUnarchive] = useState(null);
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState(false);
  const [selectedAccountToDeletePermanently, setSelectedAccountToDeletePermanently] = useState(null);

  const { accounts, setAccounts, loading: accountsLoading, error: accountsError } = useAccounts(filterStatus, currentUser, authChecked);

  // Authentication effect
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true); 
      if (!user) {
        showAlert("Authentication error: No user is currently signed in. Please log in again.", "danger");
      }
    });
    return () => unsubscribe();
  }, [showAlert]); 

  // Computed values
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        account.id?.toLowerCase().includes(searchTermLower) ||
        account.schoolId?.toLowerCase().includes(searchTermLower) ||
        (account.firstName && account.firstName.toLowerCase().includes(searchTermLower)) ||
        (account.lastName && account.lastName.toLowerCase().includes(searchTermLower)) ||
        account.accountType?.toLowerCase().includes(searchTermLower) ||
        (account.email && account.email.toLowerCase().includes(searchTermLower)) ||
        account.displayName?.toLowerCase().includes(searchTermLower)
      );
    });
  }, [accounts, searchTerm]);

  const stats = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter(acc => !acc.isArchived).length,
    archived: accounts.filter(acc => acc.isArchived).length,
    byType: accounts.reduce((acc, account) => {
      const type = account.accountType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
  }), [accounts]);

  // Event handlers
  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  const handleUnarchivePrompt = useCallback((account) => {
    setSelectedAccountToUnarchive(account);
    setShowUnarchiveConfirm(true);
  }, []);

  const handleUnarchiveConfirm = useCallback(async () => {
    if (!selectedAccountToUnarchive) return;
    setLoading(true);
    
    try {
      const account = selectedAccountToUnarchive;
      let collectionName;

      switch (account.accountType.toLowerCase()) {
        case "admin":
          collectionName = "admins";
          break;
        case "teacher":
          collectionName = "teachers";
          break;
        case "student":
          collectionName = "students";
          break;
        default:
          collectionName = account.accountType.toLowerCase() + "s";
      }

      const accountRef = doc(db, collectionName, account.id);
      await updateDoc(accountRef, {
        isArchived: false,
        unarchivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setAccounts((prevAccounts) =>
        prevAccounts.filter((acc) => acc.id !== account.id)
      );

      showAlert("Account unarchived successfully!", "success");

      // Log admin action
      logAdminUiActionCallable({
        actionType: 'account_unarchived',
        collectionName: collectionName,
        documentId: account.id,
        targetUserId: account.uid || account.id, 
        targetUserFullName: account.displayName,
      }).catch(console.error);

      setShowUnarchiveConfirm(false);
      setSelectedAccountToUnarchive(null);
    } catch (error) {
      console.error("Error unarchiving account:", error);
      showAlert(`Failed to unarchive account: ${error.message}`, "danger");
    } finally {
      setLoading(false);
    }
  }, [selectedAccountToUnarchive, setAccounts, showAlert]);

  const handlePermanentDeletePrompt = useCallback((account) => {
    setSelectedAccountToDeletePermanently(account);
    setShowPermanentDeleteConfirm(true);
  }, []);

  const handlePermanentDeleteConfirm = useCallback(async () => {
    if (!selectedAccountToDeletePermanently) return;
    setLoading(true);
    const accountToDelete = selectedAccountToDeletePermanently;

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      showAlert("Authentication error: No user is currently signed in. Please log in again.", "danger");
      setLoading(false);
      setShowPermanentDeleteConfirm(false);
      setSelectedAccountToDeletePermanently(null);
      return;
    }
    
    try {
      const idToken = await user.getIdToken(true); 
      if (!idToken) {
        showAlert("Authentication error: Could not retrieve a valid ID token. Please try logging in again.", "danger");
        setLoading(false);
        setShowPermanentDeleteConfirm(false);
        setSelectedAccountToDeletePermanently(null);
        return;
      }

      try {
        let collectionName;
        switch (accountToDelete.accountType.toLowerCase()) {
          case "admin":
            collectionName = "admins";
            break;
          case "teacher":
            collectionName = "teachers";
            break;
          case "student":
            collectionName = "students";
            break;
          default:
            showAlert("Unknown account type for permanent deletion.", "danger");
            setLoading(false); 
            setShowPermanentDeleteConfirm(false);
            setSelectedAccountToDeletePermanently(null);
            return;
        }

        const deleteUserAccountfn = httpsCallable(functions, "deleteUserAccount");
        await deleteUserAccountfn({
          uid: accountToDelete.uid || accountToDelete.id, 
          collectionName: collectionName,
          documentId: accountToDelete.id,
        });

        // Log admin action
        logAdminUiActionCallable({
          actionType: 'account_permanently_deleted',
          collectionName: collectionName,
          documentId: accountToDelete.id,
          targetUserId: accountToDelete.uid || accountToDelete.id,
          targetUserFullName: accountToDelete.displayName,
        }).catch(console.error);

        showAlert("Account permanently deleted from both database and authentication!", "success");
        setAccounts((prevAccounts) =>
          prevAccounts.filter((acc) => acc.id !== accountToDelete.id)
        );
      } catch (error) { 
        console.error("Error permanently deleting account:", error);
        let errorMessage = "Failed to permanently delete account";
        if (error.code === "functions/permission-denied") {
          errorMessage = "You don't have permission to delete accounts";
        } else if (error.code === "functions/unauthenticated") {
          errorMessage = "You must be logged in to delete accounts";
        } else if (error.message) {
          errorMessage = `Failed to delete account: ${error.message}`;
        }
        showAlert(errorMessage, "danger");
      }
    } catch (error) { 
      console.error("Error obtaining ID token:", error);
      showAlert(`Authentication or token refresh error: ${error.message}`, "danger");
    }

    setLoading(false);
    setShowPermanentDeleteConfirm(false);
    setSelectedAccountToDeletePermanently(null);
  }, [selectedAccountToDeletePermanently, setAccounts, showAlert]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    return "N/A";
  };

  if (!authChecked) {
    return (
      <div className="app-container" style={{ overflow: "hidden", height: "100vh" }}>
        <TopNavbar toggleSidebar={toggleSidebar} />
        <div className="content-container" style={{ display: "flex", height: "calc(100vh - 56px)" }}>
          <Container
            fluid
            className="main-content"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
            }}
          >
            <div className="text-center">
              <Spinner size="lg" style={{ color: COLORS.primary }} className="mb-3" />
              <h5 className="text-muted">Checking authentication...</h5>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (accountsLoading) {
    return (
      <div className="app-container" style={{ overflow: "hidden", height: "100vh" }}>
        <TopNavbar toggleSidebar={toggleSidebar} />
        <div className="content-container" style={{ display: "flex", height: "calc(100vh - 56px)" }}>
          <div className={`sidebar-container ${showSidebar ? "show" : ""}`}>
            <SidebarMenuAdmin isOpen={showSidebar} toggleSidebar={toggleSidebar} />
          </div>
          <Container
            fluid
            className={`main-content ${showSidebar ? "shifted" : ""}`}
            style={{
              overflowY: "auto",
              padding: "20px",
              height: "100vh",
              flex: 1,
            background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="text-center">
              <Spinner size="lg" style={{ color: COLORS.primary }} className="mb-3" />
              <h5 className="text-muted">Loading accounts...</h5>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ overflow: "hidden", height: "100vh" }}>
      <style jsx>{`
        .table-row-hover:hover {
          background-color: #FFF0F5 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 105, 180, 0.1);
        }
        
        .action-button:hover {
          background-color: ${COLORS.pink} !important;
          color: white !important;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
        }
        
        .dropdown-item:hover {
          background-color: #FFF0F5 !important;
          color: ${COLORS.pink} !important;
        }
        
        .min-width-0 {
          min-width: 0;
        }
        
        .flex-shrink-0 {
          flex-shrink: 0;
        }
        
        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
      
      <TopNavbar toggleSidebar={toggleSidebar} />

      <div className="content-container" style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        <div className={`sidebar-container ${showSidebar ? "show" : ""}`}>
          <SidebarMenuAdmin isOpen={showSidebar} toggleSidebar={toggleSidebar} />
        </div>

        <Container
          fluid
          className={`main-content ${showSidebar ? "shifted" : ""}`}
          style={{
            overflowY: "auto",
            padding: "24px",
            height: "calc(100vh - 56px)",
            flex: 1,
            background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
          }}
        >
          {/* Alert */}
          <Alert
            show={alert.show}
            variant={alert.variant}
            onClose={hideAlert}
            dismissible
            style={{
              position: "fixed",
              top: "80px",
              right: "20px",
              zIndex: 9999,
              minWidth: "300px",
              maxWidth: "500px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              borderRadius: "8px",
            }}
          >
            {alert.message}
          </Alert>

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                onClick={() => navigate(-1)}
                className="me-3 p-0"
                style={{ color: COLORS.primary }}
              >
                <ArrowLeftCircleFill size={24} />
              </Button>
              <div>
                <h1 className="mb-1 fw-bold text-dark">Account Management</h1>
                <p className="text-muted mb-0">
                  View and manage all user accounts
                  {filterStatus === "active" && " (Active)"}
                  {filterStatus === "archived" && " (Archived)"}
                  {filterStatus === "all" && " (All Status)"}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              {/* Filter Buttons */}
              <div className="d-flex gap-2">
                <FilterButton
                  active={filterStatus === "active"}
                  onClick={() => setFilterStatus("active")}
                >
                  <UserCheck size={16} className="me-1" />
                  Active
                </FilterButton>
                <FilterButton
                  active={filterStatus === "archived"}
                  onClick={() => setFilterStatus("archived")}
                >
                  <Archive size={16} className="me-1" />
                  Archived
                </FilterButton>
                <FilterButton
                  active={filterStatus === "all"}
                  onClick={() => setFilterStatus("all")}
                >
                  <Users size={16} className="me-1" />
                  All
                </FilterButton>
                </div>
              
              {/* Search */}
              <InputGroup style={{ width: "300px" }}>
                <FormControl
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 shadow-sm"
                  style={{ 
                    borderRadius: "25px 0 0 25px",
                    border: `1px solid ${COLORS.secondary}`,
                    borderRight: "none"
                  }}
                />
                <InputGroup.Text 
                  className="shadow-sm"
                  style={{ 
                    borderRadius: "0 25px 25px 0",
                    backgroundColor: "white",
                    color: COLORS.pink,
                    borderLeft: "none"
                  }}
                >
                  <Search />
                </InputGroup.Text>
              </InputGroup>
            </div>
          </div>

          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <StatCard
                title="Total Accounts"
                value={stats.total}
                icon={Users}
                color={COLORS.pink}
              />
            </Col>
            <Col lg={3} md={6}>
              <StatCard
                title="Active Accounts"
                value={stats.active}
                icon={UserCheck}
                color={COLORS.secondary}
              />
            </Col>
            <Col lg={3} md={6}>
              <StatCard
                title="Archived Accounts"
                value={stats.archived}
                icon={UserX}
                color={COLORS.warning}
              />
            </Col>
            <Col lg={3} md={6}>
              <StatCard
                title="Teachers"
                value={stats.byType.teacher || 0}
                icon={GraduationCap}
                color={COLORS.info}
              />
            </Col>
          </Row>

          {/* Error State */}
          {accountsError && (
            <Alert variant="danger" className="mb-4">
              <strong>Error loading accounts:</strong> {accountsError}
            </Alert>
          )}

          {/* Content */}
          <Card className="shadow-sm border-0" style={{ borderRadius: "15px" }}>
            <Card.Header 
              className="border-0 py-4"
              style={{ 
                borderRadius: "15px 15px 0 0",
                backgroundColor: COLORS.light
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold">
                  Accounts List
                  <Badge 
                    className="ms-2"
                    style={{ 
                      backgroundColor: COLORS.pink, 
                      color: "white",
                      borderRadius: "12px",
                      padding: "4px 8px"
                    }}
                  >
                    {filteredAccounts.length}
                  </Badge>
                </h5>
                {searchTerm && (
                  <small className="text-muted">
                    Showing {filteredAccounts.length} of {accounts.length} accounts
                  </small>
                )}
              </div>
            </Card.Header>
            
            <Card.Body className="p-0">
              {filteredAccounts.length === 0 ? (
                <div className="text-center py-5">
                  <Users size={48} className="text-muted mb-3" opacity={0.3} />
                  <h5 className="text-muted mb-2">
                    {searchTerm ? "No accounts found" : `No ${filterStatus} accounts`}
                  </h5>
                  <p className="text-muted mb-3">
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : `There are no ${filterStatus} accounts to display`
                    }
                  </p>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr style={{ backgroundColor: '#FFF0F5' }}>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '25%',
                          paddingLeft: '24px'
                        }}
                      >
                        Account
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '15%'
                        }}
                      >
                        School ID
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '15%'
                        }}
                      >
                        Type
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '12%'
                        }}
                      >
                        Status
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '15%'
                        }}
                      >
                        Updated
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold text-center" 
                        style={{ 
                          color: COLORS.pink,
                          width: '18%',
                          paddingRight: '24px'
                        }}
                      >
                        {/* Actions */}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account, index) => {
                      const accountConfig = ACCOUNT_TYPES[account.accountType] || ACCOUNT_TYPES.student;
                      const IconComponent = accountConfig.icon;
                      
                      return (
                        <tr 
                          key={account.id}
                          className="table-row-hover"
                          style={{ 
                            backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FFF8FA',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #FFE4E1'
                          }}
                        >
                          <td className="py-4 align-middle" style={{ paddingLeft: '24px' }}>
                            <div className="d-flex align-items-center">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                style={{ 
                                  width: '48px', 
                                  height: '48px',
                                  background: `linear-gradient(135deg, ${accountConfig.color} 0%, ${COLORS.secondary} 100%)`,
                                  boxShadow: '0 2px 8px rgba(255, 105, 180, 0.2)'
                                }}
                              >
                                <IconComponent size={22} style={{ color: "white" }} />
                              </div>
                              <div className="min-width-0 flex-grow-1">
                                <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                                  {account.displayName || 'Unknown'}
                                </div>
                                <small 
                                  className="text-muted text-truncate d-block" 
                                  style={{ fontSize: '0.8rem', maxWidth: '200px' }}
                                  title={account.email}
                                >
                                  {account.email || 'No email'}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 align-middle">
                            <Badge 
                              className="fw-semibold"
                              style={{ 
                                backgroundColor: COLORS.pink, 
                                color: 'white',
                                fontSize: '0.8rem',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                border: 'none',
                                boxShadow: '0 2px 6px rgba(255, 105, 180, 0.3)'
                              }}
                            >
                              {account.schoolId || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-4 align-middle">
                            <div className="d-flex align-items-center">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  backgroundColor: `${accountConfig.color}15`
                                }}
                              >
                                <IconComponent size={14} style={{ color: accountConfig.color }} />
                              </div>
                              <span 
                                className="fw-semibold text-capitalize" 
                                style={{ fontSize: '0.9rem', color: accountConfig.color }}
                              >
                                {accountConfig.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 align-middle">
                            <Badge 
                              className="fw-semibold"
                              style={{ 
                                backgroundColor: account.isArchived ? '#6C757D' : COLORS.success,
                                color: 'white',
                                fontSize: '0.8rem',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                border: 'none',
                                boxShadow: `0 2px 6px ${account.isArchived ? 'rgba(108, 117, 125, 0.3)' : 'rgba(152, 251, 152, 0.3)'}`
                              }}
                            >
                              {account.isArchived ? (
                                <>
                                  <Archive size={12} className="me-1" />
                                  Archived
                                </>
                              ) : (
                                <>
                                  <UserCheck size={12} className="me-1" />
                                  Active
                                </>
                              )}
                            </Badge>
                          </td>
                          <td className="py-4 align-middle">
                            <div className="d-flex align-items-center">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  backgroundColor: '#FFE4E1'
                                }}
                              >
                                <Clock size={12} style={{ color: COLORS.pink }} />
                              </div>
                              <span 
                                className="text-dark" 
                                style={{ fontSize: '0.85rem', fontWeight: '500' }}
                              >
                                {formatDate(account.updatedAt)}
                              </span>
                            </div>
                          </td>
                          {/* <td className="py-4 align-middle text-center" style={{ paddingRight: '24px' }}>
                            {account.isArchived ? (
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUnarchivePrompt(account)}
                                  disabled={loading}
                                  className="d-flex align-items-center"
                                  style={{
                                    backgroundColor: COLORS.success,
                                    border: "none",
                                    borderRadius: "20px",
                                    padding: "6px 12px",
                                    fontSize: "0.8rem",
                                    fontWeight: "500",
                                    color: "white",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <ArrowCounterclockwise size={14} className="me-1" />
                                  Restore
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handlePermanentDeletePrompt(account)}
                                  disabled={loading}
                                  className="d-flex align-items-center"
                                  style={{
                                    borderRadius: "20px",
                                    padding: "6px 12px",
                                    fontSize: "0.8rem",
                                    fontWeight: "500",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <TrashFill size={14} className="me-1" />
                                  Delete
                                </Button>
                              </div>
                            ) : (
                              <Badge 
                                className="fw-semibold"
                                style={{ 
                                  backgroundColor: '#E9ECEF',
                                  color: '#E9ECEF',
                                  fontSize: '0.8rem',
                                  borderRadius: '20px',
                                  padding: '8px 16px',
                                  border: 'none'
                                }}
                              >
                                No actions
                              </Badge>
                            )}
                          </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Modals */}
      <UnarchiveConfirmModal
        show={showUnarchiveConfirm}
        onHide={() => {
          setShowUnarchiveConfirm(false);
          setSelectedAccountToUnarchive(null);
        }}
        onConfirm={handleUnarchiveConfirm}
        account={selectedAccountToUnarchive}
        loading={loading}
      />

      <DeleteConfirmModal
        show={showPermanentDeleteConfirm}
        onHide={() => {
          setShowPermanentDeleteConfirm(false);
          setSelectedAccountToDeletePermanently(null);
        }}
        onConfirm={handlePermanentDeleteConfirm}
        account={selectedAccountToDeletePermanently}
        loading={loading}
      />
    </div>
  );
};

export default AccountList;