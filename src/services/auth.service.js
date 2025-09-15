import axios from "axios";
import { AUTH_ROUTES } from "../routes/authRoutes";


const api = axios.create({
  baseURL: "http://localhost:3001", 
});



export const login = (credentials) => {
  console.log("Login URL:", AUTH_ROUTES.LOGIN);
  return api.post(AUTH_ROUTES.LOGIN, credentials);
};

export const register = (userData) => {
  console.log("Register URL:", AUTH_ROUTES.REGISTER);
  return api.post(AUTH_ROUTES.REGISTER, userData);
};

export const registerUser = (userData) => {
  console.log("Register User URL:", AUTH_ROUTES.REGISTER);
  return api.post(AUTH_ROUTES.REGISTER, userData);
};


export const sendRegisterOtp = ({ email }) => {
  console.log("Send Register OTP URL:", AUTH_ROUTES.VERIFY_REGISTER_OTP);
  return api.post(AUTH_ROUTES.VERIFY_REGISTER_OTP, { email });
};

export const verifyRegisterOtp = ({ email, otp }) => {
  console.log("Verify Register OTP URL:", AUTH_ROUTES.VERIFY_REGISTER_OTP);
  return api.post(AUTH_ROUTES.VERIFY_REGISTER_OTP, { email, otp });
};


export const sendResetOtp = (email) => {
  console.log("Send Reset OTP URL:", AUTH_ROUTES.FORGOT_PASSWORD);
  return api.post(AUTH_ROUTES.FORGOT_PASSWORD, { email });
};

export const verifyResetOtp = ({ email, otp }) => {
  console.log("Verify Reset OTP URL:", AUTH_ROUTES.VERIFY_RESET_OTP);
  return api.post(AUTH_ROUTES.VERIFY_RESET_OTP, { email, otp });
};

export const resetPassword = ({ email, newPassword }) => {
  console.log("Reset Password URL:", AUTH_ROUTES.RESET_PASSWORD);
  return api.post(AUTH_ROUTES.RESET_PASSWORD, { email, newPassword });
};

export const sendOtp = (email) => sendResetOtp(email);
export const verifyOtp = (email, otp) => verifyResetOtp({ email, otp });
