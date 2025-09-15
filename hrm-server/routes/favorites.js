// routes/favorites.js
const express = require("express");
const router = express.Router();
const FavoritesController = require("../controllers/favoritesController");


router.get("/", FavoritesController.getUserFavorites);


router.post("/", FavoritesController.addFavorite);


router.delete("/:jobpost_id", FavoritesController.removeFavorite);


router.get("/count/:jobId", FavoritesController.countFavorites);

module.exports = router;
