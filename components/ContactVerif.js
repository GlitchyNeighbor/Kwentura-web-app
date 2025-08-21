import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
  Animated,
  Alert,
  Keyboard,
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
const useContactVerifAnimations = () => {
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

// Enhanced Phone Display Component
const PhoneDisplayCard = ({ phoneNumber, fadeAnim }) => (
  <Animated.View 
    style={[
      styles.phoneCard,
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
    <View style={styles.phoneIconContainer}>
      <Ionicons name="phone-portrait" size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.phoneText}>{phoneNumber}</Text>
  </Animated.View>
);

// Enhanced Code Input Component
const CodeInputs = ({ 
  code, 
  onChangeText, 
  hasError, 
  shakeAnim, 
  inputRefs 
}) => (
  <Animated.View 
    style={[
      styles.codeContainer,
      { transform: [{ translateX: shakeAnim }] }
    ]}
  >
    {code.map((digit, index) => (
      <TextInput
        key={index}
        ref={(ref) => (inputRefs.current[`input-${index}`] = ref)}
        style={[
          styles.codeInput,
          hasError && styles.codeInputError,
          digit && styles.codeInputActive,
        ]}
        value={digit}
        onChangeText={(text) => onChangeText(text, index)}
        keyboardType="numeric"
        maxLength={1}
        textAlign="center"
        selectTextOnFocus
        accessibilityLabel={`Verification code digit ${index + 1}`}
        accessibilityHint={`Enter digit ${index + 1} of the 4-digit verification code`}
      />
    ))}
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

const ContactVerif = ({ navigation, route }) => {
  // Extract data from route params
  const { 
    userName = "User",
    phoneNumber = "+1 (555) 123-4567",
    verificationType = "phone"
  } = route?.params || {};

  const [code, setCode] = useState(["", "", "", ""]);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef({});

  // Animation hooks
  const { 
    fadeAnim, 
    slideAnim, 
    scaleAnim, 
    shakeAnim,
    startEntranceAnimation, 
    createPressAnimation,
    createShakeAnimation
  } = useContactVerifAnimations();

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

  const handleInputChange = useCallback((text, index) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    
    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    if (hasError) {
      setHasError(false);
    }

    // Auto-focus next input
    if (numericText && index < 3) {
      const nextInput = inputRefs.current[`input-${index + 1}`];
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Auto-focus previous input on backspace
    if (!numericText && index > 0) {
      const prevInput = inputRefs.current[`input-${index - 1}`];
      if (prevInput) {
        prevInput.focus();
      }
    }
  }, [code, hasError]);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCountdown(60);
      Alert.alert(
        "Code Sent", 
        "A new verification code has been sent to your phone.",
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
    return inputCode.every(digit => digit !== "") && inputCode.length === 4;
  };

  const handleVerify = useCallback(async () => {
    Keyboard.dismiss();
    
    if (!validateCode(code)) {
      setHasError(true);
      createShakeAnimation().start();
      Alert.alert(
        "Invalid Code", 
        "Please enter a valid 4-digit verification code.",
        [{ text: "OK", onPress: () => inputRefs.current['input-0']?.focus() }]
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
          "Your phone number has been verified successfully!",
          [{ 
            text: "Continue", 
            onPress: () => navigation.navigate("NewPass", { 
              userName,
              phoneNumber,
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
          [{ text: "OK", onPress: () => inputRefs.current['input-0']?.focus() }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [code, navigation, userName, phoneNumber, createPressAnimation, verifyButtonScale, createShakeAnimation]);

  // Check if all digits are filled
  const isCodeComplete = code.every(digit => digit !== "");

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
          {/* Phone Display */}
          <PhoneDisplayCard phoneNumber={phoneNumber} fadeAnim={fadeAnim} />

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Mobile Phone Verification</Text>
            <Text style={styles.subheading}>
              Enter the 4-digit code we just sent to your phone number.
            </Text>
          </View>

          {/* Code Input */}
          <CodeInputs
            code={code}
            onChangeText={handleInputChange}
            hasError={hasError}
            shakeAnim={shakeAnim}
            inputRefs={inputRefs}
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
                  (isLoading || !isCodeComplete) && styles.buttonDisabled
                ]}
                onPress={handleVerify}
                disabled={isLoading || !isCodeComplete}
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

  // Phone Display Styles
  phoneCard: {
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
  phoneIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  phoneText: {
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

  // Code Input Styles
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 40,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    textAlign: "center",
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  codeInputActive: {
    borderColor: COLORS.primary,
  },
  codeInputError: {
    borderColor: COLORS.error,
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

  // Decorative Elements
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

export default ContactVerif;