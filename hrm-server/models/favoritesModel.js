// models/favoritesModel.js
const pool = require("../db");

const FavoritesModel = {
  // Lấy danh sách job đã yêu thích
  getUserFavorites: (userId) => {
    return pool.query(
      `SELECT jobposts.* 
       FROM favorites 
       JOIN jobposts ON favorites.jobpost_id = jobposts.id 
       WHERE favorites.user_id = ? 
       AND jobposts.status = "approved"
       AND jobposts.expiry_date > NOW()`,
      [userId]
    );
  },

  // Kiểm tra job đã có trong favorites chưa
  checkExists: (userId, jobpostId) => {
    return pool.query(
      `SELECT * FROM favorites WHERE user_id = ? AND jobpost_id = ?`,
      [userId, jobpostId]
    );
  },

  // Thêm job vào favorites
  addFavorite: (userId, jobpostId) => {
    return pool.query(
      `INSERT INTO favorites (user_id, jobpost_id) VALUES (?, ?)`,
      [userId, jobpostId]
    );
  },

  // Xóa job khỏi favorites
  removeFavorite: (userId, jobpostId) => {
    return pool.query(
      `DELETE FROM favorites WHERE user_id = ? AND jobpost_id = ?`,
      [userId, jobpostId]
    );
  },

  // Tăng số lượng yêu thích trong jobposts
  incrementFavoriteCount: (jobpostId) => {
    return pool.query(
      `UPDATE jobposts SET count_favorite = count_favorite + 1 WHERE id = ?`,
      [jobpostId]
    );
  },

  // Giảm số lượng yêu thích trong jobposts, không để âm
  decrementFavoriteCount: (jobpostId) => {
    return pool.query(
      `UPDATE jobposts SET count_favorite = GREATEST(count_favorite - 1, 0) WHERE id = ?`,
      [jobpostId]
    );
  },

  // Đếm số lượng người đã yêu thích một job
  countFavorites: (jobpostId) => {
    return pool.query(
      `SELECT COUNT(*) AS count FROM favorites WHERE jobpost_id = ?`,
      [jobpostId]
    );
  }
};

module.exports = FavoritesModel;
