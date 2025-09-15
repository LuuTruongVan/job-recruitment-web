const userModel = require('../models/userModel');
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const userController = {
  addUser: async (req, res) => {
    const { name, email, password, role } = req.body;

    let connection;
    try {
      const hashedPassword = await userService.hashPassword(password);
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const existingUsers = await userModel.findByEmail(connection, email);

      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (existingUser.is_verified === 1) {
          await connection.rollback();
          return res.status(409).json({ message: 'Email đã được sử dụng' });
        }

        await userModel.updateUser(connection, name, hashedPassword, role, existingUser.id);
        await userModel.deleteOtpCode(connection, existingUser.id);
        const otpCode = userService.generateOtp(); 
        await userModel.createOtpCode(connection, existingUser.id, otpCode);
        await userModel.deleteCandidateProfile(connection, existingUser.id);
        await userModel.deleteEmployerProfile(connection, existingUser.id);

        if (role === 'candidate') {
          await userModel.createCandidateProfile(connection, existingUser.id, name);
        } else if (role === 'employer') {
          await userModel.createEmployerProfile(connection, existingUser.id, name, email);
        }

        await userService.sendOtpEmail(email, otpCode); 
        await connection.commit();
        return res.status(201).json({
          message: 'Đăng ký lại thành công! Vui lòng kiểm tra email để lấy mã OTP và xác thực.'
        });
      } else {
        const userId = await userModel.createUser(connection, name, email, hashedPassword, role);
        if (role !== 'admin') {
          const otpCode = userService.generateOtp(); 
          await userModel.createOtpCode(connection, userId, otpCode);
          if (role === 'candidate') {
            await userModel.createCandidateProfile(connection, userId, name);
          } else if (role === 'employer') {
            await userModel.createEmployerProfile(connection, userId, name, email);
          }
          await userService.sendOtpEmail(email, otpCode); 
        }
        await connection.commit();
        res.status(201).json({
          message: role === 'admin'
            ? 'Thêm admin thành công!'
            : 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP và xác thực.'
        });
      }
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error in /users/add:', error);
      res.status(500).json({ message: 'Lỗi server khi đăng ký' });
    } finally {
      if (connection) connection.release();
    }
  },

  getUser: async (req, res) => {
    const { email, password } = req.body;
    console.log('Received /users/get request:', { email, password });

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    try {
      const connection = await pool.getConnection();
      const users = await userModel.findByEmail(connection, email);
      connection.release();

      if (users.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }

      const user = users[0];
      if (user.role !== 'admin' && !user.is_verified) {
        return res.status(403).json({ message: 'Vui lòng xác thực email trước khi đăng nhập' });
      }

      const isMatch = await userService.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = userService.generateToken(user);
      res.json({ token });
    } catch (error) {
      console.error('Error in /users/get:', error);
      res.status(500).json({ message: 'Error getting user' });
    }
  },

  toggleUserStatus: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

      const { id } = req.params;
      const connection = await pool.getConnection();
      const user = await userModel.findById(connection, id);
      connection.release();

      if (!user) return res.status(404).json({ message: 'User not found' });

      const newStatus = !user.is_active;
      await userModel.toggleUserStatus(connection, id, newStatus);
      res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user status' });
    }
  },

  getProfile: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const connection = await pool.getConnection();
      let profile = await userModel.getBasicProfile(connection, decoded.id);
      connection.release();

      if (profile.role === 'candidate') {
        const candidate = await userModel.getCandidateProfile(connection, decoded.id) || {};
        profile = { ...profile, ...candidate };
      } else if (profile.role === 'employer') {
        const employer = await userModel.getEmployerProfile(connection, decoded.id) || {};
        profile = { ...profile, ...employer };
      }

      res.json(profile);
    } catch (error) {
      console.error('Error in /get-profile:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  },

  updateProfile: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    let connection;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const {
        full_name, phone, address, resume, skills, name: company_name, email, website, avatar_url, company_intro
      } = req.body;

      connection = await pool.getConnection();
      await connection.beginTransaction();

      if (decoded.role === 'candidate') {
        await userModel.updateCandidateProfile(connection, decoded.id, full_name, phone, address, skills, avatar_url || '');
      } else if (decoded.role === 'employer') {
        await userModel.updateEmployerProfile(connection, decoded.id, company_name, address, email, phone, website, company_intro, avatar_url || '');
      }

      await connection.commit();
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error in /update-profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    } finally {
      if (connection) connection.release();
    }
  },

  changePassword: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const connection = await pool.getConnection();
      const user = await userModel.findById(connection, decoded.id);
      connection.release();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await userService.comparePassword(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
      }

      const hashedPassword = await userService.hashPassword(newPassword);
      await userModel.updatePassword(connection, decoded.id, hashedPassword);
      res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Lỗi đổi mật khẩu' });
    }
  },

  getCandidateProfile: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const connection = await pool.getConnection();
      const candidate = await userModel.getCandidateProfile(connection, decoded.id);
      connection.release();

      if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
      res.json(candidate);
    } catch (error) {
      console.error('Error in /candidate-profile:', error);
      res.status(500).json({ message: 'Error fetching candidate profile' });
    }
  },

  getEmployerProfile: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const connection = await pool.getConnection();
      const employer = await userModel.getEmployerProfile(connection, decoded.id);
      connection.release();

      if (!employer) return res.status(404).json({ message: 'Employer not found' });
      res.json(employer);
    } catch (error) {
      console.error('Error in /employer-profile:', error);
      res.status(500).json({ message: 'Error fetching employer profile' });
    }
  },

  getAllUsers: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token in /users/get-all:', decoded);
      const connection = await pool.getConnection();
      const users = await userModel.getAllUsers(connection);
      connection.release();
      console.log('Fetched users:', users);
      res.json(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: 'Error fetching all users' });
    }
  },

  deleteUser: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token in /users/delete:', decoded);
      const { id } = req.params;
      const connection = await pool.getConnection();
      const user = await userModel.findById(connection, id);
      connection.release();

      if (!user) return res.status(404).json({ message: 'User not found' });

      await userModel.deleteUser(connection, id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  },

  verifyEmail: async (req, res) => {
    const { token } = req.query;
    try {
      const connection = await pool.getConnection();
      const userId = await userModel.verifyEmailByToken(connection, token);
      connection.release();

      if (!userId) {
        return res.status(400).send('Token không hợp lệ hoặc đã hết hạn');
      }
      res.redirect('http://localhost:3000/login?verified=true');
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi xác thực email');
    }
  },

  verifyOtp: async (req, res) => {
    const { email, otp } = req.body;
    console.log('Verifying OTP for email:', email, 'with OTP:', otp); 

    try {
      const connection = await pool.getConnection();
      const users = await userModel.findByEmail(connection, email);
      connection.release();

      if (users.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }

      const userId = users[0].id;
      const connection2 = await pool.getConnection(); 
      const rows = await userModel.verifyOtp(connection2, userId, otp); 
      connection2.release();
      console.log('OTP rows from DB:', rows); 

      if (rows.length === 0) {
        return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn' });
      }

      await userModel.verifyUserByOtp(connection, userId);
      res.json({ message: 'Xác thực thành công! Bạn có thể đăng nhập.' });
    } catch (error) {
      console.error('Error in /verify-otp:', error);
      res.status(500).json({ message: 'Lỗi xác thực OTP' });
    }
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
     
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'Email không tồn tại!' });
      }

  
      const otp = userService.generateOtp();
      const [result] = await pool.query(
        'INSERT INTO reset_password_tokens (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
        [email, otp]
      );
      console.log('Inserted reset token for email:', email, 'OTP:', otp, 'ID:', result.insertId); 

     
      await userService.sendOtpEmail(email, otp, 'Mã OTP đặt lại mật khẩu');
      res.json({ message: 'Đã gửi mã OTP tới email!' });
    } catch (error) {
      console.error('Error in /forgot-password:', error);
      res.status(error.message.includes('Email không tồn tại') ? 404 : 500).json({ message: error.message });
    }
  },

  verifyResetOtp: async (req, res) => {
    const { email, otp } = req.body;
    try {
      const [rows] = await pool.query(
        'SELECT * FROM reset_password_tokens WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
        [email, otp]
      );
      console.log('Verify reset OTP request:', { email, otp }, 'Rows:', rows); 
      if (rows.length === 0) {
        return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn!' });
      }
      res.json({ message: 'Xác minh OTP thành công!' });
    } catch (error) {
      console.error('Error in /verify-reset-otp:', error);
      res.status(500).json({ message: 'Lỗi server khi xác minh OTP!' });
    }
  },

  resetPassword: async (req, res) => {
    const { email, newPassword } = req.body;
    try {
      const hashedPassword = await userService.hashPassword(newPassword);
      await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
      await pool.query('DELETE FROM reset_password_tokens WHERE email = ?', [email]);
      res.json({ message: 'Đặt lại mật khẩu thành công!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server khi đặt lại mật khẩu!' });
    }
  },};

module.exports = userController;