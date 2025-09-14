const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const userModel = require('../models/userModel');

const userService = {
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 10);
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  generateToken: (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  },

  generateOtp: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  sendOtpEmail: async (email, otp, subject = 'Mã OTP xác thực tài khoản') => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: `<p>Mã OTP của bạn là: <b>${otp}</b></p><p>Mã này sẽ hết hạn sau 10 phút.</p>`
      });
      console.log('Sent OTP to email:', otp); // Debug log
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Lỗi gửi email OTP');
    }
  },

  registerUser: async (name, email, password, role, connection) => {
    const existingUsers = await userModel.findByEmail(connection, email);
    const hashedPassword = await this.hashPassword(password);
    const otpCode = this.generateOtp(); // Tạo OTP một lần duy nhất

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.is_verified === 1) {
        throw new Error('Email đã được sử dụng');
      }
      await userModel.updateUser(connection, name, hashedPassword, role, existingUser.id);
      await userModel.deleteOtpCode(connection, existingUser.id);
      await userModel.createOtpCode(connection, existingUser.id, otpCode);
      await userModel.deleteCandidateProfile(connection, existingUser.id);
      await userModel.deleteEmployerProfile(connection, existingUser.id);

      if (role === 'candidate') {
        await userModel.createCandidateProfile(connection, existingUser.id, name);
      } else if (role === 'employer') {
        await userModel.createEmployerProfile(connection, existingUser.id, name, email);
      }

      await this.sendOtpEmail(email, otpCode); // Sử dụng OTP đã tạo
      return { message: 'Đăng ký lại thành công! Vui lòng kiểm tra email để lấy mã OTP và xác thực.', userId: existingUser.id };
    } else {
      const userId = await userModel.createUser(connection, name, email, hashedPassword, role);
      if (role !== 'admin') {
        await userModel.createOtpCode(connection, userId, otpCode); // Sử dụng OTP đã tạo
        if (role === 'candidate') {
          await userModel.createCandidateProfile(connection, userId, name);
        } else if (role === 'employer') {
          await userModel.createEmployerProfile(connection, userId, name, email);
        }
        await this.sendOtpEmail(email, otpCode); // Sử dụng OTP đã tạo
      }
      return { 
        message: role === 'admin' ? 'Thêm admin thành công!' : 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP và xác thực.',
        userId 
      };
    }
  },

  forgotPassword: async (email, connection) => {
    const users = await userModel.findByEmail(connection, email);
    if (users.length === 0) {
      throw new Error('Email không tồn tại!');
    }
    const otp = this.generateOtp();
    await userModel.createResetToken(connection, email, otp);
    await this.sendOtpEmail(email, otp, 'Mã OTP đặt lại mật khẩu');
    return { message: 'Đã gửi mã OTP tới email!' };
  },

  verifyResetOtp: async (email, otp, connection) => {
    const rows = await userModel.verifyResetOtp(connection, email, otp);
    if (rows.length === 0) {
      throw new Error('OTP không hợp lệ hoặc đã hết hạn!');
    }
    return { message: 'Xác minh OTP thành công!' };
  },

  resetPassword: async (email, newPassword, connection) => {
    const hashedPassword = await this.hashPassword(newPassword);
    await userModel.resetPassword(connection, email, hashedPassword);
    return { message: 'Đặt lại mật khẩu thành công!' };
  }
};

module.exports = userService;