import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image
} from 'react-native';
import AppHeader from "./HeaderLanding";

const Landing = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../images/Background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Header with stars and rainbow at the top */}
      <AppHeader
        navigation={navigation}
        leftIconType="drawer"
        showSearch={true}
      />

      {/* Animals positioned in the background */}
      <View style={styles.animalsContainer}>
        {/* Top area animals - smaller and more distant */}
        <Image source={require('../images/animals/Bee.png')} style={styles.bee} />
        <Image source={require('../images/animals/Parrot.png')} style={styles.parrot} />
        <Image source={require('../images/animals/Ladybug.png')} style={styles.ladybug} />
        
        {/* Middle area animals - medium size */}
        <Image source={require('../images/animals/Squirrel.png')} style={styles.squirrel} />
        <Image source={require('../images/animals/Fox.png')} style={styles.fox} />
        <Image source={require('../images/animals/Cat.png')} style={styles.cat} />
        <Image source={require('../images/animals/Frog.png')} style={styles.frog} />
        <Image source={require('../images/animals/Chicken.png')} style={styles.chicken} />
        
        {/* Lower area animals - larger and closer */}
        <Image source={require('../images/animals/Lion.png')} style={styles.lion} />
        <Image source={require('../images/animals/Dog.png')} style={styles.dog} />
        <Image source={require('../images/animals/Capybara.png')} style={styles.capybara} />
        <Image source={require('../images/animals/Kangaroo.png')} style={styles.kangaroo} />
        <Image source={require('../images/animals/Ostrich.png')} style={styles.ostrich} />
        <Image source={require('../images/animals/Snail.png')} style={styles.snail} />
      </View>

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

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>          
          <View style={styles.titleContainer}>
            <Text style={[styles.titleLetter, { color: '#E63B3B' }]}>K</Text>
            <Text style={[styles.titleLetter, { color: '#386CD2' }]}>w</Text>
            <Text style={[styles.titleLetter, { color: '#FFD915' }]}>e</Text>
            <Text style={[styles.titleLetter, { color: '#52FF00' }]}>n</Text>
            <Text style={[styles.titleLetter, { color: '#FFD915' }]}>t</Text>
            <Text style={[styles.titleLetter, { color: '#386CD2' }]}>u</Text>
            <Text style={[styles.titleLetter, { color: '#52FF00' }]}>r</Text>
            <Text style={[styles.titleLetter, { color: '#E63B3B' }]}>a</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.signUpButtonText]}>
              Sign up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.loginButtonText]}>Login</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 60,
    zIndex: 2, // Above animals
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '55%',
  },
  titleLetter: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 40,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 3, height: 4 },
    textShadowRadius: 6,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  buttonContainer: {
    width: "70%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '20%'
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20,
  },
  signUpButton: {
    backgroundColor: '#4ECDC4', // Turquoise/teal color
    marginRight: 12,
    borderWidth: 3,
    borderColor: 'white',
  },
  loginButton: {
    backgroundColor: '#FF6B6B', // Coral/salmon color
    borderWidth: 3,
    borderColor: 'white',
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  signUpButtonText: {
    color: "white",
  },
  loginButtonText: {
    color: "white",
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
  // Animals container
  animalsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Above background but below main content
  },
  // Top area animals (smaller, more distant)
  bee: {
    position: 'absolute',
    width: 35,
    height: 35,
    bottom: '5%',
    left: '15%',
    opacity: 0.8,
  },
  parrot: {
    position: 'absolute',
    width: 60,
    height: 60,
    top: '22%',
    right: '7%',
    opacity: 0.8,
  },
  ladybug: {
    position: 'absolute',
    width: 30,
    height: 30,
    bottom: '7%',
    right: '37%',
    opacity: 0.8,
  },
  // Middle area animals (medium size)
  squirrel: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: '48%',
    left: '5%',
    opacity: 0.9,
  },
  fox: {
    position: 'absolute',
    width: 90,
    height: 90,
    bottom: '30%',
    right: '25%',
    opacity: 0.9,
  },
  cat: {
    position: 'absolute',
    width: 80,
    height: 80,
    bottom: '15%',
    left: '0%',
    opacity: 0.9,
  },
  frog: {
    position: 'absolute',
    width: 40,
    height: 40,
    bottom: '40%',
    right: '7%',
    opacity: 0.9,
  },
  chicken: {
    position: 'absolute',
    width: 60,
    height: 60,
    bottom: '25%',
    left: '15%',
    opacity: 0.9,
  },
  // Lower area animals (larger, closer)
  lion: {
    position: 'absolute',
    width: 120,
    height: 120,
    bottom: '33%',
    left: '5%',
    opacity: 1,
  },
  dog: {
    position: 'absolute',
    width: 60,
    height: 60,
    bottom: '20%',
    right: '35%',
    opacity: 1,
  },
  capybara: {
    position: 'absolute',
    width: 70,
    height: 70,
    bottom: '19%',
    left: '35%',
    opacity: 1,
  },
  kangaroo: {
    position: 'absolute',
    width: 110,
    height: 110,
    bottom: '20%',
    right: '1%',
    opacity: 1,
  },
  ostrich: {
    position: 'absolute',
    width: 130,
    height: 130,
    bottom: '43%',
    left: '35%',
    opacity: 1,
  },
  snail: {
    position: 'absolute',
    width: 40,
    height: 40,
    bottom: '10%',
    right: '2%',
    opacity: 1,
  },
});

export default Landing;