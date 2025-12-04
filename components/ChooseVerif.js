import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Animated,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { RadioButton } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


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
};

const VERIFICATION_OPTIONS = [
  {
    id: 'email',
    title: 'Send code via Email',
    subtitle: 'We\'ll send a verification code to your registered email address',
    icon: 'mail-outline',
    route: 'EmailVerif',
  },
  {
    id: 'sms',
    title: 'Send code via SMS',
    subtitle: 'We\'ll send a verification code to your registered phone number',
    icon: 'phone-portrait-outline',
    route: 'ContactVerif',
  },
];


const useVerificationAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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

  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    startEntranceAnimation,
    createPressAnimation,
  };
};


const RadioOptionCard = ({ 
  option, 
  isSelected, 
  onPress, 
  animatedScale,
  disabled = false 
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress(option.id);
    }
  }, [option.id, onPress, disabled]);

  return (
    <Animated.View style={[{ transform: [{ scale: animatedScale }] }]}>
      <TouchableOpacity
        style={[
          styles.radioCard,
          isSelected && styles.radioCardSelected,
          disabled && styles.radioCardDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${option.title}. ${option.subtitle}`}
        accessibilityHint="Tap to select this verification method"
      >
        <View style={styles.radioCardContent}>
          <View style={styles.radioCardLeft}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={option.icon} 
                size={24} 
                color={isSelected ? COLORS.primary : COLORS.gray} 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[
                styles.radioTitle,
                isSelected && styles.radioTitleSelected,
                disabled && styles.textDisabled,
              ]}>
                {option.title}
              </Text>
              <Text style={[
                styles.radioSubtitle,
                disabled && styles.textDisabled,
              ]}>
                {option.subtitle}
              </Text>
            </View>
          </View>
          <RadioButton
            value={option.id}
            status={isSelected ? "checked" : "unchecked"}
            onPress={handlePress}
            color={COLORS.primary}
            uncheckedColor={COLORS.gray}
            disabled={disabled}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};


const UserInfoCard = ({ userName, userAvatar, fadeAnim }) => (
  <Animated.View 
    style={[
      styles.userInfoCard,
      { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      })}] }
    ]}
  >
    <View style={styles.avatarContainer}>
      {userAvatar ? (
        <Image source={userAvatar} style={styles.userAvatar} />
      ) : (
        <View style={styles.defaultAvatar}>
          <Ionicons name="person" size={24} color={COLORS.gray} />
        </View>
      )}
    </View>
    <Text style={styles.userName}>{userName}</Text>
  </Animated.View>
);

const ChooseVerif = ({ navigation, route }) => {
  
  const { 
    userName = "James Magno Espina", 
    userEmail = "james@example.com",
    userPhone = "+63 912 345 6789",
    userAvatar 
  } = route?.params || {};

  const [selectedOption, setSelectedOption] = useState("email");
  const [isLoading, setIsLoading] = useState(false);

  
  const { 
    fadeAnim, 
    slideAnim, 
    scaleAnim, 
    startEntranceAnimation, 
    createPressAnimation 
  } = useVerificationAnimations();

  
  const notYouButtonScale = useRef(new Animated.Value(1)).current;
  const continueButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startEntranceAnimation();
  }, [startEntranceAnimation]);

  const handleOptionSelect = useCallback((optionId) => {
    setSelectedOption(optionId);
    
    if (Platform.OS === 'ios') {
      
    }
  }, []);

  const handleNotYou = useCallback(() => {
    createPressAnimation(notYouButtonScale).start();
    
    Alert.alert(
      "Change Account",
      "Are you sure you want to go back and sign in with a different account?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, go back",
          style: "destructive",
          onPress: () => navigation.navigate("ForgotPass")
        }
      ]
    );
  }, [navigation, createPressAnimation, notYouButtonScale]);

  const handleContinue = useCallback(async () => {
    createPressAnimation(continueButtonScale).start();
    
    const selectedVerificationOption = VERIFICATION_OPTIONS.find(
      option => option.id === selectedOption
    );

    if (!selectedVerificationOption) {
      Alert.alert("Error", "Please select a verification method.");
      return;
    }

    setIsLoading(true);

    try {
      
      await new Promise(resolve => setTimeout(resolve, 800));

      
      navigation.navigate(selectedVerificationOption.route, {
        userName,
        userEmail,
        userPhone,
        verificationType: selectedOption,
        contactInfo: selectedOption === 'email' ? userEmail : userPhone,
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedOption, navigation, userName, userEmail, userPhone, createPressAnimation, continueButtonScale]);

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
          {/* User Info */}
          <UserInfoCard 
            userName={userName}
            userAvatar={userAvatar}
            fadeAnim={fadeAnim}
          />

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Choose your verification</Text>
            <Text style={styles.subheading}>
              How would you like to receive your password reset code?
            </Text>
          </View>

          {/* Verification Options */}
          <View style={styles.optionsContainer}>
            {VERIFICATION_OPTIONS.map((option) => (
              <RadioOptionCard
                key={option.id}
                option={option}
                isSelected={selectedOption === option.id}
                onPress={handleOptionSelect}
                animatedScale={scaleAnim}
                disabled={isLoading}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Animated.View style={[{ transform: [{ scale: notYouButtonScale }] }]}>
              <TouchableOpacity
                style={[styles.notYouButton, isLoading && styles.buttonDisabled]}
                onPress={handleNotYou}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Not you? Go back to sign in with different account"
              >
                <Text style={[
                  styles.notYouButtonText,
                  isLoading && styles.textDisabled
                ]}>
                  Not you?
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[{ transform: [{ scale: continueButtonScale }] }]}>
              <TouchableOpacity
                style={[styles.continueButton, isLoading && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Continue with selected verification method"
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.continueButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
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
  
  
  userInfoCard: {
    alignItems: "center",
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: '100%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  userName: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: 'Fredoka-SemiBold',
    textAlign: 'center',
  },

  
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

  
  optionsContainer: {
    width: "100%",
    marginBottom: 30,
  },
  radioCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  radioCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white, 
  },
  radioCardDisabled: {
    opacity: 0.6,
  },
  radioCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radioCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  radioTitleSelected: {
    color: COLORS.primary,
  },
  radioSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 18,
  },
  textDisabled: {
    color: COLORS.gray,
  },

  
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 20,
  },
  notYouButton: {
    flex: 1,
    paddingHorizontal: 20,
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
  notYouButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  continueButton: {
    flex: 1,
    paddingHorizontal: 20,
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
  continueButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
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

export default ChooseVerif;