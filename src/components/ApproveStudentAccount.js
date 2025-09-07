import React, { useState, useEffect, useCallback } from "react";
import SideMenuTeacher from "./SideMenuTeacher";
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
  Table,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  CheckCircleFill,
  XCircleFill,
  ArrowLeftCircleFill,
  PersonFill, // Changed from PersonBadgeFill to PersonFill for students
} from "react-bootstrap-icons";
import "../scss/custom.scss";
import { db, auth } from "../config/FirebaseConfig.js";

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

const formatDisplayName = (student) =>
  `${student.studentFirstName || ""} ${student.studentLastName || ""}`.trim();

const ApproveStudentAccounts = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [teacherSection, setTeacherSection] = useState("");
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
  const [currentTeacher, setCurrentTeacher] = useState(null);

  const navigate = useNavigate();

  const showAlert = useCallback((message, variant = "success", duration = 5000) => {
    setAlert({ show: true, message, variant });
    setTimeout(() => {
      setAlert({ show: false, message: "", variant: "success" });
    }, duration);
  }, []);

  const fetchPendingStudents = useCallback(async () => {
    setLoading(true);
    try {
      const studentsRef = collection(db, "students");
      const q = query(
        studentsRef,
        where("section", "==", teacherSection),
        where("status", "==", "pending_approval")
      );
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingStudents(studentsList);
    } catch (error) {
      console.error("Error fetching pending students: ", error);
      showAlert(`Failed to fetch pending students: ${error.message}`, "danger");
    }
    setLoading(false);
  }, [teacherSection, showAlert]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentTeacher(user);
        try {
          const teacherDocRef = doc(db, "teachers", user.uid);
          const teacherDocSnap = await getDoc(teacherDocRef);
          if (teacherDocSnap.exists()) {
            const teacherData = teacherDocSnap.data();
            if (teacherData.section) {
              setTeacherSection(teacherData.section);
            } else {
              showAlert(
                "No section assigned to your teacher profile. Cannot fetch students.",
                "warning"
              );
              setLoading(false);
            }
          } else {
            const teachersQuery = query(
              collection(db, "teachers"),
              where("uid", "==", user.uid)
            );
            const querySnapshot = await getDocs(teachersQuery);
            if (!querySnapshot.empty) {
              const teacherData = querySnapshot.docs[0].data();
              if (teacherData.section) {
                setTeacherSection(teacherData.section);
              } else {
                showAlert(
                  "No section assigned. Cannot fetch students.",
                  "warning"
                );
              }
            } else {
              showAlert(
                "Teacher profile not found. Please contact an administrator.",
                "danger"
              );
            }
            setLoading(false);
          }
        } catch (error) {
          showAlert(`Error fetching teacher data: ${error.message}`, "danger");
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate, showAlert]);

  useEffect(() => {
    if (teacherSection && currentTeacher) {
      fetchPendingStudents();
    } else if (currentTeacher && !teacherSection) {
      setPendingStudents([]);
    }
  }, [teacherSection, currentTeacher, fetchPendingStudents]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const executeApprove = async (studentId) => {
    if (!currentTeacher) return;
    setLoading(true);
    try {
      const studentRef = doc(db, "students", studentId);
      await updateDoc(studentRef, {
        status: "approved",
        approvedBy: currentTeacher.uid,
        isArchived: false,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showAlert("Student account approved successfully.", "success");
      fetchPendingStudents();
    } catch (error) {
      showAlert(`Failed to approve student: ${error.message}`, "danger");
    }
    setLoading(false);
  };

  const executeReject = async (studentId) => {
    if (!currentTeacher) return;
    setLoading(true);
    try {
      const studentRef = doc(db, "students", studentId);
      await updateDoc(studentRef, {
        status: "rejected",
        isArchived: true,
        rejectedBy: currentTeacher.uid,
        updatedAt: serverTimestamp(),
      });
      showAlert("Student account rejected and archived.", "warning");
      fetchPendingStudents();
    } catch (error) {
      showAlert(`Failed to reject student: ${error.message}`, "danger");
    }
    setLoading(false);
  };

  const handleApprove = (studentId) => {
    setConfirmationModal({
      show: true,
      title: "Confirm Approval",
      message: "Are you sure you want to approve this student's account?",
      onConfirm: () => {
        setConfirmationModal({ ...confirmationModal, show: false });
        executeApprove(studentId);
      },
      confirmVariant: "success",
    });
  };

  const handleReject = (studentId) => {
    setConfirmationModal({
      show: true,
      title: "Confirm Rejection",
      message: "Are you sure you want to reject and archive this student's account? This will remove them from the pending list.",
      onConfirm: () => {
        setConfirmationModal({ ...confirmationModal, show: false });
        executeReject(studentId);
      },
      confirmVariant: "danger",
    });
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
          <SideMenuTeacher isOpen={showSidebar} toggleSidebar={toggleSidebar} />
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
                <h1 className="mb-1 fw-bold text-dark">Approve Student Accounts</h1>
                <p className="text-muted mb-0">Review and approve pending student registrations</p>
                {teacherSection && (
                  <p className="text-muted mb-0 mt-1">Section: <span className="fw-semibold">{teacherSection}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Loading state when no section is assigned */}
          {loading && !teacherSection && (
            <div className="text-center mt-5">
              <Spinner
                animation="border"
                role="status"
                style={{ color: COLORS.primary }}
              >
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading authorization...</p>
            </div>
          )}

          {/* Warning when no section is assigned */}
          {!loading && !teacherSection && (
            <Alert variant="warning">
              Your teacher profile does not have a section assigned. Please
              contact an administrator.
            </Alert>
          )}

          {/* Content */}
          {teacherSection && (
            <div className="shadow-sm border-0" style={{ borderRadius: "15px", background: COLORS.light }}>
              <div className="py-4 px-4" style={{ borderRadius: "15px 15px 0 0", backgroundColor: COLORS.light }}>
                <h5 className="mb-0 fw-semibold">
                  Pending Students
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
                    {pendingStudents.length}
                  </span>
                </h5>
              </div>
              <div className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner size="lg" style={{ color: COLORS.primary }} className="mb-3" />
                    <h5 className="text-muted">Loading pending students...</h5>
                  </div>
                ) : pendingStudents.length === 0 ? (
                  <div className="text-center py-5">
                    <CheckCircleFill size={48} className="text-muted mb-3" opacity={0.3} />
                    <h5 className="text-muted mb-2">No pending student accounts</h5>
                    <p className="text-muted mb-3">
                      All student accounts in your section have been reviewed.
                    </p>
                  </div>
                ) : (
                  <Table responsive hover={false} className="mb-0">
                    <thead>
                      <tr style={{ backgroundColor: "#FFF0F5" }}>
                        <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "12%" }}>
                          School ID
                        </th>
                        <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "18%" }}>
                          Student Name
                        </th>
                        <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "10%" }}>
                          Grade Level
                        </th>
                        <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "20%" }}>
                          Email
                        </th>
                        <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "15%" }}>
                          Parent Name
                        </th>
                        <th className="border-0 py-4 px-4 fw-semibold" style={{ color: COLORS.pink, width: "12%" }}>
                          Parent Contact
                        </th>
                        <th className="border-0 py-4 px-4 fw-semibold text-center" style={{ color: COLORS.pink, width: "13%" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingStudents.map((student, index) => (
                        <tr
                          key={student.id}
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
                              {student.schoolId}
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
                                <PersonFill size={22} style={{ color: "white" }} />
                              </div>
                              <div className="min-width-0 flex-grow-1">
                                <div className="fw-bold text-dark mb-1" style={{ fontSize: "1.05rem" }}>
                                  {formatDisplayName(student)}
                                </div>
                                <div className="text-muted text-truncate" style={{ fontSize: "0.95rem", maxWidth: "180px" }}>
                                {student.gradeLevel}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <span
                              style={{
                                backgroundColor: COLORS.pink,
                                color: "white",
                                fontSize: "0.95rem",
                                borderRadius: "20px",
                                padding: "10px 20px",
                                border: "none",
                                boxShadow: "0 2px 8px rgba(255, 105, 180, 0.18)",
                                fontWeight: 600,
                                display: "inline-block",
                              }}
                            >
                              {student.gradeLevel}
                            </span>
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <span className="text-dark" style={{ fontSize: "1rem", fontWeight: "500" }}>
                              {student.email || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <span className="text-dark" style={{ fontSize: "1rem", fontWeight: "500" }}>
                              {`${student.parentFirstName || ""} ${student.parentLastName || ""}`.trim() || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <span className="text-dark" style={{ fontSize: "1rem", fontWeight: "500" }}>
                              {student.parentContactNumber || "N/A"}
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
                              onClick={() => handleApprove(student.id)}
                              disabled={loading}
                              title="Approve Student"
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
                              onClick={() => handleReject(student.id)}
                              disabled={loading}
                              title="Reject Student"
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
          )}
        </Container>
      </div>
    </div>
  );
};

export default ApproveStudentAccounts;