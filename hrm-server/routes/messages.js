const express = require("express");
const router = express.Router();
const pool = require("../db");

// Lấy messages theo conversation
router.get("/:conversationId", async (req,res)=>{
  try{
    const [rows] = await pool.query(
      "SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at ASC",
      [req.params.conversationId]
    );
    res.json(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({message:"Lỗi khi lấy tin nhắn"});
  }
});

// Lưu message mới
router.post("/", async (req,res)=>{
  const { conversation_id, sender_id, receiver_id, message } = req.body;
  try{
    const [result] = await pool.query(
      "INSERT INTO messages (conversation_id, sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?, NOW())",
      [conversation_id, sender_id, receiver_id, message]
    );
    const [newMsg] = await pool.query("SELECT * FROM messages WHERE id=?", [result.insertId]);
    res.json(newMsg[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({message:"Lỗi khi lưu tin nhắn"});
  }
});

module.exports = router;
