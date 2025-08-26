import "./App.css";
import Home from "./components/Home";
import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import { StudentProvider } from "./context/StudentContext";
import AboutUs from "./components/AboutUs";
import Contact from "./components/Contact";
import Signup from "./components/Signup";
import Login from "./components/Login";
import "../src/scss/custom.scss";
import "../src/css/custom.css";
import StoryAssessment from "./components/StoryAssessment";
import TermsAndConditions from "./components/TermsAndConditions";
import PrivacyPolicy from "./components/PrivacyPolicy";
import AdminDashboard from "./components/AdminDashboard";
import ManageStories from "./components/ManageStories";
import ManageTeachers from "./components/ManageTeachers";
import ManageStudents from "./components/ManageStudents";
import AccountList from "./components/AccountList";
import Charts from "./components/Charts";
import ManageAdmins from "./components/ManageAdmins";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentList from "./components/StudentList";
import Stories from "./components/Stories";
import StorySynopsis from "./components/StorySynopsis";
import SettingsAdmin from "./components/SettingsAdmin";
import TeacherLibrary from "./components/TeacherLibrary";
import SettingsTeacher from "./components/SettingsTeacher";
import ApproveStudentAccounts from "./components/ApproveStudentAccount";
import ProtectedRoute from "./ProtectedRoute";
import ApproveTeacherAccount from "./components/ApproveTeacherAccount";
import ReadStory from "./components/ReadStory";
import ForgotPassword from "./components/ForgotPassword";
import TeacherCharts from "./components/TeacherCharts";

function App() {
  return (
    <BrowserRouter>
      <StudentProvider>
        <Routes>
          <Route path="/" element={<Navigate replace to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin","superAdmin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/stories"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <ManageStories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage/admins"
            element={
              <ProtectedRoute allowedRoles={["superAdmin"]}>
                <ManageAdmins />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage/teachers"
            element={
              <ProtectedRoute allowedRoles={["admin","superAdmin"]}>
                <ManageTeachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage/students"
            element={
              <ProtectedRoute allowedRoles={["admin","superAdmin"]}>
                <ManageStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/account-list"
            element={
              <ProtectedRoute allowedRoles={["admin","superAdmin"]}>
                <AccountList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/charts"
            element={
              <ProtectedRoute allowedRoles={["admin","superAdmin"]}>
                <Charts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["admin","superAdmin"]}>
                <SettingsAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approve-teachers"
            element={
              <ProtectedRoute allowedRoles={["admin","superAdmin"]}>
                <ApproveTeacherAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/student-list"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <StudentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/stories"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Stories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/story-synopsis/:id"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <StorySynopsis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/approve-students"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <ApproveStudentAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/library"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/settings"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <SettingsTeacher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/read-story/:id"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <ReadStory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/story-assessment/:id"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <StoryAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/charts"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherCharts />
              </ProtectedRoute>
            }
          />
        </Routes>
      </StudentProvider>
    </BrowserRouter>
  );
}

export default App;
