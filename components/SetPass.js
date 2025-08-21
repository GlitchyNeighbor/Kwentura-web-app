import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";

const SetPass = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ImageBackground
      source={require('../images/Landing.png')}
      style={styles.background}
      resizeMode="cover"
    >
          
    <Image source={require('../images/Cloud.png')} style={[styles.cloud1]} />
    <Image source={require('../images/Cloud.png')} style={[styles.cloud2]} />
    <Image source={require('../images/Cloud.png')} style={[styles.cloud3]} />
    <Image source={require('../images/Cloud.png')} style={[styles.cloud4]} />
          
    <Image source={require('../images/Star.png')} style={styles.star1} />
    <Image source={require('../images/Star.png')} style={styles.star2} />
    <Image source={require('../images/Star.png')} style={styles.star3} />
    <Image source={require('../images/Star.png')} style={styles.star4} />
              
    <View style={styles.flowerContainer}>
      <Image source={require('../images/Flower1.png')} style={styles.flower1} />
      <Image source={require('../images/Flower2.png')} style={styles.flower2} />
      <Image source={require('../images/Flower3.png')} style={styles.flower3} />
      <Image source={require('../images/Flower4.png')} style={styles.flower4} />
      <Image source={require('../images/Flower5.png')} style={styles.flower5} />
    </View>        

    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Set your password</Text>
      <Text style={styles.subheading}>
        Please do not share your password to others.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeText}>{showPassword ? "-" : "O"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeText}>{showPassword ? "-" : "O"}</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => {
            // Add logic to handle password confirmation
            console.log("Password confirmed");
          }}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: "red",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  eyeText: {
    fontSize: 16,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    marginRight: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ff4081",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#ff4081",
    fontWeight: "bold",
  },
  confirmButton: {
    flex: 1,
    marginLeft: 10,
    padding: 15,
    backgroundColor: "#ff4081",
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SetPass;
