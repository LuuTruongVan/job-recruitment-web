const express = require('express');
const app = express();
const pool = require('./db');
const usersRouter = require('./routes/users');
const candidatesRouter = require('./routes/candidates');
const employersRouter = require('./routes/employers');
const jobpostsRouter = require('./routes/jobposts');
const applicationsRouter = require('./routes/applications');
const categoriesRouter = require('./routes/categories');
const favoritesRoutes = require('./routes/favorites');
const uploadAvatarRoutes = require('./routes/uploadAvatar'); 
app.use(express.json()); // Thêm nếu chưa có
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.use('/favorites', favoritesRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/upload-avatar', uploadAvatarRoutes);
app.use('/users', usersRouter);
app.use('/candidates', candidatesRouter);
app.use('/employers', employersRouter);
app.use('/jobposts', jobpostsRouter);
app.use('/applications', applicationsRouter);
app.use('/categories', categoriesRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});