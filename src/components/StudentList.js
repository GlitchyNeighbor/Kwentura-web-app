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
  Alert,
  Badge,
  Spinner,
  Collapse,
} from "react-bootstrap";
import {
  Search,
  ArrowLeftCircleFill,
  PersonFill,
  Clock,
} from "react-bootstrap-icons";
import {
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/FirebaseConfig.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SideMenuTeacher from "./SideMenuTeacher.js";
import TopNavbar from "./TopNavbar";
import "../scss/custom.scss";

// Constants - Matching AccountList.js color scheme
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

// Custom hooks
const useStudents = (currentTeacher, teacherSection, authChecked) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    if (!currentTeacher || !authChecked) {
      setLoading(false);
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let studentsQuery;
      if (teacherSection) {
        // Filter by teacher's section
        studentsQuery = query(
          collection(db, "students"),
          where("section", "==", teacherSection),
          where("isArchived", "==", false)
        );
      } else {
        // Show all active students if no specific section
        studentsQuery = query(
          collection(db, "students"),
          where("isArchived", "==", false)
        );
      }

      const querySnapshot = await getDocs(studentsQuery);
      const studentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        displayName: `${doc.data().studentFirstName || ''} ${doc.data().studentLastName || ''}`.trim(),
      }));

      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentTeacher, teacherSection, authChecked]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
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

// FilterButton helper exists in AccountList.js; avoid duplicate definition here

const StudentScores = ({ studentId, isVisible }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchScores = async () => {
        if (!studentId || !isVisible) {
          setScores([]);
          return;
        }
  
        setLoading(true);
        setError(null);
  
        try {
          const scoresQuery = query(
            collection(db, `students/${studentId}/quizScores`),
            orderBy("score", "asc")
          );
          const querySnapshot = await getDocs(scoresQuery);
          const scoresList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setScores(scoresList);
        } catch (err) {
          console.error("Error fetching scores:", err);
          setError("Failed to load scores.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchScores();
    }, [studentId, isVisible]);
  
    if (!isVisible) return null;
  
    return (
      <div className="p-3" style={{ backgroundColor: '#f7f2f7' }}>
        <Card className="shadow-sm border-0" style={{ borderRadius: "10px" }}>
          <Card.Header className="border-0 py-3" style={{ backgroundColor: COLORS.light, borderRadius: "10px 10px 0 0" }}>
            <h6 className="mb-0 fw-semibold" style={{ color: COLORS.dark }}>Quiz Scores</h6>
          </Card.Header>
          <Card.Body className="p-0">
            {loading && <div className="text-center p-4"><Spinner size="sm" /></div>}
            {error && <Alert variant="danger" className="m-3">{error}</Alert>}
            {!loading && !error && scores.length === 0 && (
              <div className="text-center p-4 text-muted">No quiz scores found for this student.</div>
            )}
            {!loading && !error && scores.length > 0 && (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr style={{ backgroundColor: '#FFF0F5' }}>
                    <th className="border-0 py-3 fw-semibold" style={{ color: COLORS.pink, paddingLeft: '24px' }}>Story Title</th>
                    <th className="border-0 py-3 fw-semibold" style={{ color: COLORS.pink }}>Score</th>
                    <th className="border-0 py-3 fw-semibold" style={{ color: COLORS.pink, paddingRight: '24px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <tr key={score.id} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FFF8FA' }}>
                      <td className="py-3 align-middle" style={{ paddingLeft: '24px' }}>
                        <div className="d-flex align-items-center">
                          <BookOpen size={16} className="me-2" style={{ color: COLORS.secondary }} />
                          <span className="fw-medium text-dark">{score.storyTitle}</span>
                        </div>
                      </td>
                      <td className="py-3 align-middle">
                        <Badge
                          style={{
                            backgroundColor: COLORS.pink,
                            color: 'white',
                            fontSize: '0.8rem',
                            padding: '6px 12px',
                          }}
                          pill
                        >
                          {score.score} / {score.totalQuestions}
                        </Badge>
                      </td>
                      <td className="py-3 align-middle" style={{ paddingRight: '24px' }}>{score.completedAt?.toDate().toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  };

// Main Component
const StudentList = () => {
  const navigate = useNavigate();
  const { alert, showAlert, hideAlert } = useAlert();

  // Authentication state
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [teacherSection, setTeacherSection] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // UI State
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [activeStudentId, setActiveStudentId] = useState(null);

  const { students, loading: studentsLoading, error: studentsError } = useStudents(currentTeacher, teacherSection, authChecked);

  // Authentication effect
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentTeacher(user);
        try {
          const teacherDocRef = doc(db, "teachers", user.uid);
          const teacherDocSnap = await getDoc(teacherDocRef);
          if (teacherDocSnap.exists()) {
            setTeacherSection(teacherDocSnap.data().section);
          } else {
            console.error("Teacher document not found!");
            showAlert("Teacher document not found", "danger");
          }
        } catch (err) {
          console.error("Error fetching teacher data:", err);
          showAlert("Error fetching teacher data", "danger");
        }
      } else {
        setCurrentTeacher(null);
        setTeacherSection("");
        showAlert("Authentication error: No user is currently signed in. Please log in again.", "danger");
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [showAlert]);

  // Computed values
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(student).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesGrade = filterGrade === "all" || student.gradeLevel === filterGrade;
      
      return matchesSearch && matchesGrade;
    });
  }, [students, searchTerm, filterGrade]);

  const stats = useMemo(() => {
    const gradeGroups = students.reduce((acc, student) => {
      const grade = student.gradeLevel || 'Unknown';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    return {
      total: students.length,
      byGrade: gradeGroups,
      sections: new Set(students.map(s => s.section).filter(Boolean)).size,
      avgAge: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length) || 'N/A' : 'N/A',
    };
  }, [students]);

  const availableGrades = useMemo(() => {
    return [...new Set(students.map(s => s.gradeLevel).filter(Boolean))].sort();
  }, [students]);

  // Event handlers
  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  const handleToggleScores = (studentId) => {
    setActiveStudentId(prevId => (prevId === studentId ? null : studentId));
  };

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

  if (studentsLoading) {
    return (
      <div className="app-container" style={{ overflow: "hidden", height: "100vh" }}>
        <TopNavbar toggleSidebar={toggleSidebar} />
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="text-center">
              <Spinner size="lg" style={{ color: COLORS.primary }} className="mb-3" />
              <h5 className="text-muted">Loading students...</h5>
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
                <h1 className="mb-1 fw-bold text-dark">Student List</h1>
                <p className="text-muted mb-0">
                  {teacherSection 
                    ? `Students in section ${teacherSection}` 
                    : "All students in your access"
                  }
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">


              
              {/* Search */}
              <InputGroup style={{ width: "300px" }}>
                <FormControl
                  placeholder="Search students..."
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
                title="Total Students"
                value={stats.total}
                icon={Users}
                color={COLORS.pink}
              />
            </Col>
            <Col lg={3} md={6}>
              <StatCard
                title="Active Students"
                value={stats.total}
                icon={UserCheck}
                color={COLORS.secondary}
              />
            </Col>
            <Col lg={3} md={6}>
              <StatCard
                title="Grade Levels"
                value={Object.keys(stats.byGrade).length}
                icon={GraduationCap}
                color={COLORS.warning}
              />
            </Col>
            <Col lg={3} md={6}>
              <StatCard
                title="Sections"
                value={stats.sections}
                icon={BookOpen}
                color={COLORS.info}
              />
            </Col>
          </Row>

          {/* Error State */}
          {studentsError && (
            <Alert variant="danger" className="mb-4">
              <strong>Error loading students:</strong> {studentsError}
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
                  Students List
                  <Badge 
                    className="ms-2"
                    style={{ 
                      backgroundColor: COLORS.pink, 
                      color: "white",
                      borderRadius: "12px",
                      padding: "4px 8px"
                    }}
                  >
                    {filteredStudents.length}
                  </Badge>
                </h5>
                {searchTerm && (
                  <small className="text-muted">
                    Showing {filteredStudents.length} of {students.length} students
                  </small>
                )}
              </div>
            </Card.Header>
            
            <Card.Body className="p-0">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-5">
                  <Users size={48} className="text-muted mb-3" opacity={0.3} />
                  <h5 className="text-muted mb-2">
                    {searchTerm ? "No students found" : "No students available"}
                  </h5>
                  <p className="text-muted mb-3">
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : teacherSection 
                        ? `There are no students in section ${teacherSection}` 
                        : "There are no students to display"
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
                          width: '20%',
                          paddingLeft: '24px'
                        }}
                      >
                        Student
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '12%'
                        }}
                      >
                        School ID
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '10%'
                        }}
                      >
                        Grade
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '10%'
                        }}
                      >
                        Section
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '20%'
                        }}
                      >
                        Parent/Guardian
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '15%'
                        }}
                      >
                        Contact
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '13%',
                          paddingRight: '24px'
                        }}
                      >
                        Enrolled
                      </th>
                      <th 
                        className="border-0 py-4 fw-semibold" 
                        style={{ 
                          color: COLORS.pink,
                          width: '5%',
                          paddingRight: '24px'
                        }}
                      >
                        Scores
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                        <React.Fragment key={student.id}>
                      <tr 
                        
                        className="table-row-hover"
                        style={{ 
                          backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FFF8FA',
                          transition: 'all 0.2s ease',
                          borderBottom: '1px solid #FFE4E1',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleToggleScores(student.id)}
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
                                {student.displayName || 'Unknown'}
                              </div>
                              <small 
                                className="text-muted text-truncate d-block" 
                                style={{ fontSize: '0.8rem', maxWidth: '180px' }}
                                title={student.email}
                              >
                                {student.email || 'No email'}
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
                            {student.schoolId || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-4 align-middle">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                              style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: `${COLORS.info}15`
                              }}
                            >
                              <GraduationCap size={14} style={{ color: COLORS.info }} />
                            </div>
                            <span 
                              className="fw-semibold" 
                              style={{ fontSize: '0.9rem', color: COLORS.info }}
                            >
                              {student.gradeLevel || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 align-middle">
                          <Badge 
                            className="fw-semibold"
                            style={{ 
                              backgroundColor: COLORS.secondary, 
                              color: 'white',
                              fontSize: '0.8rem',
                              borderRadius: '20px',
                              padding: '8px 12px',
                              border: 'none'
                            }}
                          >
                            {student.section || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-4 align-middle">
                          <div className="min-width-0">
                            <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                              {`${student.parentFirstName || ''} ${student.parentLastName || ''}`.trim() || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 align-middle">
                          <span 
                            className="text-dark fw-medium" 
                            style={{ fontSize: '0.85rem' }}
                          >
                            {student.parentContactNumber || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 align-middle" style={{ paddingRight: '24px' }}>
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
                              {formatDate(student.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 align-middle text-center">
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleToggleScores(student.id)}
                                aria-expanded={activeStudentId === student.id}
                                aria-controls={`student-scores-${student.id}`}
                                style={{color: COLORS.pink}}
                            >
                                {activeStudentId === student.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </Button>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="8" className="p-0 border-0">
                            <Collapse in={activeStudentId === student.id}>
                                <div id={`student-scores-${student.id}`}>
                                    <StudentScores studentId={student.id} isVisible={activeStudentId === student.id} />
                                </div>
                            </Collapse>
                        </td>
                      </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default StudentList;
