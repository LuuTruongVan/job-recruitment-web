import { useState } from "react";
import { registerUser, verifyRegisterOtp } from "../services/auth.service";

export const useRegister = (onSwitch) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
  });
  const [message, setMessage] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await registerUser(userData);
      if (res.status === 201) {
        setMessage("Đăng ký thành công! Vui lòng nhập mã OTP đã gửi tới email của bạn.");
        setShowOtpForm(true);
      } else {
        setMessage("Không thể đăng ký. Vui lòng thử lại!");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Lỗi đăng ký!");
    }
  };

  const handleVerifyOtp = async () => {
    setMessage("");
    try {
      const res = await verifyRegisterOtp({ email: userData.email, otp });
      setMessage(res.data?.message || "Đã xử lý xác thực OTP.");

      if ((res.data?.message || "").includes("thành công")) {
        setTimeout(() => {
          setShowOtpForm(false);
          onSwitch && onSwitch(); 
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Lỗi xác thực OTP");
    }
  };

  const handleBack = () => {
    setShowOtpForm(false);
    setMessage("");
    setOtp("");
  };

  return {
    userData,
    message,
    showOtpForm,
    otp,
    setOtp,
    handleChange,
    handleSubmit,
    handleVerifyOtp,
    handleBack,
  };
};