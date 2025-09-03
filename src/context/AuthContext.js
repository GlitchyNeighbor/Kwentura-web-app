import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { getAuth, onAuthStateChanged, signOut, } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
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

  const logout = useCallback(async () => {
    if (user && userData) {
        let collectionName = null;
        const role = userData.role;
        
        if (role === USER_ROLES.TEACHER) collectionName = "teachers";
        else if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN) collectionName = "admins";
        else if (role === USER_ROLES.STUDENT) collectionName = "students";

        if (collectionName) {
          try {
            const userDocRef = doc(db, collectionName, user.uid);
            await updateDoc(userDocRef, { activeSessionId: null });
          } catch (dbError) {
            console.warn(`AuthContext: Could not clear active session for user in ${collectionName}:`, dbError);
          }
        }
    }
    await signOut(auth);
    sessionStorage.clear();
    localStorage.removeItem("user");
  }, [auth, user, userData]);

  const value = useMemo(() => ({
    user,
    userData,
    loading,
    error,
    logout,
    refetchUserData: () => { if(user) fetchUserDataFromFirestore(user) }
  }), [user, userData, loading, error, logout, fetchUserDataFromFirestore]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};