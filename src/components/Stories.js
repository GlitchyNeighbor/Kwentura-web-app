import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  Nav,
  InputGroup,
} from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { db } from "../config/FirebaseConfig.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import SidebarMenuTeacher from "./SideMenuTeacher";
import TopNavbar from "./TopNavbar";
import { useNavigate } from "react-router-dom";
import { Search } from "react-bootstrap-icons";

// --- Enhanced Styles ---
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

const categories = [
  "All",
  "Fables",
  "Fantasy",
  "Folktales",
  "Inspirational",
  "Legend",
];

const StoryCard = ({ id, title, image, category, author, onBookmarkToggle }) => {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkBookmarked = async () => {
      try {
        const favSnap = await getDocs(collection(db, "favorites"));
        const isBookmarked = favSnap.docs.some(
          (doc) => doc.data().storyId === id
        );
        setBookmarked(isBookmarked);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
        setBookmarked(false);
      }
    };
    checkBookmarked();
  }, [id]);

  const handleBookmarkToggle = async () => {
    if (bookmarked) {
      try {
        const favSnap = await getDocs(collection(db, "favorites"));
        const favDoc = favSnap.docs.find((doc) => doc.data().storyId === id);
        if (favDoc) {
          await deleteDoc(doc(db, "favorites", favDoc.id));
        }
        setBookmarked(false);
        onBookmarkToggle && onBookmarkToggle(id, false);
      } catch (error) {
        console.error("Error removing bookmark:", error);
        alert("Failed to remove bookmark.");
      }
    } else {
      try {
        const favoriteId = `${id}_${Date.now()}`;
        await setDoc(
          doc(db, "favorites", favoriteId),
          {
            storyId: id,
            title: title,
            image: image || "",
            category: "Favorites",
            originalCategory: category,
            createdAt: serverTimestamp(),
          }
        );
        setBookmarked(true);
        onBookmarkToggle && onBookmarkToggle(id, true);
      } catch (error) {
        console.error("Error adding bookmark:", error);
        alert("Failed to bookmark story.");
      }
    }
  };

  return (
    <Col
      xs={6}
      sm={4}
      md={3}
      lg={2}
      xl={2}
      className="mb-4 d-flex align-items-stretch"
      style={{ cursor: "pointer",  }}
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
        onClick={() => navigate(`/teacher/story-synopsis/${id}`)}
      >
        {image ? (
          <Card.Img
            variant="top"
            src={image}
            alt={title}
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
              height: "200px",
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
              alignItems: "center", // centers both horizontally
              justifyContent: "center",
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
              {title}
            </div>
            {/* Author Section */}
            {author && (
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#8566aa",
                  fontWeight: "500",
                  marginBottom: "8px",
                  textAlign: "center",
                  minHeight: "20px",
                }}
              >
                By {author}
              </div>
            )}

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
              {category}
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

const Stories = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [allStories, setAllStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(""); 
  
  const [isLibraryHovered, setIsLibraryHovered] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const storiesRef = collection(db, "stories");
        const q = query(storiesRef, orderBy("createdAt", "desc"));
        const allStoriesSnap = await getDocs(q);
        const stories = allStoriesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllStories(stories);
      } catch (error) {
        console.error("Error fetching stories:", error);
        setAllStories([]);
      }
    };
    fetchStories();
  }, []);

  const handleBookmarkToggle = (storyId, isBookmarked) => {
    // kept for compatibility with StoryCard callback; no local state needed
    return;
  };

  const storiesByCategory = useMemo(() => {
    const filtered = allStories.filter(story => 
      story.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeCategory && activeCategory !== "All") {
      return {
        [activeCategory]: filtered.filter(story => story.category === activeCategory)
      };
    }

    return filtered.reduce((acc, story) => {
      const category = story.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(story);
      return acc;
    }, {});
  }, [allStories, searchTerm, activeCategory]);

  const displayedCategories = useMemo(() => {
    return Object.keys(storiesByCategory).filter(
      category => storiesByCategory[category].length > 0
    );
  }, [storiesByCategory]);

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
              Stories
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
                placeholder="Search for a story..."
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          
          <Col xs="auto">
            <Button
              variant="outline-pink"
              className="rounded-pill fw-bold"
              onClick={() => navigate("/teacher/library")}
              onMouseEnter={() => setIsLibraryHovered(true)}
              onMouseLeave={() => setIsLibraryHovered(false)}
              style={{
                borderColor: "#ff69b4",
                color: isLibraryHovered ? "#fff" : "#ff69b4",
                background: isLibraryHovered ? "#ff69b4" : "#fff",
                padding: "8px 24px",
                fontSize: "1rem",
                boxShadow: isLibraryHovered 
                  ? "0 4px 16px rgba(255,105,180,0.25)" 
                  : "0 2px 8px rgba(255,105,180,0.09)",
                transition: "all 0.3s ease-in-out",
                fontWeight: "700",
                transform: isLibraryHovered ? "translateY(-1px)" : "none",
              }}
            >
              Library
            </Button>
          </Col>
        </Row>

        {/* Category Navigation */}
        <Row className="justify-content-center mb-4">
          <Col className="d-flex justify-content-center">
            <Nav
              className="category-bar justify-content-center"
              style={{
                background: "linear-gradient(90deg, #ff69b4 0%, #ffaec9 100%)",
                borderRadius: "16px",
                boxShadow: "0 2px 16px rgba(255,105,180,0.10)",
                padding: "4px 8px",
                width: "100%",
              }}
            >
              {categories.map((cat, idx) => (
                <Nav.Item key={idx}>
                  <Nav.Link
                    className={`text-center fw-bold category-nav-link ${
                      (activeCategory === "" && cat === "All") ||
                      activeCategory === cat ? "active" : ""
                    }`}
                    style={{
                      color: ((activeCategory === "" && cat === "All") || activeCategory === cat) ? "#ff69b4" : "#fff",
                      background: ((activeCategory === "" && cat === "All") || activeCategory === cat) ? "#fff" : "transparent",
                      borderRadius: "12px",
                      margin: "2px 4px",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      letterSpacing: "0.02em",
                      boxShadow: ((activeCategory === "" && cat === "All") || activeCategory === cat)
                        ? "0 2px 6px rgba(255,105,180,0.12)" : "none",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      padding: "8px 16px",
                      border: "none",
                      minWidth: "200px"
                    }}
                    onMouseEnter={e => {
                      if (!((activeCategory === "" && cat === "All") || activeCategory === cat)) {
                        e.target.style.background = "#fff0f5";
                        e.target.style.color = "#ff69b4";
                        e.target.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!((activeCategory === "" && cat === "All") || activeCategory === cat)) {
                        e.target.style.background = "transparent";
                        e.target.style.color = "#fff";
                        e.target.style.transform = "none";
                      }
                    }}
                    onClick={() =>
                      setActiveCategory(cat === "All" ? "" : cat)
                    }
                  >
                    {cat}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>
        </Row>

        {displayedCategories.length === 0 ? (
          <div className="text-center" style={{ marginTop: "5rem" }}>
            <h4 className="text-muted">No stories found for the selected criteria.</h4>
          </div>
        ) : (
          <>
            {displayedCategories.map(category => (
              <div className="mb-5" key={category}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold" style={{ color: "#333", fontSize: "1.8rem", marginBottom: 5 }}>
                    {category}
                  </h5>
                </div>
                <Row className="g-3">
                  {storiesByCategory[category].map((story) => (
                    <StoryCard
                      id={story.id}
                      title={story.title}
                      image={story.image}
                      category={story.category}
                      author={story.author}
                      key={story.id}
                      onBookmarkToggle={handleBookmarkToggle}
                    />
                  ))}
                </Row>
              </div>
            ))}
          </>
        )}
      </Container>
    </div>
  );
};

export default Stories;