// controllers/favoritesController.js
const jwt = require("jsonwebtoken");
const FavoritesService = require("../services/favoritesService");

const FavoritesController = {
  // Lấy danh sách job yêu thích
  getUserFavorites: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const favorites = await FavoritesService.getUserFavorites(decoded.id);

      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Error fetching favorites" });
    }
  },

  // Thêm job vào favorites
  addFavorite: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { jobpost_id } = req.body;

      if (!jobpost_id) {
        return res.status(400).json({ message: "jobpost_id is required" });
      }

      const result = await FavoritesService.addFavorite(decoded.id, jobpost_id);
      res.json(result);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: error.message || "Error adding favorite" });
    }
  },

  // Xóa job khỏi favorites
  removeFavorite: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { jobpost_id } = req.params;

      const result = await FavoritesService.removeFavorite(decoded.id, jobpost_id);
      res.json(result);
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Error removing favorite" });
    }
  },

  // Đếm số lượng favorites của một job
  countFavorites: async (req, res) => {
    try {
      const { jobId } = req.params;
      const result = await FavoritesService.countFavorites(jobId);
      res.json(result);
    } catch (error) {
      console.error("Error fetching favorite count:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
};

module.exports = FavoritesController;
