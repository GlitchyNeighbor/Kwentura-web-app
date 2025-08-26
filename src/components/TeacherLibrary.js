import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, InputGroup } from "react-bootstrap";
import { FaBookmark, FaRegBookmark, FaArrowLeft, FaTrash } from "react-icons/fa";
import { Search } from "react-bootstrap-icons";
import SidebarMenuTeacher from "./SideMenuTeacher";
import TopNavbar from "./TopNavbar";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"; 
import { db } from "../config/FirebaseConfig.js";
import { useNavigate } from "react-router-dom";
import "../scss/custom.scss";

// --- Enhanced Styles matching Stories.js ---
const cardStyle = {
  minHeight: "420px",
  maxHeight: "470px",
  border: "none",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 18px rgba(255,105,180,0.13)",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(135deg, #FFF0F5 60%, #FFE8F1 100%)",
  transition: "box-shadow 0.3s, transform 0.2s",
};

const CATEGORIES = ["Favorites", "Completed"];

const LibraryStoryCard = ({ story, category, onRemoveBookmark }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRemoveBookmark = async (e) => {
    e.stopPropagation(); // Prevent card click navigation
    setLoading(true);
    await onRemoveBookmark(story.storyId || story.id);
    setLoading(false);
  };

  return (
    <Col
      xs={6}
      sm={4}
      md={3}
      lg={2}
      xl={2}
      className="mb-4 d-flex align-items-stretch"
      style={{ cursor: "pointer" }}
    >
      <Card
        className="h-100 story-card w-100"
        style={{
          ...cardStyle,
          boxShadow: isHovered
            ? "0 8px 32px rgba(255,105,180,0.20)"
            : cardStyle.boxShadow,
          transform: isHovered ? "translateY(-6px) scale(1.02)" : "none",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/teacher/story-synopsis/${story.storyId || story.id}`)}
      >
        {story.image ? (
          <Card.Img
            variant="top"
            src={story.image}
            alt={story.title}
            style={{
              height: "280px",
              objectFit: "cover",
              width: "100%",
              borderBottom: "1px solid #ffb6c1"
            }}
          />
        ) : (
          <div
            style={{
              height: "280px",
              background: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              color: "#aaa",
              fontSize: "1rem",
              fontWeight: "500"
            }}
          >
            <span>No Image</span>
          </div>
        )}
        <Card.Body
          className="d-flex flex-column align-items-center justify-content-between p-3"
          style={{ flex: 1 }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <div
              className="fw-bold text-center mb-2"
              style={{
                fontSize: "0.95rem",
                color: "#333",
                letterSpacing: "0.02em",
                marginBottom: "12px",
                minHeight: "45px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: "1.3",
                textAlign: "center",
              }}
            >
              {story.title}
            </div>

            <div
              style={{
                marginBottom: "10px",
                fontSize: "0.8rem",
                color: "#ff69b4",
                fontWeight: "600",
                letterSpacing: "0.04em",
                background: "#FFF0F5",
                borderRadius: "8px",
                padding: "4px 12px",
                boxShadow: "0 1px 4px rgba(255,105,180,0.10)",
                textAlign: "center",
              }}
            >
              {story.originalCategory || story.category || category}
            </div>

            {/* Remove bookmark button */}
            {category === "Favorites" && (
              <Button
                variant="outline-danger"
                size="sm"
                className="mt-2"
                style={{
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  padding: "4px 12px",
                  borderColor: "#ff69b4",
                  color: "#ff69b4",
                  background: "#fff",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#ff69b4";
                  e.target.style.color = "#fff";
                  e.target.style.borderColor = "#ff69b4";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#fff";
                  e.target.style.color = "#ff69b4";
                  e.target.style.borderColor = "#ff69b4";
                }}
                onClick={handleRemoveBookmark}
                disabled={loading}
              >
                <FaTrash className="me-1" />
                {loading ? "..." : "Remove"}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

const TeacherLibrary = () => {
  const [stories, setStories] = useState([]);
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookmarkedStories, setBookmarkedStories] = useState([]);
  const [isStoriesHovered, setIsStoriesHovered] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "stories")); 
        const storiesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStories(storiesData);
      } catch (error) {
        console.error("Error fetching stories:", error);
        setStories([]);
      }
      setLoading(false);
    };
    fetchStories();
  }, []);

  const fetchBookmarkedStories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "favorites"));
      const bookmarkedStoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookmarkedStories(bookmarkedStoriesData);
    } catch (error) {
      console.error("Error fetching bookmarked stories:", error);
      setBookmarkedStories([]);
    }
  };

  useEffect(() => {
    fetchBookmarkedStories();
  }, []);

  // Remove bookmark function
  const handleRemoveBookmark = async (storyId) => {
    try {
      const favSnap = await getDocs(collection(db, "favorites"));
      const favDoc = favSnap.docs.find((doc) => doc.data().storyId === storyId);
      
      if (favDoc) {
        await deleteDoc(doc(db, "favorites", favDoc.id));
        // Refresh the bookmarked stories list
        await fetchBookmarkedStories();
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      alert("Failed to remove bookmark.");
    }
  };

  // Filter stories based on search
  const filteredBookmarkedStories = bookmarkedStories.filter((story) =>
    story.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Get stories by category (for future categories like "Completed")
  const getStoriesByCategory = (category) => {
    if (category === "Favorites") {
      return filteredBookmarkedStories;
    }
    // Add logic for other categories here
    return [];
  };

  if (loading) {
    return (
      <div
        className="app-container"
        style={{
          overflow: "hidden",
          height: "100vh",
          background: "linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)",
        }}
      >
        <TopNavbar toggleSidebar={toggleSidebar} />
        <div className={`sidebar-container ${showSidebar ? "show" : ""}`}>
          <SidebarMenuTeacher
            isOpen={showSidebar}
            toggleSidebar={toggleSidebar}
          />
        </div>
        <Container
          fluid
          className={`main-content ${showSidebar ? "shifted" : ""}`}
          style={{
            overflowY: "auto",
            padding: "24px 32px 0 32px",
            height: "calc(100vh - 60px)",
            transition: "margin-left 0.3s cubic-bezier(.4,0,.2,1)",
            marginLeft: showSidebar ? "250px" : "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="text-center">
            <div 
              className="spinner-border"
              style={{ color: "#ff69b4", width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="mt-3" style={{ color: "#333", fontWeight: "600" }}>
              Loading your library...
            </h5>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{
        overflow: "hidden",
        height: "100vh",
        background: "linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)",
      }}
    >
      <TopNavbar toggleSidebar={toggleSidebar} />

      <div className={`sidebar-container ${showSidebar ? "show" : ""}`}>
        <SidebarMenuTeacher
          isOpen={showSidebar}
          toggleSidebar={toggleSidebar}
        />
      </div>

      <Container
        fluid
        className={`main-content ${showSidebar ? "shifted" : ""}`}
        style={{
          overflowY: "auto",
          padding: "24px 32px 0 32px",
          height: "calc(100vh - 60px)",
          transition: "margin-left 0.3s cubic-bezier(.4,0,.2,1)",
          marginLeft: showSidebar ? "250px" : "0",
        }}
      >
        {/* Header Section */}
        <Row className="align-items-center mb-3" style={{ paddingTop: "8px" }}>
          <Col xs="auto" className="d-flex align-items-center gap-3">
            <Button
              variant="link"
              className="p-0"
              onClick={() => navigate(-1)}
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                background: "#ff69b4",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                boxShadow: "0 2px 10px rgba(255,105,180,0.25)",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.1)";
                e.target.style.boxShadow = "0 4px 16px rgba(255,105,180,0.35)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 2px 10px rgba(255,105,180,0.25)";
              }}
            >
              <FaArrowLeft />
            </Button>
            
            <h1 className="fw-bold mb-0" style={{ fontSize: "2.2rem", letterSpacing: "0.01em", color: "#333" }}>
              My Library
            </h1>
          </Col>
          
          <Col className="d-flex justify-content-center">
            <InputGroup
              style={{
                boxShadow: "0 2px 8px rgba(255,105,180,0.07)",
                borderRadius: "25px",
                background: "#fff",
                width: "100%",
                maxWidth: "600px"
              }}
            >
              <InputGroup.Text
                className="bg-white border-end-0"
                style={{
                  borderRadius: "25px 0 0 25px",
                  border: "1px solid #f3d3e7",
                  borderRight: "none",
                  color: "#ff69b4",
                  fontSize: "1.1rem"
                }}
              >
                <Search size={20} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search your library..."
                className="rounded-end-pill"
                style={{
                  borderLeft: "none",
                  border: "1px solid #f3d3e7",
                  borderRadius: "0 25px 25px 0",
                  boxShadow: "none",
                  background: "#f8f1fa",
                  fontSize: "1rem",
                  padding: "10px 16px",
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Col>
          
          <Col xs="auto">
            <Button
              variant="outline-pink"
              className="rounded-pill fw-bold"
              onClick={() => navigate("/teacher/stories")}
              onMouseEnter={() => setIsStoriesHovered(true)}
              onMouseLeave={() => setIsStoriesHovered(false)}
              style={{
                borderColor: "#ff69b4",
                color: isStoriesHovered ? "#fff" : "#ff69b4",
                background: isStoriesHovered ? "#ff69b4" : "#fff",
                padding: "8px 24px",
                fontSize: "1rem",
                boxShadow: isStoriesHovered 
                  ? "0 4px 16px rgba(255,105,180,0.25)" 
                  : "0 2px 8px rgba(255,105,180,0.09)",
                transition: "all 0.3s ease-in-out",
                fontWeight: "700",
                transform: isStoriesHovered ? "translateY(-1px)" : "none",
              }}
            >
              Browse Stories
            </Button>
          </Col>
        </Row>

        {/* Library Categories */}
        {CATEGORIES.map((category) => {
          const categoryStories = getStoriesByCategory(category);
          
          return (
            <div key={category} className="mb-5">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <h5 className="fw-bold" style={{ color: "#333", fontSize: "1.8rem", marginBottom: 5, marginTop: 20 }}>
                  {category}
                </h5>
              </div>
              
              {categoryStories.length === 0 ? (
                <div 
                  className="text-center py-5"
                  style={{
                    background: "linear-gradient(135deg, #FFF0F5 60%, #FFE8F1 100%)",
                    borderRadius: "16px",
                    border: "1px solid #f3d3e7",
                    boxShadow: "0 2px 12px rgba(255,105,180,0.08)",
                  }}
                >
                  <div style={{ color: "#ff69b4", fontSize: "3rem", marginBottom: "1rem" }}>
                    📚
                  </div>
                  <p className="text-muted fw-bold" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    No stories in {category.toLowerCase()} yet.
                  </p>
                  {category === "Favorites" && (
                    <p className="text-muted" style={{ fontSize: "0.95rem" }}>
                      Go to Stories and bookmark some stories to see them here!
                    </p>
                  )}
                </div>
              ) : (
                <Row className="g-3 justify-content-center">
                  {categoryStories.map((story) => (
                    <LibraryStoryCard
                      key={story.id}
                      story={story}
                      category={category}
                      onRemoveBookmark={handleRemoveBookmark}
                    />
                  ))}
                </Row>
              )}
            </div>
          );
        })}
      </Container>
    </div>
  );
};

export default TeacherLibrary;