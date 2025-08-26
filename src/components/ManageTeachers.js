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
  Form,
  Dropdown,
  Alert,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  PlusCircleFill,
  Search,
  ArrowLeftCircleFill,
  ThreeDotsVertical,
  PencilFill,
  TrashFill,
  PersonFill,
  EnvelopeFill,
  TelephoneFill,
  CardText,
  BorderWidth,
} from "react-bootstrap-icons";
import { Eye, EyeOff, Users, UserCheck, UserPlus } from "lucide-react";

// Firebase imports
import {
  doc,
  getDocs,
  collection,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp } from "firebase/app";

import { db, auth, app, firebaseConfig } from "../config/FirebaseConfig.js";
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
  danger: "#FFB6C1",
  warning: "#FFB6C1",
  info: "#FF69B4",
  light: "#FFF0F5",
  dark: "#2D2D2D",
  pink: "#FF69B4",
  lightPink: "#FFE4E1",
  softPink: "#FFF0F5",
};

const INSTRUCTIONAL_LEVELS = [
  { value: "INF225", label: "Kinder 1" },
  { value: "INF226", label: "Kinder 2" },
  { value: "INF227", label: "Grade 1" },
];

const SECTIONS = [
  { value: "INF225", label: "INF225" },
  { value: "INF226", label: "INF226" },
  { value: "INF227", label: "INF227" },
];

// Custom hooks
const useTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(
        query(collection(db, "teachers"), where("isArchived", "==", false))
      );
      const teachersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return { teachers, setTeachers, loading, error, refetch: fetchTeachers };
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

// Utility functions
const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\]{};':"\\|,.<>?]/.test(password),
  };
  return requirements;
};

const formatDisplayName = (teacher) => {
  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
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

const TeacherModal = ({
  show,
  onHide,
  isEditMode,
  formData,
  onFormDataChange,
  confirmPassword,
  onConfirmPasswordChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordRequirements,
  onSubmit,
  loading,
}) => (
  <Modal show={show} onHide={onHide} size="lg" centered>
    <Modal.Header closeButton style={{ border: "none", background: `linear-gradient(135deg, ${COLORS.lightPink} 0%, ${COLORS.softPink} 100%)` }}>
      <Modal.Title className="w-100 text-center">
        <h3 className="mb-0 fw-bold" style={{ color: COLORS.pink }}>
          {isEditMode ? "Edit Teacher" : "Teacher Registration"}
        </h3>
      </Modal.Title>
    </Modal.Header>
    
    <Modal.Body className="p-4">
      <Form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <PersonFill className="me-2" size={16} />
                First Name *
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                name="firstName"
                value={formData.firstName}
                onChange={onFormDataChange}
                required
                className="border-0 shadow-sm"
                style={{ borderRadius: "12px" }}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <PersonFill className="me-2" size={16} />
                Last Name *
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                name="lastName"
                value={formData.lastName}
                onChange={onFormDataChange}
                required
                className="border-0 shadow-sm"
                style={{ borderRadius: "8px" }}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <EnvelopeFill className="me-2" size={16} />
                Email Address *
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                name="email"
                value={formData.email}
                onChange={onFormDataChange}
                required
                className="border-0 shadow-sm"
                style={{ borderRadius: "8px" }}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <TelephoneFill  size={16} color="#fff"/>
                Contact Number
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={onFormDataChange}
                className="border-0 shadow-sm"
                style={{ borderRadius: "8px" }}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <CardText className="me-2" size={16} />
                School ID *
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter school ID"
                name="schoolId"
                value={formData.schoolId}
                onChange={onFormDataChange}
                required
                className="border-0 shadow-sm"
                style={{ borderRadius: "8px" }}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Instructional Level *</Form.Label>
              <Form.Select
                name="level"
                value={formData.level}
                onChange={onFormDataChange}
                required
                className="border-0 shadow-sm"
                style={{ borderRadius: "8px" }}
              >
                <option value="">Select Level</option>
                {INSTRUCTIONAL_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Section *</Form.Label>
          <Form.Select
            name="section"
            value={formData.section}
            onChange={onFormDataChange}
            required
            className="border-0 shadow-sm"
            style={{ borderRadius: "8px" }}
          >
            <option value="">Select Section</option>
            {SECTIONS.map(section => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

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
                onChange={onFormDataChange}
                required={!isEditMode}
                className="border-0 shadow-sm"
                style={{ borderRadius: "8px", paddingRight: "45px" }}
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
                onChange={onConfirmPasswordChange}
                required={!isEditMode || formData.password}
                className="border-0 shadow-sm"
                style={{ borderRadius: "8px", paddingRight: "45px" }}
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

        {!isEditMode && formData.password && (
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
        onClick={onHide}
        disabled={loading}
        className="me-2"
        style={{ borderRadius: "25px", minWidth: "120px" }}
      >
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        disabled={loading}
        style={{
          backgroundColor: COLORS.pink,
          border: "none",
          borderRadius: "25px",
          minWidth: "120px",
        }}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" />
            {isEditMode ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>
            {isEditMode ? "Update Teacher" : "Create Teacher"}
          </>
        )}
      </Button>
    </Modal.Footer>
  </Modal>
);

const DeleteConfirmModal = ({ show, onHide, onConfirm, teacher, loading }) => (
  <Modal show={show} onHide={onHide} size="sm" centered>
    <Modal.Header 
      className="border-0 text-white"
      style={{ background: `linear-gradient(135deg, ${COLORS.pink} 0%, ${COLORS.secondary} 100%)` }}
    >
      <Modal.Title>Archive Teacher</Modal.Title>
      <Button
        variant="link"
        onClick={onHide}
        className="btn-close btn-close-white"
        disabled={loading}
      />
    </Modal.Header>
    <Modal.Body className="text-center p-4">
      <div className="mb-3">
        <TrashFill size={48} style={{ color: COLORS.pink }} />
      </div>
      <h5 className="mb-3">Archive Teacher Account?</h5>
      <p className="text-muted mb-0">
        This will mark <strong>{formatDisplayName(teacher || {})}</strong>'s account 
        as inactive and restrict login access. You can unarchive them later if needed.
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
          backgroundColor: COLORS.pink,
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
            Archiving...
          </>
        ) : (
          "Archive"
        )}
      </Button>
    </Modal.Footer>
  </Modal>
);

// Main Component
const ManageTeachers = () => {
  const navigate = useNavigate();
  const { teachers, setTeachers, loading: teachersLoading, error: teachersError, refetch } = useTeachers();
  const { alert, showAlert, hideAlert } = useAlert();

  // UI State
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  const currentUser = auth.currentUser;

  // Computed values
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) =>
      Object.values(teacher).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [teachers, searchTerm]);

  const stats = useMemo(() => ({
    total: teachers.length,
    active: teachers.filter(t => !t.isArchived).length,
    byLevel: teachers.reduce((acc, teacher) => {
      const level = teacher.level || 'Unassigned';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {}),
  }), [teachers]);

  // Event handlers
  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (name === "password" && !isEditMode) {
      setPasswordRequirements(validatePassword(value));
    }
  }, [isEditMode]);

  const resetForm = useCallback(() => {
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
    setPasswordRequirements({
      minLength: false,
      hasUppercase: false,
      hasNumber: false,
      hasSymbol: false,
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const handleAddNew = useCallback(() => {
    setIsEditMode(false);
    setSelectedTeacher(null);
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedTeacher(null);
    resetForm();
  }, [resetForm]);

  const handleEditTeacher = useCallback((teacher) => {
    setSelectedTeacher(teacher);
    setIsEditMode(true);
    setFormData({
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      contactNumber: teacher.contactNumber || "",
      email: teacher.email || "",
      schoolId: teacher.schoolId || "",
      level: teacher.level || "",
      section: teacher.section || "",
      password: "",
    });
    setConfirmPassword("");
    setShowModal(true);
  }, []);

  const handleDeletePrompt = useCallback((teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteConfirm(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.schoolId ||
      (!isEditMode && !formData.password)
    ) {
      showAlert(
        "Please fill in all required fields: First Name, Last Name, Email, School ID" +
          (isEditMode ? "" : ", and Password") + ".",
        "warning"
      );
      return;
    }

    if (!isEditMode && formData.password !== confirmPassword) {
      showAlert("Passwords do not match.", "warning");
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
    let authUser = null;

    try {
      const lowerCaseEmail = formData.email.toLowerCase();
      const teacherData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
        email: lowerCaseEmail,
        schoolId: formData.schoolId,
        level: formData.level,
        section: formData.section,
        role: "teacher",
        updatedAt: new Date(),
      };

      if (isEditMode && selectedTeacher) {
        // Update existing teacher
        const teacherRef = doc(db, "teachers", selectedTeacher.id);
        await updateDoc(teacherRef, teacherData);

        setTeachers((prevTeachers) =>
          prevTeachers.map((teacher) =>
            teacher.id === selectedTeacher.id
              ? { ...teacher, ...teacherData }
              : teacher
          )
        );

        showAlert("Teacher updated successfully!", "success");

        // Log admin action
        const teacherFullName = formatDisplayName(teacherData);
        logAdminUiActionCallable({
          actionType: 'teacher_account_updated',
          adminId: currentUser?.uid,
          collectionName: 'teachers',
          documentId: selectedTeacher.id,
          targetUserId: selectedTeacher.uid || selectedTeacher.id,
          targetUserFullName: teacherFullName,
        }).catch(console.error);
      } else {
        // Create new teacher
        const secondaryApp = initializeApp(firebaseConfig, `secondary-creation-${Date.now()}`);
        const secondaryAuth = getAuth(secondaryApp);
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          lowerCaseEmail,
          formData.password
        );
        authUser = userCredential.user;

        teacherData.createdAt = new Date();
        teacherData.isArchived = false;
        teacherData.status = "approved";
        teacherData.activeSessionId = null;

        const docRef = doc(db, "teachers", authUser.uid);
        await setDoc(docRef, teacherData);

        // Update local state
        setTeachers(prev => [...prev, { id: authUser.uid, ...teacherData }]);

        showAlert("Teacher created successfully!", "success");

        // Log admin action
        const teacherFullName = formatDisplayName(teacherData);
        logAdminUiActionCallable({
          actionType: 'teacher_account_created',
          adminId: currentUser?.uid,
          collectionName: 'teachers',
          documentId: authUser.uid,
          targetUserId: authUser.uid,
          targetUserFullName: teacherFullName,
        }).catch(console.error);
      }

      handleCloseModal();
    } catch (error) {
      console.error(isEditMode ? "Error updating teacher:" : "Error creating teacher:", error);

      // Cleanup on error
      if (!isEditMode && authUser) {
        try {
          await deleteUser(authUser);
        } catch (cleanupError) {
          console.error("Error cleaning up auth user:", cleanupError);
        }
      }

      // Error messages
      let errorMessage = error.message;
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email address is already registered.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }

      showAlert(
        `Failed to ${isEditMode ? "update" : "create"} teacher: ${errorMessage}`,
        "danger"
      );
    } finally {
      setLoading(false);
    }
  }, [formData, confirmPassword, isEditMode, selectedTeacher, currentUser, showAlert, handleCloseModal, setTeachers]);

  const handleArchiveConfirm = useCallback(async () => {
    if (!selectedTeacher) return;
    setLoading(true);

    try {
      const teacherRef = doc(db, "teachers", selectedTeacher.id);
      await updateDoc(teacherRef, {
        isArchived: true,
        archivedAt: serverTimestamp(),
      });

      setTeachers(teachers.filter((teacher) => teacher.id !== selectedTeacher.id));
      showAlert("Teacher archived successfully!", "success");

      // Log admin action
      const teacherFullName = formatDisplayName(selectedTeacher);
      logAdminUiActionCallable({
        actionType: 'teacher_account_archived',
        adminId: currentUser?.uid,
        collectionName: 'teachers',
        documentId: selectedTeacher.id,
        targetUserId: selectedTeacher.uid || selectedTeacher.id,
        targetUserFullName: teacherFullName,
      }).catch(console.error);

      setShowDeleteConfirm(false);
      setSelectedTeacher(null);
    } catch (error) {
      console.error("Error archiving teacher:", error);
      showAlert(`Failed to archive teacher: ${error.message}`, "danger");
    } finally {
      setLoading(false);
    }
  }, [selectedTeacher, teachers, setTeachers, showAlert, currentUser]);

  if (teachersLoading) {
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
              <h5 className="text-muted">Loading teachers...</h5>
            </div>
          </Container>
        </div>
      </div>
    );
  }

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
                <h1 className="mb-1 fw-bold text-dark">Manage Teachers</h1>
                <p className="text-muted mb-0">Create, edit, and manage teacher accounts</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <InputGroup style={{ width: "300px" }}>
                <FormControl
                  placeholder="Search teachers..."
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
                <UserPlus size={18} />
                Add Teacher
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <StatCard
                title="Total Teachers"
                value={stats.total}
                icon={Users}
                color={COLORS.pink}
              />
            </Col>
            <Col lg={3} md={6}>
              <StatCard
                title="Active Teachers"
                value={stats.active}
                icon={UserCheck}
                color={COLORS.secondary}
              />
            </Col>
            <Col lg={3} md={6}>
              <StatCard
                title="Kinder 1"
                value={stats.byLevel['INF225'] || 0}
                icon={PersonFill}
                color={COLORS.pink}
              />
            </Col>
            <Col lg={3} md={6}>
              <StatCard
                title="Grade 1"
                value={stats.byLevel['INF227'] || 0}
                icon={PersonFill}
                color={COLORS.secondary}
              />
            </Col>
          </Row>

          {/* Error State */}
          {teachersError && (
            <Alert variant="danger" className="mb-4">
              <strong>Error loading teachers:</strong> {teachersError}
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-2"
                onClick={refetch}
              >
                Retry
              </Button>
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
                  Teachers List
                  <Badge 
                    className="ms-2"
                    style={{ 
                      backgroundColor: COLORS.pink, 
                      color: "white",
                      borderRadius: "12px",
                      padding: "4px 8px"
                    }}
                  >
                    {filteredTeachers.length}
                  </Badge>
                </h5>
                {searchTerm && (
                  <small className="text-muted">
                    Showing {filteredTeachers.length} of {teachers.length} teachers
                  </small>
                )}
              </div>
            </Card.Header>
            
            <Card.Body className="p-0">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-5">
                  <Users size={48} className="text-muted mb-3" opacity={0.3} />
                  <h5 className="text-muted mb-2">
                    {searchTerm ? "No teachers found" : "No teachers yet"}
                  </h5>
                  <p className="text-muted mb-3">
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : "Get started by adding your first teacher"
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
                      <UserPlus size={18} className="me-2" />
                      Add First Teacher
                    </Button>
                  )}
                </div>
              ) : (
                <Table responsive hover={false} className="mb-0">
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
                        Teacher
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '18%'
                        }}
                      >
                        Contact
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
                        Level
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '15%'
                        }}
                      >
                        Section
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold text-center" 
                        style={{ 
                          color: COLORS.pink,
                          width: '12%',
                          paddingRight: '24px'
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((teacher, index) => (
                      <tr 
                        key={teacher.id}
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
                              <PersonFill size={22} style={{ color: "white" }} />
                            </div>
                            <div className="min-width-0 flex-grow-1">
                              <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                                {formatDisplayName(teacher)}
                              </div>
                              <small 
                                className="text-muted text-truncate d-block" 
                                style={{ fontSize: '0.8rem', maxWidth: '200px' }}
                                title={teacher.email}
                              >
                                {teacher.email}
                              </small>
                            </div>
                          </div>
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
                              <TelephoneFill size={12} style={{ color: COLORS.pink }} />
                            </div>
                            <span 
                              className="text-dark" 
                              style={{ fontSize: '0.9rem', fontWeight: '500' }}
                            >
                              {teacher.contactNumber || "Not provided"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 align-middle">
                          <Badge 
                            className="fw-semibold"
                            style={{ 
                              backgroundColor: COLORS.pink, // changed from blue to pink
                              color: 'white',
                              fontSize: '0.8rem',
                              borderRadius: '20px',
                              padding: '8px 16px',
                              border: 'none',
                              boxShadow: '0 2px 6px rgba(255, 105, 180, 0.3)'
                            }}
                          >
                            {teacher.schoolId}
                          </Badge>
                        </td>
                        <td className="py-4 align-middle">
                          <Badge 
                            className="fw-semibold"
                            style={{   
                              backgroundColor: COLORS.pink, // changed from blue to pink
                              color: 'white',
                              fontSize: '0.8rem',
                              borderRadius: '20px',
                              padding: '8px 16px',
                              border: 'none',
                              boxShadow: '0 2px 6px rgba(255, 105, 180, 0.3)'
                            }}
                          >
                            {INSTRUCTIONAL_LEVELS.find(l => l.value === teacher.level)?.label || teacher.level}
                          </Badge>
                        </td>
                        <td className="py-4 align-middle">
                          <Badge 
                            className="fw-semibold"
                            style={{ 
                              backgroundColor: COLORS.pink, // changed from blue to pink
                              color: 'white',
                              fontSize: '0.8rem',
                              borderRadius: '20px',
                              padding: '8px 16px',
                              border: 'none',
                              boxShadow: '0 2px 6px rgba(255, 105, 180, 0.3)'
                            }}
                          >
                            {teacher.section}
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
                                onClick={() => handleEditTeacher(teacher)}
                                className="d-flex align-items-center py-3 px-4"
                                style={{
                                  transition: 'background-color 0.2s ease',
                                  borderRadius: '0'
                                }}
                              >
                                <PencilFill size={14} className="me-3" style={{ color: COLORS.pink }} />
                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Edit Teacher</span>
                              </Dropdown.Item>
                              <Dropdown.Divider style={{ margin: '0', backgroundColor: '#FFE4E1' }} />
                              <Dropdown.Item
                                onClick={() => handleDeletePrompt(teacher)}
                                className="d-flex align-items-center py-3 px-4"
                                style={{ 
                                  color: COLORS.pink,
                                  transition: 'background-color 0.2s ease',
                                  borderRadius: '0'
                                }}
                              >
                                <TrashFill size={14} className="me-3" />
                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Archive Teacher</span>
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

      {/* Modals */}
      <TeacherModal
        show={showModal}
        onHide={handleCloseModal}
        isEditMode={isEditMode}
        formData={formData}
        onFormDataChange={handleInputChange}
        confirmPassword={confirmPassword}
        onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        passwordRequirements={passwordRequirements}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <DeleteConfirmModal
        show={showDeleteConfirm}
        onHide={() => {
          setShowDeleteConfirm(false);
          setSelectedTeacher(null);
        }}
        onConfirm={handleArchiveConfirm}
        teacher={selectedTeacher}
        loading={loading}
      />
    </div>
  );
};

export default ManageTeachers;