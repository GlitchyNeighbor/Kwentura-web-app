import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Container, Row, Col, Card, Alert, Spinner, Badge } from "react-bootstrap";
import { FaBook, FaUserGraduate, FaChartBar, FaUsers, FaExclamationTriangle, FaClock, FaEye, FaClipboardCheck } from "react-icons/fa";
import SidebarMenuTeacher from "./SideMenuTeacher";
import TopNavbar from "./TopNavbar";
import "../scss/custom.scss";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"; 
import { db } from "../config/FirebaseConfig.js";
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
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore"; 

// Constants - Updated to match AdminDashboard.js color scheme
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

const CHART_COLORS = {
  stories: "#FF69B4",
  students: "#98FB98",
  grades: ["#98FB98", "#FF69B4", "#FFB6C1", "#DDA0DD", "#87CEEB"],
  approval: ["#98FB98", "#FFB6C1", "#FF69B4", "#DDA0DD"]
};

const CARD_STYLES = {
  stories: { bg: "#FFF0F5", icon: "#FF69B4" },
  students: { bg: "#FFE4E1", icon: "#98FB98" },
  grades: { bg: "#FFF0F5", icon: "#FFB6C1" },
  approval: { bg: "#FFE4E1", icon: "#FF69B4" },
  quizzes: { bg: "#F0FFF0", icon: "#28a745" },
};

// Custom hooks
const useAuth = () => {
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [teacherSection, setTeacherSection] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentTeacher(user);
          const teacherDocRef = doc(db, "teachers", user.uid);
          const teacherDocSnap = await getDoc(teacherDocRef);
          
          if (teacherDocSnap.exists()) {
            setTeacherSection(teacherDocSnap.data().section);
          } else {
            setError("Teacher profile not found. Please contact administrator.");
          }
        } else {
          setCurrentTeacher(null);
          setTeacherSection("");
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError("Authentication failed. Please try again.");
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { currentTeacher, teacherSection, authLoading, error };
};

// Utility functions
const capitalizeStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
};

// Data fetching functions
const fetchPopularStoriesData = async () => {
  try {
    const storiesRef = collection(db, "stories");
    const storiesSnapshot = await getDocs(storiesRef);
    
    const popularStories = [];
    storiesSnapshot.forEach((doc) => {
      const data = doc.data();
      popularStories.push({
        id: doc.id,
        title: data.title,
        reads: data.usersRead || 0,
        engagementRate: ((data.usersRead || 0) / (data.totalViews || 1) * 100).toFixed(1)
      });
    });

    const sortedPopularStories = popularStories
      .sort((a, b) => b.reads - a.reads)
      .slice(0, 10);

    return {
      totalCount: storiesSnapshot.size,
      chartData: sortedPopularStories,
    };
  } catch (error) {
    console.error("Error fetching popular stories data:", error);
    return {
      totalCount: 0,
      chartData: [],
    };
  }
};

const fetchStudentsData = async (section) => {
  if (!section) {
    return {
      totalCount: 0,
      gradeData: [],
      approvalData: []
    };
  }

  const studentsQuery = query(
    collection(db, "students"),
    where("section", "==", section)
  );
  const studentsSnapshot = await getDocs(studentsQuery);
  
  const gradeCountsInSection = {};
  const approvalStatusCountsInSection = {};

  studentsSnapshot.forEach((doc) => {
    const data = doc.data();
    
    const grade = data.gradeLevel || "Unknown";
    gradeCountsInSection[grade] = (gradeCountsInSection[grade] || 0) + 1;

    const status = data.status || "unknown";
    approvalStatusCountsInSection[status] = (approvalStatusCountsInSection[status] || 0) + 1;
  });

  const gradeData = Object.keys(gradeCountsInSection).map((grade, idx) => ({
    name: grade,
    value: gradeCountsInSection[grade],
    color: CHART_COLORS.grades[idx % CHART_COLORS.grades.length],
  }));

  const approvalData = Object.keys(approvalStatusCountsInSection).map((status, idx) => ({
    name: capitalizeStatus(status),
    value: approvalStatusCountsInSection[status],
    color: CHART_COLORS.approval[idx % CHART_COLORS.approval.length],
  }));

  return {
    totalCount: studentsSnapshot.size,
    gradeData,
    approvalData
  };
};

const fetchQuizScoresData = async (section) => {
  if (!section) {
    return { averageScore: 0, totalQuizzes: 0, averageScorePerStory: [] };
  }

  try {
    const studentsQuery = query(
      collection(db, "students"),
      where("section", "==", section)
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    if (studentsSnapshot.empty) {
      return { averageScore: 0, totalQuizzes: 0, averageScorePerStory: [] };
    }

    let totalScore = 0;
    let totalQuestions = 0;
    let totalQuizzes = 0;
    const storyScores = {};

    for (const studentDoc of studentsSnapshot.docs) {
      const quizScoresQuery = collection(db, "students", studentDoc.id, "quizScores");
      const quizScoresSnapshot = await getDocs(quizScoresQuery);
      quizScoresSnapshot.forEach(quizDoc => {
        const quizData = quizDoc.data();
        totalScore += quizData.score || 0;
        totalQuestions += quizData.totalQuestions || 0;
        totalQuizzes++;

        if (!storyScores[quizData.storyId]) {
          storyScores[quizData.storyId] = { title: quizData.storyTitle, totalScore: 0, totalQuestions: 0 };
        }
        storyScores[quizData.storyId].totalScore += quizData.score;
        storyScores[quizData.storyId].totalQuestions += quizData.totalQuestions;
      });
    }

    const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
    const averageScorePerStory = Object.values(storyScores).map(story => ({
      name: story.title,
      averageScore: story.totalQuestions > 0 ? parseFloat(((story.totalScore / story.totalQuestions) * 100).toFixed(1)) : 0,
    }));
    return { averageScore: averageScore.toFixed(1), totalQuizzes, averageScorePerStory };
  } catch (error) {
    console.error("Error fetching quiz scores data:", error);
    return { averageScore: 0, totalQuizzes: 0, recentScores: [] };
  }
};

// UI Components - Updated to match AdminDashboard.js style
const MetricCard = ({ title, value, icon: IconComponent, style, loading }) => (
  <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="text-muted mb-2 fs-6">{title}</div>
          <h3 className="mb-0 fw-bold text-dark">
            {loading ? <Spinner animation="grow" size="sm" /> : value.toLocaleString()}
          </h3>
        </div>
        <div
          className="p-3 rounded-circle"
          style={{ backgroundColor: `${style.icon}15`, color: style.icon }}
        >
          <IconComponent size={24} />
        </div>
      </div>
    </Card.Body>
  </Card>
);

const ChartCard = ({ title, children, loading, noDataMessage, height = 300 }) => (
  <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
    <Card.Header 
      className="border-0 py-4"
      style={{ 
        borderRadius: "12px 12px 0 0",
        backgroundColor: COLORS.light
      }}
    >
      <h5 className="mb-0 fw-semibold text-dark">{title}</h5>
    </Card.Header>
    <Card.Body className="p-4">
      {loading ? (
        <div className="d-flex align-items-center justify-content-center" style={{ height }}>
          <div className="text-center">
            <Spinner size="lg" style={{ color: COLORS.primary }} className="mb-3" />
            <p className="text-muted mb-0">Loading chart data...</p>
          </div>
        </div>
      ) : children ? (
        <div style={{ height }}>
          {children}
        </div>
      ) : (
        <div className="d-flex align-items-center justify-content-center" style={{ height }}>
          <div className="text-center">
            <FaChartBar size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
            <p className="text-muted">{noDataMessage}</p>
          </div>
        </div>
      )}
    </Card.Body>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-sm" style={{ borderColor: COLORS.pink }}>
        <p className="mb-1 fw-semibold" style={{ color: COLORS.dark }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="mb-0" style={{ color: COLORS.pink }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Main Component
const TeacherDashboard = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stories: { totalCount: 0, chartData: [] },
    students: { totalCount: 0, gradeData: [], approvalData: [] },
    quizzes: { averageScore: 0, totalQuizzes: 0, averageScorePerStory: [] }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentTeacher, teacherSection, authLoading, error: authError } = useAuth();

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!currentTeacher || teacherSection === undefined) return;

    setLoading(true);
    setError(null);

    try {
      const [storiesResult, studentsResult, quizzesResult] = await Promise.all([
        fetchPopularStoriesData(),
        fetchStudentsData(teacherSection),
        fetchQuizScoresData(teacherSection)
      ]);

      setDashboardData({
        stories: storiesResult,
        students: studentsResult,
        quizzes: quizzesResult
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [currentTeacher, teacherSection]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const renderPieChart = useMemo(() => (data, dataKey = "value") => {
    if (!data.length || !data.some(item => item.value > 0)) return null;

    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={90}
              fill={CHART_COLORS.students}
              dataKey={dataKey}
              label={({ name, value, percent }) => 
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }, []);

  const renderBarChart = useMemo(() => (data) => {
    if (!data.length) return null;

    // Truncate long titles for better display
    const processedData = data.map(item => ({
      ...item,
      shortTitle: item.title.length > 8 ? `${item.title.substring(0, 8)}...` : item.title,
      fullTitle: item.title
    }));

    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={processedData} 
            margin={{ top: 50, right: 20, left: 50, bottom: 20 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFE4E1" />
            <XAxis 
              dataKey="shortTitle" 
              tick={{ fontSize: 9, fill: COLORS.dark }}
              angle={-45}
              textAnchor="end"
              height={90}
              tickLine={false}
              axisLine={false}
              interval={0}
              tickMargin={15}
            />
            <YAxis 
              allowDecimals={false} 
              tick={{ fontSize: 12, fill: COLORS.dark }}
              tickLine={false}
              axisLine={false}
              label={{ 
                value: 'Number of Reads', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: COLORS.dark, fontSize: '12px' }
              }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-sm" style={{ borderColor: COLORS.pink, maxWidth: '200px' }}>
                      <p className="mb-2 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                        {data.fullTitle}
                      </p>
                      <p className="mb-1 text-primary" style={{ fontSize: '0.85rem' }}>
                        📖 Reads: <span className="fw-bold">{data.reads}</span>
                      </p>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                        Engagement: {data.engagementRate}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="reads"
              name="Reads"
              fill={CHART_COLORS.stories}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Story insights below chart */}
        <div  >
          <div className="row g-1 justify-content-center text-center">
            <div className="col-md-4 col-sm-12 mb-2">
              <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{data.length}</div>
              <small className="text-muted">Stories Available</small>
            </div>
            <div className="col-md-4 col-sm-12 mb-2">
              <div className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
                {data.reduce((sum, story) => sum + story.reads, 0)}
              </div>
              <small className="text-muted">Total Reads</small>
            </div>
            <div className="col-md-4 col-sm-12 mb-2">
              <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
                {data.length > 0 ? Math.round(data.reduce((sum, story) => sum + parseFloat(story.engagementRate), 0) / data.length) : 0}%
              </div>
              <small className="text-muted">Avg. Engagement</small>
            </div>
          </div>
        </div>
      </div>
    );
  }, []);

  const renderQuizChart = useMemo(() => (data) => {
    if (!data || data.length === 0) return null;

    const processedData = data.map(item => ({
      ...item,
      shortName: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
      fullName: item.name
    }));

    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#FFE4E1" />
            <XAxis
              dataKey="shortName"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 11, fill: COLORS.dark }}
            />
            <YAxis
              stroke={COLORS.dark}
              fontSize={12}
              domain={[0, 100]}
              label={{
                value: "Average Score (%)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: COLORS.dark },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="averageScore" name="Average Score" fill={CHART_COLORS.students} radius={[6, 6, 0, 0]} unit="%" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }, []);

  if (authLoading) {
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
              <h5 className="text-muted">Initializing Dashboard...</h5>
              <p className="text-muted mb-0">Please wait while we fetch your data</p>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (authError || error) {
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
            <Row className="justify-content-center w-100">
              <Col md={6}>
                <Alert variant="danger" className="text-center" style={{ borderRadius: "12px" }}>
                  <FaExclamationTriangle className="me-2" />
                  <h5 className="alert-heading">Error</h5>
                  <p className="mb-0">{authError || error}</p>
                </Alert>
              </Col>
            </Row>
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
          {/* Header - Updated to match AdminDashboard.js style */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="mb-1 fw-bold text-dark">Teacher Dashboard</h1>
              <p className="text-muted mb-0">
                Welcome back! Here's an overview of your section: <span className="fw-semibold">{teacherSection || "Not Assigned"}</span>
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted">Last updated: {new Date().toLocaleTimeString()}</small>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4" style={{ borderRadius: "12px" }}>
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          )}

          {/* Metrics Cards - Updated styling */}
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <MetricCard
                title="Total Stories"
                value={dashboardData.stories.totalCount}
                icon={FaBook}
                style={CARD_STYLES.stories}
                loading={loading}
              />
            </Col>
            <Col lg={3} md={6}>
              <MetricCard
                title="Students in Section"
                value={dashboardData.students.totalCount}
                icon={FaUserGraduate}
                style={CARD_STYLES.students}
                loading={loading}
              />
            </Col>
            <Col lg={3} md={6}>
              <MetricCard
                title="Grade Levels"
                value={dashboardData.students.gradeData.length}
                icon={FaUsers}
                style={CARD_STYLES.grades}
                loading={loading}
              />
            </Col>
            <Col lg={3} md={6}>
              <MetricCard
                title="Approval Categories"
                value={dashboardData.students.approvalData.length}
                icon={FaChartBar}
                style={CARD_STYLES.approval}
                loading={loading}
              />
            </Col>
            <Col lg={3} md={6}>
              <MetricCard
                title="Quiz Performance"
                value={`${dashboardData.quizzes.averageScore}%`}
                icon={FaClipboardCheck}
                style={CARD_STYLES.quizzes}
                loading={loading}
              />
            </Col>
          </Row>

          {/* Charts Section */}
          <Row className="g-4 mb-4">
            <Col xl={6} lg={12}>
              <ChartCard
                title="Popular Stories"
                loading={loading}
                noDataMessage="No story data available yet"
                height={450}
              >
                {renderBarChart(dashboardData.stories.chartData)}
              </ChartCard>
            </Col>
            <Col xl={6} lg={12}>
                <ChartCard
                  title="Average Score Per Story"
                  loading={loading}
                  noDataMessage="No quiz data available for your section"
                  height={450}
                >
                  {renderQuizChart(dashboardData.quizzes.averageScorePerStory)}
                </ChartCard>
              </Col>
          </Row>

          {/* Additional Chart Row */}
          {dashboardData.students.approvalData.length > 0 && (
            <Row className="g-4 mb-4">
              <Col xl={6} lg={12}>
                <ChartCard
                  title={`Students by Grade Level${teacherSection ? ` (${teacherSection})` : ''}`}
                  loading={loading}
                  noDataMessage="No student grade data for your section"
                >
                  {renderPieChart(dashboardData.students.gradeData)}
                </ChartCard>
              </Col>
              <Col xl={6} lg={12}>
                <ChartCard
                  title="Student Approval Status"
                  loading={loading}
                  noDataMessage="No approval status data available"
                >
                  {renderPieChart(dashboardData.students.approvalData)}
                </ChartCard>
              </Col>
              <Col xl={6}>
                {/* Enhanced Section Insights Card */}
                <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
                  <Card.Header 
                    className="border-0 py-4"
                    style={{ 
                      borderRadius: "12px 12px 0 0",
                      backgroundColor: COLORS.light
                    }}
                  >
                    <h5 className="mb-0 fw-semibold text-dark">Section Insights</h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {/* Top metrics row */}
                    <Row className="g-3 mb-4">
                      <Col sm={6}>
                        <div className="text-center p-3 rounded-3" style={{ backgroundColor: `${COLORS.success}08` }}>
                          <div 
                            className="p-2 rounded-circle d-inline-flex mb-2" 
                            style={{ backgroundColor: `${COLORS.success}20`, color: "#13db23ff" }}
                          >
                            <FaUserGraduate size={20} />
                          </div>
                          <h4 className="mb-1 fw-bold text-dark">{dashboardData.students.totalCount}</h4>
                          <small className="text-muted fw-medium">Total Students</small>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="text-center p-3 rounded-3" style={{ backgroundColor: `${COLORS.info}08` }}>
                          <div 
                            className="p-2 rounded-circle d-inline-flex mb-2" 
                            style={{ backgroundColor: `${COLORS.info}20`, color: COLORS.info }}
                          >
                            <FaChartBar size={20} />
                          </div>
                          <h4 className="mb-1 fw-bold text-dark">{dashboardData.students.gradeData.length}</h4>
                          <small className="text-muted fw-medium">Grade Levels</small>
                        </div>
                      </Col>
                    </Row>

                    {/* Grade distribution list */}
                    {dashboardData.students.gradeData.length > 0 && (
                      <div>
                        <h6 className="mb-3 text-dark fw-semibold">Grade Distribution:</h6>
                        <div className="space-y-2">
                          {dashboardData.students.gradeData.slice(0, 3).map((grade, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center py-2 px-3 rounded-2" 
                                 style={{ backgroundColor: `${grade.color}15` }}>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded-circle me-2"
                                  style={{ 
                                    width: "8px", 
                                    height: "8px", 
                                    backgroundColor: grade.color 
                                  }}
                                ></div>
                                <small className="fw-medium text-dark">{grade.name}</small>
                              </div>
                              <small className="fw-bold" style={{ color: grade.color }}>
                                {grade.value} student{grade.value !== 1 ? 's' : ''}
                              </small>
                            </div>
                          ))}
                          {dashboardData.students.gradeData.length > 3 && (
                            <div className="text-center pt-2">
                              <small className="text-muted">
                                +{dashboardData.students.gradeData.length - 3} more grade levels
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </div>
  );
};

export default TeacherDashboard;