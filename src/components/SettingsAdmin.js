import React, { useState, useEffect, useCallback } from "react";
import { User, ChevronLeft, Eye, EyeOff, Camera, Trash2, Upload, Check, RefreshCw } from "lucide-react";
import { Row, Button, Form, Alert } from "react-bootstrap";
import SidebarSettingsAdmin from "./SidebarSettingsAdmin";
import TopNavbar from "./TopNavbar";
import "../scss/custom.scss";
import {
  getAuth,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { app } from "../config/FirebaseConfig.js";
import { useNavigate } from "react-router-dom";

const db = getFirestore(app);

const SettingsAdmin = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    schoolId: "",
    contactNumber: "",
    emailAddress: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userDocId, setUserDocId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [passwordUpdateStatus, setPasswordUpdateStatus] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();

  const fetchUserDataFromFirestore = useCallback(async (currentUser) => {
    setLoading(true);
    try {
      const collectionsToSearch = [
        { name: "admins", defaultRole: "admin" },
        { name: "teachers", defaultRole: "teacher" },
        { name: "students", defaultRole: "student" },
      ];

      let userData = null;
      let userRole = null;
      let docId = null;

      for (const { name: collectionName, defaultRole } of collectionsToSearch) {
        const emailQuery = query(
          collection(db, collectionName),
          where("email", "==", currentUser.email)
        );
        const emailSnapshot = await getDocs(emailQuery);

        if (!emailSnapshot.empty) {
          const docSnap = emailSnapshot.docs[0];
          userData = docSnap.data();
          userRole = userData.role || defaultRole;
          docId = docSnap.id;
          break;
        }

        if (currentUser.uid) {
          const uidQuery = query(
            collection(db, collectionName),
            where("uid", "==", currentUser.uid)
          );
          const uidSnapshot = await getDocs(uidQuery);

          if (!uidSnapshot.empty) {
            const docSnap = uidSnapshot.docs[0];
            userData = docSnap.data();
            userRole = userData.role || defaultRole;
            docId = docSnap.id;
            break;
          }
        }
      }

      if (userData && docId) {
        setUserDetails({
          fullName: `${userData.firstName || ""} ${
            userData.lastName || ""
          }`.trim(),
          schoolId: userData.schoolId || "",
          contactNumber: userData.contactNumber || "",
          emailAddress: userData.email || currentUser.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setUserDocId(docId);
        setUserRole(userRole);
        setProfileImageUrl(userData.profileImageUrl || "");

        if (
          userRole !== "admin" &&
          userRole !== "superAdmin" &&
          userRole !== "superadmin"
        ) {
          await signOut(auth);
          navigate("/login");
          return;
        }
      } else {
        await signOut(auth);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
      await signOut(auth);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [auth, navigate, setUserDetails, setUserDocId, setUserRole, setProfileImageUrl, setLoading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserDataFromFirestore(user);
        setIsEmailVerified(user.emailVerified);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, uploadingImage, fetchUserDataFromFirestore]);

  const handleSendVerificationEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        setUpdateStatus({
          show: true,
          message: "Verification email sent! Please check your inbox.",
          type: "success",
        });
        // It's important to reload the user to get the updated emailVerified status
        await user.reload();
        setIsEmailVerified(user.emailVerified);
      } catch (error) {
        console.error("Error sending verification email:", error);
        setUpdateStatus({
          show: true,
          message: "Failed to send verification email: " + error.message,
          type: "danger",
        });
      }
    } else {
      setUpdateStatus({
        show: true,
        message: "No authenticated user found to send verification email.",
        type: "danger",
      });
      console.error("No authenticated user found when trying to send verification email.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setUserDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    setUpdateStatus({ show: false, message: "", type: "" });

    if (!userDocId) {
      setUpdateStatus({
        show: true,
        message: "User document ID not found. Please refresh and try again.",
        type: "danger",
      });
      return;
    }

    try {
      let collectionName = "admins";
      if (userRole === "teacher") {
        collectionName = "teachers";
      } else if (userRole === "student") {
        collectionName = "students";
      }

      const userRef = doc(db, collectionName, userDocId);
      await updateDoc(userRef, {
        contactNumber: userDetails.contactNumber,
        email: userDetails.emailAddress,
        updatedAt: serverTimestamp(),
      });

      setUpdateStatus({
        show: true,
        message: "Profile updated successfully! You may need to re-login if email was changed.",
        type: "success",
      });

      setTimeout(() => {
        setUpdateStatus({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      let errorMessage = "Failed to update profile: " + error.message;

      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please re-authenticate to update your email. Log out and log back in.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is not valid.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email address is already in use by another account.";
      }

      setUpdateStatus({
        show: true,
        message: errorMessage,
        type: "danger",
      });
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordUpdateStatus({ show: false, message: "", type: "" });
    setIsUpdatingPassword(true);

    try {
      if (
        !userDetails.currentPassword ||
        !userDetails.newPassword ||
        !userDetails.confirmPassword
      ) {
        setPasswordUpdateStatus({
          show: true,
          message: "Please fill in all password fields.",
          type: "danger",
        });
        return;
      }

      if (userDetails.newPassword !== userDetails.confirmPassword) {
        setPasswordUpdateStatus({
          show: true,
          message: "New password and confirm password do not match.",
          type: "danger",
        });
        return;
      }

      if (userDetails.newPassword.length < 6) {
        setPasswordUpdateStatus({
          show: true,
          message: "New password must be at least 6 characters long.",
          type: "danger",
        });
        return;
      }

      if (userDetails.currentPassword === userDetails.newPassword) {
        setPasswordUpdateStatus({
          show: true,
          message: "New password must be different from current password.",
          type: "danger",
        });
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        setPasswordUpdateStatus({
          show: true,
          message: "No authenticated user found. Please log in again.",
          type: "danger",
        });
        return;
      }

      if (!user.email) {
        setPasswordUpdateStatus({
          show: true,
          message: "User email not found. Please log in again.",
          type: "danger",
        });
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        userDetails.currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, userDetails.newPassword);

      setPasswordUpdateStatus({
        show: true,
        message:
          "Password updated successfully! You can now use your new password to log in.",
        type: "success",
      });

      setUserDetails((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setTimeout(() => {
        setPasswordUpdateStatus({ show: false, message: "", type: "" });
      }, 5000);
    } catch (error) {
      console.error("Password update error:", error);

      let errorMessage = "Failed to update password. Please try again.";

      switch (error.code) {
        case "auth/wrong-password":
          errorMessage =
            "Current password is incorrect. Please check and try again.";
          break;
        case "auth/weak-password":
          errorMessage =
            "New password is too weak. Please choose a stronger password.";
          break;
        case "auth/requires-recent-login":
          errorMessage =
            "For security reasons, please log out and log back in before changing your password.";
          break;
        case "auth/user-mismatch":
          errorMessage =
            "Authentication error. Please log out and log back in.";
          break;
        case "auth/user-not-found":
          errorMessage = "User account not found. Please log in again.";
          break;
        case "auth/invalid-credential":
          errorMessage =
            "Invalid credentials. Please check your current password and try again.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your internet connection and try again.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many failed attempts. Please wait a moment before trying again.";
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }

      setPasswordUpdateStatus({
        show: true,
        message: errorMessage,
        type: "danger",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Update Firestore
      let collectionName = "admins";
      if (userRole === "teacher") {
        collectionName = "teachers";
      } else if (userRole === "student") {
        collectionName = "students";
      }
      const userRef = doc(db, collectionName, userDocId);
      await updateDoc(userRef, { profileImageUrl: url, updatedAt: serverTimestamp() });

      setProfileImageUrl(url);
      window.dispatchEvent(new Event("profileImageUpdated"));
    } catch (error) {
      setUpdateStatus({
        show: true,
        message: "Failed to upload image: " + error.message,
        type: "danger",
      });
    }
    setUploadingImage(false);
  };

  const handleRemoveProfilePicture = async () => {
    if (!profileImageUrl) {
      setUpdateStatus({
        show: true,
        message: "No profile picture to remove.",
        type: "info",
      });
      return;
    }

    // Add confirmation dialog
    const confirmRemoval = window.confirm(
      "Are you sure you want to remove your profile picture? This action cannot be undone."
    );
    
    if (!confirmRemoval) {
      return;
    }

    try {
      const storage = getStorage();
      const imageRef = ref(storage, profileImageUrl);
      await deleteObject(imageRef);

      let collectionName = "admins";
      if (userRole === "teacher") {
        collectionName = "teachers";
      } else if (userRole === "student") {
        collectionName = "students";
      }
      const userRef = doc(db, collectionName, userDocId);
      await updateDoc(userRef, { profileImageUrl: deleteField() });

      setProfileImageUrl("");
      setUpdateStatus({
        show: true,
        message: "Profile picture removed successfully!",
        type: "success",
      });
      window.dispatchEvent(new Event("profileImageUpdated"));
    } catch (error) {
      console.error("Error removing profile picture:", error);
      setUpdateStatus({
        show: true,
        message: "Failed to remove profile picture: " + error.message,
        type: "danger",
      });
    }
  };

  if (loading) {
    return (
      <div>
        {/* Sticky TopNavbar */}
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1050,
          background: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <TopNavbar toggleSidebar={() => setSidebarOpen((open) => !open)} />
        </div>
        
        <div className="settingsadmin-root" style={{ display: "flex", paddingTop: "56px" }}>
          <div
            className={`sidebar-container${sidebarOpen ? " show" : ""}`}
            style={{
              position: "fixed",
              top: "56px",
              left: 0,
              zIndex: 1000,
              height: "calc(100vh - 56px)",
            }}
          >
            <SidebarSettingsAdmin
              isOpen={sidebarOpen}
              toggleSidebar={() => setSidebarOpen(false)}
              handleLogout={handleLogout}
            />
          </div>
          <div
            className={`main-content${sidebarOpen ? " shifted" : ""}`}
            style={{
              flex: 1,
              minHeight: "100vh",
              background: "linear-gradient(135deg, #fdf7fd 0%, #f8f0f8 100%)",
              marginLeft: sidebarOpen ? 250 : 0,
              transition: "margin-left 0.3s ease",
              padding: "32px 24px 24px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div 
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "40px",
                boxShadow: "0 20px 60px rgba(237, 125, 183, 0.15)",
                border: "1px solid rgba(255, 84, 154, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                fontSize: "18px",
                fontWeight: "500",
                color: "#c2185b",
              }}
            >
              <div 
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF549A, #c2185b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "spin 1s linear infinite",
                }}
              >
                <div 
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "3px solid rgba(255, 255, 255, 0.3)",
                    borderTop: "3px solid white",
                    borderRadius: "50%",
                    animation: "inherit",
                  }}
                />
              </div>
              Loading your profile...
            </div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky TopNavbar */}
      <div style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1050,
        background: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <TopNavbar toggleSidebar={() => setSidebarOpen((open) => !open)} />
      </div>

      <div className="settingsadmin-root" style={{ display: "flex", paddingTop: "56px" }}>
        <div
          className={`sidebar-container${sidebarOpen ? " show" : ""}`}
          style={{
            position: "fixed",
            top: "56px",
            left: 0,
            zIndex: 1000,
            height: "calc(100vh - 56px)",
          }}
        >
          <SidebarSettingsAdmin
            isOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(false)}
            handleLogout={handleLogout}
            profileImageUrl={profileImageUrl}
            userName={userDetails.fullName}
            userRole={userRole}
          />
        </div>

        <div
          className={`main-content${sidebarOpen ? " shifted" : ""}`}
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #fdf7fd 0%, #f8f0f8 100%)",
            marginLeft: sidebarOpen ? 250 : 0,
            transition: "margin-left 0.3s ease",
            padding: "32px 24px 24px 24px",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          {/* Header Section */}
          <div 
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "24px 32px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(237, 125, 183, 0.12)",
              border: "1px solid rgba(255, 84, 154, 0.1)",
            }}
          >
            <div className="d-flex flex-wrap align-items-center justify-content-between">
              <div className="flex-grow-1">
                <Button
                  variant="link"
                  className="d-flex align-items-center p-0"
                  style={{ 
                    color: "#FF549A", 
                    textDecoration: "none",
                    fontWeight: "500",
                    fontSize: "16px",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => navigate("/admin/dashboard")}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#e91e63";
                    e.target.style.transform = "translateX(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#FF549A";
                    e.target.style.transform = "translateX(0)";
                  }}
                >
                  <ChevronLeft size={20} className="me-2" />
                  <span>Back to Dashboard</span>
                </Button>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Button
                  variant="link"
                  className={`tab-button ${activeTab === "about" ? "active" : ""}`}
                  onClick={() => setActiveTab("about")}
                  style={{ 
                    color: activeTab === "about" ? "#FF549A" : "#e91e63",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "16px",
                    padding: "12px 24px",
                    borderRadius: "25px",
                    background: activeTab === "about" 
                      ? "linear-gradient(135deg, rgba(255, 84, 154, 0.15), rgba(194, 24, 91, 0.1))"
                      : "transparent",
                    border: activeTab === "about" ? "2px solid rgba(255, 84, 154, 0.3)" : "2px solid transparent",
                    transition: "all 0.3s ease",
                  }}
                >
                  About Me
                </Button>
                <Button
                  variant="link"
                  className={`tab-button ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => setActiveTab("password")}
                  style={{ 
                    color: activeTab === "password" ? "#FF549A" : "#e91e63",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "16px",
                    padding: "12px 24px",
                    borderRadius: "25px",
                    background: activeTab === "password" 
                      ? "linear-gradient(135deg, rgba(255, 84, 154, 0.15), rgba(194, 24, 91, 0.1))"
                      : "transparent",
                    border: activeTab === "password" ? "2px solid rgba(255, 84, 154, 0.3)" : "2px solid transparent",
                    transition: "all 0.3s ease",
                  }}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div 
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "40px",
              boxShadow: "0 20px 60px rgba(237, 125, 183, 0.15)",
              border: "1px solid rgba(255, 84, 154, 0.1)",
            }}
          >
            {/* About Me Tab */}
            {activeTab === "about" && (
              <>
                <div 
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "black",
                    marginBottom: "32px",
                    background: "#2D2D2D",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Profile Picture
                </div>
                
                {updateStatus.show && (
                    <Alert
                      variant={updateStatus.type}
                      onClose={() =>
                        setUpdateStatus({ show: false, message: "", type: "" })
                      }
                      dismissible
                      className="mt-4"
                      style={{
                        borderRadius: "15px",
                        border: updateStatus.type === "success" 
                          ? "2px solid #28a745" 
                          : "2px solid #dc3545",
                        background: updateStatus.type === "success"
                          ? "rgba(40, 167, 69, 0.1)"
                          : "rgba(220, 53, 69, 0.1)",
                      }}
                    >
                      {updateStatus.message}
                    </Alert>
                  )}
                
                {/* Profile Picture Section */}
                <div 
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 84, 154, 0.05), rgba(194, 24, 91, 0.03))",
                    borderRadius: "20px",
                    padding: "32px",
                    marginBottom: "40px",
                    border: "1px solid rgba(255, 84, 154, 0.1)",
                  }}
                  className="d-flex flex-column flex-sm-row align-items-center gap-4"
                >
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        background: profileImageUrl 
                          ? `url(${profileImageUrl}) center/cover`
                          : "linear-gradient(135deg, #FF549A, #c2185b)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "4px solid rgba(255, 84, 154, 0.3)",
                        boxShadow: "0 15px 35px rgba(237, 125, 183, 0.3)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      {!profileImageUrl && <User size={50} color="white" />}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          right: "8px",
                          background: "linear-gradient(135deg, #FF549A)",
                          borderRadius: "50%",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "3px solid white",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}
                      >
                        <Camera size={16} color="white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex flex-column gap-3">
                    <h5 style={{ color: "#2D2D2D", fontWeight: "600", marginBottom: "8px" }}>
                      {userDetails.fullName || "No name set"}
                    </h5>
                    <p style={{ color: "#2D2D2D", marginBottom: "16px" }}>
                      Update your profile picture to personalize your account
                    </p>
                    <div className="d-flex gap-3 flex-wrap">
                      <Button
                        style={{
                          background: "linear-gradient(135deg, #FF549A)",
                          border: "none",
                          borderRadius: "25px",
                          padding: "12px 24px",
                          fontWeight: "600",
                          color: "white",
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: "0 8px 25px rgba(237, 125, 183, 0.4)",
                          transition: "all 0.3s ease",
                        }}
                        disabled={uploadingImage}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 12px 35px rgba(237, 125, 183, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 8px 25px rgba(237, 125, 183, 0.4)";
                        }}
                      >
                        <Upload size={18} className="me-2" />
                        {uploadingImage ? "Uploading..." : "Upload New"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            
                          }}
                          onChange={handleProfileImageUpload}
                          disabled={uploadingImage}
                          
                        />
                      </Button>
                      <Button
                        style={{
                          background: "transparent",
                          border: "2px solid #FF549A",
                          borderRadius: "25px",
                          padding: "12px 24px",
                          fontWeight: "600",
                          color: "#FF549A",
                          transition: "all 0.3s ease",
                        }}
                        onClick={handleRemoveProfilePicture}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#FF549A";
                          e.target.style.color = "white";
                          e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#FF549A";
                          e.target.style.transform = "translateY(0)";
                        }}
                      >
                        <Trash2 size={18} className="me-2" />
                        Remove Picture
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div 
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#FF549A",
                    marginBottom: "16px",
                    background: "#2D2D2D",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Personal Information
                </div>
                
                {/* Editable Note */}
                <div 
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 84, 154, 0.1), rgba(233, 30, 99, 0.05))",
                    border: "1px solid rgba(255, 84, 154, 0.2)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    marginBottom: "32px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span style={{ color: "#2D2D2D", fontSize: "14px", fontWeight: "500" }}>
                    <strong>Note:</strong> Only the contact number field is editable. Other information is managed by the system administrator.
                  </span>
                </div>
                
                <Form style={{ maxWidth: "800px" }}>
                  <Row className="g-4">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label 
                          style={{ 
                            color: "#2D2D2D", 
                            fontWeight: "600", 
                            marginBottom: "8px",
                            fontSize: "16px"
                          }}
                        >
                          School ID
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={userDetails.schoolId}
                          disabled
                          style={{
                            borderRadius: "15px",
                            border: "2px solid rgba(255, 84, 154, 0.2)",
                            padding: "15px 20px",
                            fontSize: "16px",
                            background: "rgba(255, 84, 154, 0.05)",
                            color: "#2D2D2D",
                          }}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label 
                          style={{ 
                            color: "#2D2D2D", 
                            fontWeight: "600", 
                            marginBottom: "8px",
                            fontSize: "16px"
                          }}
                        >
                          Email Address
                        </Form.Label>
                        <div className="d-flex gap-2 align-items-center">
                          <Form.Control
                            type="email"
                            value={userDetails.emailAddress}
                            disabled={true}
                            style={{
                              borderRadius: "15px",
                              border: "2px solid rgba(255, 84, 154, 0.2)",
                              padding: "15px 20px",
                              fontSize: "16px",
                              background: isEmailVerified ? "#f8f9fa" : "rgba(255, 84, 154, 0.05)",
                              color: "#2D2D2D",
                            }}
                          />
                          {isEmailVerified ? (
                            <span className="text-success d-flex align-items-center gap-1" style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                              <Check size={18} /> Email Verified
                            </span>
                          ) : (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={handleSendVerificationEmail}
                              style={{
                                minWidth: "100px",
                                fontSize: "0.9rem",
                                borderRadius: "15px",
                                padding: "8px 15px",
                                borderColor: "#FF549A",
                                color: "#FF549A",
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "#FF549A";
                                e.target.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.color = "#FF549A";
                              }}
                            >
                              <RefreshCw size={14} className="me-1" /> Verify
                            </Button>
                          )}
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label 
                          style={{ 
                            color: "#2D2D2D", 
                            fontWeight: "600", 
                            marginBottom: "8px",
                            fontSize: "16px"
                          }}
                        >
                          Contact Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          value={userDetails.contactNumber}
                          onChange={(e) =>
                            handleInputChange("contactNumber", e.target.value)
                          }
                          style={{
                            borderRadius: "15px",
                            border: "2px solid rgba(255, 84, 154, 0.2)",
                            padding: "15px 20px",
                            fontSize: "16px",
                            background: "white",
                            color: "#2D2D2D",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #FF549A";
                            e.target.style.boxShadow = "0 0 0 4px rgba(255, 84, 154, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid rgba(255, 84, 154, 0.2)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </Form.Group>
                    </div>
                  </Row>
                  
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={handleUpdateProfile}
                      style={{
                        background: "linear-gradient(135deg, #FF549A, #FF549A)",
                        border: "none",
                        borderRadius: "25px",
                        padding: "15px 40px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "white",
                        width: "100%",
                        maxWidth: "300px",
                        boxShadow: "0 8px 25px rgba(237, 125, 183, 0.4)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 12px 35px rgba(237, 125, 183, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 8px 25px rgba(237, 125, 183, 0.4)";
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div>
                <div 
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#FF549A",
                    marginBottom: "32px",
                    background: "#2D2D2D",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Change Password
                </div>

                {passwordUpdateStatus.show && (
                  <Alert
                    variant={passwordUpdateStatus.type}
                    onClose={() =>
                      setPasswordUpdateStatus({
                        show: false,
                        message: "",
                        type: "",
                      })
                    }
                    dismissible
                    className="mb-4"
                    style={{
                      borderRadius: "15px",
                      border: passwordUpdateStatus.type === "success" 
                        ? "2px solid #28a745" 
                        : "2px solid #dc3545",
                      background: passwordUpdateStatus.type === "success"
                        ? "rgba(40, 167, 69, 0.1)"
                        : "rgba(220, 53, 69, 0.1)",
                    }}
                  >
                    {passwordUpdateStatus.message}
                  </Alert>
                )}

                <Form style={{ maxWidth: "600px" }}>
                  <div className="mb-4">
                    <Form.Group>
                      <Form.Label 
                        style={{ 
                          color: "#2D2D2D", 
                          fontWeight: "600", 
                          marginBottom: "8px",
                          fontSize: "16px"
                        }}
                      >
                        Current Password
                      </Form.Label>
                      <div style={{ position: "relative" }}>
                        <Form.Control
                          type={showCurrentPassword ? "text" : "password"}
                          value={userDetails.currentPassword}
                          onChange={(e) =>
                            handleInputChange("currentPassword", e.target.value)
                          }
                          disabled={isUpdatingPassword}
                          placeholder="Enter your current password"
                          style={{
                            borderRadius: "15px",
                            border: "2px solid rgba(255, 84, 154, 0.2)",
                            padding: "15px 50px 15px 20px",
                            fontSize: "16px",
                            background: "white",
                            color: "#FF549A",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #FF549A";
                            e.target.style.boxShadow = "0 0 0 4px rgba(255, 84, 154, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid rgba(255, 84, 154, 0.2)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <Button
                          variant="link"
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          tabIndex={-1}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "15px",
                            transform: "translateY(-50%)",
                            border: "none",
                            boxShadow: "none",
                            background: "transparent",
                            padding: "5px",
                            zIndex: 2,
                          }}
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={18} color="#FF549A" />
                          ) : (
                            <Eye size={18} color="#2D2D2D" />
                          )}
                        </Button>
                      </div>
                    </Form.Group>
                  </div>

                  <div className="mb-4">
                    <Form.Group>
                      <Form.Label 
                        style={{ 
                          color: "#2D2D2D", 
                          fontWeight: "600", 
                          marginBottom: "8px",
                          fontSize: "16px"
                        }}
                      >
                        New Password
                      </Form.Label>
                      <div style={{ position: "relative" }}>
                        <Form.Control
                          type={showNewPassword ? "text" : "password"}
                          value={userDetails.newPassword}
                          onChange={(e) =>
                            handleInputChange("newPassword", e.target.value)
                          }
                          disabled={isUpdatingPassword}
                          placeholder="Enter your new password (minimum 6 characters)"
                          style={{
                            borderRadius: "15px",
                            border: "2px solid rgba(255, 84, 154, 0.2)",
                            padding: "15px 50px 15px 20px",
                            fontSize: "16px",
                            background: "white",
                            color: "#FF549A",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #FF549A";
                            e.target.style.boxShadow = "0 0 0 4px rgba(255, 84, 154, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid rgba(255, 84, 154, 0.2)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <Button
                          variant="link"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          tabIndex={-1}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "15px",
                            transform: "translateY(-50%)",
                            border: "none",
                            boxShadow: "none",
                            background: "transparent",
                            padding: "5px",
                            zIndex: 2,
                          }}
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} color="#FF549A" />
                          ) : (
                            <Eye size={18} color="#2D2D2D" />
                          )}
                        </Button>
                      </div>
                    </Form.Group>
                  </div>

                  <div className="mb-4">
                    <Form.Group>
                      <Form.Label 
                        style={{ 
                          color: "#2D2D2D", 
                          fontWeight: "600", 
                          marginBottom: "8px",
                          fontSize: "16px"
                        }}
                      >
                        Confirm New Password
                      </Form.Label>
                      <div style={{ position: "relative" }}>
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          value={userDetails.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          disabled={isUpdatingPassword}
                          placeholder="Confirm your new password"
                          style={{
                            borderRadius: "15px",
                            border: "2px solid rgba(255, 84, 154, 0.2)",
                            padding: "15px 50px 15px 20px",
                            fontSize: "16px",
                            background: "white",
                            color: "#FF549A",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #FF549A";
                            e.target.style.boxShadow = "0 0 0 4px rgba(255, 84, 154, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid rgba(255, 84, 154, 0.2)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <Button
                          variant="link"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          tabIndex={-1}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "15px",
                            transform: "translateY(-50%)",
                            border: "none",
                            boxShadow: "none",
                            background: "transparent",
                            padding: "5px",
                            zIndex: 2,
                          }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} color="#FF549A" />
                          ) : (
                            <Eye size={18} color="#2D2D2D" />
                          )}
                        </Button>
                      </div>
                    </Form.Group>
                  </div>

                  <Button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword}
                    style={{
                      background: isUpdatingPassword 
                        ? "linear-gradient(135deg, #ccc, #999)" 
                        : "linear-gradient(135deg, #FF549A)",
                      border: "none",
                      borderRadius: "25px",
                      padding: "15px 40px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "white",
                      width: "100%",
                      maxWidth: "300px",
                      boxShadow: isUpdatingPassword 
                        ? "0 4px 15px rgba(0, 0, 0, 0.1)" 
                        : "0 8px 25px rgba(237, 125, 183, 0.4)",
                      transition: "all 0.3s ease",
                      cursor: isUpdatingPassword ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!isUpdatingPassword) {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 12px 35px rgba(237, 125, 183, 0.5)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isUpdatingPassword) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 8px 25px rgba(237, 125, 183, 0.4)";
                      }
                    }}
                  >
                    {isUpdatingPassword ? "Updating Password..." : "Update Password"}
                  </Button>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .form-control:focus {
          outline: none !important;
        }
        
        .tab-button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(237, 125, 183, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default SettingsAdmin