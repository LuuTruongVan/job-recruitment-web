import axios from "axios";
import { AUTH_ROUTES } from "../routes/authRoutes";

export const login = (credentials) => axios.post(AUTH_ROUTES.LOGIN, credentials);

export const register = (userData) => axios.post(AUTH_ROUTES.REGISTER, userData);

export const sendOtp = (email) => axios.post(AUTH_ROUTES.FORGOT_PASSWORD, { email });

export const verifyOtp = (data) => axios.post(AUTH_ROUTES.VERIFY_OTP, data);

export const resetPassword = (data) => axios.post(AUTH_ROUTES.RESET_PASSWORD, data);

export const verifyRegisterOtp = ({ email, otp }) => {
    return axios.post(AUTH_ROUTES.VERIFY_REGISTER_OTP, { email, otp });
  };

  export const registerUser = (userData) => {
    return axios.post(AUTH_ROUTES.REGISTER, userData);
  };