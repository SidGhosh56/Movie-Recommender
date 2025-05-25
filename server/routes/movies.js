const express = require("express");
const router = express.Router();
const { getAllMovies, addMovie } = require("../controllers/movieController");
const { getRandomMovie } = require("../controllers/movieController");

router.get("/", getAllMovies);
router.post("/", addMovie);
router.get("/random", getRandomMovie);

module.exports = router;
