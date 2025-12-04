import React, { useState, useEffect, useContext, useRef } from "react";
import {
  TextInput,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  deleteUser,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  signInWithEmailAndPassword,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig"; 
import Ionicons from "react-native-vector-icons/Ionicons";
import { Checkbox } from "react-native-paper";
import { useAuthFlow } from "../context/AuthFlowContext";

const getFirebaseAuthErrorMessage = (code) => {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/email-already-in-use":
      return "This email address is already registered.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

const Register = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false); 
  const [countdown, setCountdown] = useState(0); 
  const [isCodeSent, setIsCodeSent] = useState(false); 
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const { setIsVerifyingEmail, setRegistrationCompleted } = useAuthFlow();
  const verificationInterval = useRef(null);
  const stopVerification = useRef(false);
  const sessionWarningTimer = useRef(null);

    useEffect(() => {
    return () => {
      stopVerification.current = true;
      if (sessionWarningTimer.current) {
        clearTimeout(sessionWarningTimer.current);
      }
      if (verificationInterval.current) {
        clearInterval(verificationInterval.current);
        verificationInterval.current = null;
      }
    };
  }, []);

  useEffect(() => {
  const preload = async () => {
    await Image.prefetch(Image.resolveAssetSource(require('../images/Signup.png')).uri);
    await Image.prefetch(Image.resolveAssetSource(require('../images/Bush.png')).uri);
    await Image.prefetch(Image.resolveAssetSource(require('../images/Flower1.png')).uri);
    await Image.prefetch(Image.resolveAssetSource(require('../images/Flower2.png')).uri);
    await Image.prefetch(Image.resolveAssetSource(require('../images/Flower3.png')).uri);
    await Image.prefetch(Image.resolveAssetSource(require('../images/Flower4.png')).uri);
    await Image.prefetch(Image.resolveAssetSource(require('../images/Flower5.png')).uri);
    await Image.prefetch(Image.resolveAssetSource(require('../images/Star.png')).uri);
    await Image.prefetch(Image.resolveAssetSource(require('../images/Rainbow.png')).uri);
  };
  preload();
}, []);

  
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && user.emailVerified) {
        setEmail(user.email);
        setIsEmailVerified(true);
        setSessionExpired(false); 
      }
    });
    return () => unsubscribe();
  }, []);

  const validatePassword = (pwd) => {
    if (pwd.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one capital letter.";
    }
    if (!/\d/.test(pwd)) {
      return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return "Password must contain at least one symbol.";
    }
    return ""; 
  };



  const signUp = async () => {
    if (!firstName || !lastName || !email || !contactNumber || !password || !confirmPassword) {
    Alert.alert("Missing Information", "Please fill in all fields.");
    return;
    }
    if (contactNumber.length !== 11 || !/^\d+$/.test(contactNumber)) {
    Alert.alert("Invalid Contact Number", "Please enter a valid 11-digit contact number.");
    return;
    }
    if (passwordError) {
    Alert.alert("Weak Password", passwordError);
    return;
    }
    if (password !== confirmPassword) {
    Alert.alert("Password Mismatch", "Passwords do not match!");
    return;
    }


    if (isSigningUp) return;
    setIsSigningUp(true);


    try {
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);


    if (!querySnapshot.empty) {
    Alert.alert("Email Exists", "This email address is already registered.");
    setIsSigningUp(false);
    return;
    }


    let user = auth.currentUser;
    if (!user || user.email.toLowerCase() !== email.trim().toLowerCase()) {
    Alert.alert("Verification Error", "The verified email does not match. Please start over.");
    setIsSigningUp(false);
    return;
    }


    await updatePassword(user, password);


    await setDoc(doc(db, "students", user.uid), {
    parentFirstName: firstName,
    parentLastName: lastName,
    parentContactNumber: contactNumber,
    email: user.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    studentFirstName: null,
    studentLastName: null,
    schoolId: null,
    gradeLevel: null,
    section: null,
    role: "student",
    status: "pending_approval",
    approvedBy: null,
    activeSessionId: null,
    isArchived: false,
    });


    if (sessionWarningTimer.current) {
      clearTimeout(sessionWarningTimer.current);
    }

    setIsSigningUp(false);
    setRegistrationCompleted(true);


    if (auth.currentUser) {
    navigation.replace("StudDetails", { userId: auth.currentUser.uid });
    }
    } catch (error) {
    setIsSigningUp(false);
    if (error.code === "auth/email-already-in-use") {
    Alert.alert("Email Exists", "This email is already registered. Please log in or use 'Forgot Password'.", [{ text: "OK" }]);
    } else if (error.code === "auth/requires-recent-login") {
      Alert.alert(
        "Session Expired",
        "For your security, your registration session has expired. You will be returned to the home screen.",
        [{
          text: "OK",
          onPress: async () => {
            await handleCancel(true); 
          }
        }]
      );
    } else {
    console.error("Registration error:", error);
    Alert.alert("Sign Up Failed", getFirebaseAuthErrorMessage(error.code));
    }
    }
  };

  const handleEmailProcess = async () => {
    if (!email.trim()) {
      Alert.alert("Invalid Email", "Please enter an email first.");
      return;
    }

    if (sessionWarningTimer.current) {
      clearTimeout(sessionWarningTimer.current);
    }

    setSessionExpired(false); 
    setIsVerifying(true);
    setIsVerifyingEmail(true);

    try {
      let user = auth.currentUser;

      if (!user) {
        const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
        const tempUser = await createUserWithEmailAndPassword(auth, email.trim(), tempPassword);
        await sendEmailVerification(tempUser.user);

        Alert.alert(
          "Verification Sent",
          `A verification link has been sent to ${email.trim()}, check your inbox and spam folder.\n\nOnce verified, this will automatically detect.`
        );

        user = tempUser.user;
        global._tempAuth = { email: email.trim(), password: tempPassword };

        
        sessionWarningTimer.current = setTimeout(() => {
          setShowSessionWarning(true);
        }, 270000); 
      } else if (user.emailVerified) {
        setIsEmailVerified(true);
        setIsVerifyingEmail(false);
        Alert.alert("Already Verified", "Your email is already verified!");
        return;
      } else {
        await sendEmailVerification(user);
        Alert.alert("Verification Resent", `A verification link has been sent to ${email.trim()}, check your inbox and spam folder.\n\nOnce verified, this will automatically detect`);
      }

      setIsVerifying(false); 
      setCountdown(60); 

      stopVerification.current = false; 

      verificationInterval.current = setInterval(async () => {
        if (stopVerification.current) return; 

        try {
          await user.reload();
          const refreshed = auth.currentUser;
          if (refreshed && refreshed.emailVerified) {
            clearInterval(verificationInterval.current);
            verificationInterval.current = null;
            setIsEmailVerified(true);
            setIsVerifying(false);
            setIsVerifyingEmail(false);
            Alert.alert("Success", "Your email has been verified! You can now continue.");
          }
        } catch (error) {
          if (stopVerification.current) return; 

          if (error.code === "auth/user-token-expired" && global._tempAuth) {
            console.warn("Reauthenticating temporary user...");
            const { email, password } = global._tempAuth;
            await auth.signInWithEmailAndPassword(email, password).catch(() => {});
          } else {
            console.error("Reload error:", error);
          }
        }
      }, 3000);
    } catch (err) {
      console.error("Email verification process error:", err);
      Alert.alert("Error", getFirebaseAuthErrorMessage(err.code));
      setIsVerifyingEmail(false);
      setIsVerifying(false);
    }
  };

    const handleCancel = async (navigateToLanding = false) => {
      try {
        
        stopVerification.current = true;
        if (verificationInterval.current) {
          clearTimeout(sessionWarningTimer.current);
        }
        if (sessionWarningTimer.current) {
          clearInterval(verificationInterval.current);
          verificationInterval.current = null;
        }

        const user = auth.currentUser;

        
        if (user && !user.emailVerified) {
          try {
            await deleteUser(user);
            console.log("Temporary user deleted on cancel.");
          } catch (deleteError) {
            if (deleteError.code === 'auth/requires-recent-login' && global._tempAuth) {
              console.log("Re-authenticating to delete temporary user...");
              try {
                const { email, password } = global._tempAuth;
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await deleteUser(userCredential.user);
                console.log("Temporary user deleted after re-authentication.");
              } catch (reauthDeleteError) {
                console.error("Failed to delete user even after re-authentication:", reauthDeleteError);
                
                await auth.signOut();
              }
            } else {
              console.error("Failed to delete temporary user on cancel:", deleteError);
              
              await auth.signOut();
            }
            await auth.signOut(); 
          }
        }

        
        setIsVerifyingEmail(false);
        setIsVerifying(false);
        setIsEmailVerified(false);
        global._tempAuth = null;

        
        if (navigateToLanding) {
          navigation.navigate("Landing");
        } else {
          navigation.goBack();
        }

      } catch (error) {
        console.error("Cancel cleanup error:", error);
        Alert.alert("Error", "Failed to cancel properly. Please try again.");
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

    <Image source={require('../images/Rainbow.png')} style={styles.Rainbow} />

    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <Modal
            transparent={true}
            animationType="fade"
            visible={showSessionWarning}
            onRequestClose={() => setShowSessionWarning(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Session Expiring Soon</Text>
                <Text style={styles.modalMessage}>
                  For your security, your registration session will expire in about 30 seconds. Please complete your registration to avoid starting over.
                </Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setShowSessionWarning(false)}>
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Text style={styles.heading}>Start reading with us</Text>
          <Text style={styles.subheading}>
            Please fill the information that is needed.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Parent's first name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Parent's last name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.emailInput}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.verificationRow}>
            <TouchableOpacity
              style={[styles.verifyButton, (isVerifying || (isEmailVerified && !sessionExpired) || countdown > 0) && styles.disabledButton]}
              onPress={handleEmailProcess}
              disabled={isVerifying || (isEmailVerified && !sessionExpired) || countdown > 0}
            >
              {isVerifying ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : countdown > 0 ? (
                <Text style={styles.verifyButtonText}>
                  Resend in {countdown}s
                </Text>
              ) : (
                <Text style={styles.verifyButtonText}>
                  {isEmailVerified ? "Email Verified" : "Verify Email"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Parent's contact number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
            maxLength={11}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(validatePassword(text));
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#667"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={24}
                color="#667"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <View style={styles.termsRow}>
              <Checkbox
                status={termsAgreed ? "checked" : "unchecked"}
                onPress={() => setTermsAgreed(!termsAgreed)}
                color="#FFEA00"
              />
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>By continuing, you agree to our </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("TermsCondition")}
                  style={styles.linkButton}
                >
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> and </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("PrivacyPolicy")}
                  style={styles.linkButton}
                >
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                isSigningUp && styles.disabledButton,
              ]}
              onPress={handleCancel}
              disabled={isSigningUp}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.continueButton,
                (!termsAgreed || !isEmailVerified || isSigningUp) && styles.disabledButton,
              ]}
              onPress={signUp}
              disabled={!termsAgreed || !isEmailVerified || isSigningUp}
              >
              {isSigningUp ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkAction}>Click here</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>        
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  Rainbow: {
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

  keyboardAvoidingContainer: {
    flex: 1,
    
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
    
    
  },
  headerView: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", 
    marginBottom: 30, 
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Fredoka-SemiBold',
    color: "black",
    textAlign: "center",
    marginBottom: 5,
  },
  subheading: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    borderWidth: 1,
    borderColor: "#929292ff",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    height: 50,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    borderWidth: 1,
    borderColor: "#929292ff",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    height: 50,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
  },
  termsContainer: {
    width: "90%",
    marginTop: 5,
    marginBottom: 15,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingTop: 8,
    paddingLeft: 4,
  },
  termsText: {
    fontSize: 13,
    color: "white",
    lineHeight: 18,
  },
  termsLink: {
    fontSize: 13,
    color: "#FFEA00",
    fontWeight: "bold",
    textDecorationLine: "underline",
    lineHeight: 18,
  },
  linkButton: {
    
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: "#FFCF2D",
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  cancelButtonText: {
    color: "#FFCF2D",
    fontWeight: "bold",
    fontSize: 16,
  },
  continueButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 15,
    backgroundColor: "#FFCF2D",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#FFCF2D",
    borderColor: "#FFCF2D",
    opacity: 0.7,
  },
  footerText: {
    marginTop: 20,
    textAlign: "center",
    color: "#FFEA00",
    fontWeight: "bold",
    fontSize: 15,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  linkText: {
    fontSize: 13,
    color: "white",
  },
  linkAction: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFEA00",
    textDecorationLine: "underline",
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    width: "90%",
    textAlign: "left",
  },
verificationRow: {
  flexDirection: "row",
  alignItems: "center",
  width: "90%",
  marginBottom: 10,
  justifyContent: 'space-between',
},
emailInput: {
  borderWidth: 1,
  borderColor: "#929292ff",
  borderRadius: 15,
  paddingHorizontal: 15,
  backgroundColor: "#fff",
  height: 50,
  width: '90%',
  marginBottom: 10,
},
verifyButton: {
  flex: 1,
  marginRight: 5,
  backgroundColor: "#FFCF2D",
  borderRadius: 15,
  paddingHorizontal: 15,
  height: 50,
  justifyContent: "center",
  alignItems: "center",
},
checkVerifyButton: {
  flex: 1,
  marginLeft: 5,
  backgroundColor: "#4CAF50",
  borderRadius: 15,
  paddingHorizontal: 15,
  height: 50,
  justifyContent: "center",
  alignItems: "center",
},
verifyButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
  textAlign: 'center',
},
buttonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
countdownText: {
  color: '#fff',
  fontWeight: 'bold',
  marginLeft: 8,
},
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#FFCF2D',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

});

export default Register;