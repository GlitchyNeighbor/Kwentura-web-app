import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground
} from "react-native";
import { auth } from "../FirebaseConfig";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import Ionicons from "react-native-vector-icons/Ionicons";
import AppHeader from "./HeaderProfileBackOnly";


const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handlePasswordChange = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password cannot be the same as the current password.");
      return;
    }

    setLoading(true);
    const user = auth.currentUser;

    if (!user) {
      setError("No user is currently signed in.");
      setLoading(false);
      Alert.alert("Error", "No user signed in. Please log in again.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setSuccessMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      Alert.alert("Success", "Password updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Password change error:", err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Incorrect current password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (value, setValue, placeholder, show, setShow) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        secureTextEntry={!show}
        placeholderTextColor="#888"
        autoCapitalize="none"
      />


      <TouchableOpacity onPress={() => setShow(!show)}>
        <Ionicons
          name={show ? "eye-off" : "eye"}
          size={24}
          color="#667"
        />
      </TouchableOpacity>      
    </View>
  );

  return (
    <ImageBackground
      source={require('../images/ProfileSubs.png')}
      style={[styles.background, styles.backgroundImage]}
      resizeMode="cover"
    >
  
    <SafeAreaView style={styles.safeArea}>

      <AppHeader
        navigation={navigation}
        leftIconType="drawer"
        showSearch={true}
      />
    
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >

        <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.title}>Change Password</Text>

          <Text style={styles.instructionText}>
            To change your password, please enter your current password followed
            by your new password.
          </Text>

          {renderPasswordInput(
            currentPassword,
            setCurrentPassword,
            "Current Password",
            showCurrentPassword,
            setShowCurrentPassword
          )}
          {renderPasswordInput(
            newPassword,
            setNewPassword,
            "New Password (min. 6 characters)",
            showNewPassword,
            setShowNewPassword
          )}
          {renderPasswordInput(
            confirmNewPassword,
            setConfirmNewPassword,
            "Confirm New Password",
            showConfirmNewPassword,
            setShowConfirmNewPassword
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
          {successMessage && (
            <Text style={styles.successText}>{successMessage}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handlePasswordChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
      </ImageBackground>  
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Fredoka-SemiBold',
    marginBottom: 5,
    color: "#333",
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: 'center',
    flex: 1,
  },
  instructionText: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
  input: {
    flex: 1,
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: "#FFCF2D",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
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
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ff99b9",
  },

  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
  },
  successText: {
    color: "green",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
  },
});

export default ChangePasswordScreen;
