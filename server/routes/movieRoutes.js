const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");

router.get("/", async (req, res) => {
    try {
        const movies = await Movie.find();
        console.log("Movies from DB:", movies);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


