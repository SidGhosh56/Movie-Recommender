const express = require("express");
const router = express.Router();
const { getAllMovies, addMovie } = require("../controllers/movieController");

router.get("/", getAllMovies);
router.post("/", addMovie);

module.exports = router;
