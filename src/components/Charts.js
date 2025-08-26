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
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../config/FirebaseConfig.js";
import SidebarMenuAdmin from "./SidebarMenuAdmin";
import TopNavbar from "./TopNavbar";
import "../scss/custom.scss";

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

const USER_ROLE_COLORS = ["#FF69B4", "#FFB6C1", "#98FB98"];

const Charts = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [storiesData, setStoriesData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [studentsPerSectionData, setStudentsPerSectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Create refs for each chart
  const storiesChartRef = useRef();
  const usersChartRef = useRef();
  const sectionsChartRef = useRef();
  const chartsRef = useRef();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const fetchStoriesData = async () => {
    try {
      const storiesRef = collection(db, "stories");
      const q = query(storiesRef, orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);

      const monthYearCounts = {};
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          const date = data.createdAt.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt);
          const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          monthYearCounts[monthYear] = (monthYearCounts[monthYear] || 0) + 1;
        }
      });

      const sortedKeys = Object.keys(monthYearCounts).sort((a, b) => {
        const [monthA, yearA] = a.split(" ");
        const [monthB, yearB] = b.split(" ");
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
      });

      const chartData = sortedKeys.map((monthYear) => ({
        month: monthYear,
        stories: monthYearCounts[monthYear],
      }));

      setStoriesData(chartData);
    } catch (error) {
      console.error("Error fetching stories data:", error);
      throw error;
    }
  };

  const fetchUsersData = async () => {
    try {
      const adminsRef = collection(db, "admins");
      const teachersRef = collection(db, "teachers");
      const studentsRef = collection(db, "students");
      const allStudentsQuery = query(collection(db, "students"));

      const [adminsSnapshot, teachersSnapshot, studentsSnapshot, allStudentsSnapshotForSections] =
        await Promise.all([
          getDocs(query(adminsRef, where("isArchived", "==", false))),
          getDocs(query(teachersRef, where("isArchived", "==", false))),
          getDocs(query(studentsRef, where("isArchived", "==", false))),
          getDocs(allStudentsQuery),
        ]);

      const roleCounts = {
        admin: adminsSnapshot.size,
        teacher: teachersSnapshot.size,
        student: studentsSnapshot.size,
      };

      const totalUsers = Object.values(roleCounts).reduce(
        (sum, count) => sum + count,
        0
      );

      const chartData = [
        {
          name: "Admins",
          value: roleCounts.admin,
          percentage:
            totalUsers > 0
              ? `${((roleCounts.admin / totalUsers) * 100).toFixed(1)}%`
              : "0%",
          color: USER_ROLE_COLORS[0],
        },
        {
          name: "Teachers",
          value: roleCounts.teacher,
          percentage:
            totalUsers > 0
              ? `${((roleCounts.teacher / totalUsers) * 100).toFixed(1)}%`
              : "0%",
          color: USER_ROLE_COLORS[1],
        },
        {
          name: "Students",
          value: roleCounts.student,
          percentage:
            totalUsers > 0
              ? `${((roleCounts.student / totalUsers) * 100).toFixed(1)}%`
              : "0%",
          color: USER_ROLE_COLORS[2],
        },
      ];

      setUsersData(chartData);
      processStudentsPerSection(allStudentsSnapshotForSections);
    } catch (error) {
      console.error("Error fetching users data:", error);
      throw error;
    }
  };

  // Helper function to generate colors for sections
  const generateRandomColor = () => {
    const colors = ["#FF69B4", "#FFB6C1", "#98FB98", "#FFE4E1", "#DDA0DD"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const processStudentsPerSection = (allStudentsSnapshot) => {
    const sectionCounts = {};
    allStudentsSnapshot.forEach((doc) => {
      const student = doc.data();
      if (student.section && !student.isArchived) {
        sectionCounts[student.section] = (sectionCounts[student.section] || 0) + 1;
      }
    });
    const chartData = Object.entries(sectionCounts).map(([sectionName, count]) => ({ 
      name: sectionName, 
      students: count, 
      fill: generateRandomColor() 
    }));
    setStudentsPerSectionData(chartData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchStoriesData(), fetchUsersData()]);
      } catch (err) {
        console.error("Error loading charts data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Custom tooltip component
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

  // Download handler for a specific chart
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
      pdf.save("charts.pdf");
    } catch (error) {
      console.error("Error downloading charts:", error);
    }
  };

  // Component for chart cards with loading and error states
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
          {/* Header - Updated to match AdminDashboard.js style */}
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
                <h1 className="mb-1 fw-bold text-dark">Charts & Analytics</h1>
                <p className="text-muted mb-0">Visual insights and data analytics for your platform</p>
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
              <Col xl={8} lg={12}>
                <div ref={storiesChartRef}>
                  <ChartCard 
                    title="Stories Added Over Time" 
                    loading={false}
                    onDownload={() => handleDownloadChartPdf(storiesChartRef, "stories_chart.pdf")}
                  >
                    {storiesData.length > 0 ? (
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={storiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#FFE4E1" />
                            <XAxis 
                              dataKey="month" 
                              stroke="#2D2D2D" 
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              allowDecimals={false} 
                              stroke="#2D2D2D" 
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey="stories"
                              name="Stories"
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
                          <p className="text-muted mb-0">No stories data available</p>
                        </div>
                      </div>
                    )}
                  </ChartCard>
                </div>
              </Col>
              
              <Col xl={4} lg={12}>
                <div ref={usersChartRef}>
                  <ChartCard 
                    title="User Distribution" 
                    loading={false}
                    onDownload={() => handleDownloadChartPdf(usersChartRef, "users_chart.pdf")}
                  >
                    {usersData.length > 0 && usersData.some((item) => item.value > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={usersData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percentage }) => `${name} ${percentage}`}
                          >
                            {usersData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={USER_ROLE_COLORS[index % USER_ROLE_COLORS.length]}
                              />
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
                          <p className="text-muted mb-0">No user data available</p>
                        </div>
                      </div>
                    )}
                  </ChartCard>
                </div>
              </Col>
              
              <Col md={12} className="mt-4">
                <div ref={sectionsChartRef}>
                  <ChartCard 
                    title="Students per Section" 
                    loading={false}
                    onDownload={() => handleDownloadChartPdf(sectionsChartRef, "sections_chart.pdf")}
                  >
                    {studentsPerSectionData.length > 0 ? (
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={studentsPerSectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#FFE4E1" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#2D2D2D" 
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              allowDecimals={false} 
                              stroke="#2D2D2D" 
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey="students"
                              name="Number of Students"
                              radius={[6, 6, 0, 0]}
                            >
                              {studentsPerSectionData.map((entry, index) => (
                                <Cell key={`cell-section-${index}`} fill={entry.fill || COLORS.success} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                        <div className="text-center">
                          <FaExclamationTriangle size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                          <p className="text-muted mb-0">No student section data available</p>
                        </div>
                      </div>
                    )}
                  </ChartCard>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Charts;