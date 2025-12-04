import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../FirebaseConfig";

const RegisterComplete = ({ navigation }) => {

  const handleGoToLogin = async () => {
    try {
      // Sign out the user before going to login
      await firebaseSignOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error("Sign out failed:", error);
      Alert.alert(
        "Sign Out Error",
        "There was an issue signing you out. Please try again.",
        [
          { 
            text: "Try Again", 
            onPress: handleGoToLogin 
          },
          { 
            text: "Continue Anyway", 
            onPress: () => navigation.navigate('Login') 
          }
        ]
      );
    }
  };

  return (
    <ImageBackground
      source={require('../images/Signup.png')}
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

      <Image source={require('../images/Star.png')} style={styles.star1} />
      <Image source={require('../images/Star.png')} style={styles.star2} />
      <Image source={require('../images/Star.png')} style={styles.star3} />
      <Image source={require('../images/Star.png')} style={styles.star4} />

      <Image source={require('../images/Rainbow.png')} style={styles.rainbow} /> 
      
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.heading}>You're all set!</Text>
          <View style={styles.successCircle}>
            <MaterialIcons 
              name="check" 
              size={100} 
              color="white"
              accessibilityLabel="Success checkmark"
            />
          </View>
        </View>

        <Text style={styles.subheading}>
          Your registration is complete! Please wait for account approval from your section adviser before logging in.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleGoToLogin}
            accessibilityLabel="Return to login screen"
            accessibilityRole="button"
            accessibilityHint="Signs you out and returns to the login screen"
          >
            <Text style={styles.loginButtonText}>Go back to login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  rainbow: {
    position: 'absolute',
    top: -130,
    width: '100%',
    height: '30%',
    alignSelf: 'center',
  },
  
  // Star positioning
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

  // Main content
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    marginBottom: 30,
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Fredoka-SemiBold',
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  subheading: {
    fontSize: 16,
    color: "#555",
    width: "85%",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  
  // Success circle
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFCF2D",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  
  // Button styling
  buttonContainer: {
    width: "85%",
    alignItems: "center",
  },
  loginButton: {
    width: "100%",
    paddingVertical: 18,
    backgroundColor: "#FFCF2D",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  
  // Flower positioning
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
  
  // Bush positioning
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

export default RegisterComplete;