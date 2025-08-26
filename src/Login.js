import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { auth } from "../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // Import collection, query, where, getDocs
import { db } from "../FirebaseConfig";

const Login = ({ navigation }) => {
  const [schoolId, setSchoolId] = useState(""); // Keep schoolId state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const signIn = async () => {
    if (!schoolId || !password) {
      alert("Please enter both School ID and password."); // Updated message
      return;
    }
    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("schoolId", "==", schoolId.trim())); // Use schoolId to find
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("No student found with this School ID.");
        return;
      }
      const studentDoc = querySnapshot.docs[0];
      const studentData = studentDoc.data();

      const studentEmail = studentData.email;
      if (!studentEmail) {
        alert("Student record is incomplete. Missing email address.");
        return;
      }
      const emailForAuth = studentEmail.toLowerCase();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailForAuth,
        password
      );
      const user = userCredential.user;

      const docRef = doc(db, "students", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isApproved === true) {
          if (
            data.studentFirstName &&
            data.studentLastName &&
            data.schoolId &&
            data.gradeLevel &&
            data.section
          ) {
            const rootNavigation = navigation.getParent()?.getParent();
            if (rootNavigation) {
              rootNavigation.reset({
                index: 0,
                routes: [{ name: "App" }],
              });
            }
          } else {
            // Approved but profile incomplete
            navigation.navigate("StudDetails", { userId: user.uid });
          }
        } else {
          // Not approved
          alert(
            "Your account is pending approval by your section adviser. Please wait for their confirmation."
          );
          await auth.signOut(); // Sign out the user as they cannot proceed
        }
      } else {
        // This case should ideally not happen if the initial lookup by schoolId worked,
        // but it's good to have as a fallback or for new users who haven't completed details.
        navigation.navigate("StudDetails", { userId: user.uid });
      }
    } catch (error) {
      let errorMessage = "Sign in failed. Please check your credentials.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage = "Invalid School ID or password."; // Updated error message
      } else if (error.code === "auth/invalid-email") {
        errorMessage =
          "An issue occurred with the retrieved email. Please contact support.";
      }
      alert(errorMessage);
      console.error("Login error:", error); // Log the error for debugging
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Image source={require("../assets/Logo.png")} style={styles.logo} />
        <Text style={styles.brand}>Kwentura</Text>
      </View>

      {/* Bunny fills available space */}
      <View style={styles.bunnyContainer}>
        <Image
          source={require("../images/bunny_bg.png")}
          style={styles.bunnies}
          resizeMode="contain"
        />
      </View>

      {/* Form */}
      <ScrollView
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.welcome}>Welcome Monlimarian!</Text>
        <TextInput
          style={styles.input}
          placeholder="School ID" // Changed placeholder to School ID
          value={schoolId}
          onChangeText={setSchoolId}
          keyboardType="default" // Changed keyboardType
          autoCapitalize="none"
          placeholderTextColor="#888"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#667"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={signIn}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Forgot your password?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPass")}>
            <Text style={styles.linkAction}> Click here</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>If you don't have an account</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkAction}> Sign up here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffd6ea",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 24,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 8,
  },
  brand: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#ff4081",
    fontFamily: "sans-serif",
    marginTop: 2,
  },
  bunnyContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 120,
    maxHeight: 300,
  },
  bunnies: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 20,
    marginTop: "auto",
    marginBottom: "auto",
  },
  welcome: {
    fontWeight: "bold",
    fontSize: 30,
    color: "#222",
    alignSelf: "center",
    marginBottom: 18,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#bbb",
    padding: 12,
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 16,
    paddingHorizontal: 10,
    marginBottom: 14,
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
    paddingLeft: 5,
    fontSize: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#ff4081",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 10,
    minHeight: 50,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  linkText: {
    fontSize: 15,
    color: "#333",
  },
  linkAction: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ff4081",
  },
});

export default Login;
