const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const employerRoutes = require('./routes/employers');
const jobpostRoutes = require('./routes/jobposts');
const candidateRoutes = require('./routes/candidates');
const applicationRoutes = require('./routes/applications');

const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/employers', employerRoutes);
app.use('/jobposts', jobpostRoutes);
app.use('/candidates', candidateRoutes);
app.use('/applications', applicationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});