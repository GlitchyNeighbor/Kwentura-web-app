import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ImageBackground,
  Modal,
  Animated,
} from 'react-native';
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../FirebaseConfig';
import { CommonActions } from '@react-navigation/native';
import AppHeader from './HeaderComQuestions';
import { Audio } from 'expo-av';

const ComQuestions = ({ route, navigation }) => {
  const { storyId, storyTitle } = route.params;
  const [questions, setQuestions] = useState([]);
  const [moralLessonQuestion, setMoralLessonQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sound, setSound] = useState();
  const [ttsUrls, setTtsUrls] = useState({ congratulations: '', encouragement: '' });
  
  
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onClose: () => {},
  });
  const scaleValue = useRef(new Animated.Value(0)).current;

  
  const CustomAlert = () => {
    useEffect(() => {
      if (alertConfig.visible) {
        Animated.spring(scaleValue, {
          toValue: 1,
          damping: 15,
          useNativeDriver: true,
        }).start();
      } else {
        scaleValue.setValue(0);
      }
    }, [alertConfig.visible]);

    const getEmoji = () => {
      switch (alertConfig.type) {
        case 'correct':
          return '🎉';
        case 'wrong':
          return '💭';
        case 'warning':
          return '⚠️';
        default:
          return 'ℹ️';
      }
    };

    const getColors = () => {
      switch (alertConfig.type) {
        case 'correct':
          return {
            container: '#4ECDC4',
            button: '#FFD700',
          };
        case 'wrong':
          return {
            container: '#FF6B6B',
            button: '#4ECDC4',
          };
        case 'warning':
          return {
            container: '#FFD700',
            button: '#FF6B6B',
          };
        default:
          return {
            container: '#4ECDC4',
            button: '#FFD700',
          };
      }
    };

    const colors = getColors();

    return (
      <Modal
        transparent
        visible={alertConfig.visible}
        animationType="fade"
        onRequestClose={alertConfig.onClose}
      >
        <View style={styles.alertOverlay}>
          <Animated.View
            style={[
              styles.alertContainer,
              { 
                backgroundColor: colors.container,
                transform: [{ scale: scaleValue }] 
              },
            ]}
          >
            <Text style={styles.alertEmoji}>{getEmoji()}</Text>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: colors.button }]}
              onPress={alertConfig.onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  useEffect(() => {
    const fetchTtsUrls = async () => {
      try {
        const congratulationsDoc = await getDoc(doc(db, 'tts_config', 'congratulations'));
        const encouragementDoc = await getDoc(doc(db, 'tts_config', 'encouragement'));
        
        let congratulationsUrl = '';
        if (congratulationsDoc.exists()) {
          congratulationsUrl = congratulationsDoc.data().url;
        }

        let encouragementUrl = '';
        if (encouragementDoc.exists()) {
          encouragementUrl = encouragementDoc.data().url;
        }
        setTtsUrls({ congratulations: congratulationsUrl, encouragement: encouragementUrl });
      } catch (err) {
        console.error("Error fetching TTS URLs:", err);
      }
    };

    fetchTtsUrls();
  }, []);

  async function playSoundFromUrl(url) {
    if (sound) {
      await sound.unloadAsync();
    }
    if (!url) {
      console.log('Audio URL is not provided.');
      return;
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error("Failed to play sound", error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const storyRef = doc(db, 'stories', storyId);
        const docSnap = await getDoc(storyRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const processedQuestions = (data.comprehensionQuestions || []).map(q => ({
            ...q,
            correctAnswer: q.options[q.correctOptionIndex]
          }));
          setQuestions(processedQuestions);

          if (data.moralLesson) {
            const processedMoralLesson = {
              ...data.moralLesson,
              correctAnswer: data.moralLesson.options[data.moralLesson.correctOptionIndex]
            };
            setMoralLessonQuestion(processedMoralLesson);
          }
          
          
          if (processedQuestions.length > 0 && processedQuestions[0].audioUrl) {
            playSoundFromUrl(processedQuestions[0].audioUrl);
          }
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [storyId]);

  const saveQuizResult = async (finalScore) => {
    const user = auth.currentUser;
    if (!user) return;

    const totalQuestions = questions.length + (moralLessonQuestion ? 1 : 0);

    try {
      const quizResultRef = doc(db, "students", user.uid, "quizScores", storyId);
      await setDoc(quizResultRef, {
        storyId: storyId,
        storyTitle: storyTitle,
        score: finalScore,
        totalQuestions: totalQuestions,
        completedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("Error saving quiz result:", error);
    }
  };

  useEffect(() => {
    if (showResults) {
      saveQuizResult(score);
      if (score > 0) {
        addStars(score);
      }
    }
  }, [showResults, score]);

  useEffect(() => {
    let soundObject = null;

    const playClappingSound = async () => {
      try {
        soundObject = new Audio.Sound();
        await soundObject.loadAsync(require('../assets/sounds/clapping.mp3'));
        await soundObject.playAsync();
      } catch (error) {
        console.error("Failed to play clapping sound", error);
      }
    };

    if (score === 1) {
      playClappingSound();
    }

    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, [score]);

  const addStars = async (amount) => {
    const user = auth.currentUser;
    if (!user || amount <= 0) return;

    try {
      const userDocRef = doc(db, "students", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          stars: increment(amount),
        });
      } else {
        await setDoc(userDocRef, { stars: amount, unlockedRewards: [], createdAt: new Date() });
      }
    } catch (error) {
      console.error("Error adding stars:", error);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const playSoundSequence = async (soundFiles) => {
    for (const soundFile of soundFiles) {
      try {
        const { sound } = await Audio.Sound.createAsync(soundFile);
        await sound.playAsync();
        await new Promise(resolve => {
          sound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.didJustFinish) {
              await sound.unloadAsync();
              resolve();
            }
          });
        });
      } catch (error) {
        console.error('Failed to play sound file', error);
      }
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      setAlertConfig({
        visible: true,
        title: 'Oops!',
        message: 'You must choose an option before proceeding.',
        type: 'warning',
        onClose: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOption && currentQ.correctAnswer && selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      setScore(score + 1);
      setAlertConfig({
        visible: true,
        title: 'Correct!',
        message: 'Well done! You got it right!',
        type: 'correct',
        onClose: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          setTimeout(moveToNext, 500);
        },
      });
      playSoundSequence([require('../assets/sounds/correct.mp3')]);
      playSoundSequence([require('../assets/sounds/congratulations.mp3')]);
    } else {
      setAlertConfig({
        visible: true,
        title: 'Not quite right',
        message: 'Think about the story again. You can do it!',
        type: 'wrong',
        onClose: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          setTimeout(moveToNext, 500);
        },
      });
      playSoundSequence([require('../assets/sounds/wrong-answer.mp3')]);
      playSoundSequence([require('../assets/sounds/encouragement.mp3')]);
    }
  };

  const moveToNext = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      if (questions[nextIndex].audioUrl) {
        setTimeout(() => playSoundFromUrl(questions[nextIndex].audioUrl), 1000);
      }
    } else if (moralLessonQuestion) {
      setCurrentQuestionIndex(questions.length);
      if (moralLessonQuestion.audioUrl) {
        setTimeout(() => playSoundFromUrl(moralLessonQuestion.audioUrl), 1000);
      }
    } else {
      setShowResults(true);
    }
    setSelectedOption(null);
  };

  const handleSubmitMoralLesson = () => {
    if (selectedOption === null) {
      setAlertConfig({
        visible: true,
        title: 'Oops!',
        message: 'You must choose an option before proceeding.',
        type: 'warning',
        onClose: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    const isCorrect = selectedOption && moralLessonQuestion.correctAnswer && selectedOption.trim().toLowerCase() === moralLessonQuestion.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      setScore(score + 1);
      setAlertConfig({
        visible: true,
        title: 'Correct!',
        message: 'Well done! You got it right!',
        type: 'correct',
        onClose: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          setTimeout(() => setShowResults(true), 500);
        },
      });
      playSoundSequence([require('../assets/sounds/correct.mp3')]);
      playSoundSequence([require('../assets/sounds/congratulations.mp3')]);
    } else {
      setAlertConfig({
        visible: true,
        title: 'Not quite right',
        message: 'Think about the story again. You can do it!',
        type: 'wrong',
        onClose: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          setTimeout(() => setShowResults(true), 500);
        },
      });
      playSoundSequence([require('../assets/sounds/wrong-answer.mp3')]);
      playSoundSequence([require('../assets/sounds/encouragement.mp3')]);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isMoralLessonPhase = currentQuestionIndex === questions.length && moralLessonQuestion;

  if (loading) {
    return (
      <ImageBackground source={require('../images/DarkViewStory.png')} style={styles.background} resizeMode="cover">
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#FFCF2D" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground source={require('../images/DarkViewStory.png')} style={styles.background} resizeMode="cover">
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (showResults) {
    return (
      <ImageBackground source={require('../images/DarkViewStory.png')} style={styles.background} resizeMode="cover">
        
        <SafeAreaView style={styles.container}>

          <Text style={styles.resultTitle}>🎉 Quiz Complete! 🎉</Text>
          <Text style={styles.resultText}>You scored {score} out of {questions.length + (moralLessonQuestion ? 1 : 0)}</Text>
          <Text style={styles.starsEarnedText}>You earned {score} stars! ⭐</Text>
          <TouchableOpacity
            onPress={() => {
              playSoundSequence([require('../assets/sounds/clapping.mp3')]);
              Alert.alert(
                "Congratulations!",
                `You have earned ${score} stars!`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: 'Home' }],
                        })
                      );
                      navigation.navigate('HomeTab');
                    }
                  }
                ]
              );
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (!currentQuestion && !isMoralLessonPhase) {
    return (
      <ImageBackground source={require('../images/DarkViewStory.png')} style={styles.background} resizeMode="cover">
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>No questions found for this story.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const displayQuestion = isMoralLessonPhase ? moralLessonQuestion : currentQuestion;

  return (
    <ImageBackground source={require('../images/DarkViewStory.png')} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
        <AppHeader navigation={navigation} hideStars={true} />
          <Text style={styles.storyTitle}>{storyTitle}</Text>
          
          {displayQuestion.imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: displayQuestion.imageUrl }} style={styles.questionImage} resizeMode="contain" />
            </View>
          )}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{displayQuestion.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {displayQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option && styles.selectedOption,
                ]}
                onPress={() => handleOptionSelect(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {isMoralLessonPhase ? (
            <TouchableOpacity onPress={handleSubmitMoralLesson} style={styles.button}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleNextQuestion} style={styles.button}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
      
      <CustomAlert />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyTitle: {
    fontSize: 28,
    fontFamily: 'Fredoka-SemiBold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  questionImage: {
    width: '100%',
    height: '100%',
  },
  questionContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  questionText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedOption: {
    backgroundColor: '#FFCF2D',
    borderColor: '#E6B800',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  resultTitle: {
    fontSize: 32,
    fontFamily: 'Fredoka-SemiBold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  resultText: {
    fontSize: 22,
    color: '#eee',
    marginBottom: 30,
    textAlign: 'center',
  },
  starsEarnedText: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '85%',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  alertEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  alertTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  alertMessage: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 26,
    fontWeight: '600',
  },
  alertButton: {
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    minWidth: 120,
  },
  alertButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ComQuestions;