import React, { useState } from "react";
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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Checkbox } from "react-native-paper";

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

  const signUp = async () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !contactNumber ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }
    if (contactNumber.length !== 11 || !/^\d+$/.test(contactNumber)) {
      Alert.alert(
        "Invalid Contact Number",
        "Please enter a valid 11-digit contact number."
      );
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password should be at least 6 characters long."
      );
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
        Alert.alert(
          "Email Exists",
          "This email address is already registered."
        );
        setIsSigningUp(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "students", user.uid), {
        parentFirstName: firstName, // Use parentFirstName
        parentLastName: lastName, // Use parentLastName
        parentContactNumber: contactNumber, // Use parentContactNumber
        email: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        studentFirstName: null,
        studentLastName: null,
        schoolId: null,
        gradeLevel: null,
        section: null,
        role: "student",
        isApproved: false, // Added: Account starts as not approved
        approvedBy: null, // Added: No approver initially
      });

      navigation.navigate("StudDetails", { userId: user.uid });
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "Email Exists",
          "This email is already registered. Please log in or use 'Forgot Password'.",
          [{ text: "OK" }]
        );
        // Stay on the same screen
      } else {
        console.error("Registration error:", error);
        Alert.alert("Sign Up Failed", getFirebaseAuthErrorMessage(error.code));
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
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
          {/* Header */}
          <View style={styles.headerView}>
            <Image source={require("../assets/Logo.png")} style={styles.logo} />
          </View>

          <Text style={styles.heading}>Start reading with us!</Text>
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
            style={styles.input}
            placeholder="Email" // Changed from "Parent's email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Parent's contact number (11 digits)"
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
              onChangeText={setPassword}
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Checkbox
                status={termsAgreed ? "checked" : "unchecked"}
                onPress={() => setTermsAgreed(!termsAgreed)}
                color="#ff4081"
              />
              <Text style={styles.termsTextWrapper}>
                <Text style={styles.termsText}>
                  By continuing, you agree to our{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("TermsCondition")}
                >
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> and </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("PrivacyPolicy")}
                >
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>.</Text>
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                isSigningUp && styles.disabledButton,
              ]}
              onPress={() => navigation.navigate("Login")}
              disabled={isSigningUp}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.continueButton,
                (!termsAgreed || isSigningUp) && styles.disabledButton,
              ]}
              onPress={signUp}
              disabled={!termsAgreed || isSigningUp}
            >
              {isSigningUp ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerText}>Already have an account?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerView: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", // Align to the start of the scroll view content
    marginBottom: 30, // Space below header
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff4081",
    textAlign: "center",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    width: "100%",
    height: 50,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 13,
    color: "darkGray",
    textAlign: "center",
  },
  termsLink: {
    fontSize: 13,
    color: "#ff4081",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#ff4081",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  cancelButtonText: {
    color: "#ff4081",
    fontWeight: "bold",
    fontSize: 16,
  },
  continueButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 15,
    backgroundColor: "#ff4081",
    borderRadius: 8,
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
    backgroundColor: "#ff99b9",
    borderColor: "#ff99b9",
    opacity: 0.7,
  },
  footerText: {
    marginTop: 25,
    textAlign: "center",
    color: "#ff4081",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default Register;
