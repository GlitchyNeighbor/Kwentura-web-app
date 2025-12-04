import React, { useEffect, useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ForgotPasswordComplete = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const checkIconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      // Animate check icon
      Animated.spring(checkIconAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Slide up text and button
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, []);

  const handleLoginPress = () => {
    // Add haptic feedback if available
    if (typeof Haptics !== 'undefined') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate('Login');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../images/NewBackground.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <Animated.View style={[styles.decorativeContainer, { opacity: fadeAnim }]}>
          <View style={styles.bushContainer}>
            <Image source={require('../images/Bush.png')} style={styles.bush1} />
            <Image source={require('../images/Bush.png')} style={styles.bush2} />
            <Image source={require('../images/Bush.png')} style={styles.bush3} />
          </View>

          <View style={styles.flowerContainer}>
            <Image source={require('../images/Flower1.png')} style={styles.flower1} />
            <Image source={require('../images/Flower2.png')} style={styles.flower2} />
            <Image source={require('../images/Flower3.png')} style={styles.flower3} />
            <Image source={require('../images/Flower4.png')} style={styles.flower4} />
            <Image source={require('../images/Flower5.png')} style={styles.flower5} />
          </View>

          <Image source={require('../images/Star.png')} style={styles.star1} />
          <Image source={require('../images/Star.png')} style={styles.star2} />
          <Image source={require('../images/Star.png')} style={styles.star3} />
          <Image source={require('../images/Star.png')} style={styles.star4} />

          <Image source={require('../images/Rainbow.png')} style={styles.rainbow} />
        </Animated.View>

        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Animated.Text 
              style={[
                styles.heading, 
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }] 
                }
              ]}
            >
              Password Updated
            </Animated.Text>

            <Animated.View 
              style={[
                styles.circle, 
                { 
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim
                }
              ]}
            >
              <Animated.View
                style={{
                  transform: [
                    { 
                      scale: checkIconAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.2, 1]
                      })
                    }
                  ]
                }}
              >
                <MaterialIcons 
                  name="check" 
                  size={80} 
                  color="white" 
                  style={styles.checkIcon} 
                />
              </Animated.View>
            </Animated.View>

            <Animated.Text 
              style={[
                styles.subheading,
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }] 
                }
              ]}
            >
              Your password has been changed successfully.{'\n'}
              You can now login with your new password.
            </Animated.Text>

            <Animated.View 
              style={[
                styles.buttonContainer,
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }] 
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLoginPress}
                activeOpacity={0.8}
                accessibilityLabel="Login button"
                accessibilityHint="Navigate to login screen"
              >
                <Text style={styles.loginButtonText}>Continue to Login</Text>
                <MaterialIcons 
                  name="arrow-forward" 
                  size={20} 
                  color="white" 
                  style={styles.buttonIcon} 
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  rainbow: {
    position: 'absolute',
    top: -height * 0.15,
    width: '100%',
    height: height * 0.3,
    alignSelf: 'center',
  },
  star1: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.2,
    width: 15,
    height: 15,
  },
  star2: {
    position: 'absolute',
    top: height * 0.13,
    right: width * 0.03,
    width: 15,
    height: 15,
  },
  star3: {
    position: 'absolute',
    top: height * 0.13,
    left: width * 0.05,
    width: 10,
    height: 10,
  },
  star4: {
    position: 'absolute',
    top: height * 0.13,
    right: width * 0.38,
    width: 10,
    height: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: '100%',
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Fredoka-SemiBold',
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 40,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 16,
    color: "#4A5568",
    width: "85%",
    textAlign: "center",
    marginTop: 30,
    lineHeight: 24,
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 40,
    width: "85%",
  },
  loginButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#FFCF2D",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    shadowColor: "#FFCF2D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#4FD1C7",
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#4FD1C7",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  checkIcon: {
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  flowerContainer: {
    position: 'absolute',
    bottom: -20,
    left: -40,
    right: -40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  flower1: {
    width: width * 0.28,
    height: width * 0.28,
    left: width * 0.1,
    bottom: -height * 0.05,
    transform: [{ rotate: '50deg' }],
  },
  flower2: {
    width: width * 0.25,
    height: width * 0.25,
    left: width * 0.07,
    bottom: -height * 0.075,
  },
  flower3: {
    width: width * 0.25,
    height: width * 0.25,
    left: width * 0.02,
    bottom: -height * 0.075,
  },
  flower4: {
    width: width * 0.25,
    height: width * 0.25,
    right: width * 0.05,
    bottom: -height * 0.06,
  },
  flower5: {
    width: width * 0.33,
    height: width * 0.33,
    right: width * 0.1,
    bottom: -height * 0.125,
    transform: [{ rotate: '-20deg' }],
  },
  bushContainer: {
    position: 'absolute',
    bottom: -height * 0.02,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  bush1: {
    width: width * 0.5,
    height: height * 0.12,
    bottom: -height * 0.1,
    left: -width * 0.1,
  },
  bush2: {
    width: width * 0.5,
    height: height * 0.12,
    bottom: -height * 0.1,
    left: -width * 0.2,
  },
  bush3: {
    width: width * 0.5,
    height: height * 0.12,
    bottom: -height * 0.1,
    right: width * 0.3,
  },
});

export default ForgotPasswordComplete;