import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import Home from "./pages/Home";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, SetassessaData } from "./redux/rootSlice";
import Admin from "./pages/Admin";
import Login from "./pages/Admin/Login";
import UserCreateAccount from "./WebApp/Flows/UserFlow/SignUpLogin/UserCreateAccount";
import UserLogin from "./WebApp/Flows/UserFlow/SignUpLogin/UserLogin";
import UserFlow from "./WebApp/Flows/UserFlow/UserFlow";
import UserMainPage from "./WebApp/Flows/UserFlow/MainPage/UserMainPage";
import UserProfileForm from "./WebApp/Flows/UserFlow/SignUpLogin/UserProfileBuilding/UserProfileForm";
import UserProfilePicture from "./WebApp/Flows/UserFlow/SignUpLogin/UserProfileBuilding/UserProfilePicture";
import PartnerFlow from "./WebApp/Flows/PartnerFlow/PartnerFlow";
import PartnerCreateAccount from "./WebApp/Flows/PartnerFlow/SignUpLogin/PartnerCreateAccount";
import PartnerLogin from "./WebApp/Flows/PartnerFlow/SignUpLogin/PartnerLogin";
import PartnerProfileForm from "./WebApp/Flows/PartnerFlow/SignUpLogin/UserProfileBuilding/PartnerProfileForm";
import PartnerProfilePicture from "./WebApp/Flows/PartnerFlow/SignUpLogin/UserProfileBuilding/PartnerProfilePicture";
import PartnerMainPage from "./WebApp/Flows/PartnerFlow/MainPage/PartnerMainPage";
import AdminFlow from "./WebApp/Flows/AdminFlow/AdminFlow";
import AdminCreateAccount from "./WebApp/Flows/AdminFlow/SignUpLogin/AdminCreateAccount";
import AdminLogin from "./WebApp/Flows/AdminFlow/SignUpLogin/AdminLogin";
import AdminProfileForm from "./WebApp/Flows/AdminFlow/SignUpLogin/AdminProfileBuilding/AdminProfileForm";
import AdminProfilePicture from "./WebApp/Flows/AdminFlow/SignUpLogin/AdminProfileBuilding/AdminProfilePicture";
import AdminMainPage from "./WebApp/Flows/AdminFlow/MainPage/AdminMainPage";
import TryforFree from "./WebApp/TryforFree";
import StudyAssistant from "./components/StudyAssistant/Studyassistant";
import StudyRecommendation from "./components/StudyRecommendation/StudyRecommendation";
import Customcursor from "./components/Customcursor/Customcursor";
import StudentLogin from "./components/StudentLogin/StudentLogin.jsx";
import TeacherLogin from "./components/TeacherLogin/TeacherLogin.jsx";
import AdminPanelLogin from "./components/AdminPanelLogin/AdminPanelLogin.jsx";
import StudentDashboard from "./components/StudentLogin/StudentDashboard";
import TeacherDashboard from "./components/TeacherLogin/TeacherDashboard";
import AdminDashboard from "./components/AdminPanelLogin/AdminDashboard";
import ProblemsolvingAgent from "./components/StudentLogin/ProblemsolvingAgent.jsx";
import AssessmentLibrary from "./components/TeacherLogin/AssessmentLibrary.jsx";
import AssessmentsPage from "./components/StudentLogin/AssessmentsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherManagement from "./components/AdminPanelLogin/TeacherManagement";
import StudentManagement from "./components/AdminPanelLogin/StudentManagement";
import AdminSatAttempts from "./components/AdminPanelLogin/AdminSatAttempts";
import AdminStandardAttempts from "./components/AdminPanelLogin/AdminStandardAttempts";


// 🆕 Import for Review Page
import ReviewAssessmentPage from "./components/TeacherLogin/ReviewAssessmentPage";

// Admin Dashboard Nested
import DashboardHome from "./components/AdminPanelLogin/DashboardHome";
import ApprovalRequests from "./components/AdminPanelLogin/ApprovalRequests";
import StandardGeneratedAssessmentsPage from "./components/AdminPanelLogin/StandardGeneratedAssessmentsPage";
import SatGeneratedAssessmentsPage from "./components/AdminPanelLogin/SatGeneratedAssessmentsPage";
import AdminNotificationsPage from "./components/AdminPanelLogin/AdminNotificationsPage";
// Add this with your other imports:
import SatAssessmentPreviewPage from "./components/AdminPanelLogin/SatAssessmentPreviewPage.jsx";
import StandardAssessmentPreviewPage from "./components/AdminPanelLogin/StandardAssessmentPreviewPage";

// 🆕 Import new SEO pages
import DiscoverPage from "./pages/DiscoverPage";
import VisionPage from "./pages/VisionPage";
import FeaturesPage from "./pages/FeaturesPage";
import TeamPage from "./pages/TeamPage";
import PricingPage from "./pages/PricingPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";


function App() {
  const { assessaData, reloadData } = useSelector((state) => state.root);
  const dispatch = useDispatch();

  const getassessaData = async () => {
    try {
      const response = await axios.get("/api/skillnaav/get-skillnaav-data");
      dispatch(SetassessaData(response.data));
      dispatch(HideLoading());
    } catch (error) {
      console.error("Error fetching SkillNaav data:", error);
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    if (!assessaData || reloadData) {
      getassessaData();
    }
  }, [assessaData, reloadData]);

  return (
    <BrowserRouter>
      <Customcursor />
      <Routes>
        {/* Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* User Flow */}
        <Route path="/user" element={<UserFlow />} />
        <Route path="/user-create-account" element={<UserCreateAccount />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user-profile-form" element={<UserProfileForm />} />
        <Route path="/user-profile-picture" element={<UserProfilePicture />} />
        <Route path="/user-main-page" element={<UserMainPage />} />

        {/* Partner Flow */}
        <Route path="/partner" element={<PartnerFlow />} />
        <Route path="/partner-create-account" element={<PartnerCreateAccount />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/partner-profile-form" element={<PartnerProfileForm />} />
        <Route path="/partner-profile-picture" element={<PartnerProfilePicture />} />
        <Route path="/partner-main-page" element={<PartnerMainPage />} />

        {/* Admin Flow */}
        <Route path="/admin-account" element={<AdminFlow />} />
        <Route path="/admin-create-account" element={<AdminCreateAccount />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin-profile-form" element={<AdminProfileForm />} />
        <Route path="/admin-profile-picture" element={<AdminProfilePicture />} />
        <Route path="/admin-main-page" element={<AdminMainPage />} />

        {/* Try for free */}
        <Route path="/choose-role" element={<TryforFree />} />

        <Route path="/study-assistant" element={<StudyAssistant />} />
        <Route path="/study-recommendation" element={<StudyRecommendation />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/problemsolving-agent" element={<ProblemsolvingAgent />} />

        {/* google search sitemap link Website Routes */}
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faqs" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* ✅ Protected Routes with roles */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment-library"
          element={
            <ProtectedRoute role="teacher">
              <AssessmentLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments-page"
          element={
            <ProtectedRoute role="student">
              <AssessmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard/review/:assessmentId"
          element={
            <ProtectedRoute role="teacher">
              <ReviewAssessmentPage />
            </ProtectedRoute>
          }
        />

        {/* NESTED ADMIN DASHBOARD ROUTES */}
        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="approvals" element={<ApprovalRequests />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="standard-generated-assessments" element={<StandardGeneratedAssessmentsPage />} />
          <Route path="sat-generated-assessments" element={<SatGeneratedAssessmentsPage />} />
          <Route path="attempts/standard" element={<AdminStandardAttempts />} />
          <Route path="attempts/sat" element={<AdminSatAttempts />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="assessment-preview/:assessmentId" element={<SatAssessmentPreviewPage />} />
          <Route path="standard-assessment-preview/:assessmentId" element={<StandardAssessmentPreviewPage />} />
        </Route>

        {/* Login Pages */}
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/adminpanel-login" element={<AdminPanelLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
