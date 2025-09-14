// models/jobpostsModel.js
const pool = require('../db');

const JobpostsModel = {

    getJobPositionById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM job_positions WHERE id = ?', [id]);
        return rows[0]; // trả về 1 object hoặc undefined nếu không có
      },
       
  count: async () => {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM jobposts');
    return result[0].count;
  },

  getAll: async () => {
    const [jobPosts] = await pool.query(`
      SELECT jp.*, 
             (SELECT COUNT(*) FROM favorites f WHERE f.jobpost_id = jp.id) AS favorite_count
      FROM jobposts jp
      WHERE jp.status = 'approved' AND jp.expiry_date > NOW()
    `);
    return jobPosts;
  },
  

  getById: async (id) => {
    const [job] = await pool.query(
      `SELECT jp.*, 
        (SELECT COUNT(*) FROM favorites f WHERE f.jobpost_id = jp.id) AS favorite_count
       FROM jobposts jp
       WHERE jp.id = ?`,
      [id]
    );
    return job[0];
  },

  create: async (data) => {
    const [result] = await pool.query(
      `INSERT INTO jobposts 
        (title, job_info, job_position_id, job_requirements, benefits, salary, category, location, email_contact, employer_id, created_at, expiry_date, company_name, employment_type, job_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        data.title,
        data.jobInfo,
        data.jobPositionId || null,
        data.jobRequirements,
        data.benefits,
        data.salary,
        data.category,
        data.location,
        data.emailContact,
        data.employerId,
        data.expiry_date || null,
        data.company_name || '',
        data.employmentType || '',
        data.jobImagePath || null
      ]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const [result] = await pool.query(
      `UPDATE jobposts 
       SET title = ?, job_info = ?, job_position_id = ?, job_requirements = ?, benefits = ?, 
           salary = ?, category = ?, location = ?, email_contact = ?, expiry_date = ?, 
           company_name = ?, employment_type = ?, status = 'pending', job_image = ?
       WHERE id = ?`,
      [
        data.title,
        data.jobInfo,
        data.jobPositionId || null,
        data.jobRequirements,
        data.benefits,
        data.salary,
        data.category,
        data.location,
        data.emailContact,
        data.expiry_date || null,
        data.company_name || '',
        data.employmentType || '',
        data.jobImagePath,
        id
      ]
    );
    return result;
  },

  delete: async (id) => {
    await pool.query('DELETE FROM favorites WHERE jobpost_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM jobposts WHERE id = ?', [id]);
    return result;
  },

  getByEmployerId: async (employerId) => {
    const [jobs] = await pool.query('SELECT * FROM jobposts WHERE employer_id = ?', [employerId]);
    return jobs;
  },

  getJobPositions: async (category) => {
    let query = 'SELECT jp.id, jp.name FROM job_positions jp JOIN categories c ON jp.category_id = c.id';
    const params = [];
    if (category) {
      query += ' WHERE c.name = ?';
      params.push(category);
    }
    const [positions] = await pool.query(query, params);
    return positions;
  },

  addJobPosition: async (name, categoryId) => {
    const [result] = await pool.query(
      'INSERT INTO job_positions (category_id, name) VALUES (?, ?)',
      [categoryId, name]
    );
    return result.insertId;
  },

  getApplications: async (jobId) => {
    const [applications] = await pool.query(
      'SELECT a.id, a.candidate_name, a.email, a.phone, a.skills, a.introduction, a.cv_path AS resume_url, a.status FROM applications a WHERE a.jobpost_id = ?',
      [jobId]
    );
    return applications;
  },

  updateApplicationStatus: async (applicationId, jobId, status) => {
    await pool.query('UPDATE applications SET status = ? WHERE id = ? AND jobpost_id = ?', [status, applicationId, jobId]);
  },

  updateStatusAdmin: async (id, status) => {
    const [result] = await pool.query('UPDATE jobposts SET status = ? WHERE id = ?', [status, id]);
    return result;
  }
  
};



module.exports = JobpostsModel;
