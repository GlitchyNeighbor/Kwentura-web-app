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
  warning: '#FF9800',
};


const checkPasswordStrength = (password) => {
  let strength = 0;
  let feedback = [];

  if (password.length >= 8) {
    strength += 1;
  } else {
    feedback.push("At least 8 characters");
  }

  if (/[a-z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push("One lowercase letter");
  }

  if (/[A-Z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push("One uppercase letter");
  }

  if (/\d/.test(password)) {
    strength += 1;
  } else {
    feedback.push("One number");
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 1;
  } else {
    feedback.push("One special character");
  }

  const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [COLORS.error, COLORS.error, COLORS.warning, COLORS.primary, COLORS.success];

  return {
    score: strength,
    level: levels[strength] || 'Very Weak',
    color: colors[strength] || COLORS.error,
    feedback: feedback.slice(0, 2), 
  };
};


const useNewPassAnimations = () => {
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


const PasswordStrengthIndicator = ({ password }) => {
  const strength = checkPasswordStrength(password);
  
  if (!password) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthHeader}>
        <Text style={styles.strengthLabel}>Password Strength: </Text>
        <Text style={[styles.strengthLevel, { color: strength.color }]}>
          {strength.level}
        </Text>
      </View>
      <View style={styles.strengthBar}>
        {[...Array(5)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.strengthBarSegment,
              { backgroundColor: index < strength.score ? strength.color : COLORS.lightGray }
            ]}
          />
        ))}
      </View>
      {strength.feedback.length > 0 && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Add:</Text>
          {strength.feedback.map((item, index) => (
            <Text key={index} style={styles.feedbackItem}>• {item}</Text>
          ))}
        </View>
      )}
    </View>
  );
};


const PasswordInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  showPassword, 
  onTogglePassword,
  hasError,
  shakeAnim,
  inputRef,
  onSubmitEditing,
  returnKeyType = "next"
}) => (
  <Animated.View 
    style={[
      styles.inputContainer,
      hasError && styles.inputContainerError,
      { transform: [{ translateX: shakeAnim }] }
    ]}
  >
    <View style={styles.inputIconContainer}>
      <Ionicons name="lock-closed" size={20} color={COLORS.gray} />
    </View>
    <TextInput
      ref={inputRef}
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={COLORS.gray}
      secureTextEntry={!showPassword}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      accessibilityLabel={placeholder}
      accessibilityHint="Enter your password"
    />
    <TouchableOpacity 
      onPress={onTogglePassword}
      style={styles.eyeIconContainer}
      accessibilityRole="button"
      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
    >
      <Ionicons
        name={showPassword ? "eye-off" : "eye"}
        size={20}
        color={COLORS.gray}
      />
    </TouchableOpacity>
  </Animated.View>
);

const NewPass = ({ navigation, route }) => {
  
  const { 
    userName = "User",
    userEmail = "",
    phoneNumber = "",
    isVerified = false
  } = route?.params || {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  
  const { 
    fadeAnim, 
    slideAnim, 
    scaleAnim, 
    shakeAnim,
    startEntranceAnimation, 
    createPressAnimation,
    createShakeAnimation
  } = useNewPassAnimations();

  
  const cancelButtonScale = useRef(new Animated.Value(1)).current;
  const updateButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startEntranceAnimation();
  }, [startEntranceAnimation]);

  const handleNewPasswordChange = useCallback((text) => {
    setNewPassword(text);
    if (hasError) {
      setHasError(false);
    }
  }, [hasError]);

  const handleConfirmPasswordChange = useCallback((text) => {
    setConfirmPassword(text);
    if (hasError) {
      setHasError(false);
    }
  }, [hasError]);

  const validatePasswords = () => {
    const strength = checkPasswordStrength(newPassword);
    
    if (!newPassword) {
      return { isValid: false, message: "Please enter a new password." };
    }
    
    if (strength.score < 3) {
      return { isValid: false, message: "Password is too weak. Please choose a stronger password." };
    }
    
    if (!confirmPassword) {
      return { isValid: false, message: "Please confirm your password." };
    }
    
    if (newPassword !== confirmPassword) {
      return { isValid: false, message: "Passwords do not match. Please try again." };
    }
    
    return { isValid: true, message: "" };
  };

  const handleCancel = useCallback(() => {
    createPressAnimation(cancelButtonScale).start();
    
    Alert.alert(
      "Cancel Password Reset",
      "Are you sure you want to cancel? Your progress will be lost.",
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

  const handleUpdate = useCallback(async () => {
    Keyboard.dismiss();
    
    const validation = validatePasswords();
    
    if (!validation.isValid) {
      setHasError(true);
      createShakeAnimation().start();
      Alert.alert(
        "Invalid Password", 
        validation.message,
        [{ text: "OK", onPress: () => newPasswordRef.current?.focus() }]
      );
      return;
    }

    createPressAnimation(updateButtonScale).start();
    setIsLoading(true);

    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      
      const isSuccess = Math.random() > 0.1; 
      
      if (isSuccess) {
        Alert.alert(
          "Password Updated Successfully", 
          "Your password has been updated. You can now sign in with your new password.",
          [{ 
            text: "Continue", 
            onPress: () => navigation.navigate("ForgotPassComplete", { 
              userName,
              userEmail,
              phoneNumber,
              passwordUpdated: true 
            })
          }]
        );
      } else {
        Alert.alert(
          "Update Failed", 
          "Failed to update your password. Please try again.",
          [{ text: "OK", onPress: () => newPasswordRef.current?.focus() }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [newPassword, confirmPassword, navigation, userName, userEmail, phoneNumber, createPressAnimation, updateButtonScale, createShakeAnimation]);

  const handleNewPasswordSubmit = useCallback(() => {
    confirmPasswordRef.current?.focus();
  }, []);

  const handleConfirmPasswordSubmit = useCallback(() => {
    handleUpdate();
  }, [handleUpdate]);

  
  const isFormValid = newPassword && confirmPassword && newPassword === confirmPassword && checkPasswordStrength(newPassword).score >= 3;

  return (
    <ImageBackground
      source={require('../images/NewBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
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
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="key" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.heading}>Set Your New Password</Text>
            <Text style={styles.subheading}>
              Create a strong password to secure your account. Please do not share your password with others.
            </Text>
          </View>

          <View style={styles.inputsContainer}>
            <PasswordInput
              placeholder="New password"
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              showPassword={showNewPassword}
              onTogglePassword={() => setShowNewPassword(!showNewPassword)}
              hasError={hasError}
              shakeAnim={shakeAnim}
              inputRef={newPasswordRef}
              onSubmitEditing={handleNewPasswordSubmit}
              returnKeyType="next"
            />

            <PasswordStrengthIndicator password={newPassword} />

            <PasswordInput
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              hasError={hasError}
              shakeAnim={shakeAnim}
              inputRef={confirmPasswordRef}
              onSubmitEditing={handleConfirmPasswordSubmit}
              returnKeyType="done"
            />

            {confirmPassword && (
              <View style={styles.matchContainer}>
                <Ionicons 
                  name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={newPassword === confirmPassword ? COLORS.success : COLORS.error} 
                />
                <Text style={[
                  styles.matchText, 
                  { color: newPassword === confirmPassword ? COLORS.success : COLORS.error }
                ]}>
                  {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Animated.View style={[{ transform: [{ scale: cancelButtonScale }] }]}>
              <TouchableOpacity
                style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
                onPress={handleCancel}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Cancel password reset"
              >
                <Text style={[
                  styles.cancelButtonText,
                  isLoading && styles.textDisabled
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[{ transform: [{ scale: updateButtonScale }] }]}>
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  (isLoading || !isFormValid) && styles.buttonDisabled
                ]}
                onPress={handleUpdate}
                disabled={isLoading || !isFormValid}
                accessibilityRole="button"
                accessibilityLabel="Update password"
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.updateButtonText}>Updating...</Text>
                  </View>
                ) : (
                  <Text style={styles.updateButtonText}>Update Password</Text>
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

  
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 207, 45, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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

  
  inputsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    height: 56,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: COLORS.black,
  },
  eyeIconContainer: {
    padding: 4,
    marginLeft: 8,
  },

  
  strengthContainer: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  strengthLevel: {
    fontSize: 14,
    fontWeight: '600',
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  strengthBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  feedbackContainer: {
    marginTop: 4,
  },
  feedbackTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  feedbackItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },

  
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  matchText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },

  
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
  updateButton: {
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
  updateButtonText: {
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

export default NewPass;