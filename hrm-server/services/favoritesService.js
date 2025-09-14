// services/favoritesService.js
const FavoritesModel = require("../models/favoritesModel");

const FavoritesService = {
  // Lấy danh sách job yêu thích
  getUserFavorites: async (userId) => {
    const [rows] = await FavoritesModel.getUserFavorites(userId);
    return rows;
  },

  // Thêm job vào favorites
  addFavorite: async (userId, jobpostId) => {
    const [exists] = await FavoritesModel.checkExists(userId, jobpostId);
    if (exists.length > 0) {
      throw new Error("Job already in favorites");
    }

    await FavoritesModel.addFavorite(userId, jobpostId);
    await FavoritesModel.incrementFavoriteCount(jobpostId);

    return { message: "Added to favorites" };
  },

  // Xóa job khỏi favorites
  removeFavorite: async (userId, jobpostId) => {
    await FavoritesModel.removeFavorite(userId, jobpostId);
    await FavoritesModel.decrementFavoriteCount(jobpostId);

    return { message: "Removed from favorites" };
  },

  // Đếm số lượng favorites của 1 job
  countFavorites: async (jobpostId) => {
    const [rows] = await FavoritesModel.countFavorites(jobpostId);
    return { count: rows[0].count };
  }
};

module.exports = FavoritesService;
