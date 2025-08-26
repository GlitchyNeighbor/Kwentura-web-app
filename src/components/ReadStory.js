import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Spinner,
  Modal,
} from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { db } from "../config/FirebaseConfig.js";
import { doc, setDoc, getDoc } from "firebase/firestore";
import SidebarMenuTeacher from "./SideMenuTeacher";
import TopNavbar from "./TopNavbar";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import * as pdfjsLib from "pdfjs-dist";
import PageFlip from 'react-pageflip';
import { getFunctions, httpsCallable } from "firebase/functions";
import { Volume2, BookOpen, Award } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

// Enhanced styles matching Stories.js theme
const cardStyle = {
  border: "none",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 18px rgba(255,105,180,0.13)",
  background: "linear-gradient(135deg, #FFF0F5 60%, #FFE8F1 100%)",
  transition: "all 0.3s ease-in-out",
};

const PageCover = React.forwardRef((props, ref) => {
  return (
    <div className="page page-cover" ref={ref} data-density="hard">
      <div className="page-content" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        padding: '20px', 
        boxSizing: 'border-box', 
        background: 'linear-gradient(135deg, #FFF0F5 60%, #FFE8F1 100%)'
      }}>
        {props.imageSrc && 
          <img 
            src={props.imageSrc} 
            alt="Cover" 
            style={{ 
              maxHeight: '70%', 
              maxWidth: '90%', 
              objectFit: 'contain', 
              marginBottom: '20px', 
              boxShadow: '0 8px 32px rgba(255,105,180,0.20)',
              borderRadius: '12px'
            }} 
          />
        }
        <h2 style={{ 
          textAlign: 'center', 
          color: '#333', 
          margin: 0, 
          fontSize: '1.8rem',
          fontWeight: '700',
          letterSpacing: '0.01em'
        }}>
          {props.children}
        </h2>
      </div>
    </div>
  );
});

const HighlightedText = React.forwardRef(({ text, isPlaying, currentWordIndex }, ref) => {
  const words = text.split(/\s+/);
  
  return (
    <div ref={ref} style={{ 
      fontSize: '1.1rem', 
      lineHeight: '1.6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {words.map((word, index) => (
        <span
          key={index}
          style={{
            backgroundColor: isPlaying && index === currentWordIndex ? '#ff69b4' : 'transparent',
            color: isPlaying && index === currentWordIndex ? '#fff' : '#333',
            padding: '0 2px',
            margin: '0 1px',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          {word}{' '}
        </span>
      ))}
    </div>
  );
});

const Page = React.forwardRef(({ number, imageDataUrl, pageText, isPlaying, currentWordIndex }, ref) => {
  return (
    <div className="page-container" ref={ref}>
      <div className="page" style={{ display: 'flex', height: '100%' }}>
        <div className="page-image-content" style={{ flex: '1', position: 'relative' }}>
          <img 
            src={imageDataUrl} 
            alt={`Page ${number}`} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
          <div className="page-number" style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(255,105,180,0.9)',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>Page {number}</div>
        </div>
        <div className="page-text-content" style={{ 
          flex: '1', 
          padding: '24px',
          background: '#fff',
          overflowY: 'auto',
          maxHeight: '100%',
          borderLeft: '0.5px solid gray'
        }}>
          <HighlightedText 
            text={pageText}
            isPlaying={isPlaying}
            currentWordIndex={currentWordIndex}
          />
        </div>
      </div>
    </div>
  );
});

const ReadStory = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [pdfPagesAsImages, setPdfPagesAsImages] = useState([]);
  const [isLoadingPdfPages, setIsLoadingPdfPages] = useState(true);
  const [flipbookDimensions, setFlipbookDimensions] = useState({
    width: 800,
    height: 600
  });
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const flipBook = React.useRef();
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [pdfPagesText, setPdfPagesText] = useState([]);
  const [ttsAudio, setTtsAudio] = useState(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioLoading, setTtsAudioLoading] = useState(false);
  const [ttsAudioData, setTtsAudioData] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timepoints, setTimepoints] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [assessmentHovered, setAssessmentHovered] = useState(false);
  
  const ttsAudioRef = useRef(null);
  const startTime = useRef(null);
  const timeSpent = useRef(0);
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const intervalRef = useRef(null);
  const hasLeftPage = useRef(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  useEffect(() => {
    ttsAudioRef.current = ttsAudio;
  }, [ttsAudio]);

  const stopTts = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.onended = null;
      ttsAudioRef.current.onerror = null;
    }
    setTtsAudio(null);
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, []);

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "stories", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const storyData = docSnap.data();
          setStory(storyData);
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        setError("Failed to fetch story: " + err.message);
      }
    };
    fetchStory();
  }, [id]);

  // Story engagement tracking
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const startReading = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        startTime.current = new Date();
        hasLeftPage.current = false;
        intervalRef.current = setInterval(() => {
          timeSpent.current += 1;
        }, 1000);
      };

      startReading();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          hasLeftPage.current = true;
        } else if (document.visibilityState === 'visible' && hasLeftPage.current && user) {
          startReading();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (user && story) {
          saveStoryEngagement(user.uid, id, startTime.current, timeSpent.current, completed, bookmarked);
        }
      };
    }
  }, [id, story, completed, bookmarked]);

  const saveStoryEngagement = async (userId, storyId, startTime, timeSpent, completed, bookmarked) => {
    try {
      if (!userId || !storyId) return;
      const engagementData = {
        startTime: startTime || null,
        timeSpent: timeSpent || 0,
        completed: completed || false,
        bookmarked: bookmarked || false,
      };
      await setDoc(doc(db, "story_engagement", `${userId}_${storyId}`), engagementData, { merge: true });
    } catch (error) {
      console.error("Error saving story engagement:", error);
    }
  };

  useEffect(() => {
    if (!story) return;

    if (Array.isArray(story.pageImages) && story.pageImages.length > 0) {
      setPdfPagesAsImages(story.pageImages);
      setIsLoadingPdfPages(false);
    } else if (story.pdfUrl) {
      const renderPdfPagesToImages = async () => {
        setIsLoadingPdfPages(true);
        setStatusMessage("Loading story pages...");
        setPdfPagesAsImages([]);
        setPdfPagesText([]);
        try {
          const response = await fetch(story.pdfUrl);
          if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
          const arrayBuffer = await response.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

          const pagePromises = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            pagePromises.push(
              (async (pageNum) => {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const context = canvas.getContext('2d');
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const imageDataUrl = canvas.toDataURL('image/png');
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                return { imageDataUrl, pageText };
              })(i)
            );
          }

          const pageResults = await Promise.all(pagePromises);
          const pages = pageResults.map(r => r.imageDataUrl);
          const texts = pageResults.map(r => r.pageText);

          setPdfPagesAsImages(pages);
          setPdfPagesText(texts);
          setStatusMessage("Content loaded successfully.");
        } catch (err) {
          setStatusMessage(`Failed to load story content: ${err.message}`);
          setPdfPagesAsImages([]);
          setPdfPagesText([]);
        } finally {
          setIsLoadingPdfPages(false);
        }
      };
      renderPdfPagesToImages();
    } else {
      setStatusMessage("No story content available for this story.");
      setPdfPagesAsImages([]);
      setIsLoadingPdfPages(false);
    }

    if (Array.isArray(story.pageTexts) && story.pageTexts.length > 0) {
      setPdfPagesText(story.pageTexts);
    }
  }, [story]);

  useEffect(() => {
    if (story?.ttsAudioData?.length > 0) {
      setTtsAudioData(story.ttsAudioData);
      setTtsAudioLoading(false);
      setStatusMessage("Audio ready.");
    } else {
      setTtsAudioData([]);
      setTtsAudioLoading(false);
      setStatusMessage("No audio available for this story.");
    }
  }, [story]);

  const handleFlip = useCallback((e) => {
    const rightPageIndex = e.data;
    stopTts();

    if (story?.ttsAudioData?.length > 0) {
      const leftPageIndex = rightPageIndex - 1;
      const audioDataForLeftPage = leftPageIndex >= 0
        ? story.ttsAudioData.find(d => d.pageNumber === leftPageIndex + 1)
        : null;
      const audioDataForRightPage = story.ttsAudioData.find(d => d.pageNumber === rightPageIndex + 1);

      let leftAudio, rightAudio;
      let leftTimepoints = [], rightTimepoints = [];

      if (audioDataForLeftPage) {
        leftAudio = new Audio(audioDataForLeftPage.audioUrl);
        leftTimepoints = audioDataForLeftPage.timepoints || [];
      }

      if (audioDataForRightPage) {
        rightAudio = new Audio(audioDataForRightPage.audioUrl);
        rightTimepoints = audioDataForRightPage.timepoints || [];
      }

      const playAudiosSequentially = () => {
        if (leftAudio) {
          setCurrentPageNumber(leftPageIndex);
          setTtsAudio(leftAudio);
          setTimepoints(leftTimepoints);
          setIsPlaying(true);

          leftAudio.onended = () => {
            if (rightAudio) {
              setCurrentPageNumber(rightPageIndex);
              setTtsAudio(rightAudio);
              setTimepoints(rightTimepoints);
              setIsPlaying(true);

              rightAudio.onended = () => {
                setIsPlaying(false);
                setCurrentWordIndex(-1);
                setTtsAudio(null);
                setTimepoints([]);
              };
              rightAudio.play().catch(err => console.error("Error playing right page TTS:", err));
            } else {
              setIsPlaying(false);
              setCurrentWordIndex(-1);
              setTtsAudio(null);
              setTimepoints([]);
            }
          };
          leftAudio.play().catch(err => console.error("Error playing left page TTS:", err));
        } else if (rightAudio) {
          setCurrentPageNumber(rightPageIndex);
          setTtsAudio(rightAudio);
          setTimepoints(rightTimepoints);
          setIsPlaying(true);

          rightAudio.onended = () => {
            setIsPlaying(false);
            setCurrentWordIndex(-1);
            setTtsAudio(null);
            setTimepoints([]);
          };
          rightAudio.play().catch(err => console.error("Error playing right page TTS:", err));
        }
      };

      playAudiosSequentially();
    }

    if (rightPageIndex >= pdfPagesAsImages.length - 1) {
      setHasReachedEnd(true);
      setCompleted(true);
    }
  }, [story, pdfPagesAsImages.length, stopTts]);

  useEffect(() => {
    if (showFullscreenModal && story?.ttsAudioData?.length > 0 && !ttsAudioLoading) {
      const initializeFirstPage = () => {
        stopTts();
        const audioDataForFirstPage = story.ttsAudioData.find(d => d.pageNumber === 1);
        if (audioDataForFirstPage) {
          const audio = new Audio(audioDataForFirstPage.audioUrl);
          setTtsAudio(audio);
          setTimepoints(audioDataForFirstPage.timepoints || []);
          setIsPlaying(true);
          setCurrentPageNumber(0);
          audio.play().catch(e => console.error("Error playing initial TTS:", e));
        }
      };
      initializeFirstPage();
    } else if (!showFullscreenModal || ttsAudioLoading) {
      stopTts();
    }
  }, [showFullscreenModal, story, ttsAudioLoading, stopTts]);

  useEffect(() => {
    if (ttsAudio && timepoints && timepoints.length > 0 && isPlaying) {
      const handleTimeUpdate = () => {
        const currentPageText = pdfPagesText[currentPageNumber];
        if (!currentPageText) return;

        const currentTime = ttsAudio.currentTime;
        let currentWord = -1;
        for(let i = 0; i < timepoints.length; i++) {
          if(currentTime >= timepoints[i].timeSeconds) {
            currentWord = i;
          } else {
            break;
          }
        }

        if (currentWord > -1 && currentWord !== currentWordIndex) {
          setCurrentWordIndex(currentWord);
        }
      };

      ttsAudio.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        ttsAudio.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [ttsAudio, timepoints, pdfPagesText, currentPageNumber, isPlaying, currentWordIndex]);

  useEffect(() => {
    return () => stopTts();
  }, [stopTts]);

  const handleOpenFullscreen = () => {
    setShowFullscreenModal(true);
  };

  const handleStartAssessment = () => {
    // Open assessment in new tab
    const assessmentUrl = `/teacher/story-assessment/${id}`;
    window.open(assessmentUrl, '_blank');
  };

  if (error) {
    return (
      <div
        className="app-container"
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)",
        }}
      >
        <TopNavbar toggleSidebar={toggleSidebar} />
        <Container fluid className="d-flex align-items-center justify-content-center" style={{ height: "calc(100vh - 60px)" }}>
          <Card style={cardStyle} className="p-4 text-center">
            <h3 style={{ color: "#ff69b4" }}>Story Not Found</h3>
            <p style={{ color: "#666" }}>{error}</p>
            <Button
              onClick={() => navigate(-1)}
              style={{
                background: "#ff69b4",
                border: "none",
                borderRadius: "25px",
                padding: "10px 24px",
                fontWeight: "600"
              }}
            >
              Go Back
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  if (!story && !isLoadingPdfPages && !statusMessage) {
    return (
      <div
        className="app-container"
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)",
        }}
      >
        <TopNavbar toggleSidebar={toggleSidebar} />
        <Container fluid className="d-flex align-items-center justify-content-center" style={{ height: "calc(100vh - 60px)" }}>
          <Spinner animation="border" role="status" style={{ color: "#ff69b4" }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
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
            
            {story && (
              <div>
                <h1 className="fw-bold mb-1" style={{ 
                  fontSize: "2.2rem", 
                  letterSpacing: "0.01em", 
                  color: "#333" 
                }}>
                  {story.title}
                </h1>
                {story.author && (
                  <p className="mb-0" style={{
                    fontSize: "1.1rem",
                    color: "#8566aa",
                    fontWeight: "500"
                  }}>
                    By {story.author}
                  </p>
                )}
              </div>
            )}
          </Col>
        </Row>

        {/* Main Content */}
        {isLoadingPdfPages || ttsAudioLoading ? (
          <Row className="justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <Col xs={12} className="text-center">
              <Card style={cardStyle} className="p-5">
                <Spinner animation="border" role="status" style={{ color: "#ff69b4", margin: "0 auto", width: "3rem", height: "3rem" }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 mb-0" style={{ fontSize: "1.1rem", color: "#666" }}>
                  {ttsAudioLoading
                    ? "Preparing audio for your story..."
                    : (statusMessage || "Loading story content...")}
                </p>
              </Card>
            </Col>
          </Row>
        ) : pdfPagesAsImages.length > 0 ? (
          <Row className="justify-content-center">
            <Col xs={12} lg={8} xl={6}>
              <Card 
                style={{
                  ...cardStyle,
                  transform: isHovered ? "translateY(-6px)" : "none",
                  boxShadow: isHovered ? "0 8px 32px rgba(255,105,180,0.20)" : cardStyle.boxShadow
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="text-center p-5"
              >
                <div className="mb-4">
                  <BookOpen size={64} color="#ff69b4" style={{ marginBottom: "16px" }} />
                  <h3 className="fw-bold mb-3" style={{ color: "#333", fontSize: "1.8rem" }}>
                    Ready to Read?
                  </h3>
                  <p style={{ color: "#666", fontSize: "1.1rem", lineHeight: "1.6" }}>
                    Your story is ready! Click the button below to start reading in fullscreen mode with audio narration.
                  </p>
                </div>
                
                <Button 
                  onClick={handleOpenFullscreen}
                  style={{
                    background: "linear-gradient(135deg, #ff69b4 0%, #ffaec9 100%)",
                    border: "none",
                    borderRadius: "25px",
                    padding: "12px 32px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    boxShadow: "0 4px 16px rgba(255,105,180,0.25)",
                    transition: "all 0.2s ease-in-out",
                    color: "#fff"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 24px rgba(255,105,180,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 16px rgba(255,105,180,0.25)";
                  }}
                >
                  <BookOpen size={20} className="me-2" />
                  Start Reading
                </Button>

                {/* Assessment Button - Shows after completing story */}
                {hasReachedEnd && (
                  <div className="mt-4">
                    <div className="mb-3">
                      <Award size={48} color="#28a745" style={{ marginBottom: "8px" }} />
                      <h5 style={{ color: "#28a745", fontWeight: "600" }}>Story Complete!</h5>
                      <p style={{ color: "#666", fontSize: "0.95rem" }}>
                        Test your understanding with our interactive assessment
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleStartAssessment}
                      onMouseEnter={() => setAssessmentHovered(true)}
                      onMouseLeave={() => setAssessmentHovered(false)}
                      style={{
                        background: assessmentHovered ? "#28a745" : "#fff",
                        color: assessmentHovered ? "#fff" : "#28a745",
                        border: "2px solid #28a745",
                        borderRadius: "25px",
                        padding: "10px 28px",
                        fontSize: "1rem",
                        fontWeight: "600",
                        boxShadow: assessmentHovered ? "0 6px 24px rgba(40,167,69,0.25)" : "0 2px 8px rgba(40,167,69,0.10)",
                        transition: "all 0.3s ease-in-out",
                        transform: assessmentHovered ? "translateY(-2px)" : "translateY(0)"
                      }}
                    >
                      <Award size={18} className="me-2" />
                      Start Assessment
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        ) : (
          <Row className="justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <Col xs={12} className="text-center">
              <Card style={cardStyle} className="p-5">
                <h3 className="mb-3" style={{ color: "#ff69b4" }}>No Story Content Available</h3>
                <p style={{ color: "#666" }}>{statusMessage}</p>
              </Card>
            </Col>
          </Row>
        )}

        {/* Fullscreen Modal for Reading */}
        <Modal
          show={showFullscreenModal}
          onHide={() => setShowFullscreenModal(false)}
          fullscreen={true}
          dialogClassName="fullscreen-modal-dialog"
        >
          <Modal.Header closeButton style={{
            background: "linear-gradient(135deg, #ff69b4 0%, #ffaec9 100%)",
            color: "#fff",
            border: "none"
          }}>
            <Modal.Title style={{ fontWeight: "700" }}>{story?.title || "Story"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0 d-flex flex-column" style={{ background: "#f8f9fa" }}>
            {isLoadingPdfPages && !pdfPagesAsImages.length ? (
              <div className="text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <Spinner animation="border" role="status" style={{ color: "#ff69b4", width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2" style={{ fontSize: "1.1rem", color: "#666" }}>{statusMessage || "Loading story pages..."}</p>
              </div>
            ) : ttsAudioLoading ? (
              <div className="text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center" style={{ background: "rgba(255,255,255,0.9)", zIndex: 1000 }}>
                <Spinner animation="border" role="status" style={{ color: "#ff69b4", width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <div style={{ marginTop: 16, fontWeight: "bold", fontSize: '1.2rem', color: "#333" }}>
                  Preparing audio for your story...
                </div>
                <div style={{ marginTop: 8, color: "#666" }}>
                  Please wait, this may take a few seconds.
                </div>
              </div>
            ) : pdfPagesAsImages.length > 0 ? (
              <div className="flipbook-fullscreen-wrapper d-flex align-items-center justify-content-center flex-grow-1 w-100 h-100">
                {pdfPagesAsImages.length > 1 && (
                  <Button
                    variant="light"
                    onClick={() => flipBook.current.pageFlip().flipPrev()}
                    className="flipbook-nav-button prev"
                    aria-label="Previous Page"
                    disabled={ttsLoading || ttsAudioLoading}
                    style={{
                      position: "absolute",
                      left: "20px",
                      zIndex: 10,
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                      background: "#ff69b4",
                      border: "none",
                      color: "#fff",
                      fontSize: "1.5rem",
                      boxShadow: "0 4px 16px rgba(255,105,180,0.25)"
                    }}
                  >
                    {ttsLoading || ttsAudioLoading ? 
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 
                      <>&#8249;</>
                    }
                  </Button>
                )}
                <div className="flipbook-container">
                    <PageFlip
                      width={flipbookDimensions.width}
                      height={flipbookDimensions.height}
                      size="stretch"
                      minWidth={315}
                      maxWidth={1000}
                      minHeight={400}
                      maxHeight={1533}
                      maxShadowOpacity={0.5}
                      showCover={true}
                      mobileScrollSupport={true}
                      onFlip={handleFlip}
                      className="demo-book"
                      ref={flipBook}
                      usePortrait={true}
                      singlePage={true}
                      startPage={0}
                      drawShadow={true}
                    >
                      <PageCover imageSrc={story?.image}>{story?.title || "Story"}</PageCover>
                      {pdfPagesAsImages.map((imageDataUrl, index) => {
                        const isCurrentPage = index === currentPageNumber;
                        return(
                        <Page 
                          key={`page-${index}`} 
                          number={index + 1} 
                          imageDataUrl={imageDataUrl}
                          pageText={pdfPagesText[index] || ''} 
                          isPlaying={isCurrentPage && isPlaying}
                          currentWordIndex={isCurrentPage ? currentWordIndex : -1}
                        />
                      )})}
                      <PageCover>THE END</PageCover>
                    </PageFlip>
                </div>
                {pdfPagesAsImages.length > 1 && (
                  <Button
                    variant="light"
                    onClick={() => flipBook.current.pageFlip().flipNext()}
                    className="flipbook-nav-button next"
                    aria-label="Next Page"
                    disabled={ttsLoading || ttsAudioLoading}
                    style={{
                      position: "absolute",
                      right: "20px",
                      zIndex: 10,
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                      background: "#ff69b4",
                      border: "none",
                      color: "#fff",
                      fontSize: "1.5rem",
                      boxShadow: "0 4px 16px rgba(255,105,180,0.25)"
                    }}
                  >
                    {ttsLoading || ttsAudioLoading ? 
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 
                      <>&#8250;</>
                    }
                  </Button>
                )}
              </div>
            ) : null}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default ReadStory;