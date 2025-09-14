// routes/favorites.js
const express = require("express");
const router = express.Router();
const FavoritesController = require("../controllers/favoritesController");

// Lấy tất cả favorites của user
router.get("/", FavoritesController.getUserFavorites);

// Thêm vào favorites
router.post("/", FavoritesController.addFavorite);

// Xóa khỏi favorites
router.delete("/:jobpost_id", FavoritesController.removeFavorite);

// Đếm số lượng favorites của 1 job
router.get("/count/:jobId", FavoritesController.countFavorites);

module.exports = router;
