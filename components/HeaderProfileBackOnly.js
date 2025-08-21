import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, useState } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";


  // const [avatarConfig, setAvatarConfig] = useState(null);

  // const AVATAR_OPTIONS = [
  // require("./assets/avatars/boy.png"),
  // require("./assets/avatars/boy2.png"),
  // require("./assets/avatars/boy3.png"),
  // require("./assets/avatars/boy4.png"),
  // require("./assets/avatars/boy5.png"),
  // require("./assets/avatars/boy6.png"),
  // require("./assets/avatars/girl.png"),
  // require("./assets/avatars/girl2.png"),
  // require("./assets/avatars/girl3.png"),
  // require("./assets/avatars/girl4.png"),
  // require("./assets/avatars/girl5.png"),
  // require("./assets/avatars/girl6.png"),
  // ];

  const HeaderProfileBackOnly = ({ navigation, leftIconType = "drawer" }) => {
  const handleLeftIconPress = () => {
    if (leftIconType === "drawer") {
      navigation.openDrawer();
    }
  };

  // useEffect(() => {
  //   let unsubscribe;
  //   const currentUser = auth.currentUser;
  //   if (currentUser) {
  //     const docRef = doc(db, "students", currentUser.uid);
  //     // Use onSnapshot for real-time updates
  //     unsubscribe = onSnapshot(
  //       docRef,
  //       (docSnap) => {
  //         if (docSnap.exists()) {
  //           const data = docSnap.data();
  //           setStudentName(
  //             `${data.studentFirstName || ""} ${
  //               data.studentLastName || ""
  //             }`.trim() || "Error Retrieving Data"
  //           );
  //           if (typeof data.avatarConfig === "number") {
  //             setAvatarConfig(AVATAR_OPTIONS[data.avatarConfig]);
  //           } else {
  //             setAvatarConfig(data.avatarConfig ?? null);
  //           }
  //         } else {
  //           setStudentName("Error Retrieving Data");
  //           setAvatarConfig(null);
  //         }
  //         setLoading(false);
  //       },
  //       () => {
  //         setStudentName("Error Retrieving Data");
  //         setAvatarConfig(null);
  //         setLoading(false);
  //       }
  //     );
  //   } else {
  //     setStudentName("Error Retrieving Data");
  //     setAvatarConfig(null);
  //     setLoading(false);
  //   }
  //   return () => {
  //     if (unsubscribe) unsubscribe();
  //   };
  // }, []);

  return (    
      <View style={styles.container}>

      <Image source={require('../images/Star.png')} style={styles.star1} />
      <Image source={require('../images/Star.png')} style={styles.star2} />
      <Image source={require('../images/Star.png')} style={styles.star3} />
      <Image source={require('../images/Star.png')} style={styles.star4} />
    
          <Image source={require('../images/Rainbow.png')} style={styles.Rainbow} />        
      <View style={styles.headerRow}> 

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >          
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>  

    
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  container: {
    width: "100%",
    paddingTop: 10,
    
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 30,
    paddingHorizontal: 16,
    color: "#414141",
  },
  iconButton: {
    padding: 5,
    color: "#414141",
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 28,
    color: "#fff",
    fontFamily: "sans-serif",
    letterSpacing: 0.5,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: -2,
    backgroundColor: "#ff2222",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",  
  },
  ratingNumber: {
    color: 'white',
    fontSize: 12,
  },

  Rainbow: {
    position: 'absolute',
    top: '-520%',
    width: '150%',
    height: '730%',
    alignSelf: 'center',
  },
  star1: {
    position: 'absolute',
    top: '133%',
    left: '15%',
    width: 10,
    height: 10,
  },
  star2: {
    position: 'absolute',
    top: '259%',
    right: '3%',
    width: 15,
    height: 15,
  },
  star3: {
    position: 'absolute',
    top: '225%',
    left: '3%',
    width: 10,
    height: 10,
  },
  star4: {
    position: 'absolute',
    top: '24%',
    left: '43%',
    width: 10,
    height: 10,
  },

  backButton: {
    backgroundColor: '#FFCF2D',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    
    alignItems: 'center',
    justifyContent: 'center'

  },
});

export default HeaderProfileBackOnly;
