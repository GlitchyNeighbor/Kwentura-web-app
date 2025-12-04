import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { auth, db } from "../FirebaseConfig"; 
import { PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore"; 

const OtpVerificationScreen = ({ navigation, route }) => {

  const { resolver, verificationId, isMfa, userId, email, generatedOtp, isProfileComplete } = route.params;
  const [enteredOtp, setEnteredOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleResendOtp = () => {
    
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    Alert.alert(
      "OTP Resent (Simulated)",
      `A new OTP has been sent to ${email}: ${newOtp}\n(For testing, new OTP is ${newOtp})`
    );
    
    
    
    if (!isMfa) {
        navigation.setParams({ generatedOtp: newOtp });
    }
    setEnteredOtp("");
    setError("");
  };

  const handleVerifyOtp = async () => { 
    setError("");
    if (enteredOtp.length !== 6) {
      setError("Please enter a 6-digit OTP.");
      return;
    }
    setLoading(true);
    
    if (isMfa && resolver && verificationId) {
        
        try {
            const cred = PhoneAuthProvider.credential(verificationId, enteredOtp);
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
            const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
            const mfaUser = userCredential.user; 

            
            const studentDocRef = doc(db, "students", mfaUser.uid);
            const studentDocSnap = await getDoc(studentDocRef);

            if (studentDocSnap.exists()) {
                const studentDataFromDb = studentDocSnap.data();
                const finalProfileComplete =
                    studentDataFromDb.studentFirstName &&
                    studentDataFromDb.studentLastName &&
                    studentDataFromDb.schoolId &&
                    studentDataFromDb.gradeLevel &&
                    studentDataFromDb.section;

                Alert.alert("Success", "OTP Verified! Login successful.");
                const rootNavigation = navigation.getParent()?.getParent();
                if (rootNavigation) {
                    if (finalProfileComplete) {
                        rootNavigation.reset({ index: 0, routes: [{ name: "App" }] });
                    } else {
                        navigation.replace("CompleteProfile", { userId: mfaUser.uid });
                    }
                }
            } else {
                Alert.alert("Error", "User profile not found after MFA. Contact support.");
                await auth.signOut(); 
                navigation.navigate("Login");
            }
        } catch (mfaError) {
            console.error("MFA OTP verification error:", mfaError);
            setError("Invalid OTP or MFA verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    } else {
        
        
        setTimeout(() => {
          if (enteredOtp === generatedOtp) { 
            Alert.alert("Success", "OTP Verified! (Simulated)");
            const rootNavigation = navigation.getParent()?.getParent();
            if (rootNavigation) {
              if (isProfileComplete) { 
                rootNavigation.reset({ index: 0, routes: [{ name: "App" }] });
              } else {
                navigation.replace("CompleteProfile", { userId: userId }); 
              }
            }
          } else {
            setError("Invalid OTP. Please try again. (Simulated)");
          }
          setLoading(false);
        }, 1000);
    }
  };

  const handleGoBack = async () => {
    Alert.alert(
      "Cancel Login?",
      "Going back will cancel the current login attempt. You will be signed out.",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Sign Out & Go Back",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
            } catch (e) {
              console.error("Error signing out on OTP back:", e);
            }
            navigation.navigate("Login"); 
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          A 6-digit One-Time Password has been sent to{" "}
          <Text style={{ fontWeight: "bold" }}>{email}</Text>.
        </Text>
        {!isMfa && generatedOtp && (
            <Text style={styles.debugOtpText}>
                (For testing, your OTP is: {generatedOtp})
            </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit OTP"
          value={enteredOtp}
          onChangeText={setEnteredOtp}
          keyboardType="number-pad"
          maxLength={6}
          placeholderTextColor="#888"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton}>
          <Text style={styles.resendButtonText}>Resend OTP</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  backButton: { position: "absolute", top: Platform.OS === "ios" ? 50 : 20, left: 20, zIndex: 1, padding: 5},
  title: { fontSize: 26, fontWeight: "bold", color: "#ff4081", textAlign: "center", marginBottom: 10, },
  subtitle: { fontSize: 16, textAlign: "center", color: "#555", marginBottom: 10, lineHeight: 22, },
  debugOtpText: { fontSize: 14, textAlign: "center", color: "blue", marginBottom: 20, fontStyle: "italic" },
  input: { width: "100%", height: 50, borderWidth: 1, borderColor: "#ccc", borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, backgroundColor: "#fff", fontSize: 18, textAlign: "center", letterSpacing: 5, },
  button: { backgroundColor: "#ff4081", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginBottom: 15, minHeight: 50, },
  buttonDisabled: { backgroundColor: "#ff99b9" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  resendButton: { alignItems: "center" },
  resendButtonText: { color: "#ff4081", fontSize: 16, fontWeight: "500" },
  errorText: { color: "red", textAlign: "center", marginBottom: 10, fontSize: 14, },
});

export default OtpVerificationScreen;