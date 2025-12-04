import React from "react";
import { View, StyleSheet, Image } from "react-native";

const HeaderLanding = ({ navigation, leftIconType = "drawer" }) => {
  const handleLeftIconPress = () => {
    if (leftIconType === "drawer") {
      navigation.openDrawer();
    }
  };

  return (    
    <View style={styles.container}>
      <Image source={require('../images/Star.png')} style={styles.star1} />
      <Image source={require('../images/Star.png')} style={styles.star2} />
      <Image source={require('../images/Star.png')} style={styles.star3} />
      <Image source={require('../images/Star.png')} style={styles.star4} />
      <Image source={require('../images/Star.png')} style={styles.star5} />
      <Image source={require('../images/Star.png')} style={styles.star6} />
    
      <Image source={require('../images/Rainbow.png')} style={styles.Rainbow} />   
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
    height: 200, 
    zIndex: 10, 
  },

  Rainbow: {
    position: 'absolute',
    top: '-5%', 
    width: '100%',
    height: '100%', 
    alignSelf: 'center',
  },
  
  
  star1: {
    position: 'absolute',
    top: '25%',
    right: '3%',
    width: 15,
    height: 15,
  },
  star2: {
    position: 'absolute',
    top: '80%',
    left: '20%',
    width: 15,
    height: 15,
  },
  star3: {
    position: 'absolute',
    top: '40%',
    right: '43%',
    width: 10,
    height: 10,
  },
  star4: {
    position: 'absolute',
    top: '21%',
    left: '13%',
    width: 10,
    height: 10,
  },
  star5: {
    position: 'absolute',
    top: '90%',
    right: '0%',
    width: 10,
    height: 10,
  },
  star6: {
    position: 'absolute',
    top: '30%',
    left: '3%',
    width: 10,
    height: 10,
  },
});

export default HeaderLanding;