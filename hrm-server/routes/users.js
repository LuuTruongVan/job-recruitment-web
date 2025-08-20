const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const nodemailer = require('nodemailer');
const crypto = require('crypto');

router.post('/add', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Tạo OTP 6 số
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Thêm user, admin auto xác thực (is_verified = 1)
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, role === 'admin' ? 1 : 0]
    );

    const userId = result.insertId;

    // Nếu là candidate hoặc employer → lưu OTP + tạo profile + gửi email
    if (role !== 'admin') {
      // Lưu OTP vào bảng otp_codes
      await connection.execute(
        'INSERT INTO otp_codes (user_id, token) VALUES (?, ?)',
        [userId, otpCode]
      );

      if (role === 'candidate') {
        await connection.execute(
          'INSERT INTO candidates (user_id, full_name, phone, address, skills) VALUES (?, ?, ?, ?, ?)',
          [userId, name, '',  '', '']
        );
      } else if (role === 'employer') {
        await connection.execute(
          'INSERT INTO employers (user_id, name, address, email, website) VALUES (?, ?, ?, ?, ?)',
          [userId, name, '', email, '']
        );
      }

      // Gửi OTP qua email
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Mã OTP xác thực tài khoản',
          html: `<p>Mã OTP của bạn là: <b>${otpCode}</b></p><p>Mã này sẽ hết hạn sau 10 phút.</p>`
        });
      } catch (emailError) {
        console.error('Lỗi gửi email OTP:', emailError);
      }
    }

    await connection.commit();
    res.status(201).json({
      message: role === 'admin'
        ? 'Thêm admin thành công!'
        : 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP và xác thực.'
    });
  } catch (error) {
    console.error('Error in /users/add:', error);
    res.status(500).json({ message: 'Error adding user' });
  }
});


router.post('/get', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received /users/get request:', { email });

  try {
    // Kiểm tra email có tồn tại không
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = users[0];

    if (user.role !== 'admin' && !user.is_verified) {
      return res.status(403).json({ message: 'Vui lòng xác thực email trước khi đăng nhập' });
    }
    

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Tạo token đăng nhập
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });

  } catch (error) {
    console.error('Error in /users/get:', error);
    res.status(500).json({ message: 'Error getting user' });
  }
});


router.put('/update/:id/toggle', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) return res.status(404).json({ message: 'User not found' });

    const newStatus = !user[0].is_active;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);
    res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});
router.get('/get-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    let profile = users[0];
    if (profile.role === 'candidate') {
      const [candidate] = await pool.query(
        'SELECT full_name, phone, address, skills, avatar_url FROM candidates WHERE user_id = ?',
        [decoded.id]
      );
      profile = {
        ...profile,
        ...candidate[0] || { full_name: '', phone: '', address: '', skills: '', avatar_url: '' }
      };
    } else if (profile.role === 'employer') {
      const [employer] = await pool.query(
        'SELECT name, address, email, phone, website, company_intro, avatar_url FROM employers WHERE user_id = ?',
        [decoded.id]
      );
      profile = {
        ...profile,
        ...employer[0] || { name: '', address: '', email: '', phone: '', website: '', company_intro: '', avatar_url: '' }
      };
    }

    res.json(profile);
  } catch (error) {
    console.error('Error in /get-profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

router.put('/update-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  let connection;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const {
      full_name,
      phone,
      address,
      resume,
      skills,
      name: company_name,
      email,
      website,
      avatar_url,
      company_intro // thêm trường này
    } = req.body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (decoded.role === 'candidate') {
      await connection.execute(
        'UPDATE candidates SET full_name = ?, phone = ?, address = ?, skills = ?, avatar_url = ? WHERE user_id = ?',
        [full_name, phone, address, skills, avatar_url || '', decoded.id]
      );
      await connection.execute(
        'UPDATE users SET name = ? WHERE id = ?',
        [full_name, decoded.id]
      );
    } else if (decoded.role === 'employer') {
      await connection.execute(
        'UPDATE employers SET name = ?, address = ?, email = ?, phone = ?, website = ?, company_intro = ?, avatar_url = ? WHERE user_id = ?',
        [company_name, address, email, phone, website, company_intro, avatar_url || '', decoded.id]
      );
      await connection.execute(
        'UPDATE users SET name = ? WHERE id = ?',
        [company_name, decoded.id]
      );
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
});




// Thêm route đổi mật khẩu
router.put('/change-password', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Lỗi đổi mật khẩu' });
  }
});

router.get('/candidate-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [candidate] = await pool.query(
      'SELECT full_name, phone, address, resume, skills FROM candidates WHERE user_id = ?',
      [decoded.id]
    );
    if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate[0]);
  } catch (error) {
    console.error('Error in /candidate-profile:', error);
    res.status(500).json({ message: 'Error fetching candidate profile' });
  }
});

router.get('/employer-profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [employer] = await pool.query(
      'SELECT name, address, email, website FROM employers WHERE user_id = ?',
      [decoded.id]
    );
    if (employer.length === 0) return res.status(404).json({ message: 'Employer not found' });
    res.json(employer[0]);
  } catch (error) {
    console.error('Error in /employer-profile:', error);
    res.status(500).json({ message: 'Error fetching employer profile' });
  }
});

router.get('/get-all', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /users/get-all:', decoded);
    const [users] = await pool.query('SELECT id, name, email, role FROM users');
    console.log('Fetched users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching all users' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token in /users/delete:', decoded);
    const { id } = req.params;

    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) return res.status(404).json({ message: 'User not found' });

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM verify_tokens WHERE token = ?', [token]);
    if (rows.length === 0) {
      return res.status(400).send('Token không hợp lệ hoặc đã hết hạn');
    }

    const userId = rows[0].user_id;
    await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);
    await pool.query('DELETE FROM verify_tokens WHERE user_id = ?', [userId]);

    // Điều hướng về trang login FE
    res.redirect('http://localhost:3000/login?verified=true');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi xác thực email');
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const [user] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    const userId = user[0].id;

    const [rows] = await pool.query(
      'SELECT * FROM otp_codes WHERE user_id = ? AND token = ?',
      [userId, otp]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn' });
    }

    await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);
    await pool.query('DELETE FROM otp_codes WHERE user_id = ?', [userId]);

    res.json({ message: 'Xác thực thành công! Bạn có thể đăng nhập.' });
  } catch (error) {
    console.error('Error in /verify-otp:', error);
    res.status(500).json({ message: 'Lỗi xác thực OTP' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    // Kiểm tra email có tồn tại không
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại!' });
    }

    // Tạo mã OTP ngẫu nhiên 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào DB (có thời hạn 5 phút)
    await pool.query(
      'INSERT INTO reset_password_tokens (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
      [email, otp]
    );
    

    // Cấu hình nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Gửi OTP qua email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã OTP đặt lại mật khẩu',
      text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`
    });

    res.json({ message: 'Đã gửi mã OTP tới email!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi gửi OTP!' });
  }
});

// Bước 1: Xác minh OTP
router.post('/verify-reset-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reset_password_tokens WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn!' });
    }

    res.json({ message: 'Xác minh OTP thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi xác minh OTP!' });
  }
});

// Bước 2: Đặt lại mật khẩu
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Xóa OTP đã dùng
    await pool.query('DELETE FROM reset_password_tokens WHERE email = ?', [email]);

    res.json({ message: 'Đặt lại mật khẩu thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi đặt lại mật khẩu!' });
  }
});





module.exports = router;