import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircleFill } from "react-bootstrap-icons";
import { FaDownload, FaExclamationTriangle, FaBookmark } from "react-icons/fa";
import autoTable from "jspdf-autotable";
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
import { FaBook, FaUserGraduate, FaChartBar, FaClipboardCheck } from "react-icons/fa";
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
  bookmarks: "#FFD700",
};

const STUDENT_GRADE_COLORS = ["#FF69B4", "#FFB6C1", "#98FB98", "#FFE4E1", "#DDA0DD"];

const CARD_STYLES = {
  stories: { bg: "#FFF0F5", icon: "#FF69B4" },
  students: { bg: "#FFE4E1", icon: "#98FB98" },
  grades: { bg: "#FFF0F5", icon: "#FFB6C1" },
  approval: { bg: "#FFE4E1", icon: "#FF69B4" },
  quizzes: { bg: "#F0FFF0", icon: "#28a745" },
  bookmarks: { bg: "#FFFACD", icon: "#FFD700" },
};

const TABLE_LABELS = {
  storiesData: { title: "Story Title", reads: "Number of Readers" },
  bookmarkedStoriesData: { title: "Story Title", bookmarks: "Number of Bookmarks" },
  studentsByGradeInSectionData: { name: "Grade Level", value: "Number of Students", percentage: "Percentage" },
  studentApprovalData: { name: "Approval Status", value: "Count" }, // no 'color'
  averageScorePerStoryData: { name: "Story Title", averageScore: "Average Score (%)" },
};



const MetricCard = ({ title, value, icon: IconComponent, style, loading }) => (
  <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="text-muted mb-2 fs-6">{title}</div>
            <h3 className="mb-0 fw-bold text-dark">
              {loading ? <Spinner animation="grow" size="sm" /> : ((value !== undefined && value !== null && typeof value === 'number') ? value.toLocaleString() : String(value ?? '0'))}
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

const TeacherCharts = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [storiesData, setStoriesData] = useState([]);
  const [studentsByGradeInSectionData, setStudentsByGradeInSectionData] = useState([]);
  const [studentApprovalData, setStudentApprovalData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalStories: 0,
    totalStudents: 0,
    totalBookmarks: 0,
    approvalCategories: 0,
    quizPerformance: 0,
  });
  const [averageScorePerStoryData, setAverageScorePerStoryData] = useState([]);
  const [bookmarkedStoriesData, setBookmarkedStoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [teacherSection, setTeacherSection] = useState("");
  const [noQuizData, setNoQuizData] = useState(false);

  const storiesChartRef = useRef();
  const studentsGradeChartRef = useRef();
  const bookmarkedChartRef = useRef();
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
          genre: storyData.genre || 'Unknown',
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

  const fetchStoryBookmarkCounts = async () => {
    try {
      const storiesRef = collection(db, "stories");
      const storiesSnapshot = await getDocs(storiesRef);
      const stories = storiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), bookmarks: 0 }));

      const studentsRef = collection(db, "students");
      const studentsSnapshot = await getDocs(studentsRef);

      for (const studentDoc of studentsSnapshot.docs) {
        const bookmarksRef = collection(db, "students", studentDoc.id, "bookmarks");
        const bookmarksSnapshot = await getDocs(bookmarksRef);
        bookmarksSnapshot.forEach(favDoc => {
          const story = stories.find(s => s.id === favDoc.id);
          if (story) {
            story.bookmarks++;
          }
        });
      }

      const sortedStories = stories.sort((a, b) => b.bookmarks - a.bookmarks).slice(0, 10);
      setBookmarkedStoriesData(sortedStories);

    } catch (error) {
      console.error("Error fetching story bookmark counts:", error);
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
      setDashboardStats(prev => ({ ...prev, totalStudents: studentsSnapshot.size, approvalCategories: Object.keys(gradeCounts).length }));
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

            storyScores[data.storyId] = { 
              title: data.storyTitle, 
              totalScore: 0, 
              totalQuestions: 0, 
              genre: data.genre || 'Unknown',
              count: 0 
            };
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
        genre: story.genre,
      })).map(d => ({ ...d, averageScore: parseFloat(d.averageScore.toFixed(1)) }));

      setAverageScorePerStoryData(chartData);
      setDashboardStats(prev => ({ ...prev, quizPerformance: (Object.values(storyScores).reduce((acc, s) => acc + s.totalScore, 0) / Object.values(storyScores).reduce((acc, s) => acc + s.totalQuestions, 1) * 100).toFixed(1) + '%' }));

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
          const storiesSnapshot = await getDocs(collection(db, "stories"));
          setDashboardStats(prev => ({ ...prev, totalStories: storiesSnapshot.size }));
          await Promise.all([
            fetchPopularStoriesData(), 
            fetchStudentsByGradeData(),
            fetchAverageScorePerStory(),
            fetchStoryBookmarkCounts(),
            fetchStudentApprovalData(),
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

  const fetchStudentApprovalData = async () => {
    if (!teacherSection) return;
    try {
      const studentsQuery = query(
        collection(db, "students"),
        where("section", "==", teacherSection)
      );
      const studentsSnapshot = await getDocs(studentsQuery);

      const approvalStatusCounts = {};
      studentsSnapshot.forEach((doc) => {
        const student = doc.data();
        const status = student.status || "unknown";
        approvalStatusCounts[status] = (approvalStatusCounts[status] || 0) + 1;
      });

      const chartData = Object.keys(approvalStatusCounts).map((status, idx) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
        value: approvalStatusCounts[status],
        color: STUDENT_GRADE_COLORS[idx % STUDENT_GRADE_COLORS.length],
      }));
      setStudentApprovalData(chartData);
    } catch (error) {
      console.error("Error fetching student approval data:", error);
      throw error;
    }
  };

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

  // Generates a textual interpretation for a given dataset.
  const generateInterpretation = (labelKey, data) => {
    if (!data || data.length === 0) {
      return "No data available to generate an interpretation.";
    }

    try {
      switch (labelKey) {
        case "storiesData": {
          const topStory = data[0] || {};
          return `The story "${topStory.title}" is the most read with ${topStory.reads} views. This high engagement suggests that stories with an '${topStory.genre}' theme are effective for these readers. Consider recommending more stories from this genre.`;
        }
        case "bookmarkedStoriesData": {
          const topStory = data[0] || {};
          const totalBookmarks = data.reduce((sum, story) => sum + story.bookmarks, 0);
          return `With ${totalBookmarks} total bookmarks, students are actively saving stories for future reference. The most bookmarked story, "${topStory.title}" (genre: ${topStory.genre}), is clearly valued. This indicates a strong interest in this type of content.`;
        }
        case "studentsByGradeInSectionData": {
          const sortedData = [...data].sort((a, b) => b.value - a.value);
          const topGrade = sortedData[0] || {};
          return `The section is composed of students from ${data.length} different grade levels. The largest group is ${topGrade.name}, comprising ${topGrade.percentage} of the class.`;
        }
        case "studentApprovalData": {
          const pending = data.find(d => d.name.toLowerCase().includes('pending'));
          if (pending && pending.value > 0) {
            return `There are currently ${pending.value} student(s) with a "Pending Approval" status. Reviewing these accounts is necessary to grant them full platform access.`;
          }
          return "All students in this section have an approved status. No pending actions are required.";
        }
        case "averageScorePerStoryData": {
          const sortedByScore = [...data].sort((a, b) => b.averageScore - a.averageScore);
          const topScoring = sortedByScore[0] || {};
          const lowestScoring = sortedByScore[sortedByScore.length - 1] || {};

          if (data.length === 0) return "No quiz score data available.";

          let interpretation = `Students performed best on the quiz for "${topScoring.name}" (Genre: ${topScoring.genre}), with an average score of ${topScoring.averageScore}%. This suggests strong comprehension of this material.`;
          if (data.length > 1 && topScoring.name !== lowestScoring.name) {
            interpretation += ` Conversely, the story "${lowestScoring.name}" had the lowest average score (${lowestScoring.averageScore}%), which may highlight a topic for review.`;
          }
          return interpretation;
        }
        default:
          return "Interpretation for this data is not available.";
      }
    } catch (error) {
      console.error("Error generating interpretation:", error);
      return "An error occurred while generating the interpretation.";
    }
  };

  const addInterpretationToPdf = (pdf, interpretation) => {
    const finalY = (pdf.lastAutoTable && pdf.lastAutoTable.finalY) ? pdf.lastAutoTable.finalY : 420;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100);
    const splitText = pdf.splitTextToSize(interpretation, pdf.internal.pageSize.getWidth() - 80);
    pdf.text(splitText, 40, finalY + 20);
    pdf.setFont("helvetica", "normal"); // Reset font
    pdf.setTextColor(0);
  };

const handleDownloadChartPdf = async (ref, filename, chartData, labelMapKey, existingPdf = null) => {
  if ((!ref || !ref.current) && !existingPdf) {
    console.error("A ref is required to create a new PDF from a chart.");
    return;
  }
  if (!chartData || chartData.length === 0) return;

  const isNewPdf = !existingPdf;
  const pdf = isNewPdf ? new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" }) : existingPdf;
  let startY = 40;

  try {
    // Add chart image only if a ref is provided
    if (ref && ref.current) {
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 80; // with margin
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 40, 40, imgWidth, Math.min(imgHeight, 350));
      startY = Math.min(imgHeight, 350) + 60;
    }

    const labels = TABLE_LABELS[labelMapKey] || {};
    const keys = Object.keys(labels);

    const tableHead = [keys.map(key => labels[key] || key)];
    const tableBody = chartData.map(row => keys.map(key => row[key] !== undefined ? row[key] : 'N/A'));

    autoTable(pdf, {
      head: tableHead,
      body: tableBody,
      startY: startY,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 10 },
    });

    const interpretation = generateInterpretation(labelMapKey, chartData);
    addInterpretationToPdf(pdf, interpretation);

    if (isNewPdf) {
      pdf.save(filename);
    }

  } catch (error) {
    console.error("Error downloading chart with data:", error);
  }
};

const handleDownloadPdf = async () => {
  if (!chartsRef.current) { // This ref isn't strictly needed anymore but good to keep
    console.error("Charts container ref is not available.");
    return;
  }

  try {
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    // List of charts with their refs, data, and table labels
    const charts = [
      { ref: storiesChartRef, title: "Most Read Stories", data: storiesData, labelKey: "storiesData" },
      { ref: bookmarkedChartRef, title: "Most Bookmarked Stories", data: bookmarkedStoriesData, labelKey: "bookmarkedStoriesData" },
      { ref: studentsGradeChartRef, title: "Students Per Grade (My Section)", data: studentsByGradeInSectionData, labelKey: "studentsByGradeInSectionData" },
      { ref: studentsGradeChartRef, title: "Student Approval Status", data: studentApprovalData, labelKey: "studentApprovalData" }, // Re-using a ref for the pie chart
      { ref: storiesChartRef, title: "Average Score Per Story", data: averageScorePerStoryData, labelKey: "averageScorePerStoryData" } // Re-using a ref for the bar chart
    ];

    for (let i = 0; i < charts.length; i++) {
      const { ref, title, data, labelKey } = charts[i];
      if (!data || data.length === 0) continue;

      if (i > 0) pdf.addPage(); // new page per chart

      pdf.setFontSize(18);
      pdf.text(title, 40, 40);

      await handleDownloadChartPdf(ref, null, data, labelKey, pdf); // Pass the existing PDF
    }

    pdf.save("All Charts.pdf");
  } catch (error) {
    console.error("Error downloading all charts with tables:", error);
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

          {/* Metric Cards */}
          <Row className="g-4 mb-4">
            <Col lg={2} md={4}>
              <MetricCard
                title="Total Stories"
                value={dashboardStats.totalStories}
                icon={FaBook}
                style={CARD_STYLES.stories}
                loading={loading}
              />
            </Col>
            <Col lg={2} md={4}>
              <MetricCard
                title="Students in Section"
                value={dashboardStats.totalStudents}
                icon={FaUserGraduate}
                style={CARD_STYLES.students}
                loading={loading}
              />
            </Col>
            <Col lg={2} md={4}>
              <MetricCard
                title="Total Bookmarks"
                value={bookmarkedStoriesData.reduce((sum, story) => sum + story.bookmarks, 0)}
                icon={FaBookmark}
                style={CARD_STYLES.bookmarks}
                loading={loading}
              />
            </Col>
            <Col lg={3} md={6}>
              <MetricCard
                title="Quiz Performance"
                value={dashboardStats.quizPerformance}
                icon={FaClipboardCheck}
                style={CARD_STYLES.quizzes}
                loading={loading}
              />
            </Col>
          </Row>

          <div ref={chartsRef}>
            <Row className="g-4">
              <Col xl={6} lg={12} className="mb-4">
                <div ref={storiesChartRef}>
                  <ChartCard 
                    title="Most Read Stories"
                    loading={false}
                    onDownload={() => handleDownloadChartPdf(storiesChartRef, "stories_chart.pdf", storiesData, "storiesData")}
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
                <div ref={bookmarkedChartRef}>
                    <ChartCard 
                      title="Most Bookmarked Stories"
                      loading={loading}
                      onDownload={() => handleDownloadChartPdf(bookmarkedChartRef, "bookmarked_stories_chart.pdf", bookmarkedStoriesData, "bookmarkedStoriesData")}
                    >
                    {bookmarkedStoriesData.length > 0 ? (
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={bookmarkedStoriesData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
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
                                value: "Number of Bookmarks",
                                angle: -90,
                                position: "insideLeft",
                                style: { textAnchor: "middle", fill: "#2D2D2D" },
                              }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey="bookmarks"
                              name="Total Bookmarks"
                              fill={COLORS.bookmarks}
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                        <div className="text-center">
                          <FaExclamationTriangle size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                          <p className="text-muted mb-0">No story bookmark data available</p>
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
                      onDownload={() => handleDownloadChartPdf(studentsGradeChartRef, "students_grade_chart.pdf", studentsByGradeInSectionData, "studentsByGradeInSectionData")}
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
              <Col xl={6} lg={12} className="mb-4">
                <ChartCard 
                  title="Student Approval Status"
                  loading={loading}
                  onDownload={() => handleDownloadChartPdf(studentsGradeChartRef, "student_approval_chart.pdf", studentApprovalData, "studentApprovalData")}
                >
                  {studentApprovalData.length > 0 && studentApprovalData.some((s) => s.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={studentApprovalData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {studentApprovalData.map((entry, index) => (
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
                        <p className="text-muted mb-0">No approval status data available</p>
                      </div>
                    </div>
                  )}
                </ChartCard>
              </Col>
              <Col xl={12} lg={12}>
                  <ChartCard 
                    title="Average Score Per Story"
                    loading={false}
                    onDownload={() => handleDownloadChartPdf(storiesChartRef, "average_score_chart.pdf", averageScorePerStoryData, "averageScorePerStoryData")}
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
