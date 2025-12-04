import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFonts } from 'expo-font';

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Image, View, Text, TouchableOpacity, AppState } from "react-native"; 
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { ActivityIndicator, Alert } from "react-native"; 
import { auth, db } from "./FirebaseConfig";
import { signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { AuthFlowProvider, useAuthFlow } from './context/AuthFlowContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ProfileProvider } from './context/ProfileContext';

import Home from "./components/Home";
import Categories from "./components/Categories";
import Rewards from "./components/Rewards";
import Library from "./components/Library";
import Profile from "./components/Profile";
import PersonalInfo from "./components/PersonalInfo";
import Register from "./components/Register";
import Landing from "./components/Landing";
import Login from "./components/Login";
import ViewStory from "./components/ViewStory";
import StudDetails from "./components/StudDetails";
import RegisterComplete from "./components/RegisterComplete";
import ChooseVerif from "./components/ChooseVerif";
import ContactVerif from "./components/ContactVerif";
import EmailVerif from "./components/EmailVerif";
import ForgotPassword from "./components/ForgotPassword";
import NewPass from "./components/NewPass";
import ForgotPassComplete from "./components/ForgotPassComplete";
import TermsCondition from "./components/TermsCondition"; 
import PrivacyPolicy from "./components/PrivacyPolicy";
import ChangePasswordScreen from "./components/ChangePasswordScreen";
import ReadStory from "./components/ReadStory"; 
import About from "./components/About"; 
import ComQuestions from "./components/ComQuestions"; 

import OtpVerificationScreen from "./components/OtpVerificationScreen"; 
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const DAILY_USAGE_LIMIT_MS = 90 * 60 * 1000; 

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={Profile} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="About" component={About} />
      
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="ViewStory" component={ViewStory} />
      <Stack.Screen name="ReadStory" component={ReadStory} /> 
      <Stack.Screen name="ComQuestions" component={ComQuestions} />
    </Stack.Navigator>
  );
}


function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "RewardsTab") {
            iconName = focused ? "paw" : "paw-outline";
          } else if (route.name === "LibraryTab") {
            iconName = focused ? "library" : "library-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} style={{ fontWeight: 'bold', borderRadius: 5 }} />;
        },
        tabBarActiveTintColor: "#fac411ff",
        tabBarInactiveTintColor: "#919393",
        tabBarStyle: (() => {
          
          if (route.name === "HomeTab") {
            const routeState = navigation.getState();
            const activeRoute = routeState?.routes[routeState.index];
            const homeTabState = activeRoute?.state;
            
            if (homeTabState) {
              const activeHomeRoute = homeTabState.routes[homeTabState.index];
              
               if (activeHomeRoute?.name === "ViewStory" || 
                  activeHomeRoute?.name === "ReadStory" || 
                  activeHomeRoute?.name === "ComQuestions") {
                return { display: "none" };
              }
            }
          }
          
          
          return {
            height: 60,
            paddingBottom: 5,
            paddingTop: 5,
            backgroundColor: "white",
          };
        })(),
        tabBarLabelStyle: { fontSize: 11, fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="RewardsTab"
        component={Rewards}
        options={{ title: "Rewards" }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={Library}
        options={{ title: "Library" }}
      />
      {/* ProfileTab completely removed from bottom navigation */}
    </Tab.Navigator>
  );
}



function AppDrawer() {
  
  const currentUser = auth.currentUser; 
  const [appIsGloballySleeping, setAppIsGloballySleeping] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState("--:--:--");
  const [timerTrigger, setTimerTrigger] = useState(0); 

  
  const usageTimeoutIdRef = useRef(null);
  const countdownIntervalIdRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  
  const activeSessionStartTimeRef = useRef(null); 
  const initialDurationForCountdownRef = useRef(0); 

  useEffect(() => {
    const userId = currentUser?.uid;
    console.log(`AppDrawer: Timer useEffect triggered. User: ${userId}, Trigger count: ${timerTrigger}`);

    
    if (usageTimeoutIdRef.current) clearTimeout(usageTimeoutIdRef.current);
    if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current);

    if (!userId) {
      
      
      activeSessionStartTimeRef.current = null;
      setTimerDisplay("--:--:--");
      setAppIsGloballySleeping(false);
      console.log("AppDrawer: No user or user logged out, timer inactive.");
      return; 
    }

    
    const getSleepKey = () => `appSleepUntilNextDayTimestamp_${userId}`;
    const getCumulativeUsageKey = () => `appCumulativeUsageMs_${userId}`;
    const getLastUsageDateKey = () => `appLastUsageDate_${userId}`;
    



    const formatTime = (ms) => {
      if (ms < 0) ms = 0;
      let totalSeconds = Math.floor(ms / 1000);
      let hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      let minutes = Math.floor(totalSeconds / 60);
      let seconds = totalSeconds % 60;
      const pad = (num) => String(num).padStart(2, '0');
      if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      return `${pad(minutes)}:${pad(seconds)}`;
    };

    const saveCurrentUsage = async (userIdForSave, isBackgrounding = false) => {
      if (!userIdForSave) {
          console.log(`AppDrawer (saveCurrentUsage): No userIdForSave provided, cannot save.`);
          
          const fallbackUserId = auth.currentUser?.uid;
          if (!fallbackUserId) return 0; 
          userIdForSave = fallbackUserId;
      }
      const getCumulativeUsageKeyForSave = () => `appCumulativeUsageMs_${userIdForSave}`;
      const getLastUsageDateKeyForSave = () => `appLastUsageDate_${userIdForSave}`;

      if (activeSessionStartTimeRef.current && !appIsGloballySleeping) { 
        const timeSpentActiveInSessionMs = Date.now() - activeSessionStartTimeRef.current;
        let cumulativeUsageMs = 0;
        const storedCumulativeUsageStr = await AsyncStorage.getItem(getCumulativeUsageKeyForSave());
        if (storedCumulativeUsageStr) {
          cumulativeUsageMs = parseInt(storedCumulativeUsageStr, 10) || 0;
        }
        
        const newCumulativeUsage = cumulativeUsageMs + timeSpentActiveInSessionMs;
        await AsyncStorage.setItem(getCumulativeUsageKeyForSave(), newCumulativeUsage.toString());
        await AsyncStorage.setItem(getLastUsageDateKeyForSave(), new Date().toDateString());
        console.log(`AppDrawer (User ${userIdForSave}): Saved usage. Active: ${timeSpentActiveInSessionMs}ms, New Cumulative: ${newCumulativeUsage}ms`);

        if (isBackgrounding) {
             const remainingTotal = DAILY_USAGE_LIMIT_MS - newCumulativeUsage;
             setTimerDisplay(formatTime(Math.max(0, remainingTotal)));
        }
        activeSessionStartTimeRef.current = null; 
        return newCumulativeUsage;
      }
      
      const storedCumulativeUsageStr = await AsyncStorage.getItem(getCumulativeUsageKeyForSave());
      return storedCumulativeUsageStr ? (parseInt(storedCumulativeUsageStr, 10) || 0) : 0;
    };

    const activateRestMode = async () => {
      
      console.log(`AppDrawer (User ${userId}): Activating rest mode...`); 
      if (appIsGloballySleeping && usageTimeoutIdRef.current === null && countdownIntervalIdRef.current === null) {
        
        return;
      }

      await saveCurrentUsage(userId); 

      setAppIsGloballySleeping(true);
      if (usageTimeoutIdRef.current) clearTimeout(usageTimeoutIdRef.current);
      if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current);
      usageTimeoutIdRef.current = null; 
      countdownIntervalIdRef.current = null;
      activeSessionStartTimeRef.current = null;

      try {
        await AsyncStorage.setItem(getSleepKey(), new Date().toISOString());
        await AsyncStorage.setItem(getCumulativeUsageKey(), DAILY_USAGE_LIMIT_MS.toString()); 
        await AsyncStorage.setItem(getLastUsageDateKey(), new Date().toDateString());
        console.log(`AppDrawer (User ${userId}): Sleep timestamp and final cumulative usage saved.`);
      } catch (e) {
        console.error(`AppDrawer (User ${userId}): Failed to set sleep/cumulative timestamp:`, e);
      }
    };

    const startTimer = (durationMs) => { 
      
      console.log(`AppDrawer (User ${userId}): Active timer started. Allowed for ${formatTime(durationMs)}.`); 
      setAppIsGloballySleeping(false);
      activeSessionStartTimeRef.current = Date.now();
      initialDurationForCountdownRef.current = durationMs;

      if (usageTimeoutIdRef.current) clearTimeout(usageTimeoutIdRef.current);
      if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current);

      
      usageTimeoutIdRef.current = setTimeout(activateRestMode, durationMs); 

      const updateDisplay = () => {
        if (!activeSessionStartTimeRef.current || appIsGloballySleeping) {
          if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current);
          countdownIntervalIdRef.current = null;
          return;
        }
        const elapsedInActiveSegment = Date.now() - activeSessionStartTimeRef.current;
        const currentRemainingTime = initialDurationForCountdownRef.current - elapsedInActiveSegment;

        if (currentRemainingTime <= 0) {
          setTimerDisplay(formatTime(0));
          if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current);
          countdownIntervalIdRef.current = null;
          
        } else {
          setTimerDisplay(formatTime(currentRemainingTime));
        }
      };
      updateDisplay();
      countdownIntervalIdRef.current = setInterval(updateDisplay, 1000);
    };

    const checkAppStatusAndInitializeTimer = async () => {
      
      console.log(`AppDrawer (User ${userId}): Checking app status and initializing timer...`); 
      const now = new Date();
      const todayDateStr = now.toDateString();

      const sleepTimestampStr = await AsyncStorage.getItem(getSleepKey());
      if (sleepTimestampStr) {
        const sleepUntilDate = new Date(sleepTimestampStr);
        if (sleepUntilDate.toDateString() === todayDateStr || sleepUntilDate > now) {
          console.log(`AppDrawer (User ${userId}): App is in rest mode.`);
          setAppIsGloballySleeping(true);
          if (usageTimeoutIdRef.current) clearTimeout(usageTimeoutIdRef.current);
          if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current);
          activeSessionStartTimeRef.current = null;
          setTimerDisplay(formatTime(0)); 
          return;
        } else {
          console.log(`AppDrawer (User ${userId}): Rest period ended.`);
          await AsyncStorage.removeItem(getSleepKey());
          await AsyncStorage.removeItem(getCumulativeUsageKey());
          await AsyncStorage.removeItem(getLastUsageDateKey());
        }
      }
      
      setAppIsGloballySleeping(false); 

      let cumulativeUsageMs = 0;
      const lastUsageDateStr = await AsyncStorage.getItem(getLastUsageDateKey());
      const storedCumulativeUsageStr = await AsyncStorage.getItem(getCumulativeUsageKey());

      if (lastUsageDateStr === todayDateStr && storedCumulativeUsageStr) {
        cumulativeUsageMs = parseInt(storedCumulativeUsageStr, 10) || 0;
      } else {
        console.log(`AppDrawer (User ${userId}): New day or first use. Resetting cumulative usage.`);
        cumulativeUsageMs = 0;
        await AsyncStorage.setItem(getCumulativeUsageKey(), "0");
        await AsyncStorage.setItem(getLastUsageDateKey(), todayDateStr);
      }

      const remainingActiveTimeMs = DAILY_USAGE_LIMIT_MS - cumulativeUsageMs;
      console.log(`AppDrawer (User ${userId}): Cumulative: ${cumulativeUsageMs}ms, Remaining active: ${remainingActiveTimeMs}ms`);

      if (remainingActiveTimeMs <= 0) {
        console.log(`AppDrawer (User ${userId}): Daily active usage limit exhausted on load.`);
        activateRestMode();
      } else {
        startTimer(remainingActiveTimeMs);
      }
    };

    const handleAppStateChange = async (nextAppState) => {
      const currentAppState = appStateRef.current;
      appStateRef.current = nextAppState;
      
      console.log(`AppDrawer (User ${userId}): AppState changed from ${currentAppState} to ${nextAppState}`); 

      if (appIsGloballySleeping) {
        console.log(`AppDrawer (User ${userId}): AppState changed but app is globally sleeping.`); 
        if (nextAppState === 'active') { 
            if (usageTimeoutIdRef.current) clearTimeout(usageTimeoutIdRef.current);
            if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current);
            activeSessionStartTimeRef.current = null;
            setTimerDisplay(formatTime(0));
        }
        return;
      }

      if (currentAppState.match(/inactive|background/) && nextAppState === 'active') {
        console.log(`AppDrawer (User ${userId}): App has come to the foreground!`); 
        if (usageTimeoutIdRef.current) clearTimeout(usageTimeoutIdRef.current); 
        if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current);
        await checkAppStatusAndInitializeTimer(); 
      } else if (currentAppState === 'active' && nextAppState.match(/inactive|background/)) {
        console.log(`AppDrawer (User ${userId}): App has gone to the background or became inactive.`); 
        if (usageTimeoutIdRef.current) clearTimeout(usageTimeoutIdRef.current);
        if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current);
        await saveCurrentUsage(userId, true); 
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    checkAppStatusAndInitializeTimer(); 

    return () => {
      
      const effectInstanceUserId = userId;

      const cleanup = async () => {
        
        
        if (effectInstanceUserId && activeSessionStartTimeRef.current && !appIsGloballySleeping) {
            console.log(`AppDrawer (User ${effectInstanceUserId}): Cleanup - saving current usage.`);
            await saveCurrentUsage(effectInstanceUserId, false); 
            
        }

        appStateSubscription.remove(); 
        
        if (usageTimeoutIdRef.current) clearTimeout(usageTimeoutIdRef.current); usageTimeoutIdRef.current = null;
        if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current); countdownIntervalIdRef.current = null;
        console.log(`AppDrawer (User ${effectInstanceUserId}): Timer and AppState effect cleanup finished.`);
      };
      cleanup().catch(e => console.error(`AppDrawer (User ${effectInstanceUserId}): Error in timer cleanup:`, e));
    };
  }, [currentUser?.uid, timerTrigger]); 

  const handleRestartCountdown = async () => {
    const userId = currentUser?.uid;
    if (!userId) {
        console.log("AppDrawer: Cannot restart countdown, no user.");
        return;
    }
    console.log(`AppDrawer (User ${userId}): Restarting countdown...`);
    
    if (usageTimeoutIdRef.current) clearTimeout(usageTimeoutIdRef.current); usageTimeoutIdRef.current = null;
    if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current); countdownIntervalIdRef.current = null;
    activeSessionStartTimeRef.current = null;

    
    const getSleepKey = () => `appSleepUntilNextDayTimestamp_${userId}`;
    const getCumulativeUsageKey = () => `appCumulativeUsageMs_${userId}`;
    const getLastUsageDateKey = () => `appLastUsageDate_${userId}`;

    try {
      await AsyncStorage.removeItem(getSleepKey());
      await AsyncStorage.removeItem(getCumulativeUsageKey());
      await AsyncStorage.removeItem(getLastUsageDateKey());
      console.log(`AppDrawer (User ${userId}): AsyncStorage keys for sleep/usage cleared.`);
    } catch (e) {
      console.error(`AppDrawer (User ${userId}): Failed to clear AsyncStorage keys on restart:`, e);
    }
    setAppIsGloballySleeping(false); 
    setTimerTrigger(prev => prev + 1); 
  };

  if (appIsGloballySleeping) {
    return (
      <View style={styles.timeoutOverlayContainer}>
        <Ionicons name="time-outline" size={80} color="#fff" style={{ marginBottom: 20 }} />
        <Text style={styles.timeoutOverlayTitle}>Time for a Rest!</Text>
        <Text style={styles.timeoutOverlayMessage}>{(() => {
          const totalMinutes = Math.floor(DAILY_USAGE_LIMIT_MS / (60 * 1000));
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          let message = "You've used the app for ";
          if (hours > 0) message += `${hours} hour${hours > 1 ? 's' : ''} `;
          if (minutes > 0 || hours === 0) message += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
          message = message.trim();
          message += " today. That's enough for today. The app will be available again tomorrow.";
          return message;
        })()}</Text>
        <TouchableOpacity
          style={styles.restartButton}
          onPress={handleRestartCountdown}
        >
          <Text style={styles.restartButtonText}>Start New Session</Text>
        </TouchableOpacity>
      </View>
    );
  }

return (
  <Drawer.Navigator
    
    drawerLockmode={false}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Drawer.Screen name="KwenturaHome" component={AppTabs} />
    <Drawer.Screen name="ProfileStack" component={ProfileStack} />
  </Drawer.Navigator>
);
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
 
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="StudDetails" component={StudDetails} />
      <Stack.Screen name="RegisterComplete" component={RegisterComplete} />
      <Stack.Screen name="Rewards" component={Rewards} />
      
      <Stack.Screen name="ForgotPass" component={ForgotPassword} /> 
      <Stack.Screen name="ChooseVerify" component={ChooseVerif} />
      <Stack.Screen name="ContactVerif" component={ContactVerif} />
      <Stack.Screen name="EmailVerif" component={EmailVerif} />
      <Stack.Screen name="NewPass" component={NewPass} />
      <Stack.Screen name="ForgotPassComplete" component={ForgotPassComplete} />

      <Stack.Screen name="TermsCondition" component={TermsCondition} /> 
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />

    
      
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [hasInitialDocument, setHasInitialDocument] = useState(null); 
  const { isVerifyingEmail, registrationCompleted } = useAuthFlow();

  
  const isVerifyingEmailRef = useRef(isVerifyingEmail);
  useEffect(() => {
    isVerifyingEmailRef.current = isVerifyingEmail;
  }, [isVerifyingEmail]);
  
  
  
  
  useEffect(() => {
    setInitializing(true);

    const unsubscribeAuth = auth.onAuthStateChanged((userAuth) => {
      
      
      if (!isVerifyingEmailRef.current) {
        setUser(userAuth);
        if (!userAuth) {
          setInitializing(false);
          setIsProfileComplete(null);
          setHasInitialDocument(null); 
        }
      }
    });
    return unsubscribeAuth;
  }, []); 

  
  
  
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "students", user.uid);

      const unsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          const remoteSessionId = docSnap.data()?.activeSessionId;
          const localSessionId = await AsyncStorage.getItem("userSessionId");

          if (localSessionId && remoteSessionId && localSessionId !== remoteSessionId) {
            unsubscribe(); 

            Alert.alert(
              "Session Expired",
              "You have been logged out because this account was signed into from another device.",
              [
                {
                  text: "OK",
                  onPress: async () => {
                    await AsyncStorage.removeItem("userSessionId");
                    await firebaseSignOut(auth);
                  },
                },
              ],
              { cancelable: false }
            );
          }
        }
      });

      return () => unsubscribe(); 
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      
      if (isProfileComplete === null) {
        setIsProfileComplete(null);
      }
      const docRef = doc(db, "students", user.uid);
      const unsubscribeSnapshot = onSnapshot(
        docRef,
        (docSnap) => {
          const docExists = docSnap.exists();
          setHasInitialDocument(docExists);

          if (docExists) {
            
            
            setIsProfileComplete(!!docSnap.data()?.schoolId);
          } else {
            
            setIsProfileComplete(false);
          }
          setInitializing(false);
        },
        (error) => {
          console.error("Error listening to profile document:", error);
          setHasInitialDocument(false);
          setIsProfileComplete(false);
          setInitializing(false);
        }
      );
      return () => unsubscribeSnapshot();
    } else {
      
      setInitializing(false);
      setHasInitialDocument(null);
      setIsProfileComplete(null);
    }
  }, [user?.uid, registrationCompleted]); 

  if (initializing || (user && (isProfileComplete === null || hasInitialDocument === null))) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFCF2D" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : hasInitialDocument === false ? (
          
          
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : isProfileComplete === true ? (
          
          <Stack.Screen name="App">
            {() => <ProfileProvider><AppDrawer /></ProfileProvider>}
          </Stack.Screen>
        ) : (
          
          <Stack.Screen name="CompleteProfile" component={StudDetails} initialParams={{ userId: user.uid }} options={{ gestureEnabled: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthFlowProvider>
        <RootNavigator />
      </AuthFlowProvider>
    </GestureHandlerRootView>
  );
}


import { preloadAllStories } from "./services/preloadService";

export default function AppWrapper() {
  const [fontsLoaded, fontError] = useFonts({
    'Fredoka-SemiBold': require('./assets/fonts/Fredoka-SemiBold.ttf'),
    
    
    
    
  });

  useEffect(() => {
    const preload = async () => {
      await preloadAllStories();
    };
    preload();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <View onLayout={onLayoutRootView} style={{flex: 1}}><App /></View>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  drawerHeader: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#f8f8f8",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  drawerLogo: {
    width: 45,
    height: 45,
    marginRight: 12,
  },
  drawerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "red",
  },
  drawerItem: {
    marginVertical: 3,
    marginHorizontal: 8,
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  drawerActiveTint: {
    color: "red",
  },
  drawerInactiveTint: {
    color: "gray",
  },
  drawerDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
    marginHorizontal: 15,
  },
  timeoutOverlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
    padding: 30,
  },
  timeoutOverlayTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  timeoutOverlayMessage: {
    fontSize: 18,
    color: '#eee',
    textAlign: 'center',
    lineHeight: 26,
  },
  restartButton: {
    marginTop: 30,
    backgroundColor: '#FF6DA8', 
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff', 
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
