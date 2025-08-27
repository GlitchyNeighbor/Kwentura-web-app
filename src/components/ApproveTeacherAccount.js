import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Table,
  Alert,
  Modal,
} from "react-bootstrap";
import SideMenuAdmin from "./SidebarMenuAdmin";
import TopNavbar from "./TopNavbar";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDocs,
  collection,
  updateDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  CheckCircleFill,
  XCircleFill,
  ArrowLeftCircleFill,
  PersonBadgeFill, // <-- Add this import
} from "react-bootstrap-icons";
import "../scss/custom.scss";
import { db, app } from "../config/FirebaseConfig.js"; // Import app
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions"; // Import Firebase Functions

const functions = getFunctions(app);
const logAdminUiActionCallable = httpsCallable(functions, 'logAdminUiAction');
const approveTeacherCallable = httpsCallable(functions, 'approveTeacher');
const rejectTeacherCallable = httpsCallable(functions, 'rejectTeacher');

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

const formatDisplayName = (teacher) =>
  `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();

const ApproveTeacherAccount = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [confirmationModal, setConfirmationModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmVariant: "primary",
  });
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const navigate = useNavigate();
  const authInstance = getAuth();

  const showAlert = useCallback((message, variant = "success", duration = 5000) => {
    setAlert({ show: true, message, variant });
    setTimeout(() => {
      setAlert({ show: false, message: "", variant: "success" });
    }, duration);
  }, []);

  const fetchPendingTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const pendingTeachersRef = collection(db, "pendingTeachers"); // Changed collection name
      const q = query(pendingTeachersRef); // No status filter needed if all in this collection are pending
      const querySnapshot = await getDocs(q);
      const teachersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingTeachers(teachersList);
    } catch (error) {
      console.error("Error fetching pending teachers: ", error);
      showAlert(`Failed to fetch pending teachers: ${error.message}`, "danger");
    }
    setLoading(false);
  }, [showAlert]);

  useEffect(() => {
    const unsubscribe = authInstance.onAuthStateChanged(async (user) => {
      if (user) {
        setLoading(true);
        let determinedUserRole = null;
        let isAuthorized = false;

        try {
          const adminDocRef = doc(db, "admins", user.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists()) {
            const adminData = adminDocSnap.data();
            if (
              adminData.role === "admin" ||
              adminData.role === "superAdmin" ||
              adminData.role === "superadmin"
            ) {
              determinedUserRole = adminData.role;
              isAuthorized = true;
            }
          }

          if (!isAuthorized) {
            const adminsQuery = query(
              collection(db, "admins"),
              where("uid", "==", user.uid)
            );
            const querySnapshot = await getDocs(adminsQuery);
            if (!querySnapshot.empty) {
              const adminData = querySnapshot.docs[0].data();
              if (
                adminData.role === "admin" ||
                adminData.role === "superAdmin" ||
                adminData.role === "superadmin"
              ) {
                determinedUserRole = adminData.role;
                isAuthorized = true;
              }
            }
          }

          if (isAuthorized) {
            setCurrentUserRole(determinedUserRole);
            fetchPendingTeachers();
          } else {
            showAlert(
              "You are not authorized to view this page. Role found: " +
                (determinedUserRole || "None/Not Admin"),
              "danger"
            );
            navigate("/admin/dashboard");
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          showAlert("Error fetching user role. Please try again.", "danger");
          navigate("/login");
          setLoading(false);
        }
      } else {
        setLoading(false);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate, authInstance, fetchPendingTeachers, showAlert]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const executeApprove = async (teacherId, teacherUid) => {
    setLoading(true);
    try {
      const result = await approveTeacherCallable({ teacherId, teacherUid });
      if (result.data.status === "success") {
        showAlert("Teacher account approved successfully.", "success");
      } else {
        throw new Error(result.data.message || "Unknown error during approval.");
      }

      const approvedTeacher = pendingTeachers.find(t => t.id === teacherId);
      const teacherFullName = approvedTeacher ? `${approvedTeacher.firstName || ""} ${approvedTeacher.lastName || ""}`.trim() : "";

      logAdminUiActionCallable({
        actionType: 'teacher_account_approved',
        collectionName: 'teachers', // This should ideally be 'pendingTeachers' for the source, but 'teachers' for the target
        documentId: teacherId,
        targetUserId: teacherUid,
        targetUserFullName: teacherFullName,
      }).catch(console.error);

      fetchPendingTeachers();
    } catch (error) {
      console.error("Error approving teacher: ", error);
      showAlert(`Failed to approve teacher: ${error.message}`, "danger");
    }
    setLoading(false);
  };

  const executeReject = async (teacherId, teacherUid) => {
    setLoading(true);
    try {
      const result = await rejectTeacherCallable({ teacherId, teacherUid });
      if (result.data.status === "success") {
        showAlert("Teacher account rejected and deleted.", "warning");
      } else {
        throw new Error(result.data.message || "Unknown error during rejection.");
      }

      const rejectedTeacher = pendingTeachers.find(t => t.id === teacherId);
      const teacherFullName = rejectedTeacher ? `${rejectedTeacher.firstName || ""} ${rejectedTeacher.lastName || ""}`.trim() : "";

      logAdminUiActionCallable({
        actionType: 'teacher_account_rejected',
        collectionName: 'pendingTeachers',
        documentId: teacherId,
        targetUserId: teacherUid,
        targetUserFullName: teacherFullName,
      }).catch(console.error);

      fetchPendingTeachers();
    } catch (error) {
      console.error("Error rejecting teacher: ", error);
      showAlert(`Failed to reject teacher: ${error.message}`, "danger");
    }
    setLoading(false);
  };

  const handleApprove = (teacherId, teacherUid) => {
    setConfirmationModal({
      show: true,
      title: "Confirm Approval",
      message: "Are you sure you want to approve this teacher's account?",
      onConfirm: () => {
        setConfirmationModal({ ...confirmationModal, show: false });
        executeApprove(teacherId, teacherUid);
      },
      confirmVariant: "success",
    });
  };

  const handleReject = (teacherId, teacherUid) => {
    setConfirmationModal({
      show: true,
      title: "Confirm Rejection",
      message: "Are you sure you want to reject and delete this teacher's account? This action cannot be undone.",
      onConfirm: () => {
        setConfirmationModal({ ...confirmationModal, show: false });
        executeReject(teacherId, teacherUid);
      },
      confirmVariant: "danger",
    });
  };

  if (loading && currentUserRole === null) {
    return (
      <div
        className="app-container"
        style={{ overflow: "hidden", height: "100vh" }}
      >
        <TopNavbar toggleSidebar={toggleSidebar} />
        <Container
          fluid
          className="main-content"
          style={{
            overflowY: "auto",
            padding: "20px",
            height: "100%",
            flex: 1,
            background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
          }}
        >
          <div className="text-center mt-5">
            <Spinner
              animation="border"
              role="status"
              style={{ color: "#FF549A" }}
            >
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading authorization...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (
    !loading &&
    !(
      currentUserRole === "admin" ||
      currentUserRole === "superAdmin" ||
      currentUserRole === "superadmin"
    )
  ) {
    return null;
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
        .min-width-0 { min-width: 0; }
        .flex-shrink-0 { flex-shrink: 0; }
        .text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>
      <TopNavbar toggleSidebar={toggleSidebar} />
      {alert.show && (
        <Alert
          variant={alert.variant}
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
      )}

      {/* Confirmation Modal */}
      <Modal
        show={confirmationModal.show}
        onHide={() => setConfirmationModal({ ...confirmationModal, show: false })}
        size="sm"
        centered
        style={{ minWidth: "400px", maxWidth: "480px" }}
      >
        <Modal.Header
          className="border-0 text-white justify-content-center"
          style={{
            background: `linear-gradient(135deg, ${COLORS.pink} 0%, ${COLORS.secondary} 100%)`,
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            textAlign: "center",
            position: "relative",
            minHeight: "70px"
          }}
        >
          <div className="w-100 d-flex flex-column align-items-center">
            {confirmationModal.confirmVariant === "success" ? (
              <CheckCircleFill size={40} style={{ color: COLORS.success, marginBottom: "8px" }} />
            ) : (
              <XCircleFill size={40} style={{ color: COLORS.pink, marginBottom: "8px" }} />
            )}
            <h4 className="fw-bold mb-0" style={{ color: "#fff" }}>
              {confirmationModal.title}
            </h4>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            style={{
              position: "absolute",
              top: "18px",
              right: "18px",
              filter: "invert(1)",
              opacity: 0.8,
            }}
            onClick={() => setConfirmationModal({ ...confirmationModal, show: false })}
            disabled={loading}
          />
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <h5 className="mb-3 fw-semibold">{confirmationModal.title}</h5>
          <p className="text-muted mb-0">{confirmationModal.message}</p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button
            variant="outline-secondary"
            onClick={() => setConfirmationModal({ ...confirmationModal, show: false })}
            disabled={loading}
            style={{
              borderRadius: "25px",
              minWidth: "120px",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmationModal.onConfirm}
            disabled={loading}
            style={{
              backgroundColor: confirmationModal.confirmVariant === "success" ? COLORS.success : COLORS.pink,
              border: "none",
              borderRadius: "25px",
              minWidth: "120px",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Confirming...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="content-container" style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        <div className={`sidebar-container ${showSidebar ? "show" : ""}`}>
          <SideMenuAdmin isOpen={showSidebar} toggleSidebar={toggleSidebar} />
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
                <h1 className="mb-1 fw-bold text-dark">Approve Teacher Accounts</h1>
                <p className="text-muted mb-0">Review and approve pending teacher registrations</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="shadow-sm border-0" style={{ borderRadius: "15px", background: COLORS.light }}>
            <div className="py-4 px-4" style={{ borderRadius: "15px 15px 0 0", backgroundColor: COLORS.light }}>
              <h5 className="mb-0 fw-semibold">
                Pending Teachers
                <span
                  className="ms-2 d-inline-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: COLORS.pink,
                    color: "white",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    display: "inline-flex",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(255, 105, 180, 0.18)",
                  }}
                >
                  {pendingTeachers.length}
                </span>
              </h5>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner size="lg" style={{ color: COLORS.primary }} className="mb-3" />
                  <h5 className="text-muted">Loading pending teachers...</h5>
                </div>
              ) : pendingTeachers.length === 0 ? (
                <div className="text-center py-5">
                  <CheckCircleFill size={48} className="text-muted mb-3" opacity={0.3} />
                  <h5 className="text-muted mb-2">No pending teacher accounts</h5>
                  <p className="text-muted mb-3">
                    All teacher accounts have been reviewed.
                  </p>
                </div>
              ) : (
                <Table responsive hover={false} className="mb-0">
                  <thead>
                    <tr style={{ backgroundColor: "#FFF0F5" }}>
                      <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "13%" }}>
                        School ID
                      </th>
                      <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "20%" }}>
                        Teacher Name
                      </th>
                      <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "25%" }}>
                        Email
                      </th>
                      <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "15%" }}>
                        Contact Number
                      </th>
                      <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "12%" }}>
                        Section
                      </th>
                      <th className="border-0 py-4 px-4 fw-semibold text-center" style={{ color: COLORS.pink, width: "15%" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTeachers.map((teacher, index) => (
                      <tr
                        key={teacher.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#FFF8FA",
                          borderBottom: "1px solid #FFE4E1",
                          transition: "box-shadow 0.2s",
                          boxShadow: "0 2px 8px rgba(255, 105, 180, 0.06)",
                        }}
                        className="table-row-hover"
                      >
                        <td className="py-4 px-4 align-middle">
                          <span
                            style={{
                              backgroundColor: COLORS.pink,
                              color: "white",
                              fontSize: "0.95rem",
                              borderRadius: "20px",
                              padding: "10px 28px",
                              border: "none",
                              boxShadow: "0 2px 8px rgba(255, 105, 180, 0.18)",
                              fontWeight: 600,
                              display: "inline-block",
                              letterSpacing: "1px",
                            }}
                          >
                            {teacher.schoolId}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-middle">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                              style={{
                                width: "44px",
                                height: "44px",
                                background: `linear-gradient(135deg, ${COLORS.pink} 0%, ${COLORS.secondary} 100%)`,
                                boxShadow: "0 2px 8px rgba(255, 105, 180, 0.18)",
                              }}
                            >
                              <PersonBadgeFill size={22} style={{ color: "white" }} /> {/* Changed icon */}
                            </div>
                            <div className="min-width-0 flex-grow-1">
                              <div className="fw-bold text-dark mb-1" style={{ fontSize: "1.05rem" }}>
                                {formatDisplayName(teacher)}
                              </div>
                              <div className="text-muted text-truncate" style={{ fontSize: "0.95rem", maxWidth: "220px" }}>
                                {teacher.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-middle">
                          <span className="text-dark" style={{ fontSize: "1rem", fontWeight: "500" }}>
                            {teacher.email}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-middle">
                          <span className="text-dark" style={{ fontSize: "1rem", fontWeight: "500" }}>
                            {teacher.contactNumber || "Not provided"}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-middle">
                          <span
                            style={{
                              backgroundColor: COLORS.pink,
                              color: "white",
                              fontSize: "0.95rem",
                              borderRadius: "20px",
                              padding: "10px 28px",
                              border: "none",
                              boxShadow: "0 2px 8px rgba(255, 105, 180, 0.18)",
                              fontWeight: 600,
                              display: "inline-block",
                              letterSpacing: "1px",
                            }}
                          >
                            {teacher.section}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-middle text-center">
                          <Button
                            variant="success"
                            className="me-3"
                            style={{
                              borderRadius: "50%",
                              width: "44px",
                              height: "44px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#18c435ff",
                              border: "none",
                              boxShadow: "0 2px 8px rgba(152, 251, 152, 0.18)",
                              transition: "transform 0.15s",
                              marginRight: "10px",
                            }}
                            onClick={() => handleApprove(teacher.id, teacher.uid)}
                            disabled={loading}
                            title="Approve Teacher"
                          >
                            <CheckCircleFill size={22} style={{ color: "#fff" }} />
                          </Button>
                          <Button
                            variant="danger"
                            style={{
                              borderRadius: "50%",
                              width: "44px",
                              height: "44px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#ff3300e8",
                              border: "none",
                              boxShadow: "0 2px 8px rgba(255, 105, 180, 0.18)",
                              transition: "transform 0.15s",
                              marginLeft: "10px",
                            }}
                            onClick={() => handleReject(teacher.id, teacher.uid)}
                            disabled={loading}
                            title="Reject Teacher"
                          >
                            <XCircleFill size={22} style={{ color: "#fff" }} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default ApproveTeacherAccount;