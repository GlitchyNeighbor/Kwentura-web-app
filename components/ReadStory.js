import React, { useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  ImageBackground,
  Alert
} from "react-native";
import { doc, getDoc, updateDoc, increment, setDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../FirebaseConfig";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
  withSequence,
  withRepeat,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Sound from 'react-native-sound';

import AppHeader from "./HeaderReadStory";

const { width, height } = Dimensions.get("window");

const ReadStory = ({ route, navigation }) => {
  const storyId = route.params?.storyId;
  const [pageImages, setPageImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const [pageTexts, setPageTexts] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyAuthor, setStoryAuthor] = useState("");
  const [showCompletion, setShowCompletion] = useState(false);
  const [audioData, setAudioData] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Animation values
  const flip = useSharedValue(0);
  const speakerScale = useSharedValue(1);
  const buttonPulse = useSharedValue(1);
  const starRotation = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0);
  const celebrationBounce = useSharedValue(1);

  // Start sparkle animation on load
  useEffect(() => {
    sparkleOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
    
    starRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
  }, []);

  // Completion screen animations
  useEffect(() => {
    if (showCompletion) {
      completionScale.value = withSpring(1, { damping: 15 });
    }
  }, [showCompletion]);

  // Increment "users read" count when story is completed
  useEffect(() => {
    const auth = getAuth();
    if (showCompletion && auth.currentUser && storyId) {
      const userId = auth.currentUser.uid;
      const storyRef = doc(db, "stories", storyId);
      const userReadRef = doc(collection(storyRef, "readers"), userId);

      const checkIfUserRead = async () => {
        try {
          const userReadSnap = await getDoc(userReadRef);
          if (!userReadSnap.exists()) {
            // User hasn't read this story before, increment count and mark as read
            await updateDoc(storyRef, {
              usersRead: increment(1)
            });
            await setDoc(userReadRef, { readAt: new Date() }); // Mark as read
            console.log(`Story ${storyId} read count incremented for user ${userId}`);
          } else {
            console.log(`User ${userId} already read story ${storyId}. Not incrementing.`);
          }
        } catch (error) {
          console.error("Error updating usersRead count:", error);
        }
      };
      checkIfUserRead();
    }
  }, [showCompletion, storyId]);

  useEffect(() => {
    async function fetchPages() {
      if (!storyId) {
        setError("Story ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setImagesReady(false);
      try {
        const storyRef = doc(db, "stories", storyId);
        const docSnap = await getDoc(storyRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          let images = [];
          let texts = [];
          
          // Get story title and author
          setStoryTitle(data.title || "");
          setStoryAuthor(data.author || "");
          
          // Get audio URLs
          if (data.ttsAudioData && Array.isArray(data.ttsAudioData)) {
            setAudioData(data.ttsAudioData);
          }
          
          if (Array.isArray(data.pageImages)) {
            images = data.pageImages;
          } else if (data.pageImages && typeof data.pageImages === "object") {
            images = Object.keys(data.pageImages)
              .sort((a, b) => Number(a) - Number(b))
              .map((k) => data.pageImages[k]);
          }
          
          if (Array.isArray(data.pageTexts)) {
            texts = data.pageTexts;
          } else if (data.pageTexts && typeof data.pageTexts === "object") {
            texts = Object.keys(data.pageTexts)
              .sort((a, b) => Number(a) - Number(b))
              .map((k) => data.pageTexts[k]);
          }
          setPageTexts(texts);
          
          if (images.length > 0) {
            // Skip the first image (cover)
            const contentImages = images.slice(1);
            setPageImages(contentImages);
            const prefetches = contentImages.map((url) => Image.prefetch(url));
            Promise.all(prefetches)
              .then(() => setImagesReady(true))
              .catch((e) => {
                console.error("Error prefetching images:", e);
                setImagesReady(true);
              });
          } else {
            setError("Story or page images not found.");
            setImagesReady(true);
          }
        } else {
          setError("Story not found.");
          setImagesReady(true);
        }
      } catch (err) {
        console.error("Error fetching page images:", err);
        setError("Failed to load story pages. Please try again.");
        setImagesReady(true);
      }
      setLoading(false);
    }
    fetchPages();
  }, [storyId]);

  // Auto-play with visual feedback
  useEffect(() => {
    if (imagesReady && pageTexts[currentPage] && !showCompletion) {
      if (currentAudio) {
        currentAudio.stop();
        currentAudio.release();
      }
      
      if (audioData[currentPage]) {
        setIsPlaying(true);
        speakerScale.value = withRepeat(
          withSequence(
            withSpring(1.2, { damping: 10 }),
            withSpring(1, { damping: 10 })
          ),
          3,
          true
        );
        
        playAudio(audioData[currentPage]);
      }
    }
  }, [currentPage, imagesReady, pageTexts, showCompletion]);

  // Cleanup audio when component unmounts or loses focus
  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      if (currentAudio) {
        currentAudio.stop();
        currentAudio.release();
        setCurrentAudio(null); // Clear the audio object
      }
    });

    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', () => {
      if (currentAudio) {
        currentAudio.stop();
        currentAudio.release();
        setCurrentAudio(null);
      }
    });

    return () => {
      if (currentAudio) {
        currentAudio.stop();
        currentAudio.release();
        setCurrentAudio(null);
      }
      unsubscribeBlur();
      unsubscribeBeforeRemove();
    };
  }, [currentAudio, navigation]);

  // Enhanced flip animation with bounce
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${flip.value}deg` },
    ],
  }));

  // Speaker animation
  const speakerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speakerScale.value }],
  }));

  // Button pulse animation
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonPulse.value }],
  }));

  // Star rotation animation
  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${starRotation.value}deg` }],
  }));

  // Sparkle animation
  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  // Completion screen animations
  const completionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completionScale.value }],
  }));

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationBounce.value }],
  }));

  // Enhanced gesture handler with haptic feedback
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      buttonPulse.value = withSpring(0.95);
    },
    onEnd: (event, ctx) => {
      buttonPulse.value = withSpring(1);
      
      if (event.translationX > 80 && currentPage > 0) {
        flip.value = withSpring(180, { damping: 15 }, () => {
          runOnJS(setCurrentPage)(currentPage - 1);
          flip.value = 0;
          runOnJS(() => {
            // Celebrate page turn
            buttonPulse.value = withSequence(
              withSpring(1.1),
              withSpring(1)
            );
          })();
        });
      } else if (event.translationX < -80 && currentPage < pageImages.length - 1) {
        flip.value = withSpring(-180, { damping: 15 }, () => {
          runOnJS(setCurrentPage)(currentPage + 1);
          flip.value = 0;
          runOnJS(() => {
            buttonPulse.value = withSequence(
              withSpring(1.1),
              withSpring(1)
            );
          })();
        });
      }
    },
  });

  // Play audio function
  const playAudio = (audioUrl) => {
    setIsLoadingAudio(true);
    
    // Ensure any currently playing audio is stopped and released immediately
    if (currentAudio) {
      currentAudio.stop();
      currentAudio.release();
      setCurrentAudio(null); // Clear the state immediately
    }

    // Initialize sound with remote URL
    const sound = new Sound(audioUrl.audioUrl, null, (error) => {
      setIsLoadingAudio(false);
      
      if (error) {
        console.error('Failed to load sound:', error);
        setIsPlaying(false);
        speakerScale.value = withSpring(1);
        return;
      }

      setCurrentAudio(sound); // Set the new audio object
      
      // Play the sound
      sound.play((success) => {
        if (success) {
          console.log('Successfully finished playing');
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
        setIsPlaying(false);
        speakerScale.value = withSpring(1);
      });
    });
  };

  // Enhanced navigation functions
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      if (currentAudio) {
        currentAudio.stop();
        currentAudio.release();
        setCurrentAudio(null);
      }
      setShowCompletion(false);
      flip.value = withSpring(180, { damping: 15 }, () => {
        runOnJS(setCurrentPage)(currentPage - 1);
        flip.value = 0;
      });
    }
  };

  const goToNextPage = () => {
    if (currentPage < pageImages.length - 1) {
      if (currentAudio) {
        currentAudio.stop();
        currentAudio.release();
        setCurrentAudio(null);
      }
      setShowCompletion(false);
      flip.value = withSpring(-180, { damping: 15 }, () => {
        runOnJS(setCurrentPage)(currentPage + 1);
        flip.value = 0;
      });
    } else {
      if (currentAudio) {
        currentAudio.stop();
        currentAudio.release();
        setCurrentAudio(null);
      }
      setShowCompletion(true);
      completionScale.value = 0;
      completionScale.value = withSpring(1, { damping: 15 });
    }
  };

  // Enhanced TTS with visual feedback
  const handleSpeak = () => {
    if (!audioData[currentPage]) {
      Alert.alert("No Audio", "No audio is available for this page.");
      return;
    }

    if (isPlaying && currentAudio) {
      currentAudio.stop();
      setIsPlaying(false);
      speakerScale.value = withSpring(1);
      setCurrentAudio(null); // Add this line
    } else {
      playAudio(audioData[currentPage]);
    }
  };

  const handleReadAgain = () => {
    if (currentAudio) {
      currentAudio.stop();
      currentAudio.release();
      setCurrentAudio(null);
    }
    setShowCompletion(false);
    setCurrentPage(0);
  };

  const handleBackToStories = () => {
    if (currentAudio) {
      currentAudio.stop();
      currentAudio.release();
      setCurrentAudio(null);
    }
    navigation.navigate('Home');
  };

  // Completion Screen Component
  const CompletionScreen = () => (
    <Animated.View style={[styles.completionOverlay, completionAnimatedStyle]}>
      <View style={styles.completionContainer}>
        <Text style={styles.completionTitle}>🎉 Story Complete! 🎉</Text>
        
        <Text style={styles.completionMessage}>
          Great job! You finished the story!
        </Text>
        
        <View style={styles.completionButtons}>
          <TouchableOpacity
            style={[styles.completionButton, styles.readAgainButton]}
            onPress={() => {
              if (currentAudio) {
                currentAudio.stop();
                currentAudio.release();
                setCurrentAudio(null);
              }
              navigation.navigate('ComQuestions', { storyId: storyId, storyTitle: storyTitle });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.completionButtonEmoji}>📝</Text>
            <Text style={styles.completionButtonText}>Answer Questions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.completionButton, styles.backButton]}
            onPress={handleBackToStories}
            activeOpacity={0.8}
          >
            <Text style={styles.completionButtonEmoji}>🏠</Text>
            <Text style={styles.completionButtonText}>Back to Stories</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  if (loading || !imagesReady) {
    return (
      <ImageBackground
        source={require('../images/DarkHome.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.centered}>
          <Animated.View style={[styles.loadingContainer, sparkleAnimatedStyle]}>
            <Text style={styles.loadingTitle}>✨ Getting Your Story Ready!</Text>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>
              {loading ? "📚 Loading magical pages..." : "Preparing the images... ✨"}
            </Text>
            <Animated.Text style={[styles.sparkle, starAnimatedStyle]}>⭐</Animated.Text>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    
    <ImageBackground
      source={require('../images/DarkViewStory.png')}
      style={styles.background}
      resizeMode="cover"
    >    
    <AppHeader
              navigation={navigation}
              leftIconType="drawer"
              showSearch={true}
            />  

      <GestureHandlerRootView style={{ flex: 1 }}>
      
        <SafeAreaView style={styles.safeArea}>

           <View style={styles.container}>
            

            {pageImages.length > 0 ? (
              <>
                {/* Story Title and Author */}
                <View style={styles.storyHeader}>
                  {storyTitle ? (
                    <Text style={styles.storyTitle}>{storyTitle}</Text>
                  ) : null}
                  {storyAuthor ? (
                    <Text style={styles.storyAuthor}>by {storyAuthor}</Text>
                  ) : null}
                </View>
              

                {/* Show completion screen when story is finished */}
                {showCompletion && <CompletionScreen />}
                
                {/* Decorative sparkles */}
                <Animated.Text style={[styles.decorativeSparkle, styles.bottomLeft, sparkleAnimatedStyle]}>⭐</Animated.Text>
                <Animated.Text style={[styles.decorativeSparkle, styles.bottomRight, sparkleAnimatedStyle]}>✨</Animated.Text>

                <PanGestureHandler onGestureEvent={gestureHandler}>
                  <Animated.View style={[styles.pageImageContainer, animatedStyle, buttonAnimatedStyle]}>
                    <View style={styles.imageFrame}>
                      <Image
                        source={{ uri: pageImages[currentPage] }}
                        style={styles.pageImage}
                        resizeMode="contain"
                      />
                    </View>
                  </Animated.View>
                </PanGestureHandler>
                

                {/* Enhanced Listen Button */}
                <TouchableOpacity
                  style={styles.listenButton}
                  onPress={handleSpeak}
                  activeOpacity={0.8}
                  disabled={isLoadingAudio}
                >
                  <Animated.View style={[styles.listenButtonContent, speakerAnimatedStyle]}>
                    <Text style={styles.listenButtonEmoji}>
                      {isLoadingAudio ? "⌛" : isPlaying ? "🔊" : "🎧"}
                    </Text>
                    <Text style={styles.listenButtonText}>
                      {isLoadingAudio ? "Loading..." : isPlaying ? "Stop" : "Listen"}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>

                {/* Enhanced Controls */}
                <View style={styles.controls}>
                  <TouchableOpacity
                    style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
                    onPress={goToPreviousPage}
                    disabled={currentPage === 0}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.navButtonText}>{"⬅️ Back"}</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.pageIndicatorContainer}>
                    <Text style={styles.pageIndicator}>
                       Page {currentPage + 1} of {pageImages.length}
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${((currentPage + 1) / pageImages.length) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.navButton, currentPage === pageImages.length - 1 && styles.lastPageButton]}
                    onPress={goToNextPage}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.navButtonText}>
                      {currentPage === pageImages.length - 1 ? "🎉 Finish" : "Next ➡️"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.centered}>
                <Text style={styles.errorTitle}>📚 Oops!</Text>
                <Text style={styles.errorText}>{error || "No pages found for this story."}</Text>
                <Text style={styles.subText}>Let's try again or pick a different story!</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.retryButtonText}>🌟 Choose Another Story</Text>
                </TouchableOpacity>
              </View>
            )}
            
          </View>
          
        </SafeAreaView>
        
      </GestureHandlerRootView>
      
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: { 
    flex: 1 
  },
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
  },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // Story Header Styles
  storyHeader: {
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginTop: 100,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 5,
  },
  storyAuthor: {
    fontSize: 16,
    color: '#4ECDC4',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4ECDC4',
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  sparkle: {
    fontSize: 30,
    position: 'absolute',
    top: -15,
    right: -15,
  },
  // Completion Screen Styles
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  completionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    maxWidth: width * 0.85,
  },
  completionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  completionMessage: {
    fontSize: 16,
    color: '#4ECDC4',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '600',
  },
  completionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  completionButton: {
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  readAgainButton: {
    backgroundColor: '#4ECDC4',
  },
  backButton: {
    backgroundColor: '#FF6B6B',
  },
  completionButtonEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },
  completionButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 20,
  },
  float1: { top: 10, left: 20 },
  float2: { top: 20, right: 15 },
  float3: { bottom: 15, left: 15 },
  float4: { bottom: 10, right: 20 },
  decorativeSparkle: {
    position: 'absolute',
    fontSize: 25,
    zIndex: 1,
  },
  topLeft: { top: 100, left: 20 },
  topRight: { top: 120, right: 30 },
  bottomLeft: { bottom: 160, left: 25 },
  bottomRight: { bottom: 180, right: 20 },
  pageImageContainer: {
    width: width * 0.9,
    height: height * 0.55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  imageFrame: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#FFD700',
    width:'100%',
  },
  pageImage: { 
    width: width * 0.8, 
    height: height * 0.5,
    borderRadius: 10,
  },
  listenButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  listenButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenButtonEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  listenButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "95%",
    marginBottom: 15,
  },
  navButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  lastPageButton: {
    backgroundColor: '#FFD700',
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  pageIndicatorContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 10,
    minWidth: 120,
  },
  pageIndicator: { 
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 5,
  },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  helpText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  errorText: { 
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    padding: 15,
    borderRadius: 10,
  },
  subText: { 
    color: '#4ECDC4',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReadStory;