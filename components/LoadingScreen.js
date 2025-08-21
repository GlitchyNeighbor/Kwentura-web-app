import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ loadingText = "Discovering amazing stories..." }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [bookAnim] = useState(new Animated.Value(0));
  const [dotAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));
  const [currentDot, setCurrentDot] = useState(0);

  useEffect(() => {
    // Main container animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Book floating animation
    const bookFloat = Animated.loop(
      Animated.sequence([
        Animated.timing(bookAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(bookAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    bookFloat.start();

    // Progress bar animation
    const progressLoop = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      })
    );
    progressLoop.start();

    // Dots animation
    const dotAnimation = () => {
      Animated.timing(dotAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentDot((prev) => (prev + 1) % 3);
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(dotAnimation, 200);
        });
      });
    };
    dotAnimation();

    return () => {
      bookFloat.stop();
      progressLoop.stop();
    };
  }, []);

  const bookTranslateY = bookAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderLoadingBooks = () => {
    const books = ['📚', '📖', '📓', '📒', '📕'];
    return books.map((book, index) => (
      <Animated.View
        key={index}
        style={[
          styles.floatingBook,
          {
            left: (width / 6) * (index + 1),
            transform: [
              {
                translateY: bookAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10 - (index * 5)],
                }),
              },
              {
                rotate: bookAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${(index - 2) * 5}deg`],
                }),
              },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.bookEmoji}>{book}</Text>
      </Animated.View>
    ));
  };

  const renderLoadingDots = () => {
    return Array.from({ length: 3 }, (_, index) => (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            opacity: currentDot === index ? 1 : 0.3,
            transform: [
              {
                scale: currentDot === index ? 1.5 : 1,
              },
            ],
          },
        ]}
      />
    ));
  };

  return (
    <ImageBackground
      source={require('../images/About.png')} // Adjust path as needed
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Main Loading Content */}
          <View style={styles.contentContainer}>
            {/* Floating Books Animation */}
            <View style={styles.booksContainer}>
              {renderLoadingBooks()}
            </View>

            {/* Central Icon with Glow Effect */}
            <View style={styles.centralIconContainer}>
              <LinearGradient
                colors={['#FFCF2D', '#FF9A3D', '#FF6B6B']}
                style={styles.glowCircle}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [{ translateY: bookTranslateY }],
                    },
                  ]}
                >
                  <Ionicons name="library" size={40} color="#FFFFFF" />
                </Animated.View>
              </LinearGradient>
              
              {/* Ripple Effect */}
              <Animated.View
                style={[
                  styles.ripple,
                  {
                    transform: [
                      {
                        scale: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5],
                        }),
                      },
                    ],
                    opacity: progressAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.7, 0.3, 0],
                    }),
                  },
                ]}
              />
            </View>

            {/* Loading Text with Typewriter Effect */}
            <Animated.View
              style={[
                styles.textContainer,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.loadingTitle}>StoryLand</Text>
              <View style={styles.loadingTextContainer}>
                <Text style={styles.loadingText}>{loadingText}</Text>
                <View style={styles.dotsContainer}>
                  {renderLoadingDots()}
                </View>
              </View>
            </Animated.View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { width: progressWidth }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>Loading stories...</Text>
            </View>

            {/* Decorative Elements
            <View style={styles.decorativeElements}>
              {['⭐', '✨', '🌟', '💫'].map((star, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.decorativeStar,
                    {
                      top: (index % 2) * 100 + 20,
                      left: (index * 80) + 20,
                      opacity: fadeAnim,
                      transform: [
                        {
                          rotate: bookAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.starEmoji}>{star}</Text>
                </Animated.View>
              ))}
            </View> */}
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingContainer: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  booksContainer: {
    width: width,
    height: 60,
    position: 'absolute',
    top: 50,
  },
  floatingBook: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookEmoji: {
    fontSize: 24,
  },
  centralIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  glowCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFCF2D',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FFCF2D',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingTitle: {
    fontSize: 28,
    fontFamily: 'Fredoka-Bold',
    color: '#FF6B6B',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Fredoka-Medium',
    color: '#666',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFCF2D',
    marginHorizontal: 2,
  },
  progressBarContainer: {
    width: width * 0.7,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 207, 45, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFCF2D',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Fredoka-Regular',
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  decorativeStar: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starEmoji: {
    fontSize: 16,
  },
});

export default LoadingScreen;