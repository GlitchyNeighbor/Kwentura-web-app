import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Alert, Badge, Spinner } from "react-bootstrap";
import {
  FaBook,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaEye,
  FaClock,
  FaBookmark,
  FaExclamationTriangle,
} from "react-icons/fa";
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
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  limit, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { db } from "../config/FirebaseConfig.js";
import SidebarMenuAdmin from "./SidebarMenuAdmin";
import TopNavbar from "./TopNavbar";
import "../scss/custom.scss";


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
const CARD_STYLES = {
  stories: { bg: "#FFF0F5", icon: "#FF69B4" },
  admins: { bg: "#FFE4E1", icon: "#FF69B4" },
  teachers: { bg: "#FFF0F5", icon: "#FF69B4" },
  students: { bg: "#FFE4E1", icon: "#FF69B4" },
};




const formatActionType = (action) => {
  if (!action) return "Performed an action";
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const generateRandomColor = () => {
  const colors = ["#FF69B4", "#FFB6C1", "#98FB98", "#FFE4E1", "#DDA0DD"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};


const MetricCard = ({ title, value, icon: IconComponent, style, trend }) => (
  <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="text-muted mb-2 fs-6">{title}</div>
          <h3 className="mb-0 fw-bold text-dark">{(value !== undefined && value !== null && typeof value === 'number') ? value.toLocaleString() : String(value ?? '0')}</h3>
          {trend && (
            <small className={`text-${trend.type}`}>
              {trend.value}% from last month
            </small>
          )}
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


const ChartCard = ({ title, loading, error, children, height = 300 }) => (
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


const AdminDashboard = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalCounts: { stories: 0, admins: 0, teachers: 0, students: 0 },
    storiesData: [],
    usersData: [],
    studentsPerSectionData: [],
    adminLogsData: [],
    retentionData: { dailyActiveUsers: 0, weeklyActiveUsers: 0, monthlyActiveUsers: 0 },
    storyEngagementData: { averageTimeSpent: 0, totalCompleted: 0, totalBookmarked: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  
  const fetchStoriesData = useCallback(async () => {
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
        const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
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

    return { chartData, total: querySnapshot.size };
  }, []);

  const fetchUsersData = useCallback(async () => {
    const queries = [
      query(collection(db, "admins"), where("isArchived", "==", false)),
      query(collection(db, "teachers"), where("isArchived", "==", false)),
      query(collection(db, "students"), where("isArchived", "==", false)),
      query(collection(db, "students")) 
    ];

    const [adminsSnapshot, teachersSnapshot, studentsSnapshot, allStudentsSnapshot] = 
      await Promise.all(queries.map(q => getDocs(q)));

    const roleCounts = {
      admin: adminsSnapshot.size,
      teacher: teachersSnapshot.size,
      student: studentsSnapshot.size,
    };

    const totalUsers = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);

    const usersChartData = [
      {
        name: "Admins",
        value: roleCounts.admin,
        percentage: totalUsers > 0 ? `${((roleCounts.admin / totalUsers) * 100).toFixed(1)}%` : "0%",
        color: USER_ROLE_COLORS[0],
      },
      {
        name: "Teachers",
        value: roleCounts.teacher,
        percentage: totalUsers > 0 ? `${((roleCounts.teacher / totalUsers) * 100).toFixed(1)}%` : "0%",
        color: USER_ROLE_COLORS[1],
      },
      {
        name: "Students",
        value: roleCounts.student,
        percentage: totalUsers > 0 ? `${((roleCounts.student / totalUsers) * 100).toFixed(1)}%` : "0%",
        color: USER_ROLE_COLORS[2],
      },
    ];

    
    const sectionCounts = {};
    allStudentsSnapshot.forEach((doc) => {
      const student = doc.data();
      if (student.section && !student.isArchived) {
        sectionCounts[student.section] = (sectionCounts[student.section] || 0) + 1;
      }
    });

    const sectionsChartData = Object.entries(sectionCounts).map(([sectionName, count]) => ({
      name: sectionName,
      students: count,
      fill: generateRandomColor(),
    }));

    return {
      usersChartData,
      sectionsChartData,
      counts: roleCounts,
    };
  }, []);

  const fetchAdminLogs = useCallback(async () => {
    const logsRef = collection(db, "admin_logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(15));
    const querySnapshot = await getDocs(q);

    const logsPromises = querySnapshot.docs.map(async (logDoc) => {
      const logData = logDoc.data();
      let adminName = "System";

      if (logData.adminId && logData.adminId !== "system") {
        try {
          const adminRef = doc(db, "admins", logData.adminId);
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists()) {
            const adminData = adminSnap.data();
            adminName = `${adminData.firstName || ""} ${adminData.lastName || ""}`.trim() || 
                      `Admin (${logData.adminId.substring(0, 6)}...)`;
          }
        } catch (error) {
          console.error(`Error fetching admin details:`, error);
          adminName = `Admin (${logData.adminId.substring(0, 6)}...)`;
        }
      }

      
      let targetUserName = logData.targetUserFullName || logData.affectedUserFullName || null;
      
      if (!targetUserName && logData.collectionName && logData.documentId && 
          ["admins", "teachers", "students"].includes(logData.collectionName)) {
        try {
          const userDocRef = doc(db, logData.collectionName, logData.documentId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (logData.collectionName === "students") {
              targetUserName = `${userData.studentFirstName || ""} ${userData.studentLastName || ""}`.trim();
            } else {
              targetUserName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
            }
          }
        } catch (error) {
          console.error(`Error fetching user details:`, error);
        }
      }

      return {
        id: logDoc.id,
        ...logData,
        timestamp: formatTimestamp(logData.timestamp),
        adminName,
        targetUserName,
      };
    });

    return Promise.all(logsPromises);
  }, []);

  const fetchRetentionData = useCallback(async () => {
    const ratesRef = collection(db, "retention_rates");
    const q = query(ratesRef, orderBy("date", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const latestRate = querySnapshot.docs[0].data();
      return {
        dailyActiveUsers: latestRate.dailyActiveUsers || 0,
        weeklyActiveUsers: latestRate.weeklyActiveUsers || 0,
        monthlyActiveUsers: latestRate.monthlyActiveUsers || 0,
      };
    }
    
    return { dailyActiveUsers: 0, weeklyActiveUsers: 0, monthlyActiveUsers: 0 };
  }, []);

  const fetchStoryEngagementData = useCallback(async () => {
    const engagementRef = collection(db, "story_engagement");
    const querySnapshot = await getDocs(engagementRef);
    
    let totalTimeSpent = 0;
    let totalCompleted = 0;
    let totalBookmarked = 0;
    let recordsCount = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalTimeSpent += data.timeSpent || 0;
      if (data.completed) totalCompleted++;
      if (data.bookmarked) totalBookmarked++;
      recordsCount++;
    });

    return {
      averageTimeSpent: recordsCount > 0 ? (totalTimeSpent / recordsCount / 60).toFixed(1) : 0,
      totalCompleted,
      totalBookmarked,
    };
  }, []);

  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          storiesResult,
          usersResult,
          adminLogs,
          retentionData,
          engagementData,
        ] = await Promise.all([
          fetchStoriesData(),
          fetchUsersData(),
          fetchAdminLogs(),
          fetchRetentionData(),
          fetchStoryEngagementData(),
        ]);

        setDashboardData({
          totalCounts: {
            stories: storiesResult.total,
            ...usersResult.counts,
          },
          storiesData: storiesResult.chartData,
          usersData: usersResult.usersChartData,
          studentsPerSectionData: usersResult.sectionsChartData,
          adminLogsData: adminLogs,
          retentionData,
          storyEngagementData: engagementData,
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchStoriesData, fetchUsersData, fetchAdminLogs, fetchRetentionData, fetchStoryEngagementData]);

  
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
              <h5 className="text-muted">Loading dashboard data...</h5>
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
        .activity-item:hover {
          background-color: #FFF0F5 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 105, 180, 0.1);
        }
        
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

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="mb-1 fw-bold text-dark">Admin Dashboard</h1>
              <p className="text-muted mb-0">Welcome back! Here's what's happening with your platform.</p>
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

          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <MetricCard
                title="Total Stories"
                value={dashboardData.totalCounts.stories}
                icon={FaBook}
                style={CARD_STYLES.stories}
              />
            </Col>
            <Col lg={3} md={6}>
              <MetricCard
                title="Active Admins"
                value={dashboardData.totalCounts.admin}
                icon={FaUserShield}
                style={CARD_STYLES.admins}
              />
            </Col>
            <Col lg={3} md={6}>
              <MetricCard
                title="Active Teachers"
                value={dashboardData.totalCounts.teacher}
                icon={FaChalkboardTeacher}
                style={CARD_STYLES.teachers}
              />
            </Col>
            <Col lg={3} md={6}>
              <MetricCard
                title="Active Students"
                value={dashboardData.totalCounts.student}
                icon={FaUserGraduate}
                style={CARD_STYLES.students}
              />
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col xl={8} lg={12}>
              <ChartCard title="Stories Added Over Time" loading={false}>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.storiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              </ChartCard>
            </Col>
            <Col xl={4} lg={12}>
              <ChartCard title="User Distribution" loading={false}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.usersData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage}`}
                    >
                      {dashboardData.usersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={USER_ROLE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col>
              <ChartCard title="Students per Section" loading={false}>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.studentsPerSectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        name="Students"
                        radius={[6, 6, 0, 0]}
                      >
                        {dashboardData.studentsPerSectionData.map((entry, index) => (
                          <Cell key={`cell-section-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col xl={4} md={6}>
              <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-4 text-center">
                  <div 
                    className="p-3 rounded-circle d-inline-flex mb-3" 
                    style={{ backgroundColor: `${COLORS.info}15`, color: COLORS.info }}
                  >
                    <FaClock size={24} />
                  </div>
                  <h3 className="mb-2 fw-bold text-dark">{dashboardData.storyEngagementData.averageTimeSpent} min</h3>
                  <p className="text-muted mb-0">Average Reading Time</p>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={4} md={6}>
              <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-4 text-center">
                  <div 
                    className="p-3 rounded-circle d-inline-flex mb-3" 
                    style={{ backgroundColor: `${COLORS.success}15`, color: COLORS.success }}
                  >
                    <FaEye size={24} />
                  </div>
                  <h3 className="mb-2 fw-bold text-dark">{(dashboardData.storyEngagementData.totalCompleted !== undefined && dashboardData.storyEngagementData.totalCompleted !== null) ? String(dashboardData.storyEngagementData.totalCompleted).toLocaleString() : '0'}</h3>
                  <p className="text-muted mb-0">Stories Completed</p>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={4} md={6}>
              <Card className="shadow-sm h-100 border-0" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-4 text-center">
                  <div 
                    className="p-3 rounded-circle d-inline-flex mb-3" 
                    style={{ backgroundColor: `${COLORS.warning}15`, color: COLORS.warning }}
                  >
                    <FaBookmark size={24} />
                  </div>
                  <h3 className="mb-2 fw-bold text-dark">{(dashboardData.storyEngagementData.totalBookmarked !== undefined && dashboardData.storyEngagementData.totalBookmarked !== null) ? String(dashboardData.storyEngagementData.totalBookmarked).toLocaleString() : '0'}</h3>
                  <p className="text-muted mb-0">Stories Bookmarked</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col>
              <Card className="shadow-sm border-0" style={{ borderRadius: "15px" }}>
                <Card.Header 
                  className="border-0 py-4"
                  style={{ 
                    borderRadius: "15px 15px 0 0",
                    backgroundColor: COLORS.light
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-semibold text-dark">Recent Admin Actions</h5>
                    <Badge 
                      className="bg-secondary text-white"
                      style={{ 
                        borderRadius: "12px",
                        padding: "6px 12px",
                        fontSize: "0.8rem"
                      }}
                    >
                      {dashboardData.adminLogsData.length} recent
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  {dashboardData.adminLogsData.length > 0 ? (
                    <div className="admin-actions-list">
                      {dashboardData.adminLogsData.map((log, index) => {
                        const isPermanentDelete = log.actionType === 'account_permanently_deleted';
                        const isArchive = log.actionType === 'admin_account_archived' || log.actionType === 'teacher_account_archived';
                        const isCreate = log.actionType === 'admin_account_created' || log.actionType === 'teacher_account_created';
                        
                        return (
                          <div
                            key={log.id}
                            className="d-flex align-items-start justify-content-between py-4 px-4"
                            style={{ 
                              backgroundColor: isPermanentDelete ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                              borderBottom: index !== dashboardData.adminLogsData.length - 1 ? '1px solid #f1f5f9' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center flex-wrap mb-1">
                                <span className="fw-bold text-dark me-2" style={{ fontSize: '0.95rem' }}>
                                  {log.adminName}
                                </span>
                                <span className="text-muted me-2" style={{ fontSize: '0.9rem' }}>•</span>
                                <span 
                                  className="fw-medium me-2"
                                  style={{ 
                                    color: isPermanentDelete ? '#dc2626' : isCreate ? '#10b981' : isArchive ? '#f59e0b' : '#3b82f6',
                                    fontSize: '0.9rem'
                                  }}
                                >
                                  {formatActionType(log.actionType || log.eventType)}
                                </span>
                                <span className="text-muted me-2" style={{ fontSize: '0.9rem' }}>on</span>
                                <span className="text-dark me-2" style={{ fontSize: '0.9rem' }}>
                                  {log.collectionName}
                                </span>
                                {log.targetUserName && (
                                  <>
                                    <span className="text-muted me-2" style={{ fontSize: '0.9rem' }}>•</span>
                                    <span 
                                      className="fw-medium"
                                      style={{ 
                                        color: '#06b6d4',
                                        fontSize: '0.9rem'
                                      }}
                                    >
                                      {log.targetUserName}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {isPermanentDelete && (
                                <div className="mt-2">
                                  <Badge 
                                    style={{ 
                                      backgroundColor: '#3b82f6', 
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      borderRadius: '4px',
                                      padding: '3px 8px',
                                      fontWeight: '600',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.3px'
                                    }}
                                  >
                                    PERMANENTLY DELETED
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-end flex-shrink-0 ms-4">
                              <small 
                                className="text-muted" 
                                style={{ 
                                  fontSize: '0.8rem',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {log.timestamp}
                              </small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FaExclamationTriangle size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                      <h5 className="text-muted mb-2">No recent admin actions</h5>
                      <p className="text-muted mb-0">Admin activities will appear here when they occur.</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;