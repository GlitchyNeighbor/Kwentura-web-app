import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { getAuth, onAuthStateChanged, signOut, } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { app } from '../config/FirebaseConfig';

const AuthContext = createContext();
const db = getFirestore(app);

const USER_ROLES = {
  SUPERADMIN: "superAdmin",
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  USER: "user"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use a ref to hold userData to break dependency cycle
  const userDataRef = useRef(userData);
  const auth = getAuth();

  const fetchUserDataFromFirestore = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const collectionsToSearch = [
        { name: "admins", defaultRole: "admin", roleField: "role" },
        { name: "teachers", defaultRole: "teacher", roleField: "role" },
        { name: "students", defaultRole: "student", roleField: "role" },
      ];

      let foundUserData = null;

      for (const { name: collectionName, defaultRole, roleField } of collectionsToSearch) {
        let docSnap = null;

        // Try to find by UID first, as it's more reliable and unique
        if (currentUser.uid) {
            const docRef = doc(db, collectionName, currentUser.uid); // This is a reference, not a document
            const uidDocSnap = await getDoc(docRef);
            if (uidDocSnap.exists()) {
                docSnap = uidDocSnap;
            }
        }

        // If not found by UID, try by email as a fallback
        if (!docSnap && currentUser.email) {
          const emailQuery = query(collection(db, collectionName), where("email", "==", currentUser.email));
          const emailSnapshot = await getDocs(emailQuery);
          if (!emailSnapshot.empty) {
            docSnap = emailSnapshot.docs[0];
          }
        }
        
        if (docSnap) {
          const data = docSnap.data();
          foundUserData = {
            id: docSnap.id, // Use the actual document ID
            ...data,
            role: data[roleField] || defaultRole,
          };
          break;
        }
      }

      if (foundUserData) {
        const fullName = `${foundUserData.firstName || foundUserData.studentFirstName || ""} ${foundUserData.lastName || foundUserData.studentLastName || ""}`.trim();
        setUserData({ ...foundUserData, fullName });
      } else {
        // Fallback for users that might only exist in Auth
        const displayName = currentUser.displayName || "";
        const nameParts = displayName.split(" ");
        setUserData({
          uid: currentUser.uid,
          email: currentUser.email,
          role: USER_ROLES.USER,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          fullName: displayName,
          profileImageUrl: currentUser.photoURL || "",
        });
      }
    } catch (err) {
      console.error("AuthContext: Error fetching user data:", err);
      setError("Failed to load user profile.");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserDataFromFirestore(currentUser);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    const handleProfileUpdate = () => {
      if (auth.currentUser) {
        fetchUserDataFromFirestore(auth.currentUser);
      }
    };
    
    window.addEventListener("profileImageUpdated", handleProfileUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener("profileImageUpdated", handleProfileUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [auth, fetchUserDataFromFirestore]);

  // Keep userDataRef updated to avoid dependency cycles
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  const logout = useCallback(async () => {
    const currentUserData = userDataRef.current;
    if (user && currentUserData) {
      let collectionName = null;
      const role = currentUserData.role;

      if (role === USER_ROLES.TEACHER) {
        collectionName = "teachers";
      } else if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN) {
        collectionName = "admins";
      } else if (role === USER_ROLES.STUDENT) {
        collectionName = "students";
      }

      if (collectionName && currentUserData.id) {
        try {
          const userDocRef = doc(db, collectionName, currentUserData.id);
          await updateDoc(userDocRef, { activeSessionId: null });
        } catch (error) {
          console.error("Error clearing activeSessionId:", error);
        }
      }
    }

    try {
      await signOut(auth);
      sessionStorage.clear();
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
      throw error;
    }
  }, [user, auth]); // Removed userData from dependencies

  // Separate logout function for remote sign-out to avoid clearing the new session's ID
  const remoteLogout = useCallback(async () => {
    try {
      await signOut(auth);
      sessionStorage.clear();
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error during remote sign out from Firebase:", error);
      // Don't re-throw, as this is a background operation.
    }
  }, [auth]);

  useEffect(() => {
    // This effect should only run when the user logs in or out.
    if (!user) {
      return;
    }
    const sessionId = sessionStorage.getItem('activeSessionId');
    if (!sessionId) {
      return;
    }

    let collectionName;
    const role = userData?.role; // Use userData directly since it's a dependency

    if (role === USER_ROLES.TEACHER) {
      collectionName = "teachers";
    } else if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN) {
      collectionName = "admins";
    } else if (role === USER_ROLES.STUDENT) {
      collectionName = "students";
    }
    if (!collectionName) {
      return;
    }

    const userDocRef = doc(db, collectionName, user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const firestoreData = docSnapshot.data();
        if (
          firestoreData.activeSessionId &&
          firestoreData.activeSessionId !== sessionId
        ) {
          // Another device has logged in. Log this one out.
          unsubscribe(); // Stop listening to prevent re-triggering.
          remoteLogout().then(() => {
            alert("You have been logged out because you signed in on another device.");
          });
        }
      }
    });
    return () => unsubscribe();
  }, [user, userData, remoteLogout]); // Depend on the new remoteLogout function

  const value = useMemo(() => ({
    user,
    userData,
    loading,
    error,
    logout,
    refetchUserData: () => user ? fetchUserDataFromFirestore(user) : Promise.resolve(),
  }), [user, userData, loading, error, logout, fetchUserDataFromFirestore]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};