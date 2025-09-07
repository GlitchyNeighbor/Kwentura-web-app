import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircleFill } from "react-bootstrap-icons";
import { FaDownload, FaExclamationTriangle } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import { db } from "../config/FirebaseConfig.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SidebarMenuTeacher from "./SideMenuTeacher";
import TopNavbar from "./TopNavbar";
import "../scss/custom.scss";

// Constants - Matching Charts.js color scheme
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

const STUDENT_GRADE_COLORS = ["#FF69B4", "#FFB6C1", "#98FB98", "#FFE4E1", "#DDA0DD"];

const TeacherCharts = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [storiesData, setStoriesData] = useState([]);
  const [studentsByGradeInSectionData, setStudentsByGradeInSectionData] = useState([]);
  const [averageScorePerStoryData, setAverageScorePerStoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [teacherSection, setTeacherSection] = useState("");
  const [noQuizData, setNoQuizData] = useState(false);

  const storiesChartRef = useRef();
  const studentsGradeChartRef = useRef();
  const chartsRef = useRef();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

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
            setError("Teacher document not found");
            setLoading(false);
          }
        } catch (err) {
          console.error("Error fetching teacher data:", err);
          setError("Error fetching teacher data");
          setLoading(false);
        }
      } else {
        setCurrentTeacher(null);
        setTeacherSection("");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPopularStoriesData = async () => {
    try {
      const storiesRef = collection(db, "stories");
      const storiesSnapshot = await getDocs(storiesRef);

      const popularStories = [];
      storiesSnapshot.forEach((doc) => {
        const storyData = doc.data();
        popularStories.push({
          id: doc.id,
          title: storyData.title,
          reads: storyData.usersRead || 0,
        });
      });

      const sortedPopularStories = popularStories
        .sort((a, b) => b.reads - a.reads)
        .slice(0, 10);

      setStoriesData(sortedPopularStories);
    } catch (error) {
      console.error("Error fetching popular stories data:", error);
      throw error;
    }
  };

  const fetchStudentsByGradeData = async () => {
    if (!teacherSection) return;
    try {
      const studentsQuery = query(
        collection(db, "students"),
        where("section", "==", teacherSection)
      );
      const studentsSnapshot = await getDocs(studentsQuery);

      const gradeCounts = {};
      studentsSnapshot.forEach((doc) => {
        const student = doc.data();
        const grade = student.gradeLevel || "Unknown";
        gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
      });

      const chartData = Object.keys(gradeCounts).map((grade, idx) => ({
        name: grade,
        value: gradeCounts[grade],
        color: STUDENT_GRADE_COLORS[idx % STUDENT_GRADE_COLORS.length],
        percentage: `${((gradeCounts[grade] / Object.values(gradeCounts).reduce((sum, count) => sum + count, 0)) * 100).toFixed(1)}%`,
      }));
      setStudentsByGradeInSectionData(chartData);
    } catch (error) {
      console.error("Error fetching students by grade data:", error);
      throw error;
    }
  };

  const fetchAverageScorePerStory = async () => {
    if (!teacherSection) return;
    try {
      const studentsQuery = query(
        collection(db, "students"),
        where("section", "==", teacherSection)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      if (studentsSnapshot.empty) {
        setAverageScorePerStoryData([]);
        setNoQuizData(true);
        return;
      }

      const storyScores = {};

      for (const studentDoc of studentsSnapshot.docs) {
        const quizScoresQuery = collection(db, "students", studentDoc.id, "quizScores");
        const quizScoresSnapshot = await getDocs(quizScoresQuery);
        quizScoresSnapshot.forEach(quizDoc => {
          const data = quizDoc.data();
          if (!storyScores[data.storyId]) {
            storyScores[data.storyId] = { title: data.storyTitle, totalScore: 0, totalQuestions: 0, count: 0 };
          }
          storyScores[data.storyId].totalScore += data.score;
          storyScores[data.storyId].totalQuestions += data.totalQuestions;
          storyScores[data.storyId].count++;
        });
      }

      if (Object.keys(storyScores).length === 0) {
        setNoQuizData(true);
      }

      const chartData = Object.values(storyScores).map(story => ({
        name: story.title,
        averageScore: story.totalQuestions > 0 ? (story.totalScore / story.totalQuestions) * 100 : 0,
      })).map(d => ({ ...d, averageScore: parseFloat(d.averageScore.toFixed(1)) }));

      setAverageScorePerStoryData(chartData);

    } catch (error) {
      console.error("Error fetching average score data:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (teacherSection) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          await Promise.all([
            fetchPopularStoriesData(), 
            fetchStudentsByGradeData(),
            fetchAverageScorePerStory()
          ]);
        } catch (err) {
          console.error("Error loading charts data:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [teacherSection]);

  // Custom tooltip component matching Charts.js
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm" style={{ borderColor: COLORS.pink }}>
          <p className="mb-1 fw-semibold" style={{ color: COLORS.dark }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="mb-0" style={{ color: COLORS.pink }}>
              {`${entry.name}: ${entry.value}${entry.name === 'Total Readers' ? ` reader${entry.value !== 1 ? 's' : ''}` : ''}${entry.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleDownloadChartPdf = async (ref, filename) => {
    if (!ref.current) return;
    try {
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(filename);
    } catch (error) {
      console.error("Error downloading chart:", error);
    }
  };

  const handleDownloadPdf = async () => {
    const input = chartsRef.current;
    if (!input) return;
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("teacher_charts.pdf");
    } catch (error) {
      console.error("Error downloading charts:", error);
    }
  };

  // Component for chart cards with loading and error states - matching Charts.js
  const ChartCard = ({ title, loading, error, children, height = 300, onDownload }) => (
    <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
      <Card.Header 
        className="border-0 py-4"
        style={{ 
          borderRadius: "12px 12px 0 0",
          backgroundColor: COLORS.light
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-semibold text-dark">{title}</h5>
          <Button
            size="sm"
            variant="outline-primary"
            onClick={onDownload}
            className="d-flex align-items-center gap-2"
            style={{ 
              borderColor: COLORS.primary,
              color: COLORS.primary,
              borderRadius: "8px"
            }}
          >
            <FaDownload size={14} />
            PDF
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ height }}>
            <div className="text-center">
              <Spinner size="lg" style={{ color: COLORS.primary }} className="mb-3" />
              <p className="text-muted mb-0">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-0">
            <FaExclamationTriangle className="me-2" />
            Error loading data: {error}
          </Alert>
        ) : (
          <div style={{ height }}>
            {children}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="app-container" style={{ overflow: "hidden", height: "100vh" }}>
        <TopNavbar toggleSidebar={toggleSidebar} />
        <div className="content-container" style={{ display: "flex", height: "calc(100vh - 56px)" }}>
          <div className={`sidebar-container ${showSidebar ? "show" : ""}`}>
            <SidebarMenuTeacher isOpen={showSidebar} toggleSidebar={toggleSidebar} />
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
              <h5 className="text-muted">Loading charts data...</h5>
              <p className="text-muted mb-0">Please wait while we fetch the latest information</p>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ overflow: "hidden", height: "100vh" }}>
      <style jsx>{`
        .chart-container .recharts-cartesian-grid-horizontal line,
        .chart-container .recharts-cartesian-grid-vertical line {
          stroke: #FFE4E1;
        }
        
        .chart-container .recharts-text {
          fill: #2D2D2D;
        }
        
        .btn-outline-primary:hover {
          background-color: ${COLORS.primary} !important;
          border-color: ${COLORS.primary} !important;
          color: white !important;
        }
      `}</style>
      
      <TopNavbar toggleSidebar={toggleSidebar} />
      
      <div className="content-container" style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        <div className={`sidebar-container ${showSidebar ? "show" : ""}`}>
          <SidebarMenuTeacher isOpen={showSidebar} toggleSidebar={toggleSidebar} />
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
          {/* Header - Updated to match Charts.js style */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                onClick={() => navigate(-1)}
                className="me-3 p-0"
                title="Back"
                style={{ color: COLORS.primary }}
              >
                <ArrowLeftCircleFill size={32} />
              </Button>
              <div>
                <h1 className="mb-1 fw-bold text-dark">Teacher Charts & Analytics</h1>
                <p className="text-muted mb-0">Visual insights for your section and story engagement</p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleDownloadPdf}
              className="d-flex align-items-center gap-2"
              style={{ 
                backgroundColor: COLORS.primary,
                borderColor: COLORS.primary,
                borderRadius: "10px",
                padding: "10px 20px"
              }}
            >
              <FaDownload size={16} />
              Download All Charts
            </Button>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4" style={{ borderRadius: "12px" }}>
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          )}

          <div ref={chartsRef}>
            <Row className="g-4">
              <Col xl={6} lg={12} className="mb-4">
                <div ref={storiesChartRef}>
                  <ChartCard 
                    title="Most Read Stories" 
                    loading={false}
                    onDownload={() => handleDownloadChartPdf(storiesChartRef, "stories_chart.pdf")}
                  >
                    {storiesData.length > 0 ? (
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={storiesData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#FFE4E1" />
                            <XAxis
                              dataKey="title"
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              interval={0}
                              tick={{ fontSize: 11 }}
                              stroke="#2D2D2D"
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              allowDecimals={false}
                              stroke="#2D2D2D"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              label={{
                                value: "Number of Readers",
                                angle: -90,
                                position: "insideLeft",
                                style: { textAnchor: "middle", fill: "#2D2D2D" },
                              }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey="reads"
                              name="Total Readers"
                              fill={COLORS.pink}
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                        <div className="text-center">
                          <FaExclamationTriangle size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                          <p className="text-muted mb-0">No story reading data available</p>
                        </div>
                      </div>
                    )}
                  </ChartCard>
                </div>
              </Col>
              <Col xl={6} lg={12} className="mb-4">
                <div ref={studentsGradeChartRef}>
                  <ChartCard 
                    title="Students Per Grade (My Section)" 
                    loading={false}
                    onDownload={() => handleDownloadChartPdf(studentsGradeChartRef, "students_grade_chart.pdf")}
                  >
                    {studentsByGradeInSectionData.length > 0 && studentsByGradeInSectionData.some((s) => s.value > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={studentsByGradeInSectionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percentage }) => `${name} ${percentage}`}
                          >
                            {studentsByGradeInSectionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                        <div className="text-center">
                          <FaExclamationTriangle size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                          <p className="text-muted mb-0">No student grade data for your section</p>
                        </div>
                      </div>
                    )}
                  </ChartCard>
                </div>
              </Col>
              <Col xl={12} lg={12}>
                <ChartCard 
                  ref={storiesChartRef}
                  title="Average Score Per Story" 
                  loading={false}
                  onDownload={() => handleDownloadChartPdf(storiesChartRef, "average_score_chart.pdf")}
                >
                  {averageScorePerStoryData.length > 0 ? (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={averageScorePerStoryData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#FFE4E1" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            tick={{ fontSize: 11 }}
                            stroke="#2D2D2D"
                          />
                          <YAxis
                            stroke="#2D2D2D"
                            fontSize={12}
                            domain={[0, 100]}
                            label={{
                              value: "Average Score (%)",
                              angle: -90,
                              position: "insideLeft",
                              style: { textAnchor: "middle", fill: "#2D2D2D" },
                            }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="averageScore" name="Average Score" fill={COLORS.success} radius={[6, 6, 0, 0]} unit="%" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                      <div className="text-center">
                        <FaExclamationTriangle size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                        <p className="text-muted mb-0">{noQuizData ? "No quiz data available for your section" : "Loading data..."}</p>
                      </div>
                    </div>
                  )}
                </ChartCard>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default TeacherCharts;