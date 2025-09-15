// src/routes/auth.routes.js
const BASE = "http://localhost:3001/users";

export const AUTH_ROUTES = {

  REGISTER: `${BASE}/add`,
  VERIFY_REGISTER_OTP: `${BASE}/verify-otp`, 
  LOGIN: `${BASE}/get`,
  FORGOT_PASSWORD: `${BASE}/forgot-password`,
  VERIFY_RESET_OTP: `${BASE}/verify-reset-otp`, 
  RESET_PASSWORD: `${BASE}/reset-password`,
};
