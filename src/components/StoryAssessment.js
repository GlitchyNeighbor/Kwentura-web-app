import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  Alert,
  Spinner,
  ProgressBar
} from "react-bootstrap";
import { FaArrowLeft, FaCheck, FaTimes } from "react-icons/fa";
import { db } from "../config/FirebaseConfig.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Volume2, Award, BookOpen, CheckCircle } from "lucide-react";

// Enhanced styles matching the main theme
const cardStyle = {
  border: "none",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 18px rgba(255,105,180,0.13)",
  background: "linear-gradient(135deg, #FFF0F5 60%, #FFE8F1 100%)",
  transition: "all 0.3s ease-in-out",
};

const StoryAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Assessment state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [correct, setCorrect] = useState({});
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questions, setQuestions] = useState([]); // Move to state
  
  // TTS state
  const [ttsAudio, setTtsAudio] = useState(null);
  const [ttsLoading, setTtsLoading] = useState({});
  const ttsAudioRef = useRef(null);

  // Build questions array function
  const buildQuestions = (storyData) => {
    const questionsList = [];
    
    if (storyData.moralLesson?.question && storyData.moralLesson?.options?.length === 3) {
      questionsList.push({
        id: 'moral',
        type: 'Moral Lesson',
        question: storyData.moralLesson.question,
        options: storyData.moralLesson.options,
        correctIndex: storyData.moralLesson.correctOptionIndex
      });
    }
    
    if (storyData.additionalQuestion1?.question && storyData.additionalQuestion1?.options?.length === 3) {
      questionsList.push({
        id: 'additional1',
        type: 'Additional Question 1',
        question: storyData.additionalQuestion1.question,
        options: storyData.additionalQuestion1.options,
        correctIndex: storyData.additionalQuestion1.correctOptionIndex
      });
    }
    
    if (storyData.additionalQuestion2?.question && storyData.additionalQuestion2?.options?.length === 3) {
      questionsList.push({
        id: 'additional2',
        type: 'Additional Question 2',
        question: storyData.additionalQuestion2.question,
        options: storyData.additionalQuestion2.options,
        correctIndex: storyData.additionalQuestion2.correctOptionIndex
      });
    }
    
    if (storyData.comprehensionQuestions?.length === 3) {
      storyData.comprehensionQuestions.forEach((q, index) => {
        questionsList.push({
          id: `comprehension${index}`,
          type: `Comprehension Question ${index + 1}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correctOptionIndex
        });
      });
    }
    
    return questionsList;
  };

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) {
        setError("No story ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const docRef = doc(db, "stories", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const storyData = docSnap.data();
          
          setStory(storyData);
          
          // Build questions array
          const questionsList = buildQuestions(storyData);
          
          setQuestions(questionsList);
          setTotalQuestions(questionsList.length);
          
          if (questionsList.length === 0) {
            setError("No assessment questions found for this story.");
          }
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        console.error("Error fetching story:", err); // Debug log
        setError("Failed to fetch story: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const stopTts = () => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.onended = null;
      ttsAudioRef.current.onerror = null;
    }
    setTtsAudio(null);
  };

  const playTts = async (text, loadingKey) => {
    if (!text?.trim()) return;

    setTtsLoading(prev => ({ ...prev, [loadingKey]: true }));
    stopTts();

    try {
      const functions = getFunctions();
      const synthesizeSpeech = httpsCallable(functions, "synthesizeSpeechGoogle");
      const result = await synthesizeSpeech({ text });

      const audio = new Audio(`data:audio/mp3;base64,${result.data.audioData}`);
      setTtsAudio(audio);
      ttsAudioRef.current = audio;

      audio.onended = () => {
        setTtsAudio(null);
        ttsAudioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error("TTS audio playback error:", e);
        setTtsAudio(null);
        ttsAudioRef.current = null;
      };
      
      await audio.play();
    } catch (err) {
      console.error("TTS synthesis error:", err);
    } finally {
      setTtsLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    const isCorrect = optionIndex === question.correctIndex;
    
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setSubmitted(prev => ({ ...prev, [questionId]: true }));
    setCorrect(prev => ({ ...prev, [questionId]: isCorrect }));

    const feedbackText = isCorrect ? "Correct! Well done." : "Not quite right. Think about the story again.";
    playTts(feedbackText, `feedback_${questionId}`);

    // Auto advance after 2 seconds if correct
    if (isCorrect && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 2000);
    } else if (currentQuestionIndex === questions.length - 1) {
      // Calculate final score
      setTimeout(() => {
        const finalScore = Object.values(correct).filter(Boolean).length + (isCorrect ? 1 : 0);
        setScore(finalScore);
        setAssessmentComplete(true);
        saveAssessmentResults(finalScore);
      }, 2000);
    }
  };

  const saveAssessmentResults = async (finalScore) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.warn("No authenticated user found");
        return;
      }

      const assessmentData = {
        storyId: id,
        userId: user.uid,
        score: finalScore,
        totalQuestions: questions.length,
        answers: answers,
        completedAt: new Date(),
        percentage: Math.round((finalScore / questions.length) * 100)
      };

      await setDoc(doc(db, "assessments", `${user.uid}_${id}_${Date.now()}`), assessmentData);
    } catch (error) {
      console.error("Error saving assessment results:", error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRetakeAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted({});
    setCorrect({});
    setAssessmentComplete(false);
    setScore(0);
  };
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Spinner animation="border" role="status" style={{ color: "#ff69b4", width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error || !story || questions.length === 0) {
    return (
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Card style={cardStyle} className="p-4 text-center">
          <h3 style={{ color: "#ff69b4" }}>Assessment Not Available</h3>
          <p style={{ color: "#666" }}>
            {error || "No assessment questions found for this story."}
          </p>
          <p style={{ color: "#999", fontSize: "0.9rem" }}>
            Story ID: {id || "Not provided"}
          </p>
          <Button
            onClick={() => window.close()}
            style={{
              background: "#ff69b4",
              border: "none",
              borderRadius: "25px",
              padding: "10px 24px",
              fontWeight: "600"
            }}
          >
            Close
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FFF5F8 0%, #FFE8F1 50%, #F8E8FF 100%)",
        padding: "24px 0"
      }}
    >
      <Container fluid style={{ maxWidth: "900px" }}>
        {/* Header */}
        <Row className="align-items-center mb-4">
          <Col xs="auto">
            <Button
              variant="link"
              className="p-0"
              onClick={() => window.close()}
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
          </Col>
          <Col>
            <div className="d-flex align-items-center gap-3">
              <Award size={32} color="#ff69b4" />
              <div>
                <h1 className="fw-bold mb-0" style={{ 
                  fontSize: "2.2rem", 
                  letterSpacing: "0.01em", 
                  color: "#333" 
                }}>
                  Story Assessment
                </h1>
                <p className="mb-0" style={{ 
                  fontSize: "1.1rem", 
                  color: "#8566aa", 
                  fontWeight: "500" 
                }}>
                  {story.title || "Loading..."}
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {!assessmentComplete ? (
          <>
            {/* Progress Section */}
            <Row className="mb-4">
              <Col>
                <Card style={cardStyle} className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "#ff69b4", fontWeight: "600" }}>
                      {Math.round(progressPercentage)}% Complete
                    </span>
                  </div>
                  <ProgressBar 
                    now={progressPercentage} 
                    style={{ 
                      height: "8px",
                      background: "#f0f0f0"
                    }}
                    className="custom-progress"
                  />
                </Card>
              </Col>
            </Row>

            {/* Question Card */}
            <Row className="mb-4">
              <Col>
                <Card style={{
                  ...cardStyle,
                  minHeight: "400px"
                }}>
                  <Card.Header style={{
                    background: "linear-gradient(135deg, #ff69b4 0%, #ffaec9 100%)",
                    border: "none",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "1.2rem"
                  }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <span>{currentQuestion.type}</span>
                      <Button
                        variant="link"
                        onClick={() => playTts(currentQuestion.question, `question_${currentQuestion.id}`)}
                        disabled={ttsLoading[`question_${currentQuestion.id}`]}
                        className="p-0"
                        style={{ color: "#fff" }}
                      >
                        {ttsLoading[`question_${currentQuestion.id}`] ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <Volume2 size={20} />
                        )}
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <div className="mb-4">
                      <h4 style={{ 
                        color: "#333", 
                        fontSize: "1.3rem", 
                        lineHeight: "1.5",
                        fontWeight: "600"
                      }}>
                        {currentQuestion.question}
                      </h4>
                    </div>

                    <Form>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="mb-3">
                          <Form.Check
                            type="radio"
                            id={`${currentQuestion.id}-option-${index}`}
                            name={`question-${currentQuestion.id}`}
                            value={index}
                            checked={answers[currentQuestion.id] === index}
                            onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                            disabled={submitted[currentQuestion.id]}
                            style={{ display: "none" }}
                          />
                          <label
                            htmlFor={`${currentQuestion.id}-option-${index}`}
                            style={{
                              display: "block",
                              padding: "16px 20px",
                              background: answers[currentQuestion.id] === index 
                                ? (submitted[currentQuestion.id] 
                                  ? (correct[currentQuestion.id] ? "#d4edda" : "#f8d7da")
                                  : "#fff0f5") 
                                : "#fff",
                              border: answers[currentQuestion.id] === index 
                                ? (submitted[currentQuestion.id]
                                  ? (correct[currentQuestion.id] ? "2px solid #28a745" : "2px solid #dc3545")
                                  : "2px solid #ff69b4")
                                : "2px solid #e9ecef",
                              borderRadius: "12px",
                              cursor: submitted[currentQuestion.id] ? "default" : "pointer",
                              transition: "all 0.2s ease-in-out",
                              fontSize: "1rem",
                              fontWeight: "500",
                              color: "#333",
                              position: "relative"
                            }}
                            onMouseEnter={(e) => {
                              if (!submitted[currentQuestion.id]) {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 4px 12px rgba(255,105,180,0.15)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!submitted[currentQuestion.id]) {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <span>{option}</span>
                              {submitted[currentQuestion.id] && answers[currentQuestion.id] === index && (
                                <div style={{ fontSize: "1.2rem" }}>
                                  {correct[currentQuestion.id] ? (
                                    <FaCheck style={{ color: "#28a745" }} />
                                  ) : (
                                    <FaTimes style={{ color: "#dc3545" }} />
                                  )}
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </Form>

                    {/* Feedback Alert */}
                    {submitted[currentQuestion.id] && (
                      <Alert 
                        variant={correct[currentQuestion.id] ? "success" : "danger"} 
                        className="mt-4"
                        style={{
                          borderRadius: "12px",
                          border: "none",
                          fontWeight: "500"
                        }}
                      >
                        <div className="d-flex align-items-center">
                          {correct[currentQuestion.id] ? (
                            <CheckCircle size={20} className="me-2" />
                          ) : (
                            <FaTimes size={20} className="me-2" />
                          )}
                          {correct[currentQuestion.id] 
                            ? "Excellent! You got it right." 
                            : "Not quite right. Think about the story again."
                          }
                        </div>
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Navigation Buttons */}
            <Row>
              <Col className="d-flex justify-content-between">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  style={{
                    background: currentQuestionIndex === 0 ? "#e9ecef" : "#6c757d",
                    border: "none",
                    borderRadius: "25px",
                    padding: "10px 24px",
                    fontWeight: "600",
                    color: "#fff"
                  }}
                >
                  Previous
                </Button>
                
                {currentQuestionIndex < questions.length - 1 && (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!submitted[currentQuestion.id]}
                    style={{
                      background: submitted[currentQuestion.id] ? "#ff69b4" : "#e9ecef",
                      border: "none",
                      borderRadius: "25px",
                      padding: "10px 24px",
                      fontWeight: "600",
                      color: "#fff"
                    }}
                  >
                    Next Question
                  </Button>
                )}
              </Col>
            </Row>
          </>
        ) : (
          /* Assessment Complete Screen */
          <Row className="justify-content-center">
            <Col xs={12} lg={8}>
              <Card style={{
                ...cardStyle,
                textAlign: "center",
                minHeight: "500px"
              }}>
                <Card.Body className="p-5 d-flex flex-column justify-content-center">
                  <Award size={80} color="#28a745" style={{ margin: "0 auto 24px" }} />
                  
                  <h2 className="fw-bold mb-3" style={{ 
                    color: "#333", 
                    fontSize: "2.5rem" 
                  }}>
                    Assessment Complete!
                  </h2>
                  
                  <div className="mb-4">
                    <div style={{
                      fontSize: "3rem",
                      fontWeight: "800",
                      color: score >= questions.length * 0.8 ? "#28a745" : score >= questions.length * 0.6 ? "#ffc107" : "#dc3545",
                      marginBottom: "8px"
                    }}>
                      {score}/{questions.length}
                    </div>
                    <div style={{
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      color: score >= questions.length * 0.8 ? "#28a745" : score >= questions.length * 0.6 ? "#ffc107" : "#dc3545",
                    }}>
                      {Math.round((score / questions.length) * 100)}%
                    </div>
                  </div>

                  <div className="mb-4">
                    <p style={{ 
                      fontSize: "1.2rem", 
                      color: "#666",
                      lineHeight: "1.6"
                    }}>
                      {score >= questions.length * 0.8 
                        ? "Outstanding work! You have excellent understanding of the story."
                        : score >= questions.length * 0.6
                        ? "Good job! You understood most of the story well."
                        : "Keep practicing! Reading comprehension improves with time."
                      }
                    </p>
                  </div>

                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <Button
                      onClick={handleRetakeAssessment}
                      style={{
                        background: "#fff",
                        color: "#ff69b4",
                        border: "2px solid #ff69b4",
                        borderRadius: "25px",
                        padding: "12px 24px",
                        fontWeight: "600",
                        transition: "all 0.2s ease-in-out"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#ff69b4";
                        e.target.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#fff";
                        e.target.style.color = "#ff69b4";
                      }}
                    >
                      Retake Assessment
                    </Button>
                    
                    <Button
                      onClick={() => window.close()}
                      style={{
                        background: "linear-gradient(135deg, #ff69b4 0%, #ffaec9 100%)",
                        border: "none",
                        borderRadius: "25px",
                        padding: "12px 24px",
                        fontWeight: "600",
                        color: "#fff",
                        boxShadow: "0 4px 16px rgba(255,105,180,0.25)"
                      }}
                    >
                      Close Assessment
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default StoryAssessment;