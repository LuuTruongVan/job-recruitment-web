const express = require('express');
const router = express.Router();
const pool = require('../db');

// Lấy danh sách conversation của user
router.get('/user/:userId', async (req,res)=>{
  const { userId } = req.params;
  try {
    const [candidateRows] = await pool.query('SELECT id FROM candidates WHERE user_id=?', [userId]);
    const [employerRows] = await pool.query('SELECT id FROM employers WHERE user_id=?', [userId]);
    const candidateId = candidateRows[0]?.id || 0;
    const employerId = employerRows[0]?.id || 0;

    const [rows] = await pool.query(`
      SELECT c.id, c.candidate_id, c.employer_id, c.created_at,
             cand.full_name AS candidate_name,
             emp.name AS employer_name
      FROM conversations c
      LEFT JOIN candidates cand ON c.candidate_id=cand.id
      LEFT JOIN employers emp ON c.employer_id=emp.id
      WHERE c.candidate_id=? OR c.employer_id=?
      ORDER BY c.created_at DESC
    `, [candidateId, employerId]);

    // map name cho frontend
    const formatted = rows.map(r=>({
      ...r,
      name: r.candidate_id === candidateId ? r.employer_name : r.candidate_name
    }));

    res.json(formatted);
  } catch(err){
    console.error(err);
    res.status(500).json({message:'Lỗi khi lấy danh sách hội thoại'});
  }
});

// Tạo conversation mới nếu chưa có
router.post('/', async (req,res)=>{
  const { candidate_id, employer_id } = req.body;
  try{
    const [check] = await pool.query(
      "SELECT * FROM conversations WHERE candidate_id=? AND employer_id=?",
      [candidate_id, employer_id]
    );
    if(check.length>0) return res.json(check[0]);

    const [result] = await pool.query(
      "INSERT INTO conversations (candidate_id, employer_id, created_at) VALUES (?, ?, NOW())",
      [candidate_id, employer_id]
    );
    const [newConv] = await pool.query(
      `SELECT c.id, c.candidate_id, c.employer_id, c.created_at,
              cand.full_name AS candidate_name,
              emp.name AS employer_name
       FROM conversations c
       LEFT JOIN candidates cand ON c.candidate_id=cand.id
       LEFT JOIN employers emp ON c.employer_id=emp.id
       WHERE c.id=?`,
       [result.insertId]
    );
    res.json(newConv[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Lỗi khi tạo conversation'});
  }
});

module.exports = router;
