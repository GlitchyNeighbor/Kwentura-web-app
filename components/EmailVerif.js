import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Alert,
  Keyboard,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// Constants
const COLORS = {
  primary: '#FFCF2D',
  primaryDark: '#E6B800',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#666666',
  lightGray: '#F5F5F5',
  yellow: '#FFEA00',
  transparent: 'transparent',
  shadow: 'rgba(0, 0, 0, 0.1)',
  textSecondary: '#333333',
  success: '#4CAF50',
  error: '#F44336',
  border: '#E0E0E0',
};

// Custom hook for animations
const useEmailVerifAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const startEntranceAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const createPressAnimation = (animValue) => {
    return Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);
  };

  const createShakeAnimation = () => {
    return Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);
  };

  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    shakeAnim,
    startEntranceAnimation,
    createPressAnimation,
    createShakeAnimation,
  };
};

// Enhanced Email Display Component
const EmailDisplayCard = ({ email, fadeAnim }) => (
  <Animated.View 
    style={[
      styles.emailCard,
      { 
        opacity: fadeAnim, 
        transform: [{ 
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          })
        }] 
      }
    ]}
  >
    <View style={styles.emailIconContainer}>
      <Ionicons name="mail" size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.emailText}>{email}</Text>
  </Animated.View>
);

// Enhanced Code Input Component
const CodeInput = ({ 
  value, 
  onChangeText, 
  hasError, 
  shakeAnim, 
  onSubmitEditing,
  inputRef 
}) => (
  <Animated.View 
    style={[
      styles.inputContainer,
      { transform: [{ translateX: shakeAnim }] }
    ]}
  >
    <TextInput
      ref={inputRef}
      style={[
        styles.input,
        hasError && styles.inputError,
        value.length > 0 && styles.inputActive,
      ]}
      placeholder="Enter verification code"
      placeholderTextColor={COLORS.gray}
      keyboardType="numeric"
      value={value}
      onChangeText={onChangeText}
      maxLength={6}
      autoFocus={true}
      returnKeyType="done"
      onSubmitEditing={onSubmitEditing}
      accessibilityLabel="Verification code input"
      accessibilityHint="Enter the 6-digit code sent to your email"
    />
    <View style={styles.inputIcon}>
      {value.length === 6 ? (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      ) : (
        <Ionicons name="keypad" size={20} color={COLORS.gray} />
      )}
    </View>
  </Animated.View>
);

// Enhanced Resend Component
const ResendComponent = ({ onResend, countdown, isResending }) => (
  <View style={styles.resendContainer}>
    <View style={styles.resendTextContainer}>
      <Text style={styles.resendText}>Didn't receive the code? </Text>
      {countdown > 0 ? (
        <Text style={styles.countdownText}>
          Resend in {countdown}s
        </Text>
      ) : (
        <TouchableOpacity 
          onPress={onResend} 
          disabled={isResending}
          accessibilityRole="button"
          accessibilityLabel="Resend verification code"
          style={styles.resendLinkContainer}
        >
          <Text style={[
            styles.resendLink,
            isResending && styles.resendLinkDisabled
          ]}>
            {isResending ? 'Sending...' : 'Resend'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const EmailVerif = ({ navigation, route }) => {
  // Extract data from route params
  const { 
    userName = "User",
    userEmail = "youremail@gmail.com",
    verificationType = "email"
  } = route?.params || {};

  const [code, setCode] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRef = useRef(null);

  // Animation hooks
  const { 
    fadeAnim, 
    slideAnim, 
    scaleAnim, 
    shakeAnim,
    startEntranceAnimation, 
    createPressAnimation,
    createShakeAnimation
  } = useEmailVerifAnimations();

  // Button animation values
  const cancelButtonScale = useRef(new Animated.Value(1)).current;
  const verifyButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startEntranceAnimation();
  }, [startEntranceAnimation]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = useCallback((text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setCode(numericText);
    if (hasError) {
      setHasError(false);
    }
  }, [hasError]);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCountdown(60);
      Alert.alert(
        "Code Sent", 
        "A new verification code has been sent to your email.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [countdown, isResending]);

  const handleCancel = useCallback(() => {
    createPressAnimation(cancelButtonScale).start();
    
    Alert.alert(
      "Cancel Verification",
      "Are you sure you want to cancel the verification process?",
      [
        { text: "Stay", style: "cancel" },
        { 
          text: "Cancel", 
          style: "destructive",
          onPress: () => navigation.goBack()
        }
      ]
    );
  }, [navigation, createPressAnimation, cancelButtonScale]);

  const validateCode = (inputCode) => {
    return inputCode.length === 6 && /^\d+$/.test(inputCode);
  };

  const handleVerify = useCallback(async () => {
    Keyboard.dismiss();
    
    if (!validateCode(code)) {
      setHasError(true);
      createShakeAnimation().start();
      Alert.alert(
        "Invalid Code", 
        "Please enter a valid 6-digit verification code.",
        [{ text: "OK", onPress: () => inputRef.current?.focus() }]
      );
      return;
    }

    createPressAnimation(verifyButtonScale).start();
    setIsLoading(true);

    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success/failure
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      
      if (isSuccess) {
        Alert.alert(
          "Verification Successful", 
          "Your email has been verified successfully!",
          [{ 
            text: "Continue", 
            onPress: () => navigation.navigate("NewPass", { 
              userName,
              userEmail,
              isVerified: true 
            })
          }]
        );
      } else {
        setHasError(true);
        createShakeAnimation().start();
        Alert.alert(
          "Verification Failed", 
          "The code you entered is incorrect. Please try again.",
          [{ text: "OK", onPress: () => inputRef.current?.focus() }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [code, navigation, userName, userEmail, createPressAnimation, verifyButtonScale, createShakeAnimation]);

  const handleSubmitEditing = useCallback(() => {
    if (code.length === 6) {
      handleVerify();
    }
  }, [code, handleVerify]);

  return (
    <ImageBackground
      source={require('../images/NewBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Decorative Elements */}
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

      {/* Stars */}
      {[1, 2, 3, 4].map(index => (
        <Image 
          key={`star-${index}`}
          source={require('../images/Star.png')} 
          style={styles[`star${index}`]} 
        />
      ))}

      <Image source={require('../images/Rainbow.png')} style={styles.rainbow} />

      <SafeAreaView style={styles.container}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          {/* Email Display */}
          <EmailDisplayCard email={userEmail} fadeAnim={fadeAnim} />

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Email Code Verification</Text>
            <Text style={styles.subheading}>
              Enter the 6-digit code we just sent to your email address.
            </Text>
          </View>

          {/* Code Input */}
          <CodeInput
            value={code}
            onChangeText={handleCodeChange}
            hasError={hasError}
            shakeAnim={shakeAnim}
            onSubmitEditing={handleSubmitEditing}
            inputRef={inputRef}
          />

          {/* Resend Component */}
          <ResendComponent
            onResend={handleResend}
            countdown={countdown}
            isResending={isResending}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Animated.View style={[{ transform: [{ scale: cancelButtonScale }] }]}>
              <TouchableOpacity
                style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
                onPress={handleCancel}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Cancel verification process"
              >
                <Text style={[
                  styles.cancelButtonText,
                  isLoading && styles.textDisabled
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[{ transform: [{ scale: verifyButtonScale }] }]}>
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (isLoading || code.length < 6) && styles.buttonDisabled
                ]}
                onPress={handleVerify}
                disabled={isLoading || code.length < 6}
                accessibilityRole="button"
                accessibilityLabel="Verify the entered code"
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.verifyButtonText}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },

  // Email Display Styles
  emailCard: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    marginBottom: 30,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: '100%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emailText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: COLORS.black,
    textAlign: "center",
    flex: 1,
  },

  // Header Styles
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Fredoka-SemiBold',
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  // Input Styles
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingRight: 50,
    backgroundColor: COLORS.white,
    height: 56,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputActive: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },

  // Resend Styles
  resendContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  resendTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  resendLinkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  resendLinkDisabled: {
    color: COLORS.gray,
    textDecorationLine: "none",
  },
  countdownText: {
    color: COLORS.gray,
    fontWeight: "500",
    fontSize: 14,
  },

  // Button Styles
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  verifyButton: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  textDisabled: {
    color: COLORS.gray,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Decorative Elements (keeping original positioning)
  rainbow: {
    position: 'absolute',
    top: -130,
    width: '100%',
    height: '30%',
    alignSelf: 'center',
  },
  star1: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    width: 15,
    height: 15,
  },
  star2: {
    position: 'absolute',
    top: '13%',
    right: '3%',
    width: 15,
    height: 15,
  },
  star3: {
    position: 'absolute',
    top: '13%',
    left: '5%',
    width: 10,
    height: 10,
  },
  star4: {
    position: 'absolute',
    top: '13%',
    right: '38%',
    width: 10,
    height: 10,
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
    width: 110,
    height: 110,
    left: '10%',
    bottom: '-10%',
    transform: [{ rotate: '50deg' }],
  },
  flower2: {
    width: 100,
    height: 100,
    left: '7%',
    bottom: '-15%',
  },
  flower3: {
    width: 100,
    height: 100,
    left: '2%',
    bottom: '-15%',
  },
  flower4: {
    width: 100,
    height: 100,
    right: '5%',
    bottom: '-11.5%'
  },
  flower5: {
    width: 130,
    height: 130,
    right: '10%',
    bottom: '-25%',
    transform: [{ rotate: '-20deg' }]
  },
  bushContainer: {
    position: 'absolute',
    bottom: '-2%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  bush1: {
    width: 200,
    height: 100,
    bottom: '-20%',
    left: '-10%'
  },
  bush2: {
    width: 200,
    height: 100,
    bottom: '-20%',
    left: '-20%',
  },
  bush3: {
    width: 200,
    height: 100,
    bottom: '-20%',
    right: '30%'
  },
});

export default EmailVerif;