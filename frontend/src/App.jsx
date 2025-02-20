import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VsmChat = lazy(() => import("./pages/VsmChat"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Loader component using Tailwind CSS for a centered spinner
const Loader = () => (
  <div className="flex items-center justify-center h-screen w-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <Router>
      <ToastContainer />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/openai" element={<VsmChat />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
