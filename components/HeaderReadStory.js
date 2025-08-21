import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from "react-native-vector-icons/Ionicons";
import { auth, db } from "../FirebaseConfig"; // Adjust path as needed
import { doc, onSnapshot } from "firebase/firestore";
import { rewardsConfig } from "./Rewards";

const AVATAR_OPTIONS = [
  require("../assets/avatars/boy.png"),
  require("../assets/avatars/boy2.png"),
  require("../assets/avatars/boy3.png"),
  require("../assets/avatars/boy4.png"),
  require("../assets/avatars/boy5.png"),
  require("../assets/avatars/boy6.png"),
  require("../assets/avatars/girl.png"),
  require("../assets/avatars/girl2.png"),
  require("../assets/avatars/girl3.png"),
  require("../assets/avatars/girl4.png"),
  require("../assets/avatars/girl5.png"),
  require("../assets/avatars/girl6.png"),
];

const HeaderReadStory = ({ navigation }) => {
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [userStars, setUserStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let unsubscribe;
    const currentUser = auth.currentUser;

    if (currentUser) {
      // Listen to users collection for stars data
      const userDocRef = doc(db, "users", currentUser.uid);
      const unsubscribeUsers = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserStars(userData.stars || 0);
          } else {
            setUserStars(0);
          }
        },
        (error) => {
          console.error("Error fetching user stars:", error);
          setUserStars(0);
        }
      );

      // Listen to students collection for avatar data
      const studentDocRef = doc(db, "students", currentUser.uid);
      const unsubscribeStudents = onSnapshot(
        studentDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Use animal avatar index
            if (typeof data.avatarConfig === "number") {
              setAvatarConfig(rewardsConfig[data.avatarConfig]?.image);
            } else {
              setAvatarConfig(data.avatarConfig ?? null);
            }
          } else {
            setAvatarConfig(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching user data:", error);
          setAvatarConfig(null);
          setLoading(false);
        }
      );

      unsubscribe = () => {
        unsubscribeUsers();
        unsubscribeStudents();
      };
    } else {
      setAvatarConfig(null);
      setUserStars(0);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background decorative elements */}
      <Image source={require('../images/Star.png')} style={styles.star1} />
      <Image source={require('../images/Star.png')} style={styles.star2} />
      <Image source={require('../images/Star.png')} style={styles.star3} />
      <Image source={require('../images/Star.png')} style={styles.star4} />
    
      <Image source={require('../images/DarkRainbow.png')} style={styles.Rainbow} />        
      
      <View style={styles.headerRow}> 
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >          
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>  

        <View style={[styles.ratingBox, { marginLeft: 'auto', marginRight: 5 }]}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={15} color="#ffde24ff" style={styles.starIcon} />
            <Text style={styles.ratingNumber}>{userStars}</Text>
          </View>
        </View>  

        {/* Avatar - non-clickable, just display */}
        {avatarConfig ? (
          <Image
            source={avatarConfig}
            style={styles.notificationCircle}
          />
        ) : (
          <Image
            source={require("../assets/avatars/default_profile.png")}
            style={styles.notificationCircle}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 1000,
    // Remove the negative top value that was causing positioning issues
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#414141",
  },
  notificationCircle: {
    borderRadius: 15,
    backgroundColor: "#969696ff",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingBox: {
    backgroundColor: '#979797bd',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  starIcon: {
    marginRight: 5,
  },
  ratingNumber: {
    color: 'white',
    fontSize: 12,
  },
  backButton: {
    backgroundColor: '#FFCF2D',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  // Background decorative elements with adjusted positioning
  Rainbow: {
    position: 'absolute',
    top: -100,
    width: '170%',
    height: 200,
    alignSelf: 'center',
    opacity: 0.9,
    zIndex: -1,
  },
  star1: {
    position: 'absolute',
    top: 60,
    left: '15%',
    width: 10,
    height: 10,
    opacity: 0.5,
    zIndex: -1,
  },
  star2: {
    position: 'absolute',
    top: 80,
    right: '3%',
    width: 15,
    height: 15,
    opacity: 0.5,
    zIndex: -1,
  },
  star3: {
    position: 'absolute',
    top: 70,
    left: '3%',
    width: 10,
    height: 10,
    opacity: 0.5,
    zIndex: -1,
  },
  star4: {
    position: 'absolute',
    top: 45,
    left: '43%',
    width: 10,
    height: 10,
    opacity: 0.5,
    zIndex: -1,
  },
});

export default HeaderReadStory;