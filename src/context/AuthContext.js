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
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);

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
          // Normalize role strings to a canonical set used across the app
          const rawRole = (data[roleField] || defaultRole || '').toString();
          const roleLower = rawRole.toLowerCase();
          let canonicalRole;
          if (roleLower === 'superadmin' || roleLower === 'super_admin' || roleLower === 'super-admin') {
            canonicalRole = 'superAdmin';
          } else if (roleLower === 'admin') {
            canonicalRole = 'admin';
          } else if (roleLower === 'teacher') {
            canonicalRole = 'teacher';
          } else if (roleLower === 'student') {
            canonicalRole = 'student';
          } else {
            canonicalRole = defaultRole || 'user';
          }

          foundUserData = {
            id: docSnap.id, // Use the actual document ID
            ...data,
            role: canonicalRole,
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

  const fetchPendingStudents = useCallback(async () => {
    const currentData = userDataRef.current;
    if (currentData?.role === 'teacher' && currentData?.section) {
      try {
        const studentsRef = collection(db, "students");
        const q = query(
          studentsRef,
          where("section", "==", currentData.section),
          where("status", "==", "pending_approval")
        );
        const querySnapshot = await getDocs(q);
        const studentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingStudents(studentsList);
      } catch (err) {
        console.error("AuthContext: Error fetching pending students:", err);
        // Optionally set an error state here
      }
    } else {
      // If user is not a teacher or has no section, ensure the list is empty
      setPendingStudents([]);
    }
  }, []);

  const fetchPendingTeachers = useCallback(async () => {
    // Only admins and superadmins should fetch pending teacher approvals
    const currentData = userDataRef.current;
    if (!currentData) {
      setPendingTeachers([]);
      return;
    }

    if (currentData.role === USER_ROLES.ADMIN || currentData.role === USER_ROLES.SUPERADMIN) {
      try {
        const teachersRef = collection(db, "pendingTeachers");
        const q = query(teachersRef); // assuming all docs in this collection are pending
        const querySnapshot = await getDocs(q);
        const teachersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingTeachers(teachersList);
      } catch (err) {
        console.error("AuthContext: Error fetching pending teachers:", err);
        setPendingTeachers([]);
      }
    } else {
      setPendingTeachers([]);
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
    // When userData is updated (e.g., on login), fetch pending students
    if (userData?.role === 'teacher') {
      fetchPendingStudents();
    } else if (userData?.role === USER_ROLES.ADMIN || userData?.role === USER_ROLES.SUPERADMIN) {
      // For admins and super admins, fetch pending teacher approvals
      fetchPendingTeachers();
    } else {
      // Clear lists for other roles
      setPendingStudents([]);
      setPendingTeachers([]);
    }
  }, [userData, fetchPendingStudents, fetchPendingTeachers]);

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

    // Use the Firestore document ID found during profile lookup when available.
    // Many collections use document IDs that are not the same as the Firebase Auth UID.
    const targetDocId = userData?.id || user.uid;
    const userDocRef = doc(db, collectionName, targetDocId);
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
    pendingStudents,
    pendingTeachers,
    logout,
    fetchPendingStudents,
    fetchPendingTeachers,
    refetchUserData: () => user ? fetchUserDataFromFirestore(user) : Promise.resolve(),
  }), [user, userData, loading, error, pendingStudents, pendingTeachers, logout, fetchUserDataFromFirestore, fetchPendingStudents, fetchPendingTeachers]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};