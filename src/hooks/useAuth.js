import { useState } from "react";
import jwt from "jsonwebtoken";
import { login, sendOtp, verifyOtp, resetPassword } from "../services/auth.service";

export const useAuth = (onSuccess) => {
  const [mode, setMode] = useState("login"); // login | forgot | verifyOtp | resetPassword
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [otpData, setOtpData] = useState({ email: "", otp: "", newPassword: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    if (mode === "login") {
      setCredentials({ ...credentials, [e.target.name]: e.target.value });
    } else {
      setOtpData({ ...otpData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await login(credentials);
      const { token } = response.data;
      const decoded = jwt.decode(token);

      if (decoded.role !== "admin" && decoded.is_verified === 0) {
        setMessage("Vui lòng xác thực email trước khi đăng nhập!");
        return;
      }

      const tokenKey =
        decoded.role === "admin"
          ? "admin_token"
          : decoded.role === "employer"
          ? "employer_token"
          : "candidate_token";

      localStorage.setItem(tokenKey, token);
      setMessage("Đăng nhập thành công!");
      onSuccess();
    } catch (error) {
      setMessage(error.response?.data?.message || "Lỗi đăng nhập!");
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await sendOtp(otpData.email);
      setMessage(res.data.message);
      setMode("verifyOtp");
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi gửi OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await verifyOtp(otpData.email, otpData.otp);
      setMessage(res.data.message);
      if (res.data.message.includes("thành công")) {
        setMode("resetPassword");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi xác minh OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await resetPassword(otpData.email, otpData.newPassword);
      setMessage(res.data.message);
      if (res.data.message.includes("thành công")) {
        setMode("login");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi đặt lại mật khẩu");
    }
  };

  return {
    mode,
    setMode,
    credentials,
    otpData,
    message,
    handleChange,
    handleSubmitLogin,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
  };
};
