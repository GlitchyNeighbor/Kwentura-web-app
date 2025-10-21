import { FaBookmark, FaRegBookmark, FaArrowLeft, FaEye } from "react-icons/fa";
import TopNavbar from "./TopNavbar";
import SidebarMenuTeacher from "./SideMenuTeacher";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Stack,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../config/FirebaseConfig.js";
import { useAuth } from "../context/AuthContext.js";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";

const StorySynopsis = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiSynopsis, setAiSynopsis] = useState("");
  const [error, setError] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isReadHovered, setIsReadHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const { userData } = useAuth();

  // Check if story is bookmarked
  useEffect(() => {
    const checkBookmarked = async () => {
      if (!id) return;
      
      try {
        let queryRef;
        if (userData && userData.id) {
          const role = (userData.role || "").toLowerCase();
          const collectionName = role === "teacher" ? "teachers" : role === "admin" || role === "superadmin" ? "admins" : "students";
          queryRef = collection(db, collectionName, userData.id, "bookmarks");
        } else {
          queryRef = collection(db, "favorites");
        }
        const favSnap = await getDocs(queryRef);
        const isBookmarked = favSnap.docs.some((d) => d.data().storyId === id);
        setBookmarked(isBookmarked);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
        setBookmarked(false);
      }
    };
    checkBookmarked();
  }, [id]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!story) return;
    
    setBookmarkLoading(true);
    
    if (bookmarked) {
      // Remove bookmark
      try {
        let queryRef;
        if (userData && userData.id) {
          const role = (userData.role || "").toLowerCase();
          const collectionName = role === "teacher" ? "teachers" : role === "admin" || role === "superadmin" ? "admins" : "students";
          queryRef = collection(db, collectionName, userData.id, "bookmarks");
        } else {
          queryRef = collection(db, "favorites");
        }
        const favSnap = await getDocs(queryRef);
        const favDoc = favSnap.docs.find((d) => d.data().storyId === id);
        if (favDoc) {
          if (userData && userData.id) {
            const role = (userData.role || "").toLowerCase();
            const collectionName = role === "teacher" ? "teachers" : role === "admin" || role === "superadmin" ? "admins" : "students";
            await deleteDoc(doc(db, collectionName, userData.id, "bookmarks", favDoc.id));
          } else {
            await deleteDoc(doc(db, "favorites", favDoc.id));
          }
        }
        setBookmarked(false);
      } catch (error) {
        console.error("Error removing bookmark:", error);
        alert("Failed to remove bookmark.");
      }
    } else {
      // Add bookmark
      try {
        const favoriteId = `${id}_${Date.now()}`;
        if (userData && userData.id) {
          const role = (userData.role || "").toLowerCase();
          const collectionName = role === "teacher" ? "teachers" : role === "admin" || role === "superadmin" ? "admins" : "students";
          await setDoc(doc(db, collectionName, userData.id, "bookmarks", favoriteId), {
            storyId: id,
            title: story.title,
            image: story.image || "",
            category: "Favorites",
            originalCategory: story.category,
            author: story.author,
            createdAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, "favorites", favoriteId), {
            storyId: id,
            title: story.title,
            image: story.image || "",
            category: "Favorites",
            originalCategory: story.category,
            author: story.author,
            createdAt: serverTimestamp(),
          });
        }
        setBookmarked(true);
      } catch (error) {
        console.error("Error adding bookmark:", error);
        alert("Failed to bookmark story.");
      }
    }
    setBookmarkLoading(false);
  };

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) {
        setError("No story ID provided.");
        setStory(null);
        setAiSynopsis(""); 
        setGenerating(false);
        return;
      }

      setGenerating(true); 
      setError("");
      setAiSynopsis(""); 

      try {
        const docRef = doc(db, "stories", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const storyData = docSnap.data();
          setStory(storyData);

          if (storyData.generatedSynopsis) {
            setAiSynopsis(storyData.generatedSynopsis);
          } else if (storyData.synopsis) {
            setAiSynopsis(storyData.synopsis);
          } else {
            setAiSynopsis("No synopsis available for this story.");
          }
        } else {
          setError("Story not found.");
          setStory(null);
        }
      } catch (err) {
        setError("Failed to fetch story: " + err.message);
        setStory(null);
      } finally {
        setGenerating(false); 
      }
    };
    fetchStory();
  }, [id]); 

  if (error) {
    return (
      <div className="app-container" style={{ 
        overflow: "hidden", 
        height: "100vh", 
        background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Card className="text-center p-4" style={{
          background: "#fff",
          border: "none",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(255,105,180,0.15)",
          maxWidth: "400px"
        }}>
          <div style={{ color: "#ff69b4", fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
          <h4 style={{ color: "#333", marginBottom: "1rem" }}>Oops!</h4>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>{error}</p>
          <Button
            variant="outline-pink"
            onClick={() => navigate(-1)}
            style={{
              borderColor: "#ff69b4",
              color: "#ff69b4",
              borderRadius: "20px",
              padding: "8px 24px"
            }}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (generating || (!story && !error)) {
    return (
      <div className="app-container" style={{ 
        overflow: "hidden", 
        height: "100vh", 
        background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)',
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div className="text-center">
          <div className="mb-4">
            <Spinner 
              animation="border" 
              style={{ 
                color: "#ff69b4", 
                width: "60px", 
                height: "60px",
                borderWidth: "4px"
              }} 
            />
          </div>
          <h4 style={{ color: "#333", marginBottom: "0.5rem" }}>Loading Story</h4>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>Please wait while we fetch the details...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{ 
        overflow: "hidden", 
        height: "100vh", 
        background: 'linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)'
      }}
    >
      <TopNavbar toggleSidebar={toggleSidebar} />

      <div className={`sidebar-container ${showSidebar ? "show" : ""}`}>
        <SidebarMenuTeacher
          isOpen={showSidebar}
          toggleSidebar={toggleSidebar}
        />
      </div>

      <Container fluid
        className={`main-content ${showSidebar ? "shifted" : ""}`}
        style={{
          overflowY: "auto",
          padding: "24px 32px",
          height: "calc(100vh - 60px)",
          transition: "margin-left 0.3s cubic-bezier(.4,0,.2,1)",
          marginLeft: showSidebar ? "250px" : "0",
        }}
      >
        {/* Header Section */}
        <Row className="align-items-center mb-4" style={{ paddingTop: "8px" }}>
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
            
            <h1 className="fw-bold mb-0" style={{ 
              fontSize: "2.2rem", 
              letterSpacing: "0.01em", 
              color: "#333" 
            }}>
              Story Details
            </h1>
          </Col>
          
          <Col />

        </Row>

        {/* Main Story Card */}
        <div className="d-flex justify-content-center">
          <Card
            className="rounded-4 overflow-hidden"
            style={{
              border: "none",
              background: "linear-gradient(135deg, #FFF0F5 60%, #FFE8F1 100%)",
              maxWidth: "1000px",
              width: "100%",
              boxShadow: "0 8px 32px rgba(255,105,180,0.15)",
              transition: "all 0.3s ease-in-out"
            }}
          >
            <Card.Body className="p-0">
              <Row className="g-0 align-items-stretch">
                {/* Image Section */}
                <Col lg={5} className="position-relative">
                  <div className="h-100 position-relative" style={{ minHeight: "500px" }}>
                    {story.image ? (
                      <div className="position-relative h-100">
                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-100 h-100"
                          style={{
                            objectFit: "cover",
                            filter: imageLoaded ? "none" : "blur(5px)",
                            transition: "filter 0.3s ease-in-out"
                          }}
                          onLoad={() => setImageLoaded(true)}
                        />
                        <div 
                          className="position-absolute top-0 start-0 w-100 h-100"
                          style={{
                            background: "linear-gradient(135deg, rgba(255,105,180,0.1) 0%, rgba(255,174,201,0.05) 100%)",
                          }}
                        />
                        
                        {/* Bookmark Button - Floating on Image */}
                        <div className="position-absolute" style={{ top: "20px", right: "20px" }}>
                          <Button
                            variant="light"
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "50px",
                              height: "50px",
                              background: "rgba(255,255,255,0.9)",
                              backdropFilter: "blur(10px)",
                              border: bookmarked ? "2px solid #ff69b4" : "2px solid rgba(255,255,255,0.5)",
                              color: bookmarked ? "#ff69b4" : "#666",
                              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                              transition: "all 0.3s ease-in-out"
                            }}
                            onClick={handleBookmarkToggle}
                            disabled={bookmarkLoading}
                            title={bookmarked ? "Remove from Favorites" : "Add to Favorites"}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.1)";
                              e.target.style.boxShadow = "0 6px 25px rgba(255,105,180,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                              e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
                            }}
                          >
                            {bookmarkLoading ? (
                              <Spinner 
                                size="sm" 
                                animation="border" 
                                style={{ width: "18px", height: "18px" }}
                              />
                            ) : bookmarked ? (
                              <FaBookmark size={22} />
                            ) : (
                              <FaRegBookmark size={22} />
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="h-100 d-flex align-items-center justify-content-center"
                        style={{
                          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                          color: "#adb5bd",
                          fontSize: "1.2rem",
                          fontWeight: "500"
                        }}
                      >
                        <div className="text-center">
                          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📚</div>
                          <span>No Image Available</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>

                {/* Content Section */}
                <Col lg={7}>
                  <div className="p-4 p-lg-5 h-100 d-flex flex-column">
                    {/* Title and Author */}
                    <div className="mb-4">
                      <h1 className="fw-bold mb-3" style={{ 
                        fontSize: "2.5rem", 
                        color: "#333",
                        lineHeight: "1.2",
                        letterSpacing: "-0.01em"
                      }}>
                        {story.title}
                      </h1>
                      
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <span style={{ 
                          fontSize: "1.2rem", 
                          fontWeight: "600", 
                          color: "#666" 
                        }}>
                          by {story.author}
                        </span>
                      </div>

                      <Badge 
                        className="px-3 py-2"
                        style={{
                          background: "linear-gradient(45deg, #ff69b4, #ffaec9)",
                          border: "none",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          letterSpacing: "0.02em",
                          borderRadius: "20px",
                          boxShadow: "0 2px 8px rgba(255,105,180,0.2)"
                        }}
                      >
                        {story.category}
                      </Badge>
                    </div>

                    {/* Synopsis Section */}
                    <div className="mb-4 flex-grow-1">
                      <h3 className="h4 fw-bold mb-3" style={{ color: "#333" }}>
                        📖 Synopsis
                      </h3>
                      
                      {generating ? (
                        <div className="d-flex align-items-center gap-2 p-4 rounded-3" style={{ 
                          background: "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(255,105,180,0.1)"
                        }}>
                          <Spinner size="sm" animation="border" style={{ color: "#ff69b4" }} />
                          <span style={{ color: "#666", fontStyle: "italic" }}>Loading synopsis...</span>
                        </div>
                      ) : (
                        <div 
                          className="p-4 rounded-3"
                          style={{ 
                            background: "rgba(255,255,255,0.8)",
                            border: "1px solid rgba(255,105,180,0.1)",
                            backdropFilter: "blur(10px)",
                            fontSize: "1.05rem",
                            lineHeight: "1.7",
                            color: "#444",
                            maxHeight: "200px",
                            overflowY: "auto"
                          }}
                        >
                          {aiSynopsis || "No synopsis available for this story."}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <Button
                        size="lg"
                        className="px-5 py-3 fw-bold d-flex align-items-center gap-2"
                        onMouseEnter={() => setIsReadHovered(true)}
                        onMouseLeave={() => setIsReadHovered(false)}
                        style={{
                          background: isReadHovered 
                            ? "linear-gradient(45deg, #ff1493, #ff69b4)" 
                            : "linear-gradient(45deg, #ff69b4, #ffaec9)",
                          border: "none",
                          borderRadius: "25px",
                          fontSize: "1.1rem",
                          letterSpacing: "0.02em",
                          boxShadow: isReadHovered
                            ? "0 8px 25px rgba(255,105,180,0.4)"
                            : "0 4px 15px rgba(255,105,180,0.25)",
                          transition: "all 0.3s ease-in-out",
                          transform: isReadHovered ? "translateY(-2px) scale(1.02)" : "none",
                          minWidth: "180px"
                        }}
                        onClick={() => navigate(`/teacher/read-story/${id}`)}
                      >
                        <FaEye size={18} />
                        Start Reading
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default StorySynopsis;