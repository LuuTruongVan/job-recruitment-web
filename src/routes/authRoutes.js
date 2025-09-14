// src/routes/auth.routes.js
const BASE = "http://localhost:3001/users";

export const AUTH_ROUTES = {
  // Đăng ký & OTP đăng ký
  REGISTER: `${BASE}/add`,
  VERIFY_REGISTER_OTP: `${BASE}/verify-otp`, // ✅ Xác minh OTP khi đăng ký

  // Đăng nhập
  LOGIN: `${BASE}/get`,

  // Quên mật khẩu & OTP reset
  FORGOT_PASSWORD: `${BASE}/forgot-password`,
  VERIFY_RESET_OTP: `${BASE}/verify-reset-otp`, // ✅ Xác minh OTP đặt lại mật khẩu
  RESET_PASSWORD: `${BASE}/reset-password`,
};
