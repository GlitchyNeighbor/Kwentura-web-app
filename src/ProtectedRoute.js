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
        
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          const adminData = adminDocSnap.data();
          
          const rawRole = (adminData.role || "admin").toString();
          const normalized = (rawRole || "").toLowerCase();
          if (normalized === 'superadmin' || normalized === 'super_admin' || normalized === 'super-admin') {
            setUserRole('superAdmin');
          } else if (normalized === 'admin') {
            setUserRole('admin');
          } else {
            
            setUserRole('admin');
          }
          setCheckingRole(false);
          return;
        }

        
        const teacherDocRef = doc(db, "teachers", user.uid);
        const teacherDocSnap = await getDoc(teacherDocRef);
        if (teacherDocSnap.exists()) {
          setUserRole("teacher");
          setCheckingRole(false);
          return;
        }

        
        setUserRole("student"); 
        setCheckingRole(false);
      } else {
        setCheckingRole(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useSessionManager(user);

  if (loading || checkingRole) return null; 

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    
    if (userRole === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    } else if (userRole === "admin" || userRole === "superAdmin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      
      return <Navigate to="/home" replace />; 
    }
  }

  return children;
};

export default ProtectedRoute;
