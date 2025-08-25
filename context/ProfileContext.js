import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../FirebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getUnlockedAnimalAvatars } from '../components/rewardsConfig'; // Adjust path as needed

const ProfileContext = createContext(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({
    parentFirstName: "",
    parentLastName: "",
    email: "",
    contactNumber: "",
    studentFirstName: "",
    studentLastName: "",
    studentId: "",
    gradeLevel: "",
    section: "",
    avatarConfig: null
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [unlockedAnimalAvatars, setUnlockedAnimalAvatars] = useState([]);

  // Effect to listen for unlocked animal avatars
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setUnlockedAnimalAvatars([]);
      return;
    }

    const userDocRef = doc(db, "students", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const unlockedRewardsArr = docSnap.data().unlockedRewards || [];
        const unlockedSet = new Set(unlockedRewardsArr);
        const animalAvatars = getUnlockedAnimalAvatars(unlockedSet);
        setUnlockedAnimalAvatars(animalAvatars.length > 0 ? animalAvatars : []);
      } else {
        setUnlockedAnimalAvatars([]);
      }
    }, (error) => {
      console.error("Error listening to unlocked animal avatars:", error);
      setUnlockedAnimalAvatars([]);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  // Effect to fetch and listen for profile data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        try {
          const docRef = doc(db, "students", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            let avatarConfig = null;
            if (
              typeof data.avatarConfig === "number" &&
              unlockedAnimalAvatars.length > 0 &&
              unlockedAnimalAvatars[data.avatarConfig]
            ) {
              avatarConfig = unlockedAnimalAvatars[data.avatarConfig];
            } else if (
              unlockedAnimalAvatars.length > 0 &&
              unlockedAnimalAvatars.includes(data.avatarConfig)
            ) {
              avatarConfig = data.avatarConfig;
            } else if (unlockedAnimalAvatars.length > 0) {
              avatarConfig = unlockedAnimalAvatars[0];
            }

            setProfileData({
              parentFirstName: data.parentFirstName || "",
              parentLastName: data.parentLastName || "",
              email: data.email || "",
              contactNumber: data.parentContactNumber || "",
              studentFirstName: data.studentFirstName || "",
              studentLastName: data.studentLastName || "",
              studentId: data.schoolId || "",
              gradeLevel: data.gradeLevel || "",
              section: data.section || "",
              avatarConfig: avatarConfig
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Alert.alert("Error", "Failed to fetch user data: " + error.message);
        }
      } else {
        setProfileData({
          parentFirstName: "",
          parentLastName: "",
          email: "",
          contactNumber: "",
          studentFirstName: "",
          studentLastName: "",
          studentId: "",
          gradeLevel: "",
          section: "",
          avatarConfig: unlockedAnimalAvatars.length > 0 ? unlockedAnimalAvatars[0] : null
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [unlockedAnimalAvatars]);

  const updateAvatar = useCallback(async (newAvatar) => {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      const docRef = doc(db, "students", user.uid);
      const avatarIndex = unlockedAnimalAvatars.indexOf(newAvatar);
      await updateDoc(docRef, {
        avatarConfig: avatarIndex,
        updatedAt: serverTimestamp(),
      });
      setProfileData(prev => ({ ...prev, avatarConfig: newAvatar }));
      return true;
    } catch (error) {
      console.error("Error updating avatar:", error);
      // Alert.alert("Error", "Failed to save avatar: " + error.message);
      return false;
    }
  }, [unlockedAnimalAvatars]);

  const saveChanges = useCallback(async (updates) => {
    const user = auth.currentUser;
    if (!user || isSaving) return false;

    setIsSaving(true);
    try {
      const docRef = doc(db, "students", user.uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      setProfileData(prev => ({ ...prev, ...updates }));
      // Alert.alert("Success", "Changes saved successfully!");
      return true;
    } catch (error) {
      console.error("Error saving changes:", error);
      // Alert.alert("Error", "Failed to save changes: " + error.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  const value = {
    profileData,
    loading,
    isSaving,
    updateAvatar,
    saveChanges,
    unlockedAnimalAvatars,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
