

import {
  TextInput,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ImageBackground
} from "react-native";
import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { signOut as firebaseSignOut, deleteUser } from "firebase/auth"; 
import { auth, db } from "../FirebaseConfig";


const StudDetails = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolId, setSchoolId] = useState(""); 
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false); 
  const [schoolIdError, setSchoolIdError] = useState(""); 

  
  const checkSchoolIdExists = async (id, currentUserId) => {
    if (!id) {
      setSchoolIdError("");
      return false;
    }

    try {
      const studentsRef = collection(db, "students");
      const q1 = query(studentsRef, where("schoolId", "==", id));
      const studentsSnap = await getDocs(q1);

      const teachersRef = collection(db, "teachers");
      const q2 = query(teachersRef, where("schoolId", "==", id));
      const teachersSnap = await getDocs(q2);

      const adminRef = collection(db, "admins");
      const q3 = query(adminRef, where("schoolId", "==", id));
      const adminSnap = await getDocs(q3);

      const existsInStudents =
        !studentsSnap.empty &&
        studentsSnap.docs.some((doc) => {
          return doc.id !== currentUserId;
        });
      const existsInTeachers = !teachersSnap.empty;
      const existsInAdmin = !adminSnap.empty;
      if (existsInStudents || existsInTeachers || existsInAdmin) {
        setSchoolIdError("This School ID is already registered. Please enter a unique School ID.");
        return true;
      } else {
        setSchoolIdError("");
        return false;
      }
    } catch (error) {
      console.error("Error checking school ID existence:", error);
      setSchoolIdError("Error checking School ID. Please try again.");
      return true;
    }
  };

  useEffect(() => {
    if (!userId) {
      console.error("StudDetails: userId is missing from route params!");
      Alert.alert(
        "Error",
        "An error occurred. Cannot proceed without user identification."
      );
      
      firebaseSignOut(auth).catch((err) =>
        console.error("Sign out failed:", err)
      );
      
      
      
      
    }
  }, [userId, navigation]); 

  
  const saveStudentDetails = async () => {
    if (!userId) return;
    if (!firstName || !lastName || !schoolId || !gradeLevel || !section) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields including the School ID."
      );
      return;
    }
    
    if (schoolIdError) {
      Alert.alert(
        "Invalid School ID",
        "Please correct the School ID before proceeding."
      );
      return;
    }

    if (isSaving || isCancelling) return;
    setIsSaving(true);

    try {
      await setDoc(
        doc(db, "students", userId),
        {
          studentFirstName: firstName,
          studentLastName: lastName,
          schoolId,
          gradeLevel,
          section,
          updatedAt: serverTimestamp(),
          role: "student",
        },
        { merge: true }
      );
      navigation.navigate("RegisterComplete");
      firebaseSignOut(auth);
    } catch (error) {
      console.error("Failed to save student details:", error);
      Alert.alert(
        "Save Failed",
        "Could not save student details: " + error.message
      );
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
  };

  const handleBackPress = () => {
    if (isSaving || isCancelling) return;

    Alert.alert(
      "Cancel Registration?",
      "Are you sure you want to go back? All information you entered will be deleted.",
      [
        { text: "Stay", style: "cancel" },
        {  
          text: "Cancel",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              
              await deleteDoc(doc(db, "students", userId));
              
              const user = auth.currentUser;
              if (user) {
                try {
                  
                  await deleteUser(user);
                } catch (authError) {
                  if (authError.code === 'auth/requires-recent-login') {
                    
                    
                    console.log('Cancellation: User requires recent login. Signing out.');
                    await firebaseSignOut(auth);
                  } else {
                    
                    throw authError;
                  }
                }
              }
              
              navigation.navigate("Landing");

            } catch (error) {
              console.error("Error during cancellation:", error);
              
              Alert.alert(
                "Error",
                "Could not complete the action. Please try again."
              );
              setIsCancelling(false);
            }
          },
        },
      ]
    );
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


    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Student Details</Text>
      <Text style={styles.subheading}>
        Please provide the student's information.
      </Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Student first name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Student last name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { width: '100%', marginBottom: 0 }]}
          placeholder="Enter School ID"
          value={schoolId}
          onChangeText={async (text) => {
            setSchoolId(text);
            await checkSchoolIdExists(text, userId);
          }}
          autoCapitalize="none"
          keyboardType="default"
        />
        {schoolIdError ? <Text style={styles.errorText}>{schoolIdError}</Text> : null}
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gradeLevel}
          onValueChange={(itemValue) => setGradeLevel(itemValue)}
          style={styles.picker}
          prompt="Grade Level"
        >
          <Picker.Item
            label="Select Grade Level"
            value=""
            enabled={false}
            style={{ color: "#5a5a5aff", fontSize: 14,  }}
          />
          <Picker.Item label="Kinder 1" value="Kinder 1" />
          <Picker.Item label="Kinder 2" value="Kinder 2" />
          <Picker.Item label="Grade 1" value="Grade 1" />
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={section}
          onValueChange={(itemValue) => setSection(itemValue)}
          style={styles.picker}
          prompt="Student Section"
        >
          <Picker.Item
            label="Select Section"
            value=""
            enabled={false}
            style={{ color: "#5a5a5aff", fontSize: 14 }}
          />
          <Picker.Item label="INF225" value="INF225" />
          <Picker.Item label="INF226" value="INF226" />
          <Picker.Item label="INF227" value="INF227" />
        </Picker>
      </View>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.backButton,
            (isSaving || isCancelling) && styles.disabledButton, 
          ]}
          onPress={handleBackPress}
          disabled={isSaving || isCancelling} 
        >
          <Text style={styles.backButtonText}>
            {isCancelling ? "Cancelling..." : "Cancel"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            (isSaving || isCancelling) && styles.disabledButton, 
          ]}
          onPress={saveStudentDetails}
          disabled={isSaving || isCancelling || !userId} 
        >
          <Text style={styles.nextButtonText}>
            {isSaving ? "Saving..." : "Confirm"}
          </Text>
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
  Rainbow: {
    position: 'absolute',
    top: -130,
    width: '100%',
    height: '30%',
    alignSelf: 'center',
  },
  
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center", 
    alignItems: "center", 
  },
  heading: {
    fontSize: 26,
    fontFamily: 'Fredoka-SemiBold',
    color: "black",
    textAlign: "center",
    marginBottom: 5,
  },
  subheading: {
    fontSize: 15,
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
  inputWrapper: {
    width: '90%',
    marginBottom: 10,
  },
  readOnlyInput: {
    backgroundColor: "#e9e9e9",
    color: "#555",
  },
  pickerContainer: {
    width: "90%",
    height: 50,
    borderWidth: 1,
    borderColor: "#000000ff",
    borderRadius: 15,
    marginBottom: 10,
    justifyContent: "center",
    backgroundColor: "#fff",
    overflow: "hidden",
    borderColor: "#bbb",
    
    
  },
  picker: {
    width: "100%",
    height: "100%",
    
    
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10, 
  },
  backButton: {
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
  backButtonText: {
    color: "#FFCF2D",
    fontWeight: "bold",
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 15,
    backgroundColor: "#FFCF2D",
    borderRadius: 15,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#fcdf7fff",
    borderColor: "#fcdf7fff",
    opacity: 0.7,
  },
  errorText: {
    color: '#E63B3B', 
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
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

export default StudDetails;
