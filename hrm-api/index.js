const express = require('express');
const app = express();
const pool = require('./db');
const usersRouter = require('./routes/users');
const candidatesRouter = require('./routes/candidates');
const employersRouter = require('./routes/employers');
const jobpostsRouter = require('./routes/jobposts');
const applicationsRouter = require('./routes/applications');
const categoriesRouter = require('./routes/categories'); // Thêm route mới

app.use(express.json());
app.use('/users', usersRouter);
app.use('/candidates', candidatesRouter);
app.use('/employers', employersRouter);
app.use('/jobposts', jobpostsRouter);
app.use('/applications', applicationsRouter);
app.use('/categories', categoriesRouter); // Đăng ký route

// Middleware multer
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.listen(3000, () => {
  console.log('Server running on port 3000');
});