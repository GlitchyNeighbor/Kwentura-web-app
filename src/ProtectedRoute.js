import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useSessionManager from "./components/useSessionManager";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./config/FirebaseConfig";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Check if user is an admin
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          const adminData = adminDocSnap.data();
          setUserRole(adminData.role || "admin"); // Use the role from Firestore, default to "admin"
          setCheckingRole(false);
          return;
        }

        // Check if user is a teacher
        const teacherDocRef = doc(db, "teachers", user.uid);
        const teacherDocSnap = await getDoc(teacherDocRef);
        if (teacherDocSnap.exists()) {
          setUserRole("teacher");
          setCheckingRole(false);
          return;
        }

        // If not admin or teacher, assume student or unassigned role
        setUserRole("student"); // Default role if not found in admin or teacher collections
        setCheckingRole(false);
      } else {
        setCheckingRole(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useSessionManager(user);

  if (loading || checkingRole) return null; // Still loading auth state or checking role

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect based on role if not authorized for the current route
    if (userRole === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    } else if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // For students or unassigned roles trying to access protected routes
      return <Navigate to="/home" replace />; // Redirect to home or a generic unauthorized page
    }
  }

  return children;
};

export default ProtectedRoute;
