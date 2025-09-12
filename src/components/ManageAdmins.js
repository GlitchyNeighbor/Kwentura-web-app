import React, { useState, useEffect } from "react";
import SidebarMenuAdmin from "./SidebarMenuAdmin";
import { Card } from "react-bootstrap";
import { TelephoneFill } from "react-bootstrap-icons";
import { EnvelopeFill, CardText } from "react-bootstrap-icons";
import TopNavbar from "./TopNavbar";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDocs,
  collection,
  updateDoc,
  query,
  setDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import {
  Table,
  Button,
  InputGroup,
  FormControl,
  Container,
  Row,
  Col,
  Modal,
  Form,
  Dropdown,
  Alert,
} from "react-bootstrap";
import {
  PlusCircleFill,
  Search,
  ArrowLeftCircleFill,
  ThreeDotsVertical,
  PencilFill,
  TrashFill,
} from "react-bootstrap-icons";
import "../scss/custom.scss";
import { Eye, EyeOff } from "lucide-react"; 
import { Shield } from "react-bootstrap-icons";
import { Badge } from "react-bootstrap";

import { db, auth, app, firebaseConfig } from "../config/FirebaseConfig.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp } from "firebase/app";


const functions = getFunctions(app);
const logAdminUiActionCallable = httpsCallable(functions, 'logAdminUiAction');

async function updateAdminPassword(uid, newPassword) {
  const updatePasswordFn = httpsCallable(functions, "updateAdminPassword");
  return updatePasswordFn({ uid, newPassword });
}

const ManageAdmins = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    schoolId: "",
    accountType: "admin",
    email: "",
    contactNumber: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  useEffect(() => {
    
    setCurrentUser(auth.currentUser);

    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "admins"), where("isArchived", "==", false))
        ); 
        const adminsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdmins(adminsList);
      } catch (error) {
        console.error("Error fetching admins: ", error);
        showAlert(`Failed to fetch admins: ${error.message}`);
      }
      setLoading(false);
    };

    fetchAdmins();
  }, []);


  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (name === "password") {
      validatePassword(value);
    }
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setSelectedAdmin(null);
    setFormData({
      
      firstName: "",
      lastName: "",
      schoolId: "",
      accountType: "admin",
      email: "",
      contactNumber: "",
      password: "",
    });
    setConfirmPassword("");
    setShowModal(true);
    setAlert({ show: false, message: "", type: "success" }); 
    setPasswordRequirements({
      minLength: false,
      hasUppercase: false,
      hasNumber: false,
      hasSymbol: false,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedAdmin(null);
    setFormData({
      firstName: "",
      lastName: "",
      schoolId: "",
      accountType: "admin",
      email: "",
      contactNumber: "",
      password: "",
    });
    setConfirmPassword("");
    setPasswordRequirements({
      minLength: false,
      hasUppercase: false,
      hasNumber: false,
      hasSymbol: false,
    });
  };

  

  
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(
      () => setAlert({ show: false, message: "", type: "success" }),
      3500
    );
  };

  
  const checkValueExistsInCollections = async (
    fieldName,
    value,
    collectionsToQuery,
    excludeId = null, 
    excludeCollectionName = null 
  ) => {
    if (!value || typeof value !== "string" || value.trim() === "") {
      return false; 
    }
    const trimmedValue =
      fieldName === "email" ? value.trim().toLowerCase() : value.trim();

    try {
      for (const collectionName of collectionsToQuery) {
        const q = query(
          collection(db, collectionName),
          where(fieldName, "==", trimmedValue)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          if (excludeId && collectionName === excludeCollectionName) {
            
            for (const docSnapshot of querySnapshot.docs) {
              if (docSnapshot.id !== excludeId) {
                return true; 
              }
            }
          } else {
            return true; 
          }
        }
      }
      return false;
    } catch (error) {
      console.error(`Error checking ${fieldName}:`, error);
      throw new Error(`Failed to validate ${fieldName}`);
    }
  };

  
  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
    setPasswordRequirements(requirements);
    return requirements;
  };

  const handleSubmit = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.schoolId ||
      !formData.email ||
      (!isEditMode && !formData.password)
    ) {
      showAlert(
        "Please fill in all required fields: First Name, Last Name, School ID, Email" +
          (isEditMode ? "" : ", and Password") +
          ".",
        "danger"
      );
      return;
    }

    if (!isEditMode && formData.password !== confirmPassword) {
      showAlert("Passwords do not match.", "danger");
      return;
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert("Please enter a valid email address.", "danger");
      return;
    }

    
    if (!isEditMode) {
      const requirements = validatePassword(formData.password);
      if (!Object.values(requirements).every((req) => req)) {
        showAlert("Please ensure the password meets all requirements.", "danger");
        return;
      }
    }


    setLoading(true);
    try {
      
      const excludeId = isEditMode && selectedAdmin ? selectedAdmin.id : null;
      const collectionsToSearch = ["admins", "teachers", "students"];
      const schoolIdExists = await checkValueExistsInCollections(
        "schoolId", 
        formData.schoolId,
        collectionsToSearch,
        excludeId,
        "admins" 
      );
      if (schoolIdExists) {
        showAlert(
          "This School ID is already registered in the system.",
          "danger"
        );
        setLoading(false);
        return;
      }

      
      const emailExists = await checkValueExistsInCollections(
        "email",
        formData.email,
        collectionsToSearch,
        excludeId,
        "admins" 
      );
      if (emailExists) {
        showAlert(
          "This Email is already registered in the system.",
          "danger"
        );
        setLoading(false);
        return;
      }


      const adminData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        schoolId: formData.schoolId,
        accountType: formData.accountType,
        email: formData.email,
        contactNumber: formData.contactNumber, 
        role: formData.accountType === "superAdmin" ? "superAdmin" : "admin",
        isArchived: false, 
        updatedAt: new Date(),
      };

      if (isEditMode && selectedAdmin) {
        
        const adminRef = doc(db, "admins", selectedAdmin.id);
        await updateDoc(adminRef, adminData);
        if (formData.password && formData.password.length >= 6) {
          try {
            await updateAdminPassword(selectedAdmin.uid, formData.password);
            showAlert("Password updated in Authentication!", "success");
          } catch (err) {
            showAlert("Failed to update password in Authentication.", "danger");
          }
        }

        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin.id === selectedAdmin.id ? { ...admin, ...adminData } : admin
          )
        );

        showAlert("Admin updated successfully!", "success");
        // --- LOG EDIT ---
        const adminFullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
        logAdminUiActionCallable({
          actionType: 'admin_account_updated',
          adminId: currentUser?.uid, // <-- Add this line
          collectionName: 'admins',
          documentId: selectedAdmin.id,
          targetUserId: selectedAdmin.uid || selectedAdmin.id,
          targetUserFullName: adminFullName,
        }).catch(console.error);
        // --- END LOG EDIT ---
      } else {
        
        const secondaryApp = initializeApp(firebaseConfig, `secondary-creation-${Date.now()}`);
        const secondaryAuth = getAuth(secondaryApp);
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          formData.email,
          formData.password
        );
        const authUid = userCredential.user.uid;

        const adminDataForCreate = {
          ...adminData,
          uid: authUid, 
          createdAt: serverTimestamp(), 
          updatedAt: serverTimestamp(), 
          isArchived: false,
          emailVerified: userCredential.user.emailVerified,
          activeSessionId: null, 
        };
        delete adminDataForCreate.password; 

        await setDoc(doc(db, "admins", authUid), adminDataForCreate);
        const newAdminWithId = { id: authUid, ...adminDataForCreate };

        setAdmins((prevAdmins) => [...prevAdmins, newAdminWithId]);
        showAlert("Admin added successfully!", "success");

        // Log admin action for admin creation
        const adminFullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
        logAdminUiActionCallable({
          actionType: 'admin_account_created',
          adminId: currentUser?.uid, // <-- Add this line
          collectionName: 'admins',
          documentId: authUid,
          targetUserId: authUid,
          targetUserFullName: adminFullName,
        }).catch(console.error);

        
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving admin:", error);
      let errorMessage = "Failed to save admin.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters long.";
      } else {
        errorMessage = `Failed to save admin: ${error.message}`;
      }

      showAlert(errorMessage, "danger");
    }
    setLoading(false);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsEditMode(true);

    setFormData({
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      schoolId: admin.schoolId || "",
      accountType: admin.accountType || "admin",
      email: admin.email || "",
      contactNumber: admin.contactNumber || "",
      password: "",
    });
    setConfirmPassword("");
    setShowModal(true);
  };

  const handleDeletePrompt = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteConfirm(true);
    
  };

  const handleArchiveConfirm = async () => {
    
    if (!selectedAdmin) return;
    setLoading(true);
    try {
      const adminRef = doc(db, "admins", selectedAdmin.id);
      await updateDoc(adminRef, {
        isArchived: true,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setAdmins(admins.filter((admin) => admin.id !== selectedAdmin.id)); 

      showAlert("Admin archived successfully!", "success");
      const adminFullName = `${selectedAdmin.firstName || ""} ${selectedAdmin.lastName || ""}`.trim();

      logAdminUiActionCallable({
        actionType: 'admin_account_archived',
        collectionName: 'admins',
        documentId: selectedAdmin.id,
        targetUserId: selectedAdmin.uid || selectedAdmin.id, // Ensure this uses the correct ID field
        targetUserFullName: adminFullName,
      }).catch(console.error);
      setShowDeleteConfirm(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error deleting admin:", error);
      showAlert(`Failed to archive admin: ${error.message}`, "danger");
    } 
    setLoading(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedAdmin(null);
  };

  
  const PasswordRequirement = ({ met, text }) => (
    <div className="d-flex align-items-center mb-1">
      {met ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success me-2"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-danger me-2"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      )}
      <small className={met ? "text-success" : "text-muted"}>{text}</small>
    </div>
  );

  const filteredAdmins = admins.filter((admin) =>
    Object.values(admin).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const navigate = useNavigate();

  const COLORS = {
    primary: "#FF69B4",
    secondary: "#FFB6C1", 
    success: "#98FB98",
    danger: "#FFB6C1",
    warning: "#FFB6C1",
    info: "#FF69B4",
    light: "#FFF0F5",
    dark: "#2D2D2D",
    pink: "#FF69B4",
    lightPink: "#FFE4E1",
    softPink: "#FFF0F5",
  };

  return (
    <div className="app-container" style={{ overflow: "hidden", height: "100vh" }}>
      <style jsx>{`
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
        .min-width-0 { min-width: 0; }
        .flex-shrink-0 { flex-shrink: 0; }
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
            variant={alert.type === "danger" ? "danger" : "success"}
            onClose={() => setAlert({ ...alert, show: false })}
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
                <h1 className="mb-1 fw-bold text-dark">Manage Admins</h1>
                <p className="text-muted mb-0">Create, edit, and manage admin accounts</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <InputGroup style={{ width: "300px" }}>
                <FormControl
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={handleSearchChange}
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
                    color: COLORS.pink,
                    borderLeft: "none"
                  }}
                >
                  <Search />
                </InputGroup.Text>
              </InputGroup>
              <Button
                onClick={handleAddNew}
                disabled={loading}
                className="d-flex align-items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: COLORS.pink,
                  border: "none",
                  borderRadius: "25px",
                  padding: "10px 20px",
                  fontWeight: "500",
                }}
              >
                <PlusCircleFill size={18} />
                Add Admin
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-4 d-flex align-items-center">
                  <Shield size={32} color={COLORS.pink} className="me-3" />
                  <div>
                    <div className="text-muted mb-2 fs-6">Total Admins</div>
                    <h3 className="mb-0 fw-bold text-dark">{admins.length}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-4 d-flex align-items-center">
                  <Shield size={32} color={COLORS.secondary} className="me-3" />
                  <div>
                    <div className="text-muted mb-2 fs-6">Super Admins</div>
                    <h3 className="mb-0 fw-bold text-dark">
                      {admins.filter(a => a.accountType === "superAdmin").length}
                    </h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

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
                  Admins List
                  <Badge 
                    className="ms-2"
                    style={{ 
                      backgroundColor: COLORS.pink, 
                      color: "white",
                      borderRadius: "12px",
                      padding: "4px 8px"
                    }}
                  >
                    {filteredAdmins.length}
                  </Badge>
                </h5>
                {searchTerm && (
                  <small className="text-muted">
                    Showing {filteredAdmins.length} of {admins.length} admins
                  </small>
                )}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredAdmins.length === 0 ? (
                <div className="text-center py-5">
                  <Shield size={48} className="text-muted mb-3" opacity={0.3} />
                  <h5 className="text-muted mb-2">
                    {searchTerm ? "No admins found" : "No admins yet"}
                  </h5>
                  <p className="text-muted mb-3">
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : "Get started by adding your first admin"
                    }
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={handleAddNew}
                      style={{
                        backgroundColor: COLORS.pink,
                        border: "none",
                        borderRadius: "25px",
                        padding: "10px 20px",
                      }}
                    >
                      <PlusCircleFill size={18} className="me-2" />
                      Add First Admin
                    </Button>
                  )}
                </div>
              ) : (
                <Table responsive hover={false} className="mb-0">
                  <thead>
                    <tr style={{ backgroundColor: '#FFF0F5' }}>
                      <th className="border-0 py-4 fw-semibold" style={{ color: COLORS.pink, width: '25%', paddingLeft: '24px' }}>Admin</th>
                      <th className="border-0 py-4 fw-semibold" style={{ color: COLORS.pink, width: '18%' }}>Contact</th>
                      <th className="border-0 py-4 fw-semibold" style={{ color: COLORS.pink, width: '15%' }}>School ID</th>
                      <th className="border-0 py-4 fw-semibold" style={{ color: COLORS.pink, width: '15%' }}>Account Type</th>
                      <th className="border-0 py-4 fw-semibold text-center" style={{ color: COLORS.pink, width: '12%', paddingRight: '24px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin, index) => (
                      <tr 
                        key={admin.id}
                        style={{ 
                          backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FFF8FA',
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
                                background: `linear-gradient(135deg, ${COLORS.pink} 0%, ${COLORS.secondary} 100%)`,
                                boxShadow: '0 2px 8px rgba(255, 105, 180, 0.2)'
                              }}
                            >
                              <Shield size={22} style={{ color: "white" }} />
                            </div>
                            <div className="min-width-0 flex-grow-1">
                              <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                                {admin.firstName} {admin.lastName}
                              </div>
                              <small 
                                className="text-muted text-truncate d-block" 
                                style={{ fontSize: '0.8rem', maxWidth: '200px' }}
                                title={admin.email}
                              >
                                {admin.email}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 align-middle">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                              style={{
                                width: '23px',
                                height: '23px',
                                backgroundColor: '#FF69B4',
                                boxShadow: '0 2px 8px rgba(255, 105, 180, 0.15)',
                              }}
                            >
                              <TelephoneFill size={11} color="#fff" />
                            </div>
                            <span 
                              className="text-dark" 
                              style={{ fontSize: '0.9rem', fontWeight: '500' }}
                            >
                              {admin.contactNumber || "Not provided"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 align-middle">
                          <Badge 
                            className="fw-semibold"
                            style={{ 
                              backgroundColor: '#FF69B4', 
                              color: 'white',
                              fontSize: '0.8rem',
                              borderRadius: '20px',
                              padding: '8px 16px',
                              border: 'none',
                              boxShadow: '0 2px 6px rgba(255, 105, 180, 0.3)'
                            }}
                          >
                            {admin.schoolId}
                          </Badge>
                        </td>
                        <td className="py-4 align-middle">
                          <Badge 
                            className="fw-semibold"
                            style={{   
                              backgroundColor: admin.accountType === "superAdmin" ? COLORS.secondary : COLORS.pink, 
                              color: 'white',
                              fontSize: '0.8rem',
                              borderRadius: '20px',
                              padding: '8px 16px',
                              border: 'none',
                              boxShadow: '0 2px 6px rgba(255, 105, 180, 0.3)'
                            }}
                          >
                            {admin.accountType === "superAdmin" ? "Super Admin" : "Admin"}
                          </Badge>
                        </td>
                        <td className="py-4 align-middle text-center" style={{ paddingRight: '24px' }}>
                          <Dropdown>
                            <Dropdown.Toggle
                              as="div"
                              className="btn btn-sm d-inline-flex align-items-center justify-content-center action-button"
                              style={{ 
                                width: '32px', 
                                height: '32px',
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                color: COLORS.pink,
                                transition: 'all 0.2s ease',
                                borderColor: COLORS.pink,
                                borderWidth: '1px',
                                borderRadius: '50%',
                              }}
                              disabled={loading}
                            >
                            </Dropdown.Toggle>
                            <Dropdown.Menu 
                              align="end" 
                              className="shadow border-0"
                              style={{
                                borderRadius: '12px',
                                overflow: 'hidden',
                                minWidth: '160px'
                              }}
                            >
                              <Dropdown.Item
                                onClick={() => handleEditAdmin(admin)}
                                className="d-flex align-items-center py-3 px-4"
                                style={{
                                  transition: 'background-color 0.2s ease',
                                  borderRadius: '0'
                                }}
                              >
                                <PencilFill size={14} className="me-3" style={{ color: COLORS.pink }} />
                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Edit Admin</span>
                              </Dropdown.Item>
                              <Dropdown.Divider style={{ margin: '0', backgroundColor: '#FFE4E1' }} />
                              <Dropdown.Item
                                onClick={() => handleDeletePrompt(admin)}
                                className="d-flex align-items-center py-3 px-4"
                                style={{ 
                                  color: COLORS.pink,
                                  transition: 'background-color 0.2s ease',
                                  borderRadius: '0'
                                }}
                              >
                                <TrashFill size={14} className="me-3" />
                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Archive Admin</span>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton style={{ border: "none", background: `linear-gradient(135deg, ${COLORS.lightPink} 0%, ${COLORS.softPink} 100%)` }}>
          <Modal.Title className="w-100 text-center">
            <h3 className="mb-0 fw-bold" style={{ color: COLORS.pink }}>
              {isEditMode ? "Edit Admin" : "Admin Registration"}
            </h3>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <Shield className="me-2" size={16} color="#2D2D2D" />
                    First Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter first name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="border-0 shadow-sm"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <Shield className="me-2" size={16} color="#2D2D2D" />
                    Last Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="border-0 shadow-sm"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <EnvelopeFill className="me-2" size={16} color="#2D2D2D" />
                    Email Address *
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="border-0 shadow-sm"
                    style={{ borderRadius: "12px" }}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <TelephoneFill className="me-2" size={16} color="#2D2D2D" />
                    Contact Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter contact number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="border-0 shadow-sm"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <CardText className="me-2" size={16} color="#2D2D2D" />
                    School ID *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter school ID"
                    name="schoolId"
                    value={formData.schoolId}
                    onChange={handleInputChange}
                    required
                    className="border-0 shadow-sm"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Account Type *
                  </Form.Label>
                  <Form.Select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    required
                    className="border-0 shadow-sm"
                    style={{ borderRadius: "12px" }}
                  >
                    <option value="admin">Admin</option>
                    <option value="superAdmin">Super Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" style={{ position: "relative" }}>
                  <Form.Label className="fw-semibold">
                    {isEditMode ? "New Password" : "Password *"}
                  </Form.Label>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditMode}
                    className="border-0 shadow-sm"
                    style={{ borderRadius: "12px", paddingRight: "45px" }}
                  />
                  <Button
                    variant="link"
                    tabIndex={-1}
                    style={{
                      position: "absolute",
                      top: "70%",
                      right: "15px",
                      transform: "translateY(-50%)",
                      padding: "4px",
                      border: "none",
                      background: "none",
                    }}
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <EyeOff size={18}  color="#FF69B4"/> : <Eye size={18} color="#2D2D2D" />}
                  </Button>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" style={{ position: "relative" }}>
                  <Form.Label className="fw-semibold">
                    {isEditMode ? "Confirm New Password" : "Confirm Password *"}
                  </Form.Label>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isEditMode || formData.password}
                    className="border-0 shadow-sm"
                    style={{ borderRadius: "12px", paddingRight: "45px" }}
                  />
                  <Button
                    variant="link"
                    tabIndex={-1}
                    style={{
                      position: "absolute",
                      top: "70%",
                      right: "15px",
                      transform: "translateY(-50%)",
                      padding: "4px",
                      border: "none",
                      background: "none",
                    }}
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff size={18}  color="#FF69B4"/> : <Eye size={18} color="#2D2D2D" />}
                    
                  </Button>
                </Form.Group>
              </Col>
            </Row>

            {formData.password && (
              <div className="mb-3">
                <Card className="border-0" style={{ backgroundColor: "#f8f9fa" }}>
                  <Card.Body className="p-3">
                    <small className="text-muted fw-bold d-block mb-2">
                      Password Requirements:
                    </small>
                    <PasswordRequirement
                      met={passwordRequirements.minLength}
                      text="At least 6 characters"
                    />
                    <PasswordRequirement
                      met={passwordRequirements.hasUppercase}
                      text="At least 1 uppercase letter"
                    />
                    <PasswordRequirement
                      met={passwordRequirements.hasNumber}
                      text="At least 1 number"
                    />
                    <PasswordRequirement
                      met={passwordRequirements.hasSymbol}
                      text="At least 1 symbol"
                    />
                  </Card.Body>
                </Card>
              </div>
            )}

            {isEditMode && (
              <Alert variant="info" className="mb-0">
                <small>Leave password fields empty to keep current password unchanged.</small>
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 p-4">
          <Button
            variant="outline-secondary"
            onClick={handleCloseModal}
            disabled={loading}
            className="me-2"
            style={{ borderRadius: "25px", minWidth: "120px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: COLORS.pink,
              border: "none",
              borderRadius: "25px",
              minWidth: "120px",
            }}
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating Admin Account..."
              : isEditMode
              ? "Update Admin"
              : "Create Admin Account"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirm} onHide={handleCancelDelete} size="sm" centered>
        <Modal.Header 
          className="border-0 text-white"
          style={{ background: `linear-gradient(135deg, ${COLORS.pink} 0%, ${COLORS.secondary} 100%)` }}
        >
          <Modal.Title className="w-100 text-center fw-bold">Archive Admin</Modal.Title>
          <Button
            variant="link"
            onClick={handleCancelDelete}
            className="btn-close btn-close-white"
            disabled={loading}
            style={{ position: "absolute", top: "18px", right: "18px", filter: "invert(1)", opacity: 0.8 }}
          />
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <div className="mb-3">
            <TrashFill size={48} style={{ color: COLORS.pink }} />
          </div>
          <h5 className="mb-3">Archive Admin Account?</h5>
          <p className="text-muted mb-0">
            This will mark <strong>{selectedAdmin?.firstName} {selectedAdmin?.lastName}</strong>'s account 
            as inactive and restrict login access. You can unarchive them later if needed.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button
            variant="secondary"
            onClick={handleCancelDelete}
            disabled={loading}
            style={{ borderRadius: "25px", minWidth: "100px" }}
          >
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: COLORS.pink,
              border: "none",
              borderRadius: "25px", 
              minWidth: "100px",
              color: "white"
            }}
            onClick={handleArchiveConfirm}
            disabled={loading}
          >
            {loading ? "Archiving..." : "Archive"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageAdmins;