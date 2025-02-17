import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import signupImage from "../assets/vsmsig.png";
import { useDropzone } from "react-dropzone";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    role: "student",
    image: null,
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setForm({ ...form, image: acceptedFiles[0] });
    },
  });

  useEffect(() => {
    let interval;
    if (step === 2) {
      setTimeLeft(300);
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "confirmPassword") {
      setPasswordError(
        form.password !== e.target.value ? "Passwords do not match." : ""
      );
    }
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      setMessage("Please enter a valid email.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("role", form.role);
    formData.append("image", form.image);

    setLoading(true);
    setMessage("");

    try {
      // Endpoint: http://localhost:5000/api/auth/register
      await axios.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("OTP sent to your email.", { position: "bottom-right" });
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    toast.success("OTP verified successfully!", { position: "bottom-right" });
    navigate("/login");
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      // Endpoint: http://localhost:5000/api/auth/resendOTP
      const response = await axios.post("/auth/resendOTP", {
        email: form.email,
      });
      toast.success(response.data.message, { position: "bottom-right" });
      setTimeLeft(300);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resending OTP", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6 relative">
      <button
        onClick={() => navigate("/")}
        type="button"
        className="absolute top-6 left-6 flex items-center text-blue-400 hover:text-blue-600 transition duration-300"
      >
        <FaArrowLeft className="mr-2" />
        Back to Home
      </button>

      <div className="flex flex-col md:flex-row items-center w-full max-w-5xl bg-gray-1000 rounded-xl overflow-hidden gap-8">
        <div className="md:w-1/2 p-8 bg-gray-950 rounded-lg text-white space-y-6">
          <form
            onSubmit={step === 1 ? handleSignupSubmit : handleOtpSubmit}
            className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 hover:shadow-blue-500/50 transition duration-500 ease-in-out"
          >
            <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Signup
            </h2>

            {message && (
              <div className="text-center text-red-400 font-medium">
                {message}
              </div>
            )}

            {step === 1 ? (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                  />
                </div>

                {passwordError && (
                  <p className="text-red-400 text-sm">{passwordError}</p>
                )}

                <div>
                  <label className="block text-gray-400 font-medium mb-2">
                    Role
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={form.role === "student"}
                        onChange={handleChange}
                        className="form-radio text-blue-500"
                      />
                      <span className="ml-2">Student</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={form.role === "admin"}
                        onChange={handleChange}
                        className="form-radio text-blue-500"
                      />
                      <span className="ml-2">Admin</span>
                    </label>
                  </div>
                </div>

                {/* Dropzone for image upload */}
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed p-6 text-center"
                >
                  <input {...getInputProps()} />
                  {form.image ? (
                    <p>{form.image.name}</p>
                  ) : (
                    <p>Drag & drop a profile photo here, or click to select</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </button>

                <p className="text-center text-gray-400 mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-500 hover:underline">
                    Login
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-center mb-2">
                  An OTP has been sent to your email. Enter it to complete
                  registration.
                </p>

                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={form.otp}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
                />

                <div className="text-center text-gray-400 mt-2">
                  {timeLeft > 0 ? (
                    <p>OTP expires in {formatTime(timeLeft)}</p>
                  ) : (
                    <p>OTP expired. Please resend OTP.</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all mt-2"
                  disabled={loading || timeLeft === 0}
                >
                  {loading ? "Verifying OTP..." : "Verify OTP"}
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-400 mb-2">Didn't receive the OTP?</p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-blue-500 hover:underline focus:outline-none"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="md:w-1/2 flex items-center justify-center">
          <img
            src={signupImage}
            alt="Signup Illustration"
            className="w-3/4 rounded-lg shadow-lg hover:scale-105 transition duration-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
