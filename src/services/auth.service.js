import axios from "axios";
import { AUTH_ROUTES } from "../routes/authRoutes";

// Tạo instance axios với base URL
const api = axios.create({
  baseURL: "http://localhost:3001", // Có thể đổi sang process.env.REACT_APP_API_URL nếu cần
});

// ======================== AUTH API ========================

// Đăng nhập
export const login = (credentials) => {
  console.log("Login URL:", AUTH_ROUTES.LOGIN);
  return api.post(AUTH_ROUTES.LOGIN, credentials);
};

// Đăng ký tài khoản
export const register = (userData) => {
  console.log("Register URL:", AUTH_ROUTES.REGISTER);
  return api.post(AUTH_ROUTES.REGISTER, userData);
};

// Giữ lại để tránh lỗi với useRegister.js
export const registerUser = (userData) => {
  console.log("Register User URL:", AUTH_ROUTES.REGISTER);
  return api.post(AUTH_ROUTES.REGISTER, userData);
};

// ======================== OTP ĐĂNG KÝ ========================

// Gửi OTP khi đăng ký
export const sendRegisterOtp = ({ email }) => {
  console.log("Send Register OTP URL:", AUTH_ROUTES.VERIFY_REGISTER_OTP);
  return api.post(AUTH_ROUTES.VERIFY_REGISTER_OTP, { email });
};

// Xác minh OTP khi đăng ký
export const verifyRegisterOtp = ({ email, otp }) => {
  console.log("Verify Register OTP URL:", AUTH_ROUTES.VERIFY_REGISTER_OTP);
  return api.post(AUTH_ROUTES.VERIFY_REGISTER_OTP, { email, otp });
};

// ======================== QUÊN MẬT KHẨU ========================

// Gửi OTP đặt lại mật khẩu
export const sendResetOtp = (email) => {
  console.log("Send Reset OTP URL:", AUTH_ROUTES.FORGOT_PASSWORD);
  return api.post(AUTH_ROUTES.FORGOT_PASSWORD, { email });
};

// Xác minh OTP đặt lại mật khẩu
export const verifyResetOtp = ({ email, otp }) => {
  console.log("Verify Reset OTP URL:", AUTH_ROUTES.VERIFY_RESET_OTP);
  return api.post(AUTH_ROUTES.VERIFY_RESET_OTP, { email, otp });
};

// Đặt lại mật khẩu
export const resetPassword = ({ email, newPassword }) => {
  console.log("Reset Password URL:", AUTH_ROUTES.RESET_PASSWORD);
  return api.post(AUTH_ROUTES.RESET_PASSWORD, { email, newPassword });
};

// ======================== GIỮ API CŨ ĐỂ TƯƠNG THÍCH ========================

// Giữ tên cũ cho useAuth.js để tránh lỗi import
export const sendOtp = (email) => sendResetOtp(email);
export const verifyOtp = (email, otp) => verifyResetOtp({ email, otp });
